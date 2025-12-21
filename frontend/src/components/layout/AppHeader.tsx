/**
 * AppHeader - Application header for non-dashboard pages
 * Uses NotificationDropdown for notifications
 * Includes safe-area padding for Telegram native buttons
 * Uses useTelegramSafeArea hook for dynamic safe area calculation
 */

import { useCallback } from 'react'
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useLanguage, type Language } from '../../context/LanguageContext'
import {
  NotificationDropdown,
  type Notification,
} from '../notifications'
import { useNotifications } from '../../hooks/useNotifications'
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

// Minimum safe padding for header controls
const MIN_RIGHT_SAFE = 16

export function AppHeader() {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram } = useTelegramSafeArea()
  
  // Calculate right padding: use safe area value, but ensure minimum padding
  const rightPadding = Math.max(rightInset + MIN_RIGHT_SAFE, isInTelegram ? 72 : 24)
  
  // Calculate header height including top inset
  const headerHeight = 56 + topInset

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
      pt={topInset > 0 ? `${topInset}px` : 0}
    >
      <Flex
        align="center"
        justify="space-between"
        h="56px"
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
        <HStack spacing={3}>
          {/* Language Switcher */}
          <HStack spacing={1}>
            {LANGUAGES.map(({ code, label }) => (
              <Button
                key={code}
                size="xs"
                variant="ghost"
                fontSize="xs"
                fontWeight={language === code ? 'bold' : 'medium'}
                color={language === code ? 'primary.600' : 'text.muted'}
                bg={language === code ? 'primary.50' : 'transparent'}
                borderRadius="md"
                minW="32px"
                h="28px"
                px={2}
                onClick={() => setLanguage(code)}
                _hover={{ bg: 'bg.hover' }}
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {label}
              </Button>
            ))}
          </HStack>

          {/* Notifications Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />
        </HStack>
      </Flex>
    </Box>
  )
}

export default AppHeader
