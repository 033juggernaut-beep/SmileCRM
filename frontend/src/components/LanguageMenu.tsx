/**
 * LanguageMenu - Responsive language selector
 * 
 * Mobile: Shows current language as button, opens dropdown on tap
 * Desktop: Shows inline AM | RU | EN buttons
 */

import {
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ChevronDown } from 'lucide-react'
import { useLanguage, type Language } from '../context/LanguageContext'

interface LanguageOption {
  code: Language
  label: string
  flag: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'am', label: 'AM', flag: '🇦🇲' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
]

interface LanguageMenuProps {
  /** Force mobile dropdown mode */
  forceMobile?: boolean
  /** Custom active color */
  activeColor?: string
  /** Custom inactive color */
  inactiveColor?: string
  /** Custom divider color (for desktop inline mode) */
  dividerColor?: string
}

export function LanguageMenu({
  forceMobile = false,
  activeColor = '#2563EB',
  inactiveColor = '#94A3B8',
  dividerColor = '#CBD5E1',
}: LanguageMenuProps) {
  const { language, setLanguage } = useLanguage()
  
  // Use dropdown on mobile (base/sm), inline on larger screens
  // Always use dropdown if forceMobile is true
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true
  const useDropdown = forceMobile || isMobile
  
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

  if (useDropdown) {
    return (
      <Menu placement="bottom-end" isLazy>
        <MenuButton
          as={Button}
          size="sm"
          variant="ghost"
          px={2}
          h="36px"
          minW="52px"
          fontWeight="semibold"
          fontSize="sm"
          color={activeColor}
          rightIcon={<ChevronDown size={14} />}
          _hover={{ bg: 'blackAlpha.50' }}
          _active={{ bg: 'blackAlpha.100' }}
          sx={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Flex align="center" gap={1}>
            <Text fontSize="sm">{currentLang.flag}</Text>
            <Text>{currentLang.label}</Text>
          </Flex>
        </MenuButton>
        <MenuList
          minW="120px"
          py={1}
          shadow="lg"
          borderRadius="xl"
          border="1px solid"
          borderColor="border.subtle"
          bg="bg.surface"
          zIndex={2000}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              bg={language === lang.code ? 'primary.50' : 'transparent'}
              color={language === lang.code ? 'primary.600' : 'text.primary'}
              fontWeight={language === lang.code ? 'semibold' : 'medium'}
              fontSize="sm"
              px={3}
              py={2}
              _hover={{ bg: language === lang.code ? 'primary.100' : 'bg.hover' }}
              sx={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Flex align="center" gap={2}>
                <Text>{lang.flag}</Text>
                <Text>{lang.label}</Text>
              </Flex>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    )
  }

  // Desktop inline mode: AM | RU | EN
  return (
    <Flex align="center" gap="4px" fontSize="sm">
      {LANGUAGES.map((lang, index) => (
        <Flex key={lang.code} align="center">
          <Box
            as="button"
            px="6px"
            py="2px"
            fontWeight="medium"
            color={language === lang.code ? activeColor : inactiveColor}
            onClick={() => setLanguage(lang.code)}
            transition="color 0.2s"
            sx={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {lang.label}
          </Box>
          {index < LANGUAGES.length - 1 && (
            <Text mx="4px" color={dividerColor}>|</Text>
          )}
        </Flex>
      ))}
    </Flex>
  )
}

export default LanguageMenu

