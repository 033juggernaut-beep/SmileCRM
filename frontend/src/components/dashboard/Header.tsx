/**
 * Dashboard header - Exact match to Superdesign reference
 * Layout: px-6 py-4, gap-3 (logo), gap-5 (controls)
 * Light: bg-white/90, border-blue-100
 * Dark: bg-slate-900/80, border-slate-700/50
 */

import { useState, useCallback } from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { Sun, Moon } from 'lucide-react';
import { ToothLogo } from './ToothLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  NotificationDropdown,
  mockNotifications,
  type Notification,
} from '../notifications';

const LANGS = ['AM', 'RU', 'EN'] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Header(_props?: { notificationCount?: number }) {
  const { language, setLanguage } = useLanguage();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const isDark = colorMode === 'dark';

  // Notifications state - ready for real API integration
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    // Navigate if has target path
    if (notification.targetPath) {
      navigate(notification.targetPath);
    }
  }, [navigate]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

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
      px="24px" // px-6
      py="16px" // py-4
      bg={headerBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="background-color 0.3s, border-color 0.3s"
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

          {/* Theme Toggle - w-5 h-5 */}
          <Box
            as="button"
            onClick={toggleColorMode}
            color={iconColor}
            _hover={{ color: isDark ? '#F1F5F9' : '#2563EB' }}
            transition="color 0.2s"
            sx={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
