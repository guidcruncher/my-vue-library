import { ref, unref, type Ref } from 'vue'

export interface RestClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
}

export interface RequestOptions<TBody> {
  params?: Record<string, string | number | boolean>
  body?: TBody
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface RestResponse<T> {
  data: T | null
  status: number
  ok: boolean
}

export function useRestClient(options: RestClientOptions = {}) {
  const loading = ref(false)
  const error = ref<unknown>(null)

  const buildUrl = (path: string, params?: Record<string, string | number | boolean>) => {
    const base = options.baseUrl ?? ''
    const url = new URL(path, base)

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value))
      }
    }

    return url.toString()
  }

  const request = async <TResponse, TBody = unknown>(
    method: string,
    path: string | Ref<string>,
    opts: RequestOptions<TBody> = {}
  ): Promise<RestResponse<TResponse>> => {
    const resolvedPath = unref(path)
    const url = buildUrl(resolvedPath, opts.params)

    loading.value = true
    error.value = null

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
          ...(opts.headers ?? {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: opts.signal,
      })

      const json = (await res.json().catch(() => null)) as TResponse | null

      return {
        data: json,
        status: res.status,
        ok: res.ok,
      }
    } catch (err) {
      error.value = err
      return {
        data: null,
        status: 0,
        ok: false,
      }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,

    get: <T>(path: string | Ref<string>, opts?: RequestOptions<never>) =>
      request<T>('GET', path, opts),

    post: <T, B>(path: string | Ref<string>, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>('POST', path, { ...opts, body }),

    put: <T, B>(path: string | Ref<string>, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>('PUT', path, { ...opts, body }),

    patch: <T, B>(path: string | Ref<string>, body?: B, opts?: RequestOptions<B>) =>
      request<T, B>('PATCH', path, { ...opts, body }),

    delete: <T>(path: string | Ref<string>, opts?: RequestOptions<never>) =>
      request<T>('DELETE', path, opts),
  }
}
