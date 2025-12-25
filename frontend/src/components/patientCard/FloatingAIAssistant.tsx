/**
 * Floating AI Assistant Widget - Real AI integration
 * - Text input with category selection
 * - Calls OpenAI backend for structured suggestions
 * - Shows draft/actions and Apply button
 */

import { useState, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  Grid,
  VStack,
  HStack,
  useColorMode,
  IconButton,
  useToast,
  Spinner,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { X, Stethoscope, Calendar, Wallet, Megaphone, Send, Check, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { aiApi } from '../../api/ai'
import type { AICategory, AIAction, AIAssistantResponse } from '../../api/ai'

interface FloatingAIAssistantProps {
  patientId?: string
  onActionsApplied?: () => void
}

// Minimal robot/assistant icon
function AssistantIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: '100%', height: '100%' }}
    >
      <rect x="5" y="4" width="14" height="12" rx="2" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <line x1="12" y1="4" x2="12" y2="2" />
      <circle cx="12" cy="1.5" r="1" fill="currentColor" stroke="none" />
      <path d="M8 16v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
    </svg>
  )
}

const MotionBox = motion(Box)
const MotionButton = motion(Button)

// Map frontend category IDs to API categories
const categoryMap: Record<string, AICategory> = {
  diagnosis: 'diagnosis',
  visit: 'visits',
  finance: 'finance',
  marketing: 'marketing',
}

export function FloatingAIAssistant({ patientId, onActionsApplied }: FloatingAIAssistantProps) {
  const { t, language } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIAssistantResponse | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const capabilities = [
    {
      id: 'diagnosis',
      icon: Stethoscope,
      labelKey: 'patientCard.ai.diagnosis',
      descKey: 'patientCard.ai.diagnosisDesc',
    },
    {
      id: 'visit',
      icon: Calendar,
      labelKey: 'patientCard.ai.visits',
      descKey: 'patientCard.ai.visitsDesc',
    },
    {
      id: 'finance',
      icon: Wallet,
      labelKey: 'patientCard.ai.finance',
      descKey: 'patientCard.ai.financeDesc',
    },
    {
      id: 'marketing',
      icon: Megaphone,
      labelKey: 'patientCard.ai.marketing',
      descKey: 'patientCard.ai.marketingDesc',
    },
  ]

  const handleCategorySelect = (capId: string) => {
    setSelectedCategory(selectedCategory === capId ? null : capId)
    setValidationError(null)
  }

  const handleAskAI = useCallback(async () => {
    // Validation
    if (!inputText.trim()) {
      setValidationError(t('patientCard.ai.enterText') || 'Введите текст запроса')
      return
    }
    if (!selectedCategory) {
      setValidationError(t('patientCard.ai.selectCategory') || 'Выберите категорию')
      return
    }

    setValidationError(null)
    setIsLoading(true)
    setAiResponse(null)

    try {
      const response = await aiApi.assistant({
        category: categoryMap[selectedCategory],
        patient_id: patientId || null,
        text: inputText,
        locale: language as 'ru' | 'hy' | 'en',
      })

      setAiResponse(response)
    } catch (error) {
      console.error('AI request failed:', error)
      const message = error instanceof Error ? error.message : 'AI service error'
      toast({
        title: t('common.error'),
        description: message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [inputText, selectedCategory, patientId, language, toast, t])

  const handleApply = useCallback(async () => {
    if (!aiResponse?.actions?.length) return

    setIsApplying(true)

    try {
      const result = await aiApi.apply(aiResponse.actions as AIAction[])

      if (result.success) {
        toast({
          title: t('common.saved') || 'Сохранено',
          description: `${result.results.applied.length} действий применено`,
          status: 'success',
          duration: 3000,
        })
        // Reset state
        setAiResponse(null)
        setInputText('')
        setSelectedCategory(null)
        // Notify parent to refresh data
        onActionsApplied?.()
      } else {
        toast({
          title: t('common.error'),
          description: `${result.results.failed.length} действий не удалось применить`,
          status: 'warning',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Apply failed:', error)
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : 'Failed to apply',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsApplying(false)
    }
  }, [aiResponse, toast, t, onActionsApplied])

  const formatActionType = (type: string): string => {
    const typeLabels: Record<string, string> = {
      update_patient_diagnosis: '📋 Обновить диагноз',
      create_visit: '📅 Создать визит',
      add_finance_note: '💰 Заметка по оплате',
    }
    return typeLabels[type] || type
  }

  const renderActionDetails = (action: AIAction): string => {
    if (action.type === 'update_patient_diagnosis') {
      return action.diagnosis || ''
    }
    if (action.type === 'create_visit') {
      const parts = []
      if (action.visit_date) parts.push(`Дата: ${action.visit_date}`)
      if (action.next_visit_date) parts.push(`След. визит: ${action.next_visit_date}`)
      if (action.notes) parts.push(`Заметки: ${action.notes}`)
      return parts.join(' | ')
    }
    if (action.type === 'add_finance_note') {
      return action.note || ''
    }
    return JSON.stringify(action)
  }

  return (
    <Box position="fixed" bottom={6} right={6} zIndex={50}>
      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <MotionBox
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            position="absolute"
            bottom={16}
            right={0}
            w="80"
            maxH="500px"
            overflowY="auto"
            borderRadius="2xl"
            boxShadow="2xl"
            bg={isDark ? 'gray.800' : 'white'}
            border="1px solid"
            borderColor={isDark ? 'gray.700' : 'gray.200'}
          >
            {/* Header */}
            <Flex
              px={4}
              py={3}
              align="center"
              justify="space-between"
              borderBottom="1px solid"
              borderColor={isDark ? 'gray.700' : 'gray.100'}
              position="sticky"
              top={0}
              bg={isDark ? 'gray.800' : 'white'}
              zIndex={1}
            >
              <Flex align="center" gap={2}>
                <Box w={5} h={5} color={isDark ? 'blue.400' : 'blue.600'}>
                  <AssistantIcon />
                </Box>
                <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'gray.800'}>
                  {t('patientCard.ai.title')}
                </Text>
              </Flex>
              <IconButton
                aria-label={t('common.close')}
                icon={<Box as={X} w={4} h={4} />}
                size="xs"
                variant="ghost"
                color={isDark ? 'gray.400' : 'gray.500'}
                _hover={{ bg: isDark ? 'gray.700' : 'gray.100' }}
                onClick={() => setIsOpen(false)}
              />
            </Flex>

            <Box p={3}>
              {/* Text Input */}
              <Box mb={3}>
                <Textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    setValidationError(null)
                  }}
                  placeholder={t('patientCard.ai.placeholder')}
                  rows={3}
                  resize="none"
                  fontSize="sm"
                  borderRadius="xl"
                  bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}
                  color={isDark ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={validationError && !inputText.trim() ? 'red.500' : (isDark ? 'gray.600' : 'gray.200')}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: isDark ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 0 0 2px rgba(59, 130, 246, 0.3)',
                  }}
                />
              </Box>

              {/* Category Selection */}
              <Box mb={3}>
                <Text fontSize="xs" mb={2} color={isDark ? 'gray.500' : 'gray.400'}>
                  {t('patientCard.ai.helpWith')}
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {capabilities.map((cap) => {
                    const isSelected = selectedCategory === cap.id
                    return (
                      <Button
                        key={cap.id}
                        onClick={() => handleCategorySelect(cap.id)}
                        variant="ghost"
                        size="sm"
                        justifyContent="flex-start"
                        gap={2}
                        p={2.5}
                        h="auto"
                        borderRadius="xl"
                        border="2px solid"
                        borderColor={isSelected ? 'blue.500' : 'transparent'}
                        bg={isSelected ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50') : 'transparent'}
                        _hover={{ bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50' }}
                      >
                        <Box
                          as={cap.icon}
                          w={4}
                          h={4}
                          flexShrink={0}
                          color={isSelected ? 'blue.500' : (isDark ? 'blue.400' : 'blue.600')}
                        />
                        <Box textAlign="left">
                          <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.300' : 'gray.600'}>
                            {t(cap.labelKey)}
                          </Text>
                          <Text fontSize="10px" color={isDark ? 'gray.500' : 'gray.400'}>
                            {t(cap.descKey)}
                          </Text>
                        </Box>
                      </Button>
                    )
                  })}
                </Grid>
              </Box>

              {/* Validation Error */}
              {validationError && (
                <Flex align="center" gap={2} mb={3} p={2} borderRadius="lg" bg={isDark ? 'red.900' : 'red.50'}>
                  <Box as={AlertCircle} w={4} h={4} color="red.500" />
                  <Text fontSize="xs" color="red.500">{validationError}</Text>
                </Flex>
              )}

              {/* Ask AI Button */}
              <Button
                onClick={handleAskAI}
                isLoading={isLoading}
                loadingText="Думаю..."
                leftIcon={<Box as={Send} w={4} h={4} />}
                colorScheme="blue"
                size="sm"
                w="full"
                borderRadius="xl"
                mb={3}
                isDisabled={!inputText.trim() || !selectedCategory}
              >
                {t('patientCard.ai.ask') || 'Спросить AI'}
              </Button>

              {/* AI Response */}
              {aiResponse && (
                <VStack spacing={3} align="stretch">
                  <Divider borderColor={isDark ? 'gray.700' : 'gray.200'} />

                  {/* Summary */}
                  <Box p={3} borderRadius="lg" bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}>
                    <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                      {t('patientCard.ai.summary') || 'Понял:'}
                    </Text>
                    <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                      {aiResponse.summary}
                    </Text>
                  </Box>

                  {/* Actions */}
                  {aiResponse.actions.length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'} mb={2}>
                        {t('patientCard.ai.actions') || 'Действия:'}
                      </Text>
                      <VStack spacing={2} align="stretch">
                        {aiResponse.actions.map((action, idx) => (
                          <Box
                            key={idx}
                            p={2}
                            borderRadius="lg"
                            bg={isDark ? 'rgba(34, 197, 94, 0.1)' : 'green.50'}
                            border="1px solid"
                            borderColor={isDark ? 'green.800' : 'green.200'}
                          >
                            <Badge colorScheme="green" fontSize="10px" mb={1}>
                              {formatActionType(action.type)}
                            </Badge>
                            <Text fontSize="xs" color={isDark ? 'gray.300' : 'gray.600'}>
                              {renderActionDetails(action as AIAction)}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Marketing Draft */}
                  {aiResponse.draft?.marketing_message && (
                    <Box p={3} borderRadius="lg" bg={isDark ? 'rgba(168, 85, 247, 0.1)' : 'purple.50'}>
                      <Text fontSize="xs" fontWeight="medium" color={isDark ? 'purple.400' : 'purple.600'} mb={1}>
                        📨 Маркетинговое сообщение:
                      </Text>
                      <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'} whiteSpace="pre-wrap">
                        {aiResponse.draft.marketing_message}
                      </Text>
                    </Box>
                  )}

                  {/* Warnings */}
                  {aiResponse.warnings.length > 0 && (
                    <Box p={2} borderRadius="lg" bg={isDark ? 'rgba(251, 191, 36, 0.1)' : 'yellow.50'}>
                      {aiResponse.warnings.map((warning, idx) => (
                        <Text key={idx} fontSize="xs" color={isDark ? 'yellow.400' : 'yellow.700'}>
                          ⚠️ {warning}
                        </Text>
                      ))}
                    </Box>
                  )}

                  {/* Apply Button */}
                  {aiResponse.actions.length > 0 && (
                    <HStack spacing={2}>
                      <Button
                        onClick={handleApply}
                        isLoading={isApplying}
                        loadingText="Сохраняю..."
                        leftIcon={<Box as={Check} w={4} h={4} />}
                        colorScheme="green"
                        size="sm"
                        flex={1}
                        borderRadius="xl"
                      >
                        {t('patientCard.ai.apply') || 'Применить'}
                      </Button>
                      <Button
                        onClick={() => setAiResponse(null)}
                        variant="ghost"
                        size="sm"
                        borderRadius="xl"
                        color={isDark ? 'gray.400' : 'gray.600'}
                      >
                        {t('common.cancel') || 'Отмена'}
                      </Button>
                    </HStack>
                  )}
                </VStack>
              )}

              {/* Loading State */}
              {isLoading && (
                <Flex justify="center" py={4}>
                  <Spinner size="sm" color="blue.500" />
                </Flex>
              )}
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Main Floating Button */}
      <MotionButton
        onClick={() => setIsOpen(!isOpen)}
        w={14}
        h={14}
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="lg"
        bg={
          isOpen
            ? 'blue.600'
            : isDark
            ? 'gray.700'
            : 'white'
        }
        color={
          isOpen
            ? 'white'
            : isDark
            ? 'blue.400'
            : 'blue.600'
        }
        border={isOpen ? 'none' : '1px solid'}
        borderColor={isDark ? 'gray.600' : 'gray.200'}
        _hover={{
          bg: isOpen ? 'blue.500' : isDark ? 'gray.600' : 'gray.50',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="AI Assistant"
      >
        <Box w={6} h={6}>
          <AssistantIcon />
        </Box>
      </MotionButton>
    </Box>
  )
}

export default FloatingAIAssistant
