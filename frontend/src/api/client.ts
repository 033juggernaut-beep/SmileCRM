import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://smilecrm-backend-production.up.railway.app'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const buildAuthHeaders = (authToken?: string | null) =>
  authToken ? { Authorization: `Bearer ${authToken}` } : undefined

