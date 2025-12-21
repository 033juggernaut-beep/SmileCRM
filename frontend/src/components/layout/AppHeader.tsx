/**
 * AppHeader - Application header for non-dashboard pages
 * Uses NotificationDropdown for notifications
 * Includes safe-area padding for Telegram native buttons
 */

import { useState, useCallback } from 'react'
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
  mockNotifications,
  type Notification,
} from '../notifications'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

// Safe area padding for Telegram native buttons (X and ... buttons on the right)
const TELEGRAM_RIGHT_SAFE = '64px'

export function AppHeader() {
  const { language, setLanguage } = useLanguage()
  const navigate = useNavigate()

  // Notifications state - ready for real API integration
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    )
    // Navigate if has target path
    if (notification.targetPath) {
      navigate(notification.targetPath)
    }
  }, [navigate])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )
  }, [])

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
      h="56px"
    >
      <Flex
        align="center"
        justify="space-between"
        h="100%"
        pl={4}
        pr={TELEGRAM_RIGHT_SAFE} // Safe area for Telegram buttons
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
