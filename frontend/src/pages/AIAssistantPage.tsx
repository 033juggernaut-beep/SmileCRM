/**
 * AIAssistantPage - Dedicated AI Assistant page
 * 
 * Features:
 * - Professional dental assistant interface
 * - Question input with Enter to submit
 * - Answer display with loading/error states
 * - Daily limit indicator
 * - Premium Onyx theme matching Stats page
 * - Persistence: saves last Q&A to localStorage (24h TTL)
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
  IconButton,
  HStack,
  Collapse,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Bot, Send, Sparkles, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { motion } from 'framer-motion'

import { Header } from '../components/dashboard/Header'
import { Footer } from '../components/dashboard/Footer'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'
import { BackButton } from '../components/patientCard/BackButton'
import { useLanguage } from '../context/LanguageContext'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { aiAssistantApi, type AILanguage } from '../api/aiAssistant'
import {
  loadLastAiAnswer,
  saveLastAiAnswer,
  clearLastAiAnswer,
  formatSavedTime,
  type AiAssistantSaved,
} from '../utils/aiAssistantStorage'

const MotionBox = motion.create(Box)

export const AIAssistantPage = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t, language: uiLanguage } = useLanguage()
  const toast = useToast()
  const isDark = colorMode === 'dark'
  const answerRef = useRef<HTMLDivElement>(null)

  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const handleBack = useCallback(() => navigate('/home'), [navigate])
  const { showFallbackButton } = useTelegramBackButton(handleBack)

  // State
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limit, setLimit] = useState<number | null>(null)
  
  // Persistence state
  const [savedQuestion, setSavedQuestion] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [isAnswerHidden, setIsAnswerHidden] = useState(false)

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

  // Load saved answer on mount
  useEffect(() => {
    const saved = loadLastAiAnswer()
    if (saved) {
      setSavedQuestion(saved.question)
      setAnswer(saved.answer)
      setSavedAt(saved.createdAt)
      setIsAnswerHidden(false)
    }
  }, [])

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
      
      // Persist Q&A
      const lang = getApiLanguage() as AiAssistantSaved['lang']
      const now = new Date().toISOString()
      saveLastAiAnswer({
        question: question.trim(),
        answer: response.answer,
        lang,
        createdAt: now,
      })
      setSavedQuestion(question.trim())
      setSavedAt(now)
      setIsAnswerHidden(false)
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

  // Clear saved answer
  const handleClearAnswer = useCallback(() => {
    clearLastAiAnswer()
    setAnswer(null)
    setSavedQuestion(null)
    setSavedAt(null)
    setIsAnswerHidden(false)
  }, [])

  // Toggle hide/show answer
  const handleToggleHide = useCallback(() => {
    setIsAnswerHidden(prev => !prev)
  }, [])

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
          pt={topInset > 0 ? `${topInset + 24}px` : { base: 6, md: 10 }}
        >
          <Box w="full" maxW="2xl" mx="auto">
            {/* Back Button - only show if not in Telegram */}
            {showFallbackButton && (
              <Box mb={4}>
                <BackButton onClick={handleBack} />
              </Box>
            )}

            {/* Header Card */}
            <Box
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="xl"
              boxShadow={shadow}
              p={6}
              mb={6}
              overflowX="hidden"
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
                  flexShrink={0}
                >
                  <Bot size={28} />
                </Flex>
                <Box flex="1" minW="0">
                  <Flex align="center" gap={2} flexWrap="wrap">
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
                      flexShrink={0}
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
                  <Box textAlign="right" flexShrink={0}>
                    <Text fontSize="lg" fontWeight="bold" color={limitColor} whiteSpace="nowrap">
                      {remaining}/{limit}
                    </Text>
                    <Text fontSize="xs" color={subtitleColor} whiteSpace="nowrap">
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
                {/* Header with title and controls */}
                <Flex align="center" justify="space-between" mb={isAnswerHidden ? 0 : 4}>
                  <Flex align="center" gap={2}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      bg={iconColor}
                    />
                    <Text fontSize="sm" fontWeight="semibold" color={titleColor}>
                      {t('ai.answerTitle')}
                    </Text>
                    {/* Saved time indicator */}
                    {savedAt && !isLoading && (
                      <Text fontSize="xs" color={subtitleColor} ml={2}>
                        • {formatSavedTime(savedAt, t)}
                      </Text>
                    )}
                  </Flex>
                  
                  {/* Control buttons */}
                  {answer && !isLoading && (
                    <HStack spacing={1}>
                      <IconButton
                        aria-label={isAnswerHidden ? t('ai.showAnswer') : t('ai.hideAnswer')}
                        icon={isAnswerHidden ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        size="sm"
                        variant="ghost"
                        color={subtitleColor}
                        _hover={{ color: titleColor, bg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
                        onClick={handleToggleHide}
                      />
                      <IconButton
                        aria-label={t('ai.clearAnswer')}
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="ghost"
                        color={subtitleColor}
                        _hover={{ color: '#EF4444', bg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}
                        onClick={handleClearAnswer}
                      />
                    </HStack>
                  )}
                </Flex>

                {isLoading ? (
                  <Flex align="center" justify="center" py={8}>
                    <Spinner size="lg" color={iconColor} thickness="3px" />
                  </Flex>
                ) : answer ? (
                  <Collapse in={!isAnswerHidden} animateOpacity>
                    {/* Saved question display */}
                    {savedQuestion && (
                      <Box
                        bg={isDark ? 'rgba(51, 65, 85, 0.3)' : '#F8FAFC'}
                        borderRadius="lg"
                        p={3}
                        mb={3}
                        fontSize="sm"
                        color={subtitleColor}
                        fontStyle="italic"
                      >
                        "{savedQuestion}"
                      </Box>
                    )}
                    <Box
                      bg={answerBg}
                      borderRadius="lg"
                      p={4}
                      fontSize="sm"
                      color={titleColor}
                      whiteSpace="pre-wrap"
                      lineHeight="1.7"
                      overflowX="hidden"
                    >
                      {answer}
                    </Box>
                  </Collapse>
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

