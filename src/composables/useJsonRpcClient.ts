import { ref, onBeforeUnmount } from 'vue'

export interface JsonRpcRequest<T = any> {
  jsonrpc: '2.0'
  method: string
  params?: T
  id: number | string
}

export interface JsonRpcSuccess<T = any> {
  jsonrpc: '2.0'
  result: T
  id: number | string
}

export interface JsonRpcError {
  jsonrpc: '2.0'
  error: {
    code: number
    message: string
    data?: any
  }
  id: number | string | undefined
}

export type JsonRpcResponse<T = any> = JsonRpcSuccess<T> | JsonRpcError

type PendingRequest = {
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

export function useJsonRpcClient(url: string, autoReconnect = true) {
  const ws = ref<WebSocket | undefined>(undefined)
  const isConnected = ref(false)

  let requestId = 1
  const pending = new Map<number | string, PendingRequest>()
  const listeners = new Map<string, Set<(payload: any) => void>>()

  function connect() {
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      isConnected.value = true
    }

    ws.value.onclose = () => {
      isConnected.value = false
      if (autoReconnect) {
        setTimeout(connect, 1000)
      }
    }

    ws.value.onmessage = (event) => {
      const msg = JSON.parse(event.data)

      // Response to a request
      if (msg.id !== undefined && msg.id !== undefined) {
        const pendingReq = pending.get(msg.id)
        if (!pendingReq) return

        pending.delete(msg.id)

        if ('result' in msg) {
          pendingReq.resolve(msg.result)
        } else {
          pendingReq.reject(msg.error)
        }
        return
      }

      // Notification (no id)
      if (msg.method && listeners.has(msg.method)) {
        const handlers = listeners.get(msg.method)!
        handlers.forEach((fn) => fn(msg.params))
      }
    }
  }

  connect()

  async function call<TParams = any, TResult = any>(
    method: string,
    params?: TParams
  ): Promise<TResult> {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    const id = requestId++
    const request: JsonRpcRequest<TParams> = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    }

    const payload = JSON.stringify(request)

    return new Promise<TResult>((resolve, reject) => {
      pending.set(id, { resolve, reject })
      ws.value!.send(payload)
    })
  }

  function onNotification<T = any>(method: string, handler: (payload: T) => void) {
    if (!listeners.has(method)) {
      listeners.set(method, new Set())
    }
    listeners.get(method)!.add(handler)

    return () => {
      listeners.get(method)!.delete(handler)
    }
  }

  onBeforeUnmount(() => {
    ws.value?.close()
    pending.forEach((p) => p.reject('Component unmounted'))
    pending.clear()
  })

  return {
    isConnected,
    call,
    onNotification,
  }
}
