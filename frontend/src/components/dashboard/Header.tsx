/**
 * Dashboard header - Exact match to Superdesign reference
 * Layout: px-6 py-4, gap-3 (logo), gap-5 (controls)
 * Light: bg-white/90, border-blue-100
 * Dark: bg-slate-900/80, border-slate-700/50
 * 
 * Includes safe-area padding for Telegram native buttons (close/menu)
 * Uses useTelegramSafeArea hook for dynamic safe area calculation
 */

import { useCallback } from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';
import { ToothLogo } from './ToothLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  NotificationDropdown,
  type Notification,
} from '../notifications';
import { useNotifications } from '../../hooks/useNotifications';
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea';

const LANGS = ['AM', 'RU', 'EN'] as const;

// Minimum safe padding for header controls (fallback when hook returns lower values)
const MIN_RIGHT_SAFE = 16; // Minimum padding on right
const MIN_ICON_SIZE = 44; // Minimum touch target size

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header(_props?: { notificationCount?: number }) {
  const { language, setLanguage } = useLanguage();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const isDark = colorMode === 'dark';

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram } = useTelegramSafeArea();
  
  // Calculate right padding: use safe area value, but ensure minimum padding
  const rightPadding = Math.max(rightInset + MIN_RIGHT_SAFE, isInTelegram ? 72 : 24);

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
  const headerBg = isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)';
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
      pl="24px" // px-6 left
      pr={`${rightPadding}px`} // Dynamic safe area for Telegram buttons
      pt={topInset > 0 ? `${topInset + 16}px` : '16px'} // py-4 + top safe area
      pb="16px" // py-4
      bg={headerBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="background-color 0.3s, border-color 0.3s"
      position="relative"
      zIndex={1000}
    >
      <Flex align="center" justify="space-between">
        {/* Left: Logo + Brand - gap-3 */}
        <Flex align="center" gap="12px">
          <ToothLogo size="28px" color={logoColor} />
          {/* text-lg font-semibold tracking-wide */}
          <Text
            fontSize="lg" // 18px
            fontWeight="semibold"
            letterSpacing="wide" // 0.025em
            color={brandColor}
          >
            SmileCRM
          </Text>
        </Flex>

        {/* Right: Controls - gap-5 */}
        <Flex align="center" gap="20px">
          {/* Language Switch - gap-1 text-sm */}
          <Flex align="center" gap="4px" fontSize="sm">
            {LANGS.map((lang, index) => (
              <Flex key={lang} align="center">
                {/* px-1.5 py-0.5 font-medium */}
                <Box
                  as="button"
                  px="6px"
                  py="2px"
                  fontWeight="medium"
                  color={language.toUpperCase() === lang ? activeColor : inactiveColor}
                  onClick={() => setLanguage(lang.toLowerCase() as 'am' | 'ru' | 'en')}
                  transition="color 0.2s"
                  sx={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {lang}
                </Box>
                {index < LANGS.length - 1 && (
                  <Text mx="4px" color={dividerColor}>|</Text>
                )}
              </Flex>
            ))}
          </Flex>

          {/* Notification Dropdown */}
          <NotificationDropdown
            notifications={notifications}
            onNotificationClick={handleNotificationClick}
            onMarkAllRead={handleMarkAllRead}
          />

          {/* Theme Toggle - with proper touch target size */}
          <Box
            as="button"
            onClick={toggleColorMode}
            color={iconColor}
            _hover={{ color: isDark ? '#F1F5F9' : '#2563EB' }}
            transition="color 0.2s"
            sx={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            minW={`${MIN_ICON_SIZE}px`}
            minH={`${MIN_ICON_SIZE}px`}
            borderRadius="md"
            _active={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
          >
            {isDark ? <Sun size={22} /> : <Moon size={22} />}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
