import { Box, Flex, Heading } from '@chakra-ui/react'
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
    <Flex 
      direction="column" 
      w="100vw"
      minH={viewportHeight} 
      maxH={viewportHeight}
      h={viewportHeight}
      bg="gray.50"
      overflow="hidden"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
    >
      <Box as="header" bg="teal.600" color="white" px={4} py={3} boxShadow="sm" flexShrink={0}>
        <Heading size="md" fontWeight="semibold">
          Dental Mini App
        </Heading>
      </Box>

      <Flex
        as="main"
        flex="1"
        align="center"
        justify="center"
        px={4}
        py={8}
        overflow="auto"
        w="100%"
      >
        <Box w="full" maxW="600px">
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}

