/**
 * Dashboard header - Exact match to Superdesign reference
 * Layout: px-6 py-4, gap-3 (logo), gap-5 (controls)
 * Light: bg-white/90, border-blue-100
 * Dark: bg-slate-900/80, border-slate-700/50
 * 
 * IMPORTANT: This header is STICKY at top with proper safe-area padding
 * for Telegram native buttons (close X, menu ...) to prevent overlap
 * 
 * Uses useTelegramSafeArea hook for dynamic safe area calculation
 * Uses LanguageMenu for mobile-friendly language dropdown
 */

import { useCallback } from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';
import { ToothLogo } from './ToothLogo';
import { useNavigate } from 'react-router-dom';
import {
  NotificationDropdown,
  type Notification,
} from '../notifications';
import { useNotifications } from '../../hooks/useNotifications';
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea';
import { LanguageMenu } from '../LanguageMenu';

// Minimum safe padding for header controls (fallback when hook returns lower values)
const MIN_RIGHT_SAFE = 16; // Minimum padding on right
const MIN_ICON_SIZE = 44; // Minimum touch target size
const BASE_HEADER_HEIGHT = 56; // Base header height without safe area

// Export header height calculation for use by parent components
export function getHeaderHeight(topInset: number): number {
  return BASE_HEADER_HEIGHT + topInset;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header(_props?: { notificationCount?: number }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const isDark = colorMode === 'dark';

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram, headerHeight } = useTelegramSafeArea();
  
  // Calculate right padding: use safe area value, but ensure minimum padding
  // On mobile Telegram, we need extra padding for X and ... buttons
  const rightPadding = Math.max(rightInset + MIN_RIGHT_SAFE, isInTelegram ? 80 : 24);
  
  // Total header height including safe area
  const totalHeaderHeight = headerHeight || getHeaderHeight(topInset);

  // Notifications from API (with fallback to mock data)
  const { notifications, markRead, markAllRead } = useNotifications();

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    markRead([notification.id]);
    // Navigate if has target path
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  }, [navigate, markRead]);

  const handleMarkAllRead = useCallback(() => {
    markAllRead();
  }, [markAllRead]);

  // Exact colors from reference
  const headerBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'; // blue-100
  const logoColor = isDark ? '#60A5FA' : '#2563EB'; // blue-400 / blue-600
  const brandColor = isDark ? 'white' : '#1E293B'; // slate-800
  const activeColor = isDark ? '#60A5FA' : '#2563EB'; // blue-400 / blue-600
  const inactiveColor = isDark ? '#64748B' : '#94A3B8'; // slate-500 / slate-400
  const dividerColor = isDark ? '#475569' : '#CBD5E1'; // slate-600 / slate-300
  const iconColor = isDark ? '#94A3B8' : '#64748B'; // slate-400 / slate-500

  return (
    <Box
      as="header"
      w="100%"
      position="sticky"
      top={0}
      left={0}
      right={0}
      h={`${totalHeaderHeight}px`}
      minH={`${totalHeaderHeight}px`}
      pl="24px" // px-6 left
      pr={`${rightPadding}px`} // Dynamic safe area for Telegram buttons
      pt={topInset > 0 ? `${topInset}px` : 0} // Top safe area padding
      bg={headerBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="background-color 0.3s, border-color 0.3s"
      zIndex={1000}
      backdropFilter="blur(12px)"
      // Ensure the header stays above everything
      isolation="isolate"
    >
      <Flex 
        align="center" 
        justify="space-between"
        h={`${BASE_HEADER_HEIGHT}px`}
      >
        {/* Left: Logo + Brand - gap-3 */}
        <Flex align="center" gap="12px">
          <ToothLogo size="28px" color={logoColor} />
          {/* text-lg font-semibold tracking-wide */}
          <Text
            fontSize="lg" // 18px
            fontWeight="semibold"
            letterSpacing="wide" // 0.025em
            color={brandColor}
            display={{ base: 'none', sm: 'block' }}
          >
            SmileCRM
          </Text>
        </Flex>

        {/* Right: Controls - responsive gap */}
        <Flex align="center" gap={{ base: '12px', md: '20px' }}>
          {/* Language Menu - dropdown on mobile, inline on desktop */}
          <LanguageMenu
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            dividerColor={dividerColor}
          />

          {/* Notification Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* Theme Toggle - with proper touch target size and visibility */}
          <Box
            as="button"
            onClick={toggleColorMode}
            color={iconColor}
            _hover={{ color: isDark ? '#F1F5F9' : '#2563EB' }}
            transition="color 0.2s"
            sx={{ 
              WebkitTapHighlightColor: 'transparent',
              // Ensure the icon is always visible
              '& svg': {
                display: 'block',
              }
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
            overflow="visible"
            position="relative"
            zIndex={1}
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
