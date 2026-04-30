import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'

export interface SSEChannelMap {
  [event: string]: unknown
}

export interface SSEAdvancedOptions {
  autoReconnect?: boolean
  maxReconnectDelayMs?: number
  batch?: {
    enabled: boolean
    flushIntervalMs: number
  }
  withCredentials?: boolean
}

export function useSSEAdvanced<Channels extends SSEChannelMap>(
  url: string,
  options: SSEAdvancedOptions = {}
) {
  const {
    autoReconnect = true,
    maxReconnectDelayMs = 8000,
    batch = { enabled: false, flushIntervalMs: 250 },
    withCredentials = false,
  } = options

  const isConnected = ref(false)
  const error = ref<Event | undefined>(undefined)

  // Per-channel reactive event buffers
  const events = shallowRef<{
    [K in keyof Channels]?: Channels[K][]
  }>({})

  let source: EventSource | undefined = undefined
  let reconnectDelay = 500
  let batchTimer: number | undefined = undefined

  const emitEvent = <K extends keyof Channels>(event: K, data: Channels[K]) => {
    if (!events.value[event]) {
      events.value[event] = []
    }
    events.value[event]!.push(data)
  }

  const flushBatch = () => {
    // Trigger Vue reactivity by replacing the object
    events.value = { ...events.value }
  }

  const scheduleBatchFlush = () => {
    if (!batch.enabled) return
    if (batchTimer !== undefined) return

    batchTimer = window.setTimeout(() => {
      flushBatch()
      batchTimer = undefined
    }, batch.flushIntervalMs)
  }

  const connect = () => {
    source = new EventSource(url, { withCredentials })

    source.onopen = () => {
      isConnected.value = true
      reconnectDelay = 500
    }

    source.onerror = (e) => {
      error.value = e
      isConnected.value = false

      if (!autoReconnect) {
        source?.close()
        return
      }

      source?.close()

      setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelayMs)
        connect()
      }, reconnectDelay)
    }

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data)
        emitEvent('message' as keyof Channels, parsed)
      } catch {
        emitEvent('message' as keyof Channels, event.data as any)
      }
      scheduleBatchFlush()
    }

    source.addEventListener('*', (event: any) => {
      const type = event.type as keyof Channels
      try {
        const parsed = JSON.parse(event.data)
        emitEvent(type, parsed)
      } catch {
        emitEvent(type, event.data as any)
      }
      scheduleBatchFlush()
    })
  }

  const disconnect = () => {
    source?.close()
    isConnected.value = false
  }

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return {
    isConnected,
    error,
    events,
    connect,
    disconnect,
  }
}
