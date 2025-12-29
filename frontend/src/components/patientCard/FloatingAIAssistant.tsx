/**
 * Floating Voice AI Assistant - Whisper STT + LLM parsing + preview/confirm
 * 
 * Flow:
 * 1. Doctor records voice
 * 2. Audio sent to /api/ai/voice/parse (Whisper STT → LLM parsing)
 * 3. Show preview with parsed data (editable)
 * 4. Doctor confirms or edits
 * 5. Commit to /api/ai/voice/commit
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  useColorMode,
  IconButton,
  useToast,
  Spinner,
  Badge,
  Divider,
  Progress,
  Input,
  Textarea,
} from '@chakra-ui/react'
import { X, Check, RotateCcw, Stethoscope, Calendar, Wallet, MessageSquare, Square, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { voiceApi } from '../../api/ai'
import type { VoiceAIMode, VoiceParsedData } from '../../api/ai'

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

// Supported MIME types for recording
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
]

type RecordingState = 'idle' | 'recording' | 'processing' | 'preview' | 'editing' | 'error'

// Mode configuration
const modeConfig: Record<VoiceAIMode, { icon: typeof Stethoscope; label: string; color: string }> = {
  visit: { icon: Calendar, label: 'Визит', color: 'blue' },
  diagnosis: { icon: Stethoscope, label: 'Диагноз', color: 'green' },
  payment: { icon: Wallet, label: 'Оплата', color: 'orange' },
  message: { icon: MessageSquare, label: 'Заметка', color: 'purple' },
}

export function FloatingAIAssistant({ patientId, onActionsApplied }: FloatingAIAssistantProps) {
  const { language } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<VoiceAIMode>('visit')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isCommitting, setIsCommitting] = useState(false)

  // Result state
  const [transcript, setTranscript] = useState('')
  const [editedData, setEditedData] = useState<VoiceParsedData | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch {
        // Ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    audioChunksRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Get supported MIME type
  const getSupportedMimeType = (): string => {
    for (const type of SUPPORTED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    return 'audio/webm'
  }

  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      audioChunksRef.current = []
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.start(100) // Collect data every 100ms
      setRecordingState('recording')
      setRecordingSeconds(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
      
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Не удалось получить доступ к микрофону')
      setRecordingState('error')
    }
  }

  // Stop recording and send to API
  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return
    
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    setRecordingState('processing')
    
    // Wait for final data
    await new Promise<void>((resolve) => {
      const recorder = mediaRecorderRef.current!
      recorder.onstop = () => resolve()
      recorder.stop()
    })
    
    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    
    // Create audio blob
    const mimeType = getSupportedMimeType()
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
    
    if (audioBlob.size < 100) {
      setError('Запись слишком короткая')
      setRecordingState('error')
      return
    }
    
    // Check patient ID
    if (!patientId) {
      setError('Не выбран пациент')
      setRecordingState('error')
      return
    }
    
    // Send to API
    try {
      // Map 'am' (Armenian in app) to 'hy' (Armenian ISO code for Whisper)
      const localeMap: Record<string, 'ru' | 'hy' | 'en'> = {
        ru: 'ru',
        am: 'hy',
        en: 'en',
      }
      const locale = localeMap[language] || 'ru'
      
      const response = await voiceApi.parse(audioBlob, selectedMode, patientId, {
        locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
      
      setTranscript(response.text)
      setEditedData(response.data)
      setWarnings(response.warnings)
      setRecordingState('preview')
      
    } catch (err) {
      console.error('Voice parse failed:', err)
      setError('Ошибка распознавания. Попробуйте снова.')
      setRecordingState('error')
    }
  }

  // Commit data
  const handleCommit = async () => {
    if (!editedData || !patientId) return
    
    setIsCommitting(true)
    
    try {
      const response = await voiceApi.commit({
        mode: selectedMode,
        patient_id: patientId,
        data: editedData,
      })
      
      if (response.ok) {
        toast({
          title: '✅ Сохранено',
          description: response.message,
          status: 'success',
          duration: 3000,
        })
        
        // Reset state
        handleReset()
        onActionsApplied?.()
      }
    } catch (err: unknown) {
      console.error('Commit failed:', err)
      const errorMessage = err instanceof Error ? err.message : 
        (typeof err === 'object' && err !== null && 'response' in err) 
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Ошибка сохранения')
          : 'Ошибка сохранения'
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsCommitting(false)
    }
  }

  // Reset to initial state
  const handleReset = () => {
    cleanup()
    setRecordingState('idle')
    setTranscript('')
    setEditedData(null)
    setWarnings([])
    setError(null)
    setRecordingSeconds(0)
    setIsCommitting(false)
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Update edited field
  const updateField = (field: keyof VoiceParsedData, value: string | number | null) => {
    if (!editedData) return
    setEditedData({ ...editedData, [field]: value })
  }

  // Get today's date
  const getToday = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  // Get tomorrow's date
  const getTomorrow = (): string => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <Box position="fixed" bottom={6} right={6} zIndex={50}>
      {/* Main Panel */}
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
            w="340px"
            maxH="520px"
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
                <Box w={5} h={5} color="blue.500">
                  <AssistantIcon />
                </Box>
                <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'gray.800'}>
                  🤖 Голосовой AI
                </Text>
              </Flex>
              <IconButton
                aria-label="Закрыть"
                icon={<Box as={X} w={4} h={4} />}
                size="xs"
                variant="ghost"
                onClick={() => {
                  cleanup()
                  setIsOpen(false)
                }}
              />
            </Flex>

            <Box p={4}>
              {/* Mode Selection */}
              <HStack spacing={2} mb={4} flexWrap="wrap">
                {(Object.entries(modeConfig) as [VoiceAIMode, typeof modeConfig.visit][]).map(([mode, config]) => {
                  const Icon = config.icon
                  const isSelected = selectedMode === mode
                  return (
                    <Button
                      key={mode}
                      size="sm"
                      variant={isSelected ? 'solid' : 'outline'}
                      colorScheme={isSelected ? config.color : 'gray'}
                      leftIcon={<Box as={Icon} w={4} h={4} />}
                      onClick={() => setSelectedMode(mode)}
                      borderRadius="lg"
                      isDisabled={recordingState !== 'idle'}
                    >
                      {config.label}
                    </Button>
                  )
                })}
              </HStack>

              {/* Idle State - Record Button */}
              {recordingState === 'idle' && (
                <VStack spacing={4}>
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} textAlign="center">
                    Нажмите и говорите. AI распознает и заполнит данные.
                  </Text>
                  <Button
                    size="lg"
                    colorScheme="blue"
                    borderRadius="full"
                    w="80px"
                    h="80px"
                    onClick={startRecording}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="transform 0.2s"
                  >
                    <Box w={8} h={8}>
                      <AssistantIcon />
                    </Box>
                  </Button>
                </VStack>
              )}

              {/* Recording State */}
              {recordingState === 'recording' && (
                <VStack spacing={4}>
                  <HStack>
                    <Box w={3} h={3} borderRadius="full" bg="red.500" animation="pulse 1s infinite" />
                    <Text fontSize="lg" fontWeight="bold" color="red.500">
                      {formatTime(recordingSeconds)}
                    </Text>
                  </HStack>
                  
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                    Говорите...
                  </Text>

                  <Button
                    size="lg"
                    colorScheme="red"
                    borderRadius="full"
                    w="80px"
                    h="80px"
                    onClick={stopRecording}
                  >
                    <Box as={Square} w={8} h={8} fill="currentColor" />
                  </Button>
                  <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                    Нажмите чтобы остановить
                  </Text>
                </VStack>
              )}

              {/* Processing State */}
              {recordingState === 'processing' && (
                <VStack spacing={4} py={6}>
                  <Spinner size="lg" color="blue.500" />
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                    AI обрабатывает...
                  </Text>
                  <Progress size="sm" isIndeterminate colorScheme="blue" w="full" borderRadius="full" />
                </VStack>
              )}

              {/* Error State */}
              {recordingState === 'error' && (
                <VStack spacing={4}>
                  <Box 
                    p={3} 
                    borderRadius="lg" 
                    bg={isDark ? 'red.900' : 'red.50'}
                    w="full"
                  >
                    <Text fontSize="sm" color="red.500">{error}</Text>
                  </Box>
                  <Button
                    leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                    onClick={handleReset}
                    size="sm"
                  >
                    Попробовать снова
                  </Button>
                </VStack>
              )}

              {/* Preview/Editing State */}
              {(recordingState === 'preview' || recordingState === 'editing') && editedData && (
                <VStack spacing={3} align="stretch">
                  {/* Transcript */}
                  <Box 
                    p={3} 
                    borderRadius="lg" 
                    bg={isDark ? 'gray.700' : 'gray.100'}
                  >
                    <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                      Распознано:
                    </Text>
                    <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                      "{transcript}"
                    </Text>
                  </Box>

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <Box p={2} borderRadius="lg" bg={isDark ? 'orange.900' : 'orange.50'}>
                      {warnings.map((w, i) => (
                        <Text key={i} fontSize="xs" color="orange.500">
                          ⚠️ {w}
                        </Text>
                      ))}
                    </Box>
                  )}

                  <Divider />

                  {/* Editable Fields */}
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'}>
                        Данные для сохранения:
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Box as={Edit2} w={3} h={3} />}
                        onClick={() => setRecordingState(recordingState === 'editing' ? 'preview' : 'editing')}
                      >
                        {recordingState === 'editing' ? 'Готово' : 'Редактировать'}
                      </Button>
                    </Flex>

                    {/* Visit Date */}
                    {(selectedMode === 'visit' || editedData.visit_date) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          📅 Дата визита
                        </Text>
                        {recordingState === 'editing' ? (
                          <VStack spacing={2} align="stretch">
                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => updateField('visit_date', getToday())}
                              >
                                Сегодня
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => updateField('visit_date', getTomorrow())}
                              >
                                Завтра
                              </Button>
                            </HStack>
                            <Input
                              type="date"
                              size="sm"
                              value={editedData.visit_date || ''}
                              onChange={(e) => updateField('visit_date', e.target.value || null)}
                              min={getToday()}
                            />
                          </VStack>
                        ) : (
                          <Badge colorScheme={editedData.visit_date ? 'green' : 'orange'}>
                            {editedData.visit_date || 'Не указана'}
                          </Badge>
                        )}
                      </Box>
                    )}

                    {/* Next Visit Date */}
                    {editedData.next_visit_date && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          ➡️ Следующий визит
                        </Text>
                        {recordingState === 'editing' ? (
                          <Input
                            type="date"
                            size="sm"
                            value={editedData.next_visit_date || ''}
                            onChange={(e) => updateField('next_visit_date', e.target.value || null)}
                          />
                        ) : (
                          <Badge colorScheme="blue">{editedData.next_visit_date}</Badge>
                        )}
                      </Box>
                    )}

                    {/* Diagnosis */}
                    {(selectedMode === 'diagnosis' || editedData.diagnosis) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          🩺 Диагноз
                        </Text>
                        {recordingState === 'editing' ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            value={editedData.diagnosis || ''}
                            onChange={(e) => updateField('diagnosis', e.target.value || null)}
                            placeholder="Введите диагноз..."
                          />
                        ) : (
                          <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                            {editedData.diagnosis || <Text as="span" color="gray.400">Не указан</Text>}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Notes */}
                    {(selectedMode === 'message' || editedData.notes) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          📝 Заметки
                        </Text>
                        {recordingState === 'editing' ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            value={editedData.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value || null)}
                            placeholder="Введите заметки..."
                          />
                        ) : (
                          <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                            {editedData.notes || <Text as="span" color="gray.400">Нет</Text>}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Amount */}
                    {(selectedMode === 'payment' || editedData.amount) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          💰 Сумма
                        </Text>
                        {recordingState === 'editing' ? (
                          <VStack spacing={2} align="stretch">
                            <HStack>
                              <Input
                                type="number"
                                size="sm"
                                flex={1}
                                value={editedData.amount || ''}
                                onChange={(e) => updateField('amount', parseFloat(e.target.value) || null)}
                                placeholder="0"
                              />
                              <HStack spacing={1}>
                                <Button
                                  size="xs"
                                  variant={editedData.currency === 'AMD' ? 'solid' : 'outline'}
                                  colorScheme={editedData.currency === 'AMD' ? 'green' : 'gray'}
                                  onClick={() => updateField('currency', 'AMD')}
                                >
                                  AMD
                                </Button>
                                <Button
                                  size="xs"
                                  variant={editedData.currency === 'RUB' ? 'solid' : 'outline'}
                                  colorScheme={editedData.currency === 'RUB' ? 'blue' : 'gray'}
                                  onClick={() => updateField('currency', 'RUB')}
                                >
                                  RUB
                                </Button>
                              </HStack>
                            </HStack>
                          </VStack>
                        ) : (
                          <HStack>
                            <Badge colorScheme={editedData.amount ? 'green' : 'orange'}>
                              {editedData.amount ? `${editedData.amount.toLocaleString()} ${editedData.currency || 'AMD'}` : 'Не указана'}
                            </Badge>
                            {warnings.some(w => w.includes('исправлена')) && (
                              <Badge colorScheme="orange" fontSize="10px">
                                исправлено
                              </Badge>
                            )}
                          </HStack>
                        )}
                      </Box>
                    )}
                  </VStack>

                  {/* Action Buttons */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      flex={1}
                      colorScheme="green"
                      leftIcon={<Box as={Check} w={4} h={4} />}
                      onClick={handleCommit}
                      isLoading={isCommitting}
                      loadingText="Сохраняю..."
                      size="sm"
                      borderRadius="lg"
                      isDisabled={
                        (selectedMode === 'visit' && !editedData.visit_date) ||
                        (selectedMode === 'diagnosis' && !editedData.diagnosis) ||
                        (selectedMode === 'payment' && !editedData.amount)
                      }
                    >
                      Подтвердить
                    </Button>
                    <Button
                      variant="ghost"
                      leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                      onClick={handleReset}
                      size="sm"
                      borderRadius="lg"
                    >
                      Заново
                    </Button>
                  </HStack>
                </VStack>
              )}

            </Box>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <MotionButton
        onClick={() => setIsOpen(!isOpen)}
        borderRadius="full"
        w="56px"
        h="56px"
        colorScheme="blue"
        boxShadow="lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        p={0}
      >
        <Box w={6} h={6} color="white">
          <AssistantIcon />
        </Box>
      </MotionButton>
    </Box>
  )
}
