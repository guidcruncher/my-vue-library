import { inject, onBeforeUnmount } from 'vue'
import type { App, InjectionKey } from 'vue'

// -------------------- Types --------------------

export type UnifiedEventKind = 'sse' | 'ws' | 'local'

export interface UnifiedEvent<TPayload = unknown> {
  source: UnifiedEventKind
  channel: string
  data: TPayload
  id?: string
  timestamp: number
  raw?: unknown
}

export type UnifiedEventHandler<T = unknown> = (event: UnifiedEvent<T>) => void

export interface UnifiedSubscription {
  unsubscribe(): void
}

export interface UnifiedEventBus {
  subscribe<T = unknown>(channel: string, handler: UnifiedEventHandler<T>): UnifiedSubscription
  emitLocal<T = unknown>(channel: string, data: T): void
  emitRemote?<T = unknown>(channel: string, data: T): void
  close(): void
}

type AnyHandler = UnifiedEventHandler<any>

type HandlerMap = Map<string, Set<AnyHandler>>

interface TransportAdapter {
  start(push: (event: UnifiedEvent) => void): void
  close(): void
}

function safeJson(input: any): any {
  if (typeof input !== 'string') return input
  try {
    return JSON.parse(input)
  } catch {
    return input
  }
}

// -------------------- SSE Adapter --------------------

class SseAdapter implements TransportAdapter {
  private url: string
  private init?: EventSourceInit
  private channels: string[]
  private es: EventSource | undefined = undefined

  constructor(url: string, init?: EventSourceInit, channels: string[] = ['message']) {
    this.url = url
    this.init = init
    this.channels = channels
  }

  start(push: (event: UnifiedEvent) => void): void {
    const es = new EventSource(this.url, this.init)
    this.es = es

    for (const channel of this.channels) {
      es.addEventListener(channel, (ev: MessageEvent) => {
        push({
          source: 'sse',
          channel,
          data: safeJson(ev.data),
          timestamp: Date.now(),
          raw: ev,
        })
      })
    }

    es.onerror = (err) => {
      push({
        source: 'sse',
        channel: '__error__',
        data: { error: 'sse', detail: err },
        timestamp: Date.now(),
        raw: err,
      })
    }
  }

  close(): void {
    if (this.es) this.es.close()
    this.es = undefined
  }
}

// -------------------- WebSocket Adapter --------------------

class WebSocketAdapter implements TransportAdapter {
  private url: string
  private protocols?: string | string[]
  private ws: WebSocket | undefined = undefined

  constructor(url: string, protocols?: string | string[]) {
    this.url = url
    this.protocols = protocols
  }

  start(push: (event: UnifiedEvent) => void): void {
    const ws = new WebSocket(this.url, this.protocols)
    this.ws = ws

    ws.onmessage = (ev) => {
      const parsed = safeJson(ev.data)
      const { channel, data, id } = this.normalize(parsed)

      push({
        source: 'ws',
        channel,
        data,
        id,
        timestamp: Date.now(),
        raw: ev,
      })
    }

    ws.onerror = (err) => {
      push({
        source: 'ws',
        channel: '__error__',
        data: { error: 'ws', detail: err },
        timestamp: Date.now(),
        raw: err,
      })
    }
  }

  send<T>(channel: string, data: T): void {
    const ws = this.ws
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ channel, data }))
  }

  close(): void {
    if (this.ws) this.ws.close()
    this.ws = undefined
  }

  private normalize(msg: any): { channel: string; data: any; id?: string } {
    if (msg && typeof msg === 'object' && 'channel' in msg) {
      return { channel: msg.channel, data: msg.data, id: msg.id }
    }
    return { channel: 'message', data: msg }
  }
}

// -------------------- Local Adapter --------------------

class LocalAdapter implements TransportAdapter {
  private target = new EventTarget()
  private push: ((event: UnifiedEvent) => void) | undefined = undefined

  start(push: (event: UnifiedEvent) => void): void {
    this.push = push
  }

  emit<T>(channel: string, data: T): void {
    const event: UnifiedEvent<T> = {
      source: 'local',
      channel,
      data,
      timestamp: Date.now(),
    }
    if (this.push) this.push(event)
    this.target.dispatchEvent(new CustomEvent(channel, { detail: event }))
  }

  close(): void {
    this.push = undefined
  }
}

// -------------------- Bus Factory --------------------

export interface UnifiedEventBusOptions {
  sse?: { url: string; init?: EventSourceInit; channels?: string[] }
  ws?: { url: string; protocols?: string | string[] }
  local?: boolean
}

export function createUnifiedEventBus(opts: UnifiedEventBusOptions): UnifiedEventBus {
  const handlers: HandlerMap = new Map()
  const transports: TransportAdapter[] = []

  let wsAdapter: WebSocketAdapter | undefined
  let localAdapter: LocalAdapter | undefined

  if (opts.sse) {
    transports.push(new SseAdapter(opts.sse.url, opts.sse.init, opts.sse.channels))
  }

  if (opts.ws) {
    wsAdapter = new WebSocketAdapter(opts.ws.url, opts.ws.protocols)
    transports.push(wsAdapter)
  }

  if (opts.local !== false) {
    localAdapter = new LocalAdapter()
    transports.push(localAdapter)
  }

  const dispatch = (event: UnifiedEvent) => {
    const set = handlers.get(event.channel)
    if (!set) return
    for (const handler of set) handler(event)
  }

  for (const t of transports) t.start(dispatch)

  return {
    subscribe(channel, handler) {
      let set = handlers.get(channel)
      if (!set) {
        set = new Set()
        handlers.set(channel, set)
      }
      set.add(handler)

      return {
        unsubscribe() {
          const s = handlers.get(channel)
          if (!s) return
          s.delete(handler)
          if (s.size === 0) handlers.delete(channel)
        },
      }
    },

    emitLocal(channel, data) {
      if (localAdapter) localAdapter.emit(channel, data)
    },

    emitRemote(channel, data) {
      if (wsAdapter) wsAdapter.send(channel, data)
    },

    close() {
      for (const t of transports) t.close()
      handlers.clear()
    },
  }
}

// -------------------- Vue Plugin + Composables --------------------

const UnifiedEventBusKey: InjectionKey<UnifiedEventBus> = Symbol('UnifiedEventBus')

export const UnifiedEventBusPlugin = {
  install(app: App, options: UnifiedEventBusOptions) {
    const bus = createUnifiedEventBus(options)
    app.provide(UnifiedEventBusKey, bus)
    ;(app.config.globalProperties as any).$eventBus = bus
  },
}

export function useUnifiedEventBus(): UnifiedEventBus {
  const bus = inject(UnifiedEventBusKey)
  if (!bus) throw new Error('UnifiedEventBus not provided')
  return bus
}

export function useUnifiedChannel<T>(channel: string, handler: UnifiedEventHandler<T>): void {
  const bus = useUnifiedEventBus()
  const sub = bus.subscribe(channel, handler)

  onBeforeUnmount(() => sub.unsubscribe())
}
