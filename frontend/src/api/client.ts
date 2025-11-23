import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

if (!API_URL) {
  const message = '[api] VITE_API_BASE_URL is not configured'
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
})

export const buildAuthHeaders = (authToken?: string | null) =>
  authToken ? { Authorization: `Bearer ${authToken}` } : undefined

export { API_URL }

