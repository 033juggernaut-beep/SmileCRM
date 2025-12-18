/**
 * AppHeader - Application header for non-dashboard pages
 * Light theme only (no dark mode toggle)
 */

import {
  Box,
  Flex,
  HStack,
  Text,
  IconButton,
  Button,
} from '@chakra-ui/react'
import { Bell } from 'lucide-react'
import { useLanguage, type Language } from '../../context/LanguageContext'

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'am', label: 'AM' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function AppHeader() {
  const { language, setLanguage } = useLanguage()

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

          {/* Notifications */}
          <IconButton
            aria-label="Notifications"
            icon={<Bell size={20} />}
            variant="ghost"
            size="sm"
            color="text.muted"
            borderRadius="lg"
            _hover={{ bg: 'bg.hover', color: 'text.primary' }}
            sx={{ WebkitTapHighlightColor: 'transparent' }}
          />
        </HStack>
      </Flex>
    </Box>
  )
}

export default AppHeader
