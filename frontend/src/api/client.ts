type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  authToken?: string | null
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const resolveUrl = (path: string) =>
  path.startsWith('http') ? path : `${API_BASE_URL}${path}`

async function request<T>(path: string, options: RequestOptions = {}) {
  const { method = 'GET', body, headers = {}, authToken } = options

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (authToken) {
    mergedHeaders.Authorization = `Bearer ${authToken}`
  }

  const response = await fetch(resolveUrl(path), {
    method,
    headers: mergedHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const errorPayload = await response.json()
      message =
        (errorPayload?.detail as string) ??
        (errorPayload?.message as string) ??
        message
    } catch {
      // ignore json parse errors
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  try {
    return (await response.json()) as T
  } catch {
    return undefined as T
  }
}

export const apiClient = {
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, options)
  },
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'POST', body })
  },
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method'>) {
    return request<T>(path, { ...options, method: 'PATCH', body })
  },
  request,
}

