import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'

export const AppLayout = () => {
  useEffect(() => {
    const telegram = window.Telegram?.WebApp

    // Set CSS custom property for viewport height
    const updateViewportHeight = () => {
      // Try to use Telegram's viewport height first
      const vh = telegram?.viewportStableHeight || telegram?.viewportHeight || window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${vh}px`)
      console.log('[AppLayout] Set --app-height:', vh)
    }

    // Initial set
    updateViewportHeight()

    // Listen for viewport changes in Telegram
    if (telegram?.onEvent) {
      telegram.onEvent('viewportChanged', updateViewportHeight)
    }

    // Also listen for window resize as fallback
    window.addEventListener('resize', updateViewportHeight)

    return () => {
      if (telegram?.offEvent) {
        telegram.offEvent('viewportChanged', updateViewportHeight)
      }
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [])

  return (
    <Box 
      w="100%"
      minH="var(--app-height, 100vh)"
      h="var(--app-height, 100vh)"
      position="relative"
      overflow="hidden"
    >
      <Outlet />
    </Box>
  )
}

