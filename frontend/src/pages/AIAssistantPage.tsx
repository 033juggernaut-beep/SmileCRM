/**
 * AIAssistantPage - Dedicated AI Assistant page
 * 
 * Features:
 * - Professional dental assistant interface
 * - Question input with Enter to submit
 * - Answer display with loading/error states
 * - Daily limit indicator
 * - Premium Onyx theme matching Stats page
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Flex,
  Text,
  Textarea,
  Button,
  Spinner,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Bot, Send, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

import { Header } from '../components/dashboard/Header'
import { Footer } from '../components/dashboard/Footer'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'
import { BackButton } from '../components/patientCard/BackButton'
import { useLanguage } from '../context/LanguageContext'
import { aiAssistantApi, type AILanguage } from '../api/aiAssistant'

const MotionBox = motion.create(Box)

export const AIAssistantPage = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t, language: uiLanguage } = useLanguage()
  const toast = useToast()
  const isDark = colorMode === 'dark'
  const answerRef = useRef<HTMLDivElement>(null)

  // State
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limit, setLimit] = useState<number | null>(null)

  // Page background (same as Stats page)
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  // Footer links
  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ]

  // Fetch initial limits
  useEffect(() => {
    aiAssistantApi.getLimits()
      .then(data => {
        setRemaining(data.remainingToday)
        setLimit(data.limitToday)
      })
      .catch(() => {
        // Ignore, will show after first request
      })
  }, [])

  // Scroll to answer when it appears
  useEffect(() => {
    if (answer && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [answer])

  // Map UI language to API language
  const getApiLanguage = useCallback((): AILanguage => {
    const langMap: Record<string, AILanguage> = { am: 'am', ru: 'ru', en: 'en' }
    return langMap[uiLanguage] || 'ru'
  }, [uiLanguage])

  // Handle submit
  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return

    if (remaining !== null && remaining <= 0) {
      toast({
        title: t('ai.limitReached'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    setAnswer(null)

    try {
      const response = await aiAssistantApi.ask({
        question: question.trim(),
        language: getApiLanguage(),
      })

      setAnswer(response.answer)
      setRemaining(response.remainingToday)
      setLimit(response.limitToday)
    } catch (error: any) {
      console.error('AI Assistant error:', error)
      
      if (error?.response?.status === 429) {
        const detail = error.response.data?.detail
        if (detail) {
          setRemaining(detail.remainingToday ?? 0)
          setLimit(detail.limitToday)
        }
        toast({
          title: t('ai.limitReached'),
          status: 'warning',
          duration: 4000,
          isClosable: true,
        })
      } else {
        toast({
          title: t('ai.errorGeneric'),
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Theme colors
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'
  const shadow = isDark
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
    : '0 4px 6px -1px rgba(239, 246, 255, 1)'
  const iconBg = isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE'
  const iconColor = isDark ? '#60A5FA' : '#2563EB'
  const titleColor = isDark ? 'white' : '#1E293B'
  const subtitleColor = isDark ? '#94A3B8' : '#64748B'
  const inputBg = isDark ? 'rgba(51, 65, 85, 0.5)' : '#F1F5F9'
  const answerBg = isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF'
  const limitColor = remaining === 0 ? '#EF4444' : isDark ? '#60A5FA' : '#2563EB'

  const isLimitReached = remaining !== null && remaining <= 0
  const canSubmit = question.trim().length > 0 && !isLoading && !isLimitReached

  return (
    <Box
      minH="100dvh"
      w="full"
      position="relative"
      transition="colors 0.3s"
      bg={pageBg}
      overflowY="auto"
      overflowX="hidden"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      <BackgroundPattern />

      <Box position="relative" zIndex={10} display="flex" flexDirection="column" minH="100dvh">
        <Header />

        <MotionBox
          as="main"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          px={4}
          py={{ base: 6, md: 10 }}
        >
          <Box w="full" maxW="2xl" mx="auto">
            {/* Back Button */}
            <Box mb={4}>
              <BackButton onClick={() => navigate('/home')} />
            </Box>

            {/* Header Card */}
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              boxShadow={shadow}
              p={6}
              mb={6}
            >
              <Flex align="center" gap={4} mb={4}>
                <Flex
                  align="center"
                  justify="center"
                  w="48px"
                  h="48px"
                  bg={iconBg}
                  borderRadius="xl"
                  color={iconColor}
                >
                  <Bot size={28} />
                </Flex>
                <Box flex="1">
                  <Flex align="center" gap={2}>
                    <Text fontSize="xl" fontWeight="bold" color={titleColor}>
                      {t('ai.pageTitle')}
                    </Text>
                    <Flex
                      align="center"
                      gap={1}
                      px={2}
                      py={0.5}
                      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                      borderRadius="full"
                    >
                      <Sparkles size={12} color={iconColor} />
                      <Text fontSize="xs" fontWeight="semibold" color={iconColor}>
                        AI
                      </Text>
                    </Flex>
                  </Flex>
                  <Text fontSize="sm" color={subtitleColor} mt={1}>
                    {t('ai.pageSubtitle')}
                  </Text>
                </Box>
                {/* Limit indicator */}
                {limit !== null && (
                  <Box textAlign="right">
                    <Text fontSize="lg" fontWeight="bold" color={limitColor}>
                      {remaining}/{limit}
                    </Text>
                    <Text fontSize="xs" color={subtitleColor}>
                      {t('ai.limitLeft')}
                    </Text>
                  </Box>
                )}
              </Flex>

              {/* Input Area */}
              <Box mb={4}>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('ai.inputPlaceholder')}
                  bg={inputBg}
                  border="none"
                  borderRadius="lg"
                  fontSize="sm"
                  rows={3}
                  resize="none"
                  _placeholder={{ color: subtitleColor }}
                  _focus={{
                    boxShadow: `0 0 0 2px ${iconColor}`,
                    outline: 'none',
                  }}
                  isDisabled={isLoading || isLimitReached}
                />
              </Box>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                isDisabled={!canSubmit}
                size="md"
                w="full"
                bg={isLimitReached ? '#94A3B8' : iconColor}
                color="white"
                fontWeight="semibold"
                _hover={{
                  bg: isLimitReached ? '#94A3B8' : isDark ? '#3B82F6' : '#1D4ED8',
                }}
                _disabled={{
                  bg: '#94A3B8',
                  cursor: 'not-allowed',
                  opacity: 0.7,
                }}
                leftIcon={isLoading ? <Spinner size="sm" /> : <Send size={18} />}
              >
                {isLoading ? t('common.loading') : isLimitReached ? t('ai.limitReached') : t('ai.ask')}
              </Button>
            </Box>

            {/* Answer Card */}
            {(answer || isLoading) && (
              <MotionBox
                ref={answerRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow={shadow}
                p={6}
              >
                <Flex align="center" gap={2} mb={4}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg={iconColor}
                  />
                  <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                    {t('ai.answerTitle')}
                  </Text>
                </Flex>

                {isLoading ? (
                  <Flex align="center" justify="center" py={8}>
                    <Spinner size="lg" color={iconColor} thickness="3px" />
                  </Flex>
                ) : answer ? (
                  <Box
                    bg={answerBg}
                    borderRadius="lg"
                    p={4}
                    fontSize="sm"
                    color={titleColor}
                    whiteSpace="pre-wrap"
                    lineHeight="1.7"
                  >
                    {answer}
                  </Box>
                ) : null}
              </MotionBox>
            )}
          </Box>
        </MotionBox>

        <Footer links={footerLinks} />
      </Box>
    </Box>
  )
}

export default AIAssistantPage

