import { App, inject, InjectionKey, onBeforeUnmount } from 'vue'

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

// SSE
class SseAdapter implements TransportAdapter {
  private es: EventSource | null = null

  constructor(
    private url: string,
    private init?: EventSourceInit,
    private channels: string[] = ['message']
  ) {}

  start(push: (event: UnifiedEvent) => void): void {
    this.es = new EventSource(this.url, this.init)

    for (const channel of this.channels) {
      this.es.addEventListener(channel, (ev: MessageEvent) => {
        push({
          source: 'sse',
          channel,
          data: safeJson(ev.data),
          timestamp: Date.now(),
          raw: ev,
        })
      })
    }

    this.es.onerror = (err) => {
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
    this.es?.close()
    this.es = null
  }
}

// WebSocket
class WebSocketAdapter implements TransportAdapter {
  private ws: WebSocket | null = null

  constructor(
    private url: string,
    private protocols?: string | string[]
  ) {}

  start(push: (event: UnifiedEvent) => void): void {
    this.ws = new WebSocket(this.url, this.protocols)

    this.ws.onmessage = (ev) => {
      const parsed = safeJson(ev.data)
      const { channel, data, id } = this.normalizeWsMessage(parsed)

      push({
        source: 'ws',
        channel,
        data,
        id,
        timestamp: Date.now(),
        raw: ev,
      })
    }

    this.ws.onerror = (err) => {
      push({
        source: 'ws',
        channel: '__error__',
        data: { error: 'ws', detail: err },
        timestamp: Date.now(),
        raw: err,
      })
    }
  }

  send<T = unknown>(channel: string, data: T): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ channel, data }))
  }

  close(): void {
    this.ws?.close()
    this.ws = null
  }

  private normalizeWsMessage(msg: any): { channel: string; data: any; id?: string } {
    if (msg && typeof msg === 'object' && 'channel' in msg) {
      return { channel: msg.channel, data: msg.data, id: msg.id }
    }
    return { channel: 'message', data: msg }
  }
}

// Local
class LocalAdapter implements TransportAdapter {
  private target = new EventTarget()
  private push: ((event: UnifiedEvent) => void) | null = null

  start(push: (event: UnifiedEvent) => void): void {
    this.push = push
  }

  emit<T = unknown>(channel: string, data: T): void {
    const event: UnifiedEvent<T> = {
      source: 'local',
      channel,
      data,
      timestamp: Date.now(),
    }
    this.push?.(event)
    this.target.dispatchEvent(new CustomEvent(channel, { detail: event }))
  }

  close(): void {
    this.push = null
  }
}

export interface UnifiedEventBusOptions {
  sse?: { url: string; init?: EventSourceInit; channels?: string[] }
  ws?: { url: string; protocols?: string | string[] }
  local?: boolean
}

type HandlerMap = Map<string, Set<UnifiedEventHandler>>

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
    if (!set || set.size === 0) return
    for (const handler of set) handler(event)
  }

  for (const t of transports) t.start(dispatch)

  const bus: UnifiedEventBus = {
    subscribe<T = unknown>(channel: string, handler: UnifiedEventHandler<T>): UnifiedSubscription {
      let set = handlers.get(channel)
      if (!set) {
        set = new Set()
        handlers.set(channel, set)
      }
      set.add(handler as UnifiedEventHandler)

      return {
        unsubscribe: () => {
          const s = handlers.get(channel)
          if (!s) return
          s.delete(handler as UnifiedEventHandler)
          if (s.size === 0) handlers.delete(channel)
        },
      }
    },

    emitLocal<T = unknown>(channel: string, data: T): void {
      localAdapter?.emit(channel, data)
    },

    emitRemote<T = unknown>(channel: string, data: T): void {
      wsAdapter?.send(channel, data)
    },

    close(): void {
      for (const t of transports) t.close()
      handlers.clear()
    },
  }

  return bus
}

const UnifiedEventBusKey: InjectionKey<UnifiedEventBus> = Symbol('UnifiedEventBus')

export interface UnifiedEventBusPluginOptions extends UnifiedEventBusOptions {}

export const UnifiedEventBusPlugin = {
  install(app: App, options: UnifiedEventBusPluginOptions) {
    const bus = createUnifiedEventBus(options)
    app.provide(UnifiedEventBusKey, bus)

    // optional: expose on app.config.globalProperties if you like
    ;(app.config.globalProperties as any).$eventBus = bus
  },
}

export function useUnifiedEventBus(): UnifiedEventBus {
  const bus = inject(UnifiedEventBusKey)
  if (!bus) {
    throw new Error(
      '[UnifiedEventBus] No bus provided. Did you forget to app.use(UnifiedEventBusPlugin, ...)?'
    )
  }
  return bus
}

// Optional helper composable for auto-unsubscribe
export function useUnifiedChannel<T = unknown>(
  channel: string,
  handler: UnifiedEventHandler<T>
): void {
  const bus = useUnifiedEventBus()
  const sub: UnifiedSubscription = bus.subscribe<T>(channel, handler)

  onBeforeUnmount(() => {
    sub.unsubscribe()
  })
}
