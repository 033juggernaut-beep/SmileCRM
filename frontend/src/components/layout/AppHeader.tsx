/**
 * AppHeader - Application header for non-dashboard pages
 * Uses NotificationDropdown for notifications
 * Includes safe-area padding for Telegram native buttons
 * Uses useTelegramSafeArea hook for dynamic safe area calculation
 * Uses LanguageMenu for mobile-friendly language dropdown
 */

import { useCallback } from 'react'
import {
  Box,
  Flex,
  HStack,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  NotificationDropdown,
  type Notification,
} from '../notifications'
import { useNotifications } from '../../hooks/useNotifications'
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea'
import { LanguageMenu } from '../LanguageMenu'

// Minimum safe padding for header controls
const MIN_RIGHT_SAFE = 16
const BASE_HEADER_HEIGHT = 56
const MIN_ICON_SIZE = 44

export function AppHeader() {
  const navigate = useNavigate()
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram, headerHeight: computedHeight } = useTelegramSafeArea()
  
  // Calculate right padding: use safe area value, but ensure minimum padding
  // On mobile Telegram, we need extra padding for X and ... buttons
  const rightPadding = Math.max(rightInset + MIN_RIGHT_SAFE, isInTelegram ? 80 : 24)
  
  // Calculate header height including top inset
  const headerHeight = computedHeight || (BASE_HEADER_HEIGHT + topInset)

  // Notifications from API (with fallback to mock data)
  const { notifications, markRead, markAllRead } = useNotifications()

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    markRead([notification.id])
    // Navigate if has target path
    if (notification.targetPath) {
      navigate(notification.targetPath)
    }
  }, [navigate, markRead])

  const handleMarkAllRead = useCallback(() => {
    markAllRead()
  }, [markAllRead])

  // Colors
  const activeColor = isDark ? '#60A5FA' : '#2563EB'
  const inactiveColor = isDark ? '#64748B' : '#94A3B8'
  const dividerColor = isDark ? '#475569' : '#CBD5E1'
  const iconColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.subtle"
      h={`${headerHeight}px`}
      minH={`${headerHeight}px`}
      pt={topInset > 0 ? `${topInset}px` : 0}
      backdropFilter="blur(12px)"
      isolation="isolate"
    >
      <Flex
        align="center"
        justify="space-between"
        h={`${BASE_HEADER_HEIGHT}px`}
        pl={4}
        pr={`${rightPadding}px`} // Dynamic safe area for Telegram buttons
        maxW="100%"
      >
        {/* Left - Logo */}
        <HStack spacing={2}>
          <Text fontSize="xl" role="img" aria-label="SmileCRM">
            🦷
          </Text>
          <Text
            fontSize="md"
            fontWeight="bold"
            color="text.primary"
            display={{ base: 'none', sm: 'block' }}
          >
            SmileCRM
          </Text>
        </HStack>

        {/* Right - Controls */}
        <HStack spacing={{ base: 2, md: 3 }}>
          {/* Language Menu - dropdown on mobile */}
          <LanguageMenu
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            dividerColor={dividerColor}
          />

          {/* Notifications Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* Theme Toggle */}
          <Box
            as="button"
            onClick={toggleColorMode}
            color={iconColor}
            _hover={{ color: isDark ? '#F1F5F9' : '#2563EB' }}
            transition="color 0.2s"
            sx={{ 
              WebkitTapHighlightColor: 'transparent',
              '& svg': { display: 'block' },
            }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW={`${MIN_ICON_SIZE}px`}
            minH={`${MIN_ICON_SIZE}px`}
            w={`${MIN_ICON_SIZE}px`}
            h={`${MIN_ICON_SIZE}px`}
            borderRadius="md"
            _active={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
            flexShrink={0}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Box>
        </HStack>
      </Flex>
    </Box>
  )
}

export default AppHeader
