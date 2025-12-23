/**
 * AIAssistantCard - Interactive AI assistant card for dashboard
 * 
 * Features:
 * - Question input
 * - Answer display
 * - Daily limit indicator
 * - History in localStorage (last 5 Q&A)
 * - Premium Onyx style
 */

import { useState, useEffect, useCallback } from 'react'
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
  Collapse,
} from '@chakra-ui/react'
import { Bot, Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { aiAssistantApi, type AILanguage, type AIAssistantAskResponse } from '../../api/aiAssistant'

const MotionBox = motion.create(Box)

interface QAItem {
  question: string
  answer: string
  timestamp: number
}

const STORAGE_KEY = 'smilecrm_ai_history'
const MAX_HISTORY = 5

function loadHistory(): QAItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored).slice(0, MAX_HISTORY)
    }
  } catch (e) {
    console.error('Failed to load AI history:', e)
  }
  return []
}

function saveHistory(items: QAItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)))
  } catch (e) {
    console.error('Failed to save AI history:', e)
  }
}

export interface AIAssistantCardProps {
  className?: string
}

export function AIAssistantCard({ className }: AIAssistantCardProps) {
  const { colorMode } = useColorMode()
  const { t, language: uiLanguage } = useLanguage()
  const toast = useToast()
  const isDark = colorMode === 'dark'

  // State
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [limit, setLimit] = useState<number | null>(null)
  const [history, setHistory] = useState<QAItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
    // Fetch initial limits
    aiAssistantApi.getLimits()
      .then(data => {
        setRemaining(data.remainingToday)
        setLimit(data.limitToday)
      })
      .catch(() => {
        // Ignore errors, will show limit after first request
      })
  }, [])

  // Map UI language to API language
  const getApiLanguage = useCallback((): AILanguage => {
    const langMap: Record<string, AILanguage> = {
      am: 'am',
      ru: 'ru',
      en: 'en',
    }
    return langMap[uiLanguage] || 'ru'
  }, [uiLanguage])

  // Handle submit
  const handleSubmit = async () => {
    if (!question.trim() || isLoading) return

    // Check if limit reached
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
    setCurrentAnswer(null)

    try {
      const response: AIAssistantAskResponse = await aiAssistantApi.ask({
        question: question.trim(),
        language: getApiLanguage(),
      })

      setCurrentAnswer(response.answer)
      setRemaining(response.remainingToday)
      setLimit(response.limitToday)

      // Add to history
      const newItem: QAItem = {
        question: question.trim(),
        answer: response.answer,
        timestamp: Date.now(),
      }
      const newHistory = [newItem, ...history].slice(0, MAX_HISTORY)
      setHistory(newHistory)
      saveHistory(newHistory)

      // Clear input
      setQuestion('')
    } catch (error: any) {
      console.error('AI Assistant error:', error)
      
      // Check for 429 (limit reached)
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

  // Clear history
  const clearHistory = () => {
    setHistory([])
    saveHistory([])
    setCurrentAnswer(null)
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

  return (
    <Box
      className={className}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow={shadow}
      p={5}
      transition="all 0.2s"
    >
      {/* Header */}
      <Flex align="center" gap={3} mb={4}>
        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          bg={iconBg}
          borderRadius="lg"
          color={iconColor}
        >
          <Bot size={24} />
        </Flex>
        <Box flex="1">
          <Text fontSize="md" fontWeight="semibold" color={titleColor}>
            {t('ai.title')}
          </Text>
          <Text fontSize="xs" color={subtitleColor}>
            {t('ai.subtitle')}
          </Text>
        </Box>
        {/* Limit indicator */}
        {limit !== null && (
          <Box textAlign="right">
            <Text fontSize="xs" color={limitColor} fontWeight="medium">
              {remaining}/{limit}
            </Text>
            <Text fontSize="10px" color={subtitleColor}>
              {t('ai.limitLeft')}
            </Text>
          </Box>
        )}
      </Flex>

      {/* Input */}
      <Box mb={3}>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('ai.placeholder')}
          bg={inputBg}
          border="none"
          borderRadius="lg"
          fontSize="sm"
          rows={2}
          resize="none"
          _placeholder={{ color: subtitleColor }}
          _focus={{
            boxShadow: `0 0 0 2px ${iconColor}`,
            outline: 'none',
          }}
          isDisabled={isLoading || isLimitReached}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
      </Box>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        isDisabled={!question.trim() || isLoading || isLimitReached}
        size="sm"
        w="full"
        bg={isLimitReached ? '#94A3B8' : iconColor}
        color="white"
        _hover={{
          bg: isLimitReached ? '#94A3B8' : isDark ? '#3B82F6' : '#1D4ED8',
        }}
        _disabled={{
          bg: '#94A3B8',
          cursor: 'not-allowed',
        }}
        leftIcon={isLoading ? <Spinner size="xs" /> : <Send size={16} />}
      >
        {isLoading ? t('common.loading') : isLimitReached ? t('ai.limitReached') : t('ai.ask')}
      </Button>

      {/* Current Answer */}
      <AnimatePresence>
        {currentAnswer && (
          <MotionBox
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            mt={4}
          >
            <Box
              bg={answerBg}
              borderRadius="lg"
              p={4}
              fontSize="sm"
              color={titleColor}
              whiteSpace="pre-wrap"
              lineHeight="1.6"
            >
              {currentAnswer}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* History toggle */}
      {history.length > 0 && (
        <Box mt={4}>
          <Flex
            align="center"
            justify="space-between"
            cursor="pointer"
            onClick={() => setShowHistory(!showHistory)}
            py={2}
          >
            <Flex align="center" gap={2}>
              <Text fontSize="xs" color={subtitleColor} fontWeight="medium">
                История ({history.length})
              </Text>
              {showHistory ? (
                <ChevronUp size={14} color={subtitleColor} />
              ) : (
                <ChevronDown size={14} color={subtitleColor} />
              )}
            </Flex>
            {showHistory && (
              <IconButton
                aria-label="Clear history"
                icon={<Trash2 size={14} />}
                size="xs"
                variant="ghost"
                color={subtitleColor}
                onClick={(e) => {
                  e.stopPropagation()
                  clearHistory()
                }}
              />
            )}
          </Flex>

          <Collapse in={showHistory} animateOpacity>
            <Box
              maxH="200px"
              overflowY="auto"
              mt={2}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDark ? '#475569' : '#CBD5E1',
                  borderRadius: '2px',
                },
              }}
            >
              {history.map((item, idx) => (
                <Box
                  key={item.timestamp}
                  mb={idx < history.length - 1 ? 3 : 0}
                  p={3}
                  bg={isDark ? 'rgba(51, 65, 85, 0.3)' : '#F8FAFC'}
                  borderRadius="md"
                >
                  <Text fontSize="xs" fontWeight="medium" color={iconColor} mb={1}>
                    Q: {item.question}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={subtitleColor}
                    noOfLines={3}
                    whiteSpace="pre-wrap"
                  >
                    {item.answer}
                  </Text>
                </Box>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  )
}

export default AIAssistantCard

