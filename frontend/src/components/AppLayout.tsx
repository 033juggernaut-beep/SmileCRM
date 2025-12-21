import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppHeader } from './layout/AppHeader'

// Pages where AppHeader should be shown
// Note: /home now has its own light Header component, so we exclude it
const PAGES_WITH_APP_HEADER: string[] = []

export const AppLayout = () => {
  const location = useLocation()
  const showAppHeader = PAGES_WITH_APP_HEADER.includes(location.pathname)

  useEffect(() => {
    const telegram = window.Telegram?.WebApp

    // Initialize Telegram WebApp
    if (telegram) {
      console.log('[AppLayout] Telegram WebApp detected')
      
      // Mark as ready
      if (telegram.ready) {
        telegram.ready()
        console.log('[AppLayout] tg.ready() called')
      }
      
      // Expand to fullscreen
      if (telegram.expand) {
        telegram.expand()
        console.log('[AppLayout] tg.expand() called, isExpanded:', telegram.isExpanded)
      }
      
      // Try requestFullscreen for newer versions
      if (telegram.requestFullscreen) {
        try {
          telegram.requestFullscreen()
          console.log('[AppLayout] tg.requestFullscreen() called')
        } catch (e) {
          console.log('[AppLayout] requestFullscreen error:', e)
        }
      }
      
      // Disable vertical swipes to prevent closing
      if (telegram.disableVerticalSwipes) {
        telegram.disableVerticalSwipes()
      }
    }

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
      minH="100dvh"
      position="relative"
      overflowX="hidden"
      overflowY="auto"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Global AppHeader - only on specific pages */}
      {showAppHeader && <AppHeader />}
      
      {/* Page content with padding for fixed header */}
      <Box
        pt={showAppHeader ? '56px' : 0}
        minH="100%"
        overflowX="hidden"
      >
        <Outlet />
      </Box>
    </Box>
  )
}
