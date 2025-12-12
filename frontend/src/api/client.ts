import axios from 'axios'
import { TOKEN_STORAGE_KEY } from '../constants/storage'

// Use env variable or fallback to localhost in dev mode
const API_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '')

if (!API_URL) {
  const message = '[api] VITE_API_BASE_URL is not configured and not in dev mode'
  console.error(message, import.meta.env)
  throw new Error(message)
}

const runtimeLabel = import.meta.env.DEV ? 'dev' : 'prod'
console.log(`[api] Using base URL (${runtimeLabel}) =>`, API_URL)

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Request interceptor: automatically attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Skip auth header for auth endpoints (they send initData instead)
    if (config.url?.includes('/auth/')) {
      return config
    }
    
    // Only attach token if not already set (allows manual override)
    if (!config.headers.Authorization) {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem(TOKEN_STORAGE_KEY) 
        : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: better error logging
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('[API Error]', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      })
    } else if (error.request) {
      // Request made but no response
      console.error('[Network Error] No response from server', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      })
    } else {
      // Something else happened
      console.error('[Request Error]', error.message)
    }
    return Promise.reject(error)
  }
)

/**
 * Build Authorization header object.
 * @deprecated Use automatic interceptor instead. Only needed for manual override.
 */
export const buildAuthHeaders = (authToken?: string | null) =>
  authToken ? { Authorization: `Bearer ${authToken}` } : undefined

// Health check utility to test backend connection
export const testBackendConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const healthUrl = API_URL.replace('/api', '/health')
    console.log('[Health Check] Testing connection to:', healthUrl)
    const response = await axios.get(healthUrl, { timeout: 10000 })
    console.log('[Health Check] Success:', response.data)
    return { success: true }
  } catch (error: unknown) {
    console.error('[Health Check] Failed:', error)
    let errorMessage = 'Unknown error'
    if (axios.isAxiosError(error)) {
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`
      } else if (error.request) {
        errorMessage = 'No response from server (server may be sleeping or unreachable)'
      } else {
        errorMessage = error.message
      }
    } else if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export { API_URL }

