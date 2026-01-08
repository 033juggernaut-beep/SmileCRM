/**
 * Floating Voice AI Assistant - Whisper STT + LLM parsing + preview/confirm
 * 
 * Flow:
 * 1. Doctor records voice
 * 2. Audio sent to /api/ai/voice/parse (Whisper STT → LLM parsing)
 * 3. Show preview with parsed data (editable)
 * 4. Doctor confirms or edits
 * 5. Commit to /api/ai/voice/commit
 * 
 * Android Telegram WebView compatibility:
 * - Checks for MediaRecorder support before enabling
 * - Shows text fallback when voice not available
 * - Proper error handling with i18n messages
 * - Dev logging for debugging voice recognition issues
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
import { X, Check, RotateCcw, Stethoscope, Calendar, Wallet, MessageSquare, Square, Edit2, AlertCircle, Keyboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DateInput } from '../DateInput'
// Speech language is selected explicitly in the UI, but defaults from app language
import { voiceApi } from '../../api/ai'
import type { VoiceAIMode, VoiceParsedData } from '../../api/ai'
import { useLanguage } from '../../context/LanguageContext'

// Development logging helper
const isDev = import.meta.env.DEV
const devLog = (message: string, data?: unknown) => {
  if (isDev) {
    console.log(`[FloatingAI] ${message}`, data ?? '')
  }
}

// Error types for better UX
type VoiceErrorType = 
  | 'mic_denied'      // Microphone access denied
  | 'mic_not_found'   // No microphone detected
  | 'not_supported'   // MediaRecorder not available (Telegram WebView)
  | 'recognition'     // STT/backend failed to recognize
  | 'network'         // Network/API error
  | 'timeout'         // Request timeout
  | 'unknown'         // Fallback error

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

type RecordingState = 'idle' | 'recording' | 'processing' | 'preview' | 'editing' | 'error' | 'text_fallback'

// Mode configuration
const modeConfig: Record<VoiceAIMode, { icon: typeof Stethoscope; label: string; color: string }> = {
  visit: { icon: Calendar, label: 'Visit', color: 'blue' },
  diagnosis: { icon: Stethoscope, label: 'Diagnosis', color: 'green' },
  payment: { icon: Wallet, label: 'Payment', color: 'orange' },
  message: { icon: MessageSquare, label: 'Note', color: 'purple' },
}

export function FloatingAIAssistant({ patientId, onActionsApplied }: FloatingAIAssistantProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()
  const { t, language: uiLanguage } = useLanguage()

  // Speech language options (hy = Armenian ISO 639-1 code for Whisper)
  type SpeechLanguage = 'ru' | 'hy' | 'en'
  const speechLanguageLabels: Record<SpeechLanguage, string> = {
    ru: 'RU',
    hy: 'AM',
    en: 'EN',
  }
  
  // Map UI language to speech language (am -> hy for Whisper)
  const getInitialSpeechLanguage = (): SpeechLanguage => {
    switch (uiLanguage) {
      case 'am': return 'hy' // Armenian ISO 639-1 code
      case 'ru': return 'ru'
      case 'en': return 'en'
      default: return 'hy' // Default to Armenian for SmileCRM
    }
  }
  
  // Check MediaRecorder support - critical for Telegram WebView
  const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined' && 
    typeof navigator?.mediaDevices?.getUserMedia !== 'undefined'

  // UI state
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<VoiceAIMode>('visit')
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>(getInitialSpeechLanguage())
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<VoiceErrorType | null>(null)
  const [isCommitting, setIsCommitting] = useState(false)
  
  // Get localized error message based on error type
  const getErrorMessage = useCallback((type: VoiceErrorType): string => {
    switch (type) {
      case 'mic_denied':
        return t('voice.micAccessDenied')
      case 'mic_not_found':
        return t('voice.micNotFound')
      case 'not_supported':
        return t('voice.notSupported') || 'Voice input not supported in this browser'
      case 'recognition':
        return t('voice.recognitionError') || t('voice.processingError')
      case 'network':
        return t('voice.networkError') || t('common.error')
      case 'timeout':
        return t('voice.timeout') || 'Request timed out'
      default:
        return t('voice.processingError')
    }
  }, [t])

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

  // Switch to text fallback mode
  const handleFallbackToText = useCallback(() => {
    devLog('Switching to text fallback')
    setRecordingState('text_fallback')
    setError(null)
    setErrorType(null)
    // Initialize empty data for text input
    setEditedData({
      visit_date: null,
      next_visit_date: null,
      diagnosis: null,
      notes: null,
      amount: null,
      currency: 'AMD',
    })
  }, [])

  // Start recording with proper error handling
  const startRecording = async () => {
    devLog('Starting recording...')
    setError(null)
    setErrorType(null)
    audioChunksRef.current = []
    
    // Check support first
    if (!isMediaRecorderSupported) {
      devLog('MediaRecorder not available')
      setErrorType('not_supported')
      setError(getErrorMessage('not_supported'))
      setRecordingState('error')
      return
    }
    
    try {
      devLog('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      devLog('Microphone access granted')
      streamRef.current = stream
      
      const mimeType = getSupportedMimeType()
      devLog(`Using MIME type: ${mimeType}`)
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onerror = (e) => {
        devLog('MediaRecorder error', e)
        setErrorType('unknown')
        setError(t('voice.recordingError'))
        setRecordingState('error')
      }
      
      mediaRecorder.start(100) // Collect data every 100ms
      setRecordingState('recording')
      setRecordingSeconds(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1)
      }, 1000)
      
    } catch (err) {
      devLog('Failed to start recording', err)
      
      // Determine error type from browser error
      const errorName = (err as Error)?.name || ''
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        setErrorType('mic_denied')
        setError(getErrorMessage('mic_denied'))
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setErrorType('mic_not_found')
        setError(getErrorMessage('mic_not_found'))
      } else {
        setErrorType('unknown')
        setError(t('voice.micError'))
      }
      setRecordingState('error')
    }
  }

  // Stop recording and send to API
  const stopRecording = async () => {
    devLog('Stopping recording...')
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
    devLog(`Audio blob size: ${audioBlob.size}`)
    
    if (audioBlob.size < 100) {
      devLog('Recording too short')
      setErrorType('recognition')
      setError(t('voice.tooShort'))
      setRecordingState('error')
      return
    }
    
    // Check patient ID
    if (!patientId) {
      setError(t('voice.noPatient') || 'Patient not selected')
      setRecordingState('error')
      return
    }
    
    // Send to API
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Yerevan'
      
      devLog(`Sending voice: mode=${selectedMode}, locale=${speechLanguage}, timezone=${timezone}`)
      
      // Use explicitly selected speech language (not app UI language)
      const response = await voiceApi.parse(audioBlob, selectedMode, patientId, {
        locale: speechLanguage,
        timezone,
      })
      
      devLog(`Parse result: transcript="${response.text.substring(0, 50)}...", amount=${response.data.amount}, currency=${response.data.currency}`)
      
      // Check if we got a meaningful transcript
      if (!response.text || response.text.trim().length < 2) {
        devLog('Empty or too short transcript')
        setErrorType('recognition')
        setError(t('voice.noData'))
        setRecordingState('error')
        return
      }
      
      setTranscript(response.text)
      setEditedData(response.data)
      setWarnings(response.warnings)
      setRecordingState('preview')
      
    } catch (err) {
      devLog('Voice parse failed', err)
      
      // Determine error type from API response
      const axiosError = err as { response?: { status?: number }; code?: string }
      
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        setErrorType('timeout')
      } else if (axiosError.response?.status === 400 || axiosError.response?.status === 422) {
        setErrorType('recognition')
      } else if (axiosError.response?.status && axiosError.response.status >= 500) {
        setErrorType('network')
      } else if (!navigator.onLine) {
        setErrorType('network')
      } else {
        setErrorType('recognition')
      }
      
      setError(getErrorMessage(errorType || 'recognition'))
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
          title: 'Saved',
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
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Save error')
          : 'Save error'
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setIsCommitting(false)
    }
  }

  // Reset to initial state - fully clears everything for retry
  const handleReset = () => {
    devLog('Resetting state')
    cleanup()
    setRecordingState('idle')
    setTranscript('')
    setEditedData(null)
    setWarnings([])
    setError(null)
    setErrorType(null)
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
            // Android WebView text overflow fix - prevent horizontal scroll
            overflowX="hidden"
            sx={{
              // Enable smooth scrolling on iOS
              WebkitOverflowScrolling: 'touch',
              // Prevent scroll chaining issues on Android
              overscrollBehavior: 'contain',
            }}
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
                  Voice AI
                </Text>
              </Flex>
              <IconButton
                aria-label="Close"
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

              {/* Speech Language Selection */}
              {recordingState === 'idle' && (
                <HStack spacing={1} mb={3} justify="center">
                  {(Object.entries(speechLanguageLabels) as [SpeechLanguage, string][]).map(([lang, label]) => (
                    <Button
                      key={lang}
                      size="xs"
                      variant={speechLanguage === lang ? 'solid' : 'ghost'}
                      colorScheme={speechLanguage === lang ? 'blue' : 'gray'}
                      onClick={() => setSpeechLanguage(lang)}
                      borderRadius="md"
                      px={2}
                    >
                      {label}
                    </Button>
                  ))}
                </HStack>
              )}

              {/* Idle State - Record Button */}
              {recordingState === 'idle' && (
                <VStack spacing={4}>
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} textAlign="center">
                    Press and speak. AI will recognize and fill data.
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
                    Speaking...
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
                    Press to stop
                  </Text>
                </VStack>
              )}

              {/* Processing State */}
              {recordingState === 'processing' && (
                <VStack spacing={4} py={6}>
                  <Spinner size="lg" color="blue.500" />
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                    AI processing...
                  </Text>
                  <Progress size="sm" isIndeterminate colorScheme="blue" w="full" borderRadius="full" />
                </VStack>
              )}

              {/* Error State - Improved with retry and fallback options */}
              {recordingState === 'error' && (
                <VStack spacing={4}>
                  <Flex
                    p={3}
                    borderRadius="lg"
                    bg={isDark ? 'red.900' : 'red.50'}
                    w="full"
                    align="flex-start"
                    gap={2}
                  >
                    <Box as={AlertCircle} w={5} h={5} color="red.500" flexShrink={0} mt={0.5} />
                    <Box flex={1}>
                      <Text fontSize="sm" color="red.500" fontWeight="medium">
                        {error}
                      </Text>
                      {/* Additional hint based on error type */}
                      {errorType === 'mic_denied' && (
                        <Text fontSize="xs" color={isDark ? 'red.300' : 'red.400'} mt={1}>
                          {t('voice.micDeniedHint') || 'Check browser settings to allow microphone access.'}
                        </Text>
                      )}
                      {errorType === 'recognition' && (
                        <Text fontSize="xs" color={isDark ? 'red.300' : 'red.400'} mt={1}>
                          {t('voice.recognitionHint') || 'Try speaking more clearly or check your microphone.'}
                        </Text>
                      )}
                      {errorType === 'not_supported' && (
                        <Text fontSize="xs" color={isDark ? 'red.300' : 'red.400'} mt={1}>
                          {t('voice.notSupportedHint') || 'Voice input is not available in this browser.'}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                  
                  <HStack spacing={2} w="full">
                    <Button
                      flex={1}
                      leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                      onClick={handleReset}
                      size="sm"
                      colorScheme="blue"
                    >
                      {t('common.tryAgain')}
                    </Button>
                    <Button
                      flex={1}
                      leftIcon={<Box as={Keyboard} w={4} h={4} />}
                      onClick={handleFallbackToText}
                      size="sm"
                      variant="outline"
                    >
                      {t('voice.useTextInput') || 'Text input'}
                    </Button>
                  </HStack>
                </VStack>
              )}
              
              {/* Text Fallback State - for when voice is not available */}
              {recordingState === 'text_fallback' && editedData && (
                <VStack spacing={3} align="stretch">
                  {/* Show notice if voice not supported */}
                  {errorType === 'not_supported' && (
                    <Flex
                      p={3}
                      borderRadius="lg"
                      bg={isDark ? 'orange.900' : 'orange.50'}
                      align="center"
                      gap={2}
                    >
                      <Box as={AlertCircle} w={4} h={4} color="orange.500" flexShrink={0} />
                      <Text fontSize="xs" color={isDark ? 'orange.200' : 'orange.700'}>
                        {t('voice.notSupportedHint') || 'Voice input is not available. Use text input instead.'}
                      </Text>
                    </Flex>
                  )}
                  
                  <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} textAlign="center">
                    {t('voice.textInputHint') || 'Enter data manually'}
                  </Text>
                  
                  <Divider />
                  
                  {/* Manual input fields based on selected mode */}
                  <VStack spacing={3} align="stretch">
                    {/* Visit Date - for visit mode */}
                    {selectedMode === 'visit' && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          {t('patientCard.visitDate') || 'Visit Date'}
                        </Text>
                        <DateInput
                          value={editedData.visit_date || ''}
                          onChange={(date) => setEditedData({ ...editedData, visit_date: date || null })}
                          placeholder={t('patientCard.visitDate')}
                        />
                      </Box>
                    )}
                    
                    {/* Notes - for visit and message modes */}
                    {(selectedMode === 'visit' || selectedMode === 'message') && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          {t('patientCard.doctorNotes') || 'Notes'}
                        </Text>
                        <Textarea
                          size="sm"
                          rows={2}
                          value={editedData.notes || ''}
                          onChange={(e) => setEditedData({ ...editedData, notes: e.target.value || null })}
                          placeholder={t('patientCard.notesPlaceholder')}
                          bg={isDark ? 'gray.700' : 'white'}
                        />
                      </Box>
                    )}
                    
                    {/* Diagnosis - for diagnosis mode */}
                    {selectedMode === 'diagnosis' && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          {t('patientCard.diagnosis') || 'Diagnosis'}
                        </Text>
                        <Textarea
                          size="sm"
                          rows={3}
                          value={editedData.diagnosis || ''}
                          onChange={(e) => setEditedData({ ...editedData, diagnosis: e.target.value || null })}
                          placeholder={t('patientCard.diagnosisPlaceholder')}
                          bg={isDark ? 'gray.700' : 'white'}
                        />
                      </Box>
                    )}
                    
                    {/* Amount - for payment mode */}
                    {selectedMode === 'payment' && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          {t('patientCard.finance.amount') || 'Amount'}
                        </Text>
                        <HStack>
                          <Input
                            type="number"
                            size="sm"
                            flex={1}
                            value={editedData.amount || ''}
                            onChange={(e) => setEditedData({ ...editedData, amount: parseFloat(e.target.value) || null })}
                            placeholder="0"
                            bg={isDark ? 'gray.700' : 'white'}
                          />
                          <HStack spacing={1}>
                            <Button
                              size="xs"
                              variant={editedData.currency === 'AMD' ? 'solid' : 'outline'}
                              colorScheme={editedData.currency === 'AMD' ? 'green' : 'gray'}
                              onClick={() => setEditedData({ ...editedData, currency: 'AMD' })}
                            >
                              AMD
                            </Button>
                            <Button
                              size="xs"
                              variant={editedData.currency === 'RUB' ? 'solid' : 'outline'}
                              colorScheme={editedData.currency === 'RUB' ? 'blue' : 'gray'}
                              onClick={() => setEditedData({ ...editedData, currency: 'RUB' })}
                            >
                              RUB
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                  
                  {/* Action buttons */}
                  <HStack spacing={2} pt={2}>
                    <Button
                      flex={1}
                      colorScheme="green"
                      leftIcon={<Box as={Check} w={4} h={4} />}
                      onClick={handleCommit}
                      isLoading={isCommitting}
                      loadingText={t('patientCard.saving') || 'Saving...'}
                      size="sm"
                      borderRadius="lg"
                      isDisabled={
                        (selectedMode === 'visit' && !editedData.visit_date) ||
                        (selectedMode === 'diagnosis' && !editedData.diagnosis) ||
                        (selectedMode === 'payment' && !editedData.amount)
                      }
                    >
                      {t('common.save')}
                    </Button>
                    <Button
                      variant="ghost"
                      leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                      onClick={handleReset}
                      size="sm"
                      borderRadius="lg"
                    >
                      {t('voice.discard') || 'Reset'}
                    </Button>
                  </HStack>
                </VStack>
              )}

              {/* Preview/Editing State */}
              {(recordingState === 'preview' || recordingState === 'editing') && editedData && (
                <VStack spacing={3} align="stretch">
                  {/* Transcript - with proper text wrapping for Armenian */}
                  <Box 
                    p={3} 
                    borderRadius="lg" 
                    bg={isDark ? 'gray.700' : 'gray.100'}
                  >
                    <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'} mb={1}>
                      {t('voice.transcript') || 'Recognized:'}
                    </Text>
                    <Text 
                      fontSize="sm" 
                      color={isDark ? 'white' : 'gray.800'}
                      // Text wrapping fixes for Armenian/Latin mixed content
                      wordBreak="break-word"
                      overflowWrap="anywhere"
                      whiteSpace="pre-wrap"
                    >
                      "{transcript}"
                    </Text>
                  </Box>

                  {/* Warnings */}
                  {warnings.length > 0 && (
                    <Box p={2} borderRadius="lg" bg={isDark ? 'orange.900' : 'orange.50'}>
                      {warnings.map((w, i) => (
                        <Text key={i} fontSize="xs" color="orange.500">
                          вљ пёЏ {w}
                        </Text>
                      ))}
                    </Box>
                  )}

                  <Divider />

                  {/* Editable Fields */}
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'}>
                        Data to save:
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Box as={Edit2} w={3} h={3} />}
                        onClick={() => setRecordingState(recordingState === 'editing' ? 'preview' : 'editing')}
                      >
                        {recordingState === 'editing' ? 'Done' : 'Edit'}
                      </Button>
                    </Flex>

                    {/* Visit Date */}
                    {(selectedMode === 'visit' || editedData.visit_date) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          Visit Date
                        </Text>
                        {recordingState === 'editing' ? (
                          <VStack spacing={2} align="stretch">
                            <HStack spacing={2}>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => updateField('visit_date', getToday())}
                              >
                                Today
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => updateField('visit_date', getTomorrow())}
                              >
                                Tomorrow
                              </Button>
                            </HStack>
                            <DateInput
                              value={editedData.visit_date || ''}
                              onChange={(date) => updateField('visit_date', date || null)}
                              placeholder={t('patientCard.visitDate')}
                              minDate={new Date()}
                            />
                          </VStack>
                        ) : (
                          <Badge colorScheme={editedData.visit_date ? 'green' : 'orange'}>
                            {editedData.visit_date || 'Not specified'}
                          </Badge>
                        )}
                      </Box>
                    )}

                    {/* Next Visit Date */}
                    {editedData.next_visit_date && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          Next Visit
                        </Text>
                        {recordingState === 'editing' ? (
                          <DateInput
                            value={editedData.next_visit_date || ''}
                            onChange={(date) => updateField('next_visit_date', date || null)}
                            placeholder={t('patientCard.nextVisit')}
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
                          Diagnosis
                        </Text>
                        {recordingState === 'editing' ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            value={editedData.diagnosis || ''}
                            onChange={(e) => updateField('diagnosis', e.target.value || null)}
                            placeholder="Enter diagnosis..."
                          />
                        ) : (
                          <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                            {editedData.diagnosis || <Text as="span" color="gray.400">Not specified</Text>}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Notes */}
                    {(selectedMode === 'message' || editedData.notes) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          Notes
                        </Text>
                        {recordingState === 'editing' ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            value={editedData.notes || ''}
                            onChange={(e) => updateField('notes', e.target.value || null)}
                            placeholder="Enter notes..."
                          />
                        ) : (
                          <Text fontSize="sm" color={isDark ? 'white' : 'gray.800'}>
                            {editedData.notes || <Text as="span" color="gray.400">None</Text>}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Amount */}
                    {(selectedMode === 'payment' || editedData.amount) && (
                      <Box>
                        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'} mb={1}>
                          Amount
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
                              {editedData.amount ? `${editedData.amount.toLocaleString()} ${editedData.currency || 'AMD'}` : 'Not specified'}
                            </Badge>
                            {warnings.some(w => w.includes('corrected')) && (
                              <Badge colorScheme="orange" fontSize="10px">
                                corrected
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
                      loadingText="Saving..."
                      size="sm"
                      borderRadius="lg"
                      isDisabled={
                        (selectedMode === 'visit' && !editedData.visit_date) ||
                        (selectedMode === 'diagnosis' && !editedData.diagnosis) ||
                        (selectedMode === 'payment' && !editedData.amount)
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="ghost"
                      leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                      onClick={handleReset}
                      size="sm"
                      borderRadius="lg"
                    >
                      Reset
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
