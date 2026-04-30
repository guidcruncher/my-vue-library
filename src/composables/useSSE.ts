import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface SSEOptions {
  autoReconnect?: boolean
  withCredentials?: boolean
}

export interface SSEMessage<T = unknown> {
  raw: MessageEvent
  data: T
}

export function useSSE<T = unknown>(url: string, options: SSEOptions = {}) {
  const isConnected = ref(false)
  const lastEvent = ref<SSEMessage<T> | undefined>(undefined)
  const error = ref<Event | undefined>(undefined)

  let source: EventSource | undefined = undefined

  const connect = () => {
    source = new EventSource(url, {
      withCredentials: options.withCredentials ?? false,
    })

    source.onopen = () => {
      isConnected.value = true
    }

    source.onerror = (e) => {
      error.value = e
      isConnected.value = false

      if (!options.autoReconnect) {
        source?.close()
      }
    }

    source.onmessage = (event) => {
      try {
        lastEvent.value = {
          raw: event,
          data: JSON.parse(event.data) as T,
        }
      } catch {
        lastEvent.value = {
          raw: event,
          data: event.data as unknown as T,
        }
      }
    }
  }

  const disconnect = () => {
    source?.close()
    isConnected.value = false
  }

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return {
    isConnected,
    lastEvent,
    error,
    connect,
    disconnect,
  }
}
