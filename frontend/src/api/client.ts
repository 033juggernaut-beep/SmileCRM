import axios from 'axios'

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

// Add response interceptor for better error logging
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
  } catch (error: any) {
    console.error('[Health Check] Failed:', error)
    let errorMessage = 'Unknown error'
    if (error.response) {
      errorMessage = `Server error: ${error.response.status}`
    } else if (error.request) {
      errorMessage = 'No response from server (server may be sleeping or unreachable)'
    } else {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export { API_URL }

