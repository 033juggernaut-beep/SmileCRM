/**
 * AppHeader - Main application header with language, notifications, and theme controls
 * 
 * Features:
 * - Fixed position at top
 * - Logo on left
 * - Language switcher (AM | RU | EN)
 * - Notifications bell (placeholder)
 * - Theme toggle (sun/moon)
 */

import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Button,
  useColorMode,
} from '@chakra-ui/react'
import { Bell, Sun, Moon } from 'lucide-react'
import { useLanguage, type Language } from '../../context/LanguageContext'

// Teal accent for active state
const TEAL_ACCENT = '#3B9B8C'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function AppHeader() {
  const { language, setLanguage } = useLanguage()
  const { colorMode, toggleColorMode } = useColorMode()

  const handleNotifications = () => {
    console.log('notifications')
  }

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
        px={4}
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
                color={language === code ? TEAL_ACCENT : 'text.muted'}
                bg={language === code ? 'rgba(59, 155, 140, 0.12)' : 'transparent'}
                borderRadius="md"
                minW="32px"
                h="28px"
                px={2}
                onClick={() => setLanguage(code)}
                _active={{
                  bg: 'rgba(59, 155, 140, 0.2)',
                }}
                sx={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {label}
              </Button>
            ))}
          </HStack>

          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={20} />}
            variant="ghost"
            size="sm"
            color="text.muted"
            borderRadius="lg"
            onClick={handleNotifications}
            _active={{
              color: 'text.primary',
              bg: 'bg.surface2',
            }}
            sx={{
              WebkitTapHighlightColor: 'transparent',
            }}
          />

          {/* Theme Toggle */}
          <IconButton
            aria-label="Toggle theme"
            icon={colorMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            variant="ghost"
            size="sm"
            color="text.muted"
            borderRadius="lg"
            onClick={toggleColorMode}
            _active={{
              color: 'text.primary',
              bg: 'bg.surface2',
            }}
            sx={{
              WebkitTapHighlightColor: 'transparent',
            }}
          />
        </HStack>
      </Flex>
    </Box>
  )
}

export default AppHeader
