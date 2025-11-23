import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnvEntries = Object.entries(env).filter(([key]) => key.startsWith('VITE_'))
  const publicEnv = Object.fromEntries(publicEnvEntries)
  console.log('[vite] Loaded public env variables:', publicEnv)

  if (!publicEnv.VITE_API_BASE_URL) {
    throw new Error('[vite] VITE_API_BASE_URL is not defined. Configure it before building.')
  }

  return {
    plugins: [react()],
  }
})
