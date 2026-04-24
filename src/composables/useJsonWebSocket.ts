import { ref, onUnmounted, type Ref } from 'vue'

export interface UseJsonWebSocketReturn<T = any> {
  data: Ref<T | null>
  status: Ref<'OPEN' | 'CLOSED' | 'CONNECTING' | 'ERROR'>
  error: Ref<Event | null>
  send: (payload: any) => void
  close: (code?: number, reason?: string) => void
  connect: () => void
}

/**
 * useJsonWebSocket
 * @param url - The WebSocket URL
 */
export function useJsonWebSocket<T = any>(url: string): UseJsonWebSocketReturn<T> {
  // Use a standard ref since JSON objects benefit from deep reactivity
  const data = ref<T | null>(null) as Ref<T | null>
  const status = ref<'OPEN' | 'CLOSED' | 'CONNECTING' | 'ERROR'>('CLOSED')
  const error = ref<Event | null>(null)

  let socket: WebSocket | null = null

  const connect = () => {
    if (socket) socket.close()

    status.value = 'CONNECTING'
    socket = new WebSocket(url)

    socket.onopen = () => {
      status.value = 'OPEN'
      error.value = null
    }

    socket.onclose = () => {
      status.value = 'CLOSED'
    }

    socket.onerror = (ev) => {
      status.value = 'ERROR'
      error.value = ev
    }

    socket.onmessage = (event: MessageEvent) => {
      try {
        // Automatically parse incoming JSON strings
        data.value = JSON.parse(event.data)
      } catch (e) {
        console.error('Failed to parse WebSocket JSON:', e)
        error.value = e as any
      }
    }
  }

  const send = (payload: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      // Automatically stringify objects/arrays before sending
      const message = typeof payload === 'string' ? payload : JSON.stringify(payload)
      socket.send(message)
    }
  }

  const close = (code?: number, reason?: string) => {
    socket?.close(code, reason)
  }

  connect()
  onUnmounted(() => close())

  return { data, status, error, send, close, connect }
}
