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
    
    build: {
      // Split vendor chunks for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React - changes rarely
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI framework - changes rarely
            'vendor-chakra': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
            // Animation library
            'vendor-motion': ['framer-motion'],
            // Icons - can be cached separately
            'vendor-icons': ['lucide-react'],
            // HTTP client
            'vendor-axios': ['axios'],
          },
        },
      },
      // Increase chunk warning limit (optional)
      chunkSizeWarningLimit: 600,
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console.log in production
          drop_debugger: true,
        },
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
      ],
    },
  }
})
