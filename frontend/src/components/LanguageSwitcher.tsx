/**
 * Language Switcher Component
 * Compact dropdown to switch between AM / RU / EN
 */

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useLanguage } from '../context/LanguageContext'
import { languageNames, type Language } from '../i18n'

const LANGUAGES: Language[] = ['am', 'ru', 'en']

interface LanguageSwitcherProps {
  /** Variant: 'compact' shows only flag+code, 'full' shows native name */
  variant?: 'compact' | 'full'
}

export function LanguageSwitcher({ variant = 'compact' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()
  const current = languageNames[language]
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        size="sm"
        px={2}
        borderRadius="lg"
        color="text.secondary"
        _hover={{ bg: 'bg.hover', color: 'text.primary' }}
        _active={{ bg: 'bg.active' }}
      >
        <HStack spacing={1}>
          <Text fontSize="lg">{current.flag}</Text>
          <Text fontSize="xs" fontWeight="medium" textTransform="uppercase">
            {language}
          </Text>
        </HStack>
      </MenuButton>
      
      <MenuList
        bg="bg.secondary"
        borderColor="border.subtle"
        boxShadow="lg"
        minW="120px"
        py={1}
      >
        {LANGUAGES.map((lang) => {
          const info = languageNames[lang]
          const isActive = lang === language
          
          return (
            <MenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              bg={isActive ? 'bg.hover' : 'transparent'}
              _hover={{ bg: 'bg.hover' }}
              px={3}
              py={2}
            >
              <HStack spacing={2} w="full">
                <Text fontSize="lg">{info.flag}</Text>
                <Text
                  fontSize="sm"
                  fontWeight={isActive ? 'semibold' : 'normal'}
                  color={isActive ? 'primary.400' : 'text.primary'}
                >
                  {variant === 'full' ? info.native : lang.toUpperCase()}
                </Text>
              </HStack>
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}
