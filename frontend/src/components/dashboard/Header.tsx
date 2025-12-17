/**
 * Dashboard Header - Superdesign Blue Theme (Light Mode Forced)
 * 
 * Layout: Logo | Spacer | Lang Switch | Bell | Theme Toggle
 * All styles hardcoded for light mode (no theme tokens)
 */

import { Box, Flex, Text } from '@chakra-ui/react';
import { Bell, Moon } from 'lucide-react';
import { ToothLogo } from './ToothLogo';
import { useLanguage } from '../../context/LanguageContext';

// =============================================
// 🎨 LIGHT THEME COLORS (Superdesign Reference)
// =============================================
const COLORS = {
  headerBg: 'rgba(255, 255, 255, 0.9)',
  headerBorder: '#dbeafe',        // blue-100
  logoColor: '#2563eb',           // blue-600
  brandText: '#1e293b',           // slate-800
  langActive: '#2563eb',          // blue-600
  langInactive: '#94a3b8',        // slate-400
  langDivider: '#cbd5e1',         // slate-300
  iconColor: '#64748b',           // slate-500
  badgeBg: '#3b82f6',             // blue-500
  badgeText: '#ffffff',
};

const LANGS = ['AM', 'RU', 'EN'] as const;

interface HeaderProps {
  notificationCount?: number;
  onThemeToggle?: () => void;
}

export function Header({ 
  notificationCount = 0,
  onThemeToggle,
}: HeaderProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <Box
      as="header"
      w="100%"
      px={6}
      py={4}
      bg={COLORS.headerBg}
      borderBottom="1px solid"
      borderColor={COLORS.headerBorder}
      backdropFilter="blur(8px)"
    >
      <Flex align="center" justify="space-between" maxW="960px" mx="auto">
        {/* Left: Logo + Brand */}
        <Flex align="center" gap={3}>
          <ToothLogo size={28} color={COLORS.logoColor} />
          <Text
            fontSize="lg"
            fontWeight="semibold"
            letterSpacing="wide"
            color={COLORS.brandText}
          >
            SmileCRM
          </Text>
        </Flex>

        {/* Right: Controls */}
        <Flex align="center" gap={5}>
          {/* Language Switch */}
          <Flex align="center" gap={1} fontSize="sm">
            {LANGS.map((lang, index) => (
              <Flex key={lang} align="center">
                <Box
                  as="button"
                  px={1.5}
                  py={0.5}
                  fontWeight="medium"
                  color={language.toUpperCase() === lang ? COLORS.langActive : COLORS.langInactive}
                  transition="color 0.2s"
                  onClick={() => setLanguage(lang.toLowerCase() as 'am' | 'ru' | 'en')}
                  _hover={{ color: COLORS.langActive }}
                  sx={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {lang}
                </Box>
                {index < LANGS.length - 1 && (
                  <Text mx={1} color={COLORS.langDivider}>|</Text>
                )}
              </Flex>
            ))}
          </Flex>

          {/* Notification Bell */}
          <Box position="relative">
            <Bell size={20} color={COLORS.iconColor} />
            {notificationCount > 0 && (
              <Flex
                position="absolute"
                top="-6px"
                right="-6px"
                w="16px"
                h="16px"
                bg={COLORS.badgeBg}
                borderRadius="full"
                align="center"
                justify="center"
              >
                <Text fontSize="10px" fontWeight="semibold" color={COLORS.badgeText}>
                  {notificationCount}
                </Text>
              </Flex>
            )}
          </Box>

          {/* Theme Toggle (cosmetic, shows moon for light mode) */}
          <Box
            as="button"
            color={COLORS.iconColor}
            onClick={onThemeToggle}
            sx={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Moon size={20} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
