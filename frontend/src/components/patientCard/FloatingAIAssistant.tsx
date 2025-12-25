/**
 * Floating Voice AI Assistant - Voice-first dental assistant
 * - Doctor speaks → AI fills fields
 * - Shows transcription and suggested changes
 * - Apply button to save changes
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
} from '@chakra-ui/react'
import { X, Mic, MicOff, Check, RotateCcw, Stethoscope, Calendar, Wallet, Megaphone } from 'lucide-react'
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

// Supported MIME types for recording
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
]

type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

// Category mapping
const categoryMap: Record<string, AICategory> = {
  diagnosis: 'diagnosis',
  visits: 'visits',
  finance: 'finance',
  marketing: 'marketing',
}

export function FloatingAIAssistant({ patientId, onActionsApplied }: FloatingAIAssistantProps) {
  const { t, language } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('diagnosis')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIAssistantResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const capabilities = [
    { id: 'diagnosis', icon: Stethoscope, label: 'Диагноз' },
    { id: 'visits', icon: Calendar, label: 'Визит' },
    { id: 'finance', icon: Wallet, label: 'Оплата' },
    { id: 'marketing', icon: Megaphone, label: 'Сообщение' },
  ]

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    audioChunksRef.current = []
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])

  // Get supported MIME type
  const getSupportedMimeType = (): string => {
    for (const mimeType of SUPPORTED_MIME_TYPES) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    }
    return 'audio/webm'
  }

  // Start recording with Web Speech API for real-time transcription
  const startRecording = async () => {
    try {
      cleanup()
      setError(null)
      setTranscript('')
      setAiResponse(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Setup MediaRecorder for audio capture (backup)
      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100)

      // Setup Web Speech API for real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = language === 'hy' ? 'hy-AM' : language === 'en' ? 'en-US' : 'ru-RU'
        
        recognition.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' '
            } else {
              interimTranscript += result[0].transcript
            }
          }
          
          setTranscript(prev => {
            const base = prev.replace(/\[.*\]$/, '').trim()
            const newText = finalTranscript || ''
            const interim = interimTranscript ? ` [${interimTranscript}]` : ''
            return (base + ' ' + newText + interim).trim()
          })
        }
        
        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error)
        }
        
        recognition.start()
      }

      // Start timer
      setRecordingSeconds(0)
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1)
      }, 1000)

      setRecordingState('recording')
    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Не удалось получить доступ к микрофону')
      setRecordingState('error')
    }
  }

  // Stop recording and process
  const stopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    // Clean up interim markers from transcript
    setTranscript(prev => prev.replace(/\[.*\]$/, '').trim())
    
    setRecordingState('processing')
    
    // Small delay to ensure transcript is finalized
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Get final transcript
    const finalTranscript = transcript.replace(/\[.*\]$/, '').trim()
    
    if (!finalTranscript) {
      setError('Не удалось распознать речь. Попробуйте снова.')
      setRecordingState('error')
      return
    }

    // Send to AI
    try {
      const response = await aiApi.assistant({
        category: categoryMap[selectedCategory],
        patient_id: patientId || null,
        text: finalTranscript,
        locale: language as 'ru' | 'hy' | 'en',
      })

      setAiResponse(response)
      setRecordingState('done')
    } catch (err) {
      console.error('AI request failed:', err)
      setError('Ошибка AI. Попробуйте снова.')
      setRecordingState('error')
    }
  }

  // Apply AI actions
  const handleApply = useCallback(async () => {
    if (!aiResponse?.actions?.length) return

    setIsApplying(true)

    try {
      const result = await aiApi.apply(aiResponse.actions as AIAction[])

      if (result.success) {
        toast({
          title: '✅ Сохранено',
          description: `${result.results.applied.length} изменений применено`,
          status: 'success',
          duration: 3000,
        })
        // Reset state
        setAiResponse(null)
        setTranscript('')
        setRecordingState('idle')
        onActionsApplied?.()
      } else {
        toast({
          title: 'Ошибка',
          description: `${result.results.failed.length} изменений не применено`,
          status: 'warning',
          duration: 5000,
        })
      }
    } catch (err) {
      console.error('Apply failed:', err)
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsApplying(false)
    }
  }, [aiResponse, toast, onActionsApplied])

  // Reset to try again
  const handleReset = () => {
    cleanup()
    setRecordingState('idle')
    setTranscript('')
    setAiResponse(null)
    setError(null)
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format action for display
  const formatAction = (action: AIAction): { label: string; value: string } => {
    if (action.type === 'update_patient_diagnosis') {
      return { label: '📋 Диагноз', value: action.diagnosis || '' }
    }
    if (action.type === 'create_visit') {
      const parts = []
      if (action.visit_date) parts.push(`📅 ${action.visit_date}`)
      if (action.next_visit_date) parts.push(`➡️ ${action.next_visit_date}`)
      if (action.notes) parts.push(action.notes)
      return { label: '🗓️ Визит', value: parts.join(' • ') }
    }
    if (action.type === 'add_finance_note') {
      return { label: '💰 Оплата', value: action.note || '' }
    }
    return { label: action.type, value: JSON.stringify(action) }
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
            w="320px"
            maxH="480px"
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
                  🎤 Голосовой AI
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
              {/* Category Selection */}
              <HStack spacing={2} mb={4} flexWrap="wrap">
                {capabilities.map((cap) => {
                  const isSelected = selectedCategory === cap.id
                  return (
                    <Button
                      key={cap.id}
                      size="xs"
                      leftIcon={<Box as={cap.icon} w={3} h={3} />}
                      variant={isSelected ? 'solid' : 'outline'}
                      colorScheme={isSelected ? 'blue' : 'gray'}
                      borderRadius="full"
                      onClick={() => setSelectedCategory(cap.id)}
                      isDisabled={recordingState === 'recording'}
                    >
                      {cap.label}
                    </Button>
                  )
                })}
              </HStack>

              {/* Recording Area */}
              {recordingState === 'idle' && (
                <VStack spacing={4}>
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} textAlign="center">
                    Нажмите и говорите. AI заполнит данные.
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
                    <Box as={Mic} w={8} h={8} />
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
                  
                  {transcript && (
                    <Box 
                      p={3} 
                      borderRadius="lg" 
                      bg={isDark ? 'gray.700' : 'gray.100'}
                      w="full"
                      maxH="120px"
                      overflowY="auto"
                    >
                      <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                        {transcript}
                      </Text>
                    </Box>
                  )}

                  <Button
                    size="lg"
                    colorScheme="red"
                    borderRadius="full"
                    w="80px"
                    h="80px"
                    onClick={stopRecording}
                  >
                    <Box as={MicOff} w={8} h={8} />
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

              {/* Results State */}
              {recordingState === 'done' && aiResponse && (
                <VStack spacing={3} align="stretch">
                  {/* Transcript */}
                  <Box 
                    p={3} 
                    borderRadius="lg" 
                    bg={isDark ? 'gray.700' : 'gray.100'}
                  >
                    <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                      Вы сказали:
                    </Text>
                    <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                      "{transcript}"
                    </Text>
                  </Box>

                  <Divider />

                  {/* AI Summary */}
                  <Box>
                    <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'} mb={2}>
                      AI понял:
                    </Text>
                    <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                      {aiResponse.summary}
                    </Text>
                  </Box>

                  {/* Actions Preview */}
                  {aiResponse.actions.length > 0 && (
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'}>
                        Изменения:
                      </Text>
                      {aiResponse.actions.map((action, idx) => {
                        const { label, value } = formatAction(action as AIAction)
                        return (
                          <Box
                            key={idx}
                            p={2}
                            borderRadius="lg"
                            bg={isDark ? 'green.900' : 'green.50'}
                            border="1px solid"
                            borderColor={isDark ? 'green.700' : 'green.200'}
                          >
                            <Badge colorScheme="green" fontSize="10px" mb={1}>
                              {label}
                            </Badge>
                            <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                              {value}
                            </Text>
                          </Box>
                        )
                      })}
                    </VStack>
                  )}

                  {/* Marketing Draft */}
                  {aiResponse.draft?.marketing_message && (
                    <Box p={3} borderRadius="lg" bg={isDark ? 'purple.900' : 'purple.50'}>
                      <Text fontSize="xs" color="purple.500" mb={1}>📨 Сообщение:</Text>
                      <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                        {aiResponse.draft.marketing_message}
                      </Text>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      flex={1}
                      colorScheme="green"
                      leftIcon={<Box as={Check} w={4} h={4} />}
                      onClick={handleApply}
                      isLoading={isApplying}
                      loadingText="Сохраняю..."
                      size="sm"
                      borderRadius="lg"
                    >
                      Сохранить
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
        bg={isOpen ? 'blue.600' : isDark ? 'gray.700' : 'white'}
        color={isOpen ? 'white' : 'blue.500'}
        border={isOpen ? 'none' : '1px solid'}
        borderColor={isDark ? 'gray.600' : 'gray.200'}
        _hover={{
          bg: isOpen ? 'blue.500' : isDark ? 'gray.600' : 'gray.50',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Voice AI Assistant"
      >
        <Box w={7} h={7}>
          <AssistantIcon />
        </Box>
      </MotionButton>
    </Box>
  )
}

export default FloatingAIAssistant
