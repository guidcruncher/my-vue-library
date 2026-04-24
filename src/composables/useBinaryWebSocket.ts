import { ref, onUnmounted, shallowRef, type Ref } from 'vue'

export type BinaryData = ArrayBuffer | Blob

export interface UseBinaryWebSocketReturn {
  data: Ref<BinaryData | null>
  status: Ref<'OPEN' | 'CLOSED' | 'CONNECTING' | 'ERROR'>
  error: Ref<Event | null>
  send: (payload: string | Blob | BufferSource) => void
  close: (code?: number, reason?: string) => void
  connect: () => void
}

/**
 * useBinaryWebSocket
 * @param url - The WebSocket URL
 * @param useBlob - If true, uses 'blob', otherwise 'arraybuffer'
 */
export function useBinaryWebSocket(
  url: string,
  useBlob: boolean = false
): UseBinaryWebSocketReturn {
  // Use shallowRef for binary data to prevent expensive deep reactivity on byte arrays
  const data = shallowRef<BinaryData | null>(null)
  const status = ref<'OPEN' | 'CLOSED' | 'CONNECTING' | 'ERROR'>('CLOSED')
  const error = ref<Event | null>(null)

  let socket: WebSocket | null = null

  const connect = () => {
    if (socket) socket.close()

    status.value = 'CONNECTING'
    socket = new WebSocket(url)
    socket.binaryType = useBlob ? 'blob' : 'arraybuffer'

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
      data.value = event.data
    }
  }

  const send = (payload: string | Blob | BufferSource) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(payload)
    }
  }

  const close = (code?: number, reason?: string) => {
    socket?.close(code, reason)
  }

  // Lifecycle: Connect immediately and cleanup on unmount
  connect()
  onUnmounted(() => close())

  return { data, status, error, send, close, connect }
}
