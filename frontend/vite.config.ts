import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnvEntries = Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
  const publicEnv = Object.fromEntries(publicEnvEntries)
  console.log('[vite] Loaded public env variables:', publicEnv)

  // In production mode, VITE_API_BASE_URL must be set
  // In dev mode, it will fallback to localhost in client.ts
  if (mode === 'production' && !publicEnv.VITE_API_BASE_URL) {
    throw new Error('[vite] VITE_API_BASE_URL is required for production builds.')
  }

  return {
    plugins: [react()],
    base: '/', // SPA base path for Vercel
  }
})
