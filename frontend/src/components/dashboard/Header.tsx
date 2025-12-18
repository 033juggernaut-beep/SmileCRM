/**
 * Header - Superdesign exact copy
 * Logo | Spacer | Lang Switch | Bell | Theme Toggle
 * Using exact tokens from designTokens.ts
 */

import { Box, Flex, Text } from '@chakra-ui/react';
import { Bell, Moon } from 'lucide-react';
import { ToothLogo } from './ToothLogo';
import { DASHBOARD_TOKENS as T } from './designTokens';
import { useLanguage } from '../../context/LanguageContext';

const LANGS = ['AM', 'RU', 'EN'] as const;

interface HeaderProps {
  notificationCount?: number;
}

export function Header({ notificationCount = 0 }: HeaderProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <Box
      as="header"
      w="100%"
      px={T.headerPaddingX}
      py={T.headerPaddingY}
      bg={T.headerBg}
      borderBottom="1px solid"
      borderColor={T.borderLight}
    >
      <Flex align="center" justify="space-between" maxW={T.containerMaxW} mx="auto">
        {/* Left: Logo + Brand */}
        <Flex align="center" gap={T.gapHeader}>
          <ToothLogo size={T.logoSize} color={T.iconColor} />
          <Text
            fontSize={T.fontLg}
            fontWeight={T.weightSemibold}
            letterSpacing={T.trackingWide}
            color={T.textTitle}
          >
            SmileCRM
          </Text>
        </Flex>

        {/* Right: Controls */}
        <Flex align="center" gap={T.gapHeaderControls}>
          {/* Language Switch */}
          <Flex align="center" gap="4px" fontSize={T.fontSm}>
            {LANGS.map((lang, index) => (
              <Flex key={lang} align="center">
                <Box
                  as="button"
                  px="6px"
                  py="2px"
                  fontWeight={T.weightMedium}
                  color={language.toUpperCase() === lang ? T.textAccent : T.textMuted}
                  onClick={() => setLanguage(lang.toLowerCase() as 'am' | 'ru' | 'en')}
                  sx={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {lang}
                </Box>
                {index < LANGS.length - 1 && (
                  <Text mx="4px" color={T.textDivider}>|</Text>
                )}
              </Flex>
            ))}
          </Flex>

          {/* Notification Bell */}
          <Box position="relative">
            <Bell size={parseInt(T.bellSize)} color={T.textBody} />
            {notificationCount > 0 && (
              <Flex
                position="absolute"
                top="-6px"
                right="-6px"
                w={T.badgeSize}
                h={T.badgeSize}
                bg={T.badgeBg}
                borderRadius="9999px"
                align="center"
                justify="center"
              >
                <Text fontSize={T.badgeFontSize} fontWeight={T.weightSemibold} color={T.badgeText}>
                  {notificationCount}
                </Text>
              </Flex>
            )}
          </Box>

          {/* Theme Toggle (cosmetic) */}
          <Box as="button" color={T.textBody} sx={{ WebkitTapHighlightColor: 'transparent' }}>
            <Moon size={parseInt(T.bellSize)} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Header;
