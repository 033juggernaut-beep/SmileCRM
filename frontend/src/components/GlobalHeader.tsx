/**
 * GlobalHeader - Universal header component for all pages
 * 
 * Features:
 * - Telegram safe area support (respects native X and ⋮ buttons)
 * - Sticky positioning at top
 * - Mobile-friendly language dropdown
 * - Theme toggle with proper touch targets
 * - Notification bell
 * 
 * This header should be used by ALL pages either directly or via layouts.
 */

import { useCallback } from 'react'
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import { Sun, Moon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { LanguageMenu } from './LanguageMenu'
import { NotificationDropdown, type Notification } from './notifications'
import { useNotifications } from '../hooks/useNotifications'

// Constants
const BASE_HEADER_HEIGHT = 56
const MIN_ICON_SIZE = 44
const MIN_RIGHT_PADDING = 16

interface GlobalHeaderProps {
  /** Show logo and brand name */
  showLogo?: boolean
  /** Custom logo component */
  logo?: React.ReactNode
  /** Show notification bell */
  showNotifications?: boolean
  /** Show theme toggle */
  showThemeToggle?: boolean
  /** Show language switcher */
  showLanguage?: boolean
  /** Transparent background (for overlay on hero sections) */
  transparent?: boolean
  /** Custom right element (replaces default controls) */
  rightElement?: React.ReactNode
}

export function GlobalHeader({
  showLogo = true,
  logo,
  showNotifications = true,
  showThemeToggle = true,
  showLanguage = true,
  transparent = false,
  rightElement,
}: GlobalHeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const isDark = colorMode === 'dark'

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram, headerHeight: computedHeaderHeight } = useTelegramSafeArea()
  
  // Calculate paddings with safe areas
  const rightPadding = Math.max(rightInset + MIN_RIGHT_PADDING, isInTelegram ? 80 : 24)
  const totalHeaderHeight = computedHeaderHeight || (BASE_HEADER_HEIGHT + topInset)

  // Notifications
  const { notifications, markRead, markAllRead } = useNotifications()

  const handleNotificationClick = useCallback((notification: Notification) => {
    markRead([notification.id])
    if (notification.targetPath) {
      navigate(notification.targetPath)
    }
  }, [navigate, markRead])

  const handleMarkAllRead = useCallback(() => {
    markAllRead()
  }, [markAllRead])

  // Colors
  const headerBg = transparent
    ? 'transparent'
    : isDark
      ? 'rgba(15, 23, 42, 0.95)'
      : 'rgba(255, 255, 255, 0.95)'
  const borderColor = transparent
    ? 'transparent'
    : isDark
      ? 'rgba(51, 65, 85, 0.5)'
      : '#DBEAFE'
  const brandColor = isDark ? 'white' : '#1E293B'
  const activeColor = isDark ? '#60A5FA' : '#2563EB'
  const inactiveColor = isDark ? '#64748B' : '#94A3B8'
  const dividerColor = isDark ? '#475569' : '#CBD5E1'
  const iconColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      left={0}
      right={0}
      w="100%"
      h={`${totalHeaderHeight}px`}
      minH={`${totalHeaderHeight}px`}
      zIndex={1000}
      bg={headerBg}
      borderBottom={transparent ? 'none' : '1px solid'}
      borderColor={borderColor}
      backdropFilter={transparent ? 'none' : 'blur(12px)'}
      transition="background-color 0.3s, border-color 0.3s"
      isolation="isolate"
    >
      {/* Top safe area spacer */}
      {topInset > 0 && <Box h={`${topInset}px`} />}
      
      {/* Header content */}
      <Flex
        align="center"
        justify="space-between"
        h={`${BASE_HEADER_HEIGHT}px`}
        pl="24px"
        pr={`${rightPadding}px`}
      >
        {/* Left: Logo */}
        {showLogo && (
          <Flex align="center" gap="12px">
            {logo || (
              <Text fontSize="2xl" role="img" aria-label="SmileCRM">
                🦷
              </Text>
            )}
            <Text
              fontSize="lg"
              fontWeight="semibold"
              letterSpacing="wide"
              color={brandColor}
              display={{ base: 'none', sm: 'block' }}
            >
              SmileCRM
            </Text>
          </Flex>
        )}

        {/* Right: Controls */}
        <Flex align="center" gap={{ base: '12px', md: '20px' }}>
          {rightElement ? (
            rightElement
          ) : (
            <>
              {/* Language Switcher */}
              {showLanguage && (
                <LanguageMenu
                  forceMobile={false}
                  activeColor={activeColor}
                  inactiveColor={inactiveColor}
                  dividerColor={dividerColor}
                />
              )}

              {/* Notifications */}
              {showNotifications && (
                <NotificationDropdown
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}

              {/* Theme Toggle */}
              {showThemeToggle && (
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
                  {isDark ? <Sun size={22} /> : <Moon size={22} />}
                </Box>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

// Export header height for use by other components
export function getGlobalHeaderHeight(topInset: number): number {
  return BASE_HEADER_HEIGHT + topInset
}

export { BASE_HEADER_HEIGHT }
export default GlobalHeader

