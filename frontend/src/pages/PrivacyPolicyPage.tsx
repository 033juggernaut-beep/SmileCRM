/**
 * PrivacyPolicyPage - Full privacy policy rendered from markdown
 * 
 * Loads the appropriate markdown file based on current language (am/ru/en)
 * Uses react-markdown for rendering
 * 
 * Placeholders to replace before production:
 * - {{DATE}} - effective date
 * - {{VERSION}} - policy version (e.g., 1.0)
 * - {{EMAIL}} - contact email
 * - {{COMPANY_NAME}} - company/individual name
 * - {{ADDRESS}} - legal address
 * - {{PAYMENTS_RETENTION}} - payment data retention period
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Spinner,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'

import { BackgroundPattern } from '../components/dashboard'
import { BackButton } from '../components/patientCard/BackButton'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { useLanguage } from '../context/LanguageContext'

// Import markdown content as raw strings
import privacyAm from '../content/privacy_policy.am.md?raw'
import privacyRu from '../content/privacy_policy.ru.md?raw'
import privacyEn from '../content/privacy_policy.en.md?raw'

// Placeholder values - CHANGE THESE BEFORE PRODUCTION
const PLACEHOLDERS: Record<string, string> = {
  '{{DATE}}': '2026-01-06',
  '{{VERSION}}': '1.0',
  '{{EMAIL}}': 'support@smilecrm.app',
  '{{COMPANY_NAME}}': 'SmileCRM',
  '{{ADDRESS}}': 'Yerevan, Armenia',
  '{{PAYMENTS_RETENTION}}': '5 years',
}

// Replace all placeholders in content
const replacePlaceholders = (content: string): string => {
  let result = content
  for (const [placeholder, value] of Object.entries(PLACEHOLDERS)) {
    result = result.replaceAll(placeholder, value)
  }
  return result
}

export const PrivacyPolicyPage = () => {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const handleBack = () => navigate('/home')
  const { showFallbackButton } = useTelegramBackButton(handleBack)

  // Get content based on language
  const [content, setContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const contentMap: Record<string, string> = {
      am: privacyAm,
      ru: privacyRu,
      en: privacyEn,
    }
    
    const rawContent = contentMap[language] || contentMap.ru
    setContent(replacePlaceholders(rawContent))
    setIsLoading(false)
  }, [language])
  
  // Background gradient matching HomePage
  const pageBg = isDark 
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  // Content styles
  const contentBg = isDark 
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.95)'

  const textColor = isDark ? 'gray.100' : 'gray.800'
  const mutedColor = isDark ? 'gray.400' : 'gray.600'
  const linkColor = isDark ? 'blue.300' : 'blue.600'
  const borderColor = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)'
  const codeBg = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 0.8)'
  
  return (
    <Box
      minH="100dvh"
      w="100%"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      position="relative"
      transition="background 0.3s"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        {/* Back Button - only show if not in Telegram */}
        {showFallbackButton && (
          <Box px="16px" pt={topInset > 0 ? `${topInset + 16}px` : '16px'}>
            <BackButton onClick={handleBack} />
          </Box>
        )}

        <Flex
          as="main"
          direction="column"
          align="center"
          justify="flex-start"
          flex="1"
          px="16px"
          py={{ base: '16px', md: '32px' }}
        >
          {/* Loading state */}
          {isLoading && (
            <Flex justify="center" align="center" py="64px">
              <Spinner size="lg" color="blue.500" thickness="3px" />
            </Flex>
          )}

          {/* Markdown Content */}
          {!isLoading && (
            <Box
              w="100%"
              maxW="720px"
              bg={contentBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              p={{ base: 5, md: 8 }}
              mb="32px"
              boxShadow={isDark 
                ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
              }
              sx={{
                // Markdown styling
                '& h1': {
                  fontSize: { base: 'xl', md: '2xl' },
                  fontWeight: 'bold',
                  color: textColor,
                  mb: 4,
                  mt: 0,
                  pb: 3,
                  borderBottom: '2px solid',
                  borderColor: 'green.500',
                },
                '& h2': {
                  fontSize: { base: 'lg', md: 'xl' },
                  fontWeight: 'semibold',
                  color: textColor,
                  mt: 8,
                  mb: 4,
                  pb: 2,
                  borderBottom: '1px solid',
                  borderColor: borderColor,
                },
                '& h3': {
                  fontSize: { base: 'md', md: 'lg' },
                  fontWeight: 'semibold',
                  color: textColor,
                  mt: 6,
                  mb: 3,
                },
                '& p': {
                  fontSize: 'sm',
                  color: mutedColor,
                  lineHeight: 'tall',
                  mb: 4,
                },
                '& ul, & ol': {
                  pl: 5,
                  mb: 4,
                  '& li': {
                    fontSize: 'sm',
                    color: mutedColor,
                    lineHeight: 'tall',
                    mb: 2,
                  },
                },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'orange.400',
                  pl: 4,
                  py: 2,
                  my: 4,
                  bg: isDark ? 'rgba(251, 146, 60, 0.1)' : 'orange.50',
                  borderRadius: 'md',
                  '& p': {
                    mb: 0,
                    color: isDark ? 'orange.200' : 'orange.700',
                  },
                },
                '& strong': {
                  fontWeight: 'semibold',
                  color: textColor,
                },
                '& a': {
                  color: linkColor,
                  textDecoration: 'underline',
                  _hover: {
                    textDecoration: 'none',
                  },
                },
                '& code': {
                  bg: codeBg,
                  px: 2,
                  py: 0.5,
                  borderRadius: 'md',
                  fontSize: 'xs',
                  fontFamily: 'mono',
                },
                '& table': {
                  width: '100%',
                  mb: 4,
                  fontSize: 'sm',
                  borderCollapse: 'collapse',
                  '& th, & td': {
                    border: '1px solid',
                    borderColor: borderColor,
                    px: 3,
                    py: 2,
                    textAlign: 'left',
                  },
                  '& th': {
                    bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50',
                    fontWeight: 'semibold',
                    color: textColor,
                  },
                  '& td': {
                    color: mutedColor,
                  },
                },
                '& hr': {
                  borderColor: borderColor,
                  my: 6,
                },
                '& em': {
                  fontStyle: 'italic',
                  color: mutedColor,
                },
              }}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  )
}
