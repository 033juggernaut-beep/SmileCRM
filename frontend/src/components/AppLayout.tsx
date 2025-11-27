import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

export const AppLayout = () => {
  const [viewportHeight, setViewportHeight] = useState('100vh')

  useEffect(() => {
    // Use Telegram WebApp viewport height if available for more accurate fullscreen
    const telegram = window.Telegram?.WebApp
    if (telegram?.viewportHeight) {
      setViewportHeight(`${telegram.viewportHeight}px`)
      console.log('[AppLayout] Using Telegram viewport height:', telegram.viewportHeight)
    }

    // Listen for viewport changes (when keyboard opens/closes, orientation changes, etc.)
    const handleViewportChanged = () => {
      if (telegram?.viewportHeight) {
        setViewportHeight(`${telegram.viewportHeight}px`)
        console.log('[AppLayout] Viewport changed to:', telegram.viewportHeight)
      }
    }

    // Telegram WebApp emits viewport_changed event
    if (telegram && telegram.onEvent) {
      telegram.onEvent('viewportChanged', handleViewportChanged)
    }

    return () => {
      if (telegram && telegram.offEvent) {
        telegram.offEvent('viewportChanged', handleViewportChanged)
      }
    }
  }, [])

  return (
    <Box 
      w="100%"
      minH={viewportHeight}
      position="relative"
    >
      <Outlet />
    </Box>
  )
}

