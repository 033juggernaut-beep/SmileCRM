/**
 * Voice Assistant Button Component
 * Clean design matching FloatingAIAssistant
 * 
 * Android Telegram WebView compatibility:
 * - Checks for MediaRecorder support before enabling
 * - Shows fallback to text input when voice not available
 * - Proper error handling with i18n messages
 * - Dev logging for debugging voice recognition issues
 */

import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,
  Spinner,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
  useColorMode,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Edit2, RotateCcw, Square, X, Keyboard, AlertCircle } from 'lucide-react'

// Minimal robot/assistant icon - same as FloatingAIAssistant
function AssistantIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
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
import {
  type VoiceLanguage,
  type VoiceMode,
  type VoiceParseResponse,
  type VoiceParseStructured,
  parseVoice,
} from '../api/ai'
import { useLanguage } from '../context/LanguageContext'

// Constants
const MAX_RECORDING_SECONDS = 60
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
]

// Development logging helper
const isDev = import.meta.env.DEV
const devLog = (message: string, data?: unknown) => {
  if (isDev) {
    console.log(`[VoiceAssistant] ${message}`, data ?? '')
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

// Recording pulse animation
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`

type RecordingState = 'idle' | 'recording' | 'processing' | 'preview' | 'editing' | 'error' | 'fallback'
type SpeechLanguage = 'ru' | 'hy' | 'en'

export type VoiceAssistantButtonProps = {
  mode: VoiceMode
  contextPatientId?: string
  onApply: (structured: VoiceParseStructured, transcript: string) => void
  buttonLabel?: string
}

export const VoiceAssistantButton = ({
  mode,
  contextPatientId,
  onApply,
  buttonLabel = 'Voice',
}: VoiceAssistantButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { t, language: uiLanguage } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  // Speech language labels
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
  
  // State - initialize speech language from UI language
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>(getInitialSpeechLanguage())
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<VoiceErrorType | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [parseResult, setParseResult] = useState<VoiceParseResponse | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Editable fields for patient mode
  const [editedFirstName, setEditedFirstName] = useState('')
  const [editedLastName, setEditedLastName] = useState('')
  const [editedPhone, setEditedPhone] = useState('')
  const [editedDiagnosis, setEditedDiagnosis] = useState('')
  const [editedBirthDate, setEditedBirthDate] = useState('')
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Check MediaRecorder support - critical for Telegram WebView
  const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined' && 
    typeof navigator?.mediaDevices?.getUserMedia !== 'undefined'
  
  // Get localized error message based on error type
  const getErrorMessage = (type: VoiceErrorType): string => {
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
  }
  
  // Get supported MIME type
  const getSupportedMimeType = (): string => {
    if (!isMediaRecorderSupported) return 'audio/webm'
    for (const mimeType of SUPPORTED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    }
    return 'audio/webm'
  }
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Cleanup
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop() } catch {}
      }
      mediaRecorderRef.current = null
    }
    audioChunksRef.current = []
  }, [])
  
  // Reset state - fully clears everything for retry
  const handleReset = useCallback(() => {
    devLog('Resetting state')
    cleanup()
    setRecordingState('idle')
    setRecordingSeconds(0)
    setError(null)
    setErrorType(null)
    setTranscript('')
    setParseResult(null)
    setIsEditing(false)
    setEditedFirstName('')
    setEditedLastName('')
    setEditedPhone('')
    setEditedDiagnosis('')
    setEditedBirthDate('')
  }, [cleanup])
  
  // Switch to text fallback mode
  const handleFallbackToText = useCallback(() => {
    devLog('Switching to text fallback')
    setRecordingState('fallback')
    setError(null)
    setErrorType(null)
  }, [])
  
  // Close modal
  const handleClose = () => {
    handleReset()
    onClose()
  }
  
  // Handle modal open - check support and show fallback if needed
  const handleOpen = () => {
    if (!isMediaRecorderSupported) {
      devLog('MediaRecorder not supported - showing fallback')
      setRecordingState('fallback')
      setErrorType('not_supported')
    }
    onOpen()
  }
  
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
      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }
      
      recorder.onstop = async () => {
        // Process audio when recording stops
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        devLog(`Audio blob size: ${audioBlob.size}`)
        if (audioBlob.size > 100) {
          await processAudio(audioBlob)
        } else {
          devLog('Recording too short')
          setErrorType('recognition')
          setError(t('voice.tooShort'))
          setRecordingState('error')
        }
      }
      
      recorder.onerror = (e) => {
        devLog('MediaRecorder error', e)
        setErrorType('unknown')
        setError(t('voice.recordingError'))
        setRecordingState('error')
      }
      
      recorder.start()
      setRecordingState('recording')
      setRecordingSeconds(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
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
  
  // Stop recording
  const stopRecording = () => {
    devLog('Stopping recording...')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setRecordingState('processing')
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }
  
  // Process audio - send to API with proper error handling
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Use selected speech language (hy/ru/en) - already in Whisper format
      const language: VoiceLanguage = speechLanguage
      
      // Get user's timezone for accurate date parsing
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Yerevan'
      
      devLog(`Processing audio: language=${language}, timezone=${timezone}, size=${audioBlob.size}`)
      
      const result = await parseVoice({
        mode,
        language,
        contextPatientId,
        audioBlob,
        timezone,
      })
      
      devLog(`Parse result: transcript length=${result.transcript.length}`)
      
      // Check if we got a meaningful transcript
      if (!result.transcript || result.transcript.trim().length < 2) {
        devLog('Empty or too short transcript')
        setErrorType('recognition')
        setError(t('voice.noData'))
        setRecordingState('error')
        return
      }
      
      setTranscript(result.transcript)
      setParseResult(result)
      
      // Set editable fields from parsed data
      if ('patient' in result.structured) {
        const p = result.structured.patient
        setEditedFirstName(p.first_name || '')
        setEditedLastName(p.last_name || '')
        setEditedPhone(p.phone || '')
        setEditedDiagnosis(p.diagnosis || '')
        setEditedBirthDate(p.birth_date || '')
      }
      
      setRecordingState('preview')
      
    } catch (err) {
      devLog('Voice parsing failed', err)
      
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
  
  // Apply result
  const handleApply = () => {
    if (!parseResult) return
    
    // Build structured data with edits
    let structured = parseResult.structured
    
    if ('patient' in structured) {
      structured = {
        patient: {
          first_name: editedFirstName || undefined,
          last_name: editedLastName || undefined,
          phone: editedPhone || undefined,
          diagnosis: editedDiagnosis || undefined,
          birth_date: editedBirthDate || undefined,
        }
      }
    }
    
    onApply(structured, transcript)
    toast({
      title: 'Applied',
      description: 'Check fields and save',
      status: 'success',
      duration: 3000,
    })
    handleClose()
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup()
  }, [cleanup])
  
  // Mode label
  const getModeLabel = () => {
    switch (mode) {
      case 'patient': return 'Patient Voice Input'
      case 'visit': return 'Visit Voice Input'
      case 'note': return 'Note Voice Input'
      default: return 'Voice Input'
    }
  }
  
  // Check if we should render as floating circular button
  const isFloatingStyle = buttonLabel === '🤖' || buttonLabel === ''
  
  return (
    <>
      {isFloatingStyle ? (
        <Button
          onClick={handleOpen}
          borderRadius="full"
          w="56px"
          h="56px"
          colorScheme="blue"
          boxShadow="lg"
          p={0}
          _hover={{ transform: 'scale(1.1)' }}
          transition="transform 0.2s"
        >
          <Box w={6} h={6} color="white">
            <AssistantIcon />
          </Box>
        </Button>
      ) : (
        <Button
          onClick={handleOpen}
          leftIcon={<Box w={4} h={4}><AssistantIcon /></Box>}
          variant="outline"
          size="sm"
          borderRadius="lg"
          colorScheme="blue"
        >
          {buttonLabel}
        </Button>
      )}
      
      <Modal isOpen={isOpen} onClose={handleClose} size="sm" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent 
          mx={4} 
          borderRadius="2xl" 
          overflow="hidden"
          bg={isDark ? 'gray.800' : 'white'}
          // Android WebView - prevent horizontal scroll from text overflow
          overflowX="hidden"
          sx={{
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
          }}
        >
          {/* Header */}
          <Flex
            px={4}
            py={3}
            align="center"
            justify="space-between"
            borderBottom="1px solid"
            borderColor={isDark ? 'gray.700' : 'gray.200'}
          >
            <Flex align="center" gap={2}>
              <Box w={5} h={5} color="blue.500"><AssistantIcon /></Box>
              <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'gray.800'}>
                {getModeLabel()}
              </Text>
            </Flex>
            <IconButton
              aria-label="Close"
              icon={<Box as={X} w={4} h={4} />}
              size="xs"
              variant="ghost"
              onClick={handleClose}
            />
          </Flex>
          
          <ModalBody p={4}>
            {/* Language Selection - show in idle and fallback modes */}
            {(recordingState === 'idle' || recordingState === 'fallback') && (
              <HStack spacing={1} mb={4} justify="center">
                {(Object.entries(speechLanguageLabels) as [SpeechLanguage, string][]).map(([lang, label]) => (
                  <Button
                    key={lang}
                    size="xs"
                    variant={speechLanguage === lang ? 'solid' : 'ghost'}
                    colorScheme={speechLanguage === lang ? 'blue' : 'gray'}
                    onClick={() => setSpeechLanguage(lang)}
                    borderRadius="md"
                    px={3}
                  >
                    {label}
                  </Button>
                ))}
              </HStack>
            )}
            
            {/* Idle State */}
            {recordingState === 'idle' && (
              <VStack spacing={4}>
                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'} textAlign="center">
                  {t('voice.startHint') || 'Press and speak. AI will recognize and fill data.'}
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
                  <Box w={8} h={8}><AssistantIcon /></Box>
                </Button>
                
                {/* Text fallback link */}
                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<Box as={Keyboard} w={3} h={3} />}
                  onClick={handleFallbackToText}
                  color={isDark ? 'gray.400' : 'gray.500'}
                  fontWeight="normal"
                >
                  {t('voice.useTextInput') || 'Use text input'}
                </Button>
              </VStack>
            )}
            
            {/* Fallback Text Input State - for when voice is not available */}
            {recordingState === 'fallback' && (
              <VStack spacing={4} align="stretch">
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
                  {t('voice.textInputHint') || 'Enter patient information manually'}
                </Text>
                
                {/* Manual input fields for patient mode */}
                <VStack spacing={3} align="stretch">
                  <Input
                    size="sm"
                    placeholder={t('addPatient.firstNamePlaceholder')}
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    bg={isDark ? 'gray.700' : 'white'}
                  />
                  <Input
                    size="sm"
                    placeholder={t('addPatient.lastNamePlaceholder')}
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    bg={isDark ? 'gray.700' : 'white'}
                  />
                  <Input
                    size="sm"
                    placeholder={t('addPatient.phonePlaceholder')}
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    bg={isDark ? 'gray.700' : 'white'}
                  />
                  <Textarea
                    size="sm"
                    rows={2}
                    placeholder={t('addPatient.diagnosisPlaceholderShort')}
                    value={editedDiagnosis}
                    onChange={(e) => setEditedDiagnosis(e.target.value)}
                    bg={isDark ? 'gray.700' : 'white'}
                  />
                  <Input
                    type="date"
                    size="sm"
                    value={editedBirthDate}
                    onChange={(e) => setEditedBirthDate(e.target.value)}
                    bg={isDark ? 'gray.700' : 'white'}
                  />
                </VStack>
                
                {/* Action buttons */}
                <HStack spacing={2} pt={2}>
                  <Button
                    flex={1}
                    colorScheme="green"
                    leftIcon={<Box as={Check} w={4} h={4} />}
                    onClick={() => {
                      // Create structured data from manual input
                      const structured: VoiceParseStructured = {
                        patient: {
                          first_name: editedFirstName || undefined,
                          last_name: editedLastName || undefined,
                          phone: editedPhone || undefined,
                          diagnosis: editedDiagnosis || undefined,
                          birth_date: editedBirthDate || undefined,
                        }
                      }
                      onApply(structured, `[Manual input]`)
                      toast({
                        title: t('voice.dataApplied'),
                        description: t('voice.checkAndSave'),
                        status: 'success',
                        duration: 3000,
                      })
                      handleClose()
                    }}
                    size="sm"
                    borderRadius="lg"
                    isDisabled={!editedFirstName && !editedLastName && !editedPhone}
                  >
                    {t('voice.apply')}
                  </Button>
                  <Button
                    variant="ghost"
                    leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                    onClick={handleReset}
                    size="sm"
                    borderRadius="lg"
                  >
                    {t('voice.discard')}
                  </Button>
                </HStack>
              </VStack>
            )}
            
            {/* Recording State */}
            {recordingState === 'recording' && (
              <VStack spacing={4}>
                <HStack>
                  <Box 
                    w={3} 
                    h={3} 
                    borderRadius="full" 
                    bg="red.500" 
                    animation={`${pulseAnimation} 1s infinite`}
                  />
                  <Text fontSize="lg" fontWeight="bold" color="red.500">
                    {formatTime(recordingSeconds)}
                  </Text>
                </HStack>
                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('patientCard.ai.listening') || 'Speaking...'}
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
                  {t('voice.stopHint') || 'Press to stop'}
                </Text>
              </VStack>
            )}
            
            {/* Processing State */}
            {recordingState === 'processing' && (
              <VStack spacing={4} py={6}>
                <Spinner size="lg" color="blue.500" />
                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('voice.processing')}
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
            
            {/* Preview State */}
            {recordingState === 'preview' && parseResult && (
              <VStack spacing={3} align="stretch">
                {/* Transcript - with proper text wrapping for Armenian */}
                <Box p={3} borderRadius="lg" bg={isDark ? 'gray.700' : 'gray.100'}>
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
                    {transcript}
                  </Text>
                </Box>
                
                {/* Editable Fields */}
                {'patient' in parseResult.structured && (
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontWeight="medium" color="gray.500">
                        Parsed Data:
                      </Text>
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<Box as={Edit2} w={3} h={3} />}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Done' : 'Edit'}
                      </Button>
                    </Flex>
                    
                    {/* First Name */}
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>First Name</Text>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editedFirstName}
                          onChange={(e) => setEditedFirstName(e.target.value)}
                          placeholder="First name..."
                        />
                      ) : (
                        <Badge colorScheme={editedFirstName ? 'green' : 'orange'}>
                          {editedFirstName || 'Not specified'}
                        </Badge>
                      )}
                    </Box>
                    
                    {/* Last Name */}
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Last Name</Text>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editedLastName}
                          onChange={(e) => setEditedLastName(e.target.value)}
                          placeholder="Last name..."
                        />
                      ) : (
                        <Badge colorScheme={editedLastName ? 'green' : 'orange'}>
                          {editedLastName || 'Not specified'}
                        </Badge>
                      )}
                    </Box>
                    
                    {/* Phone */}
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>Phone</Text>
                      {isEditing ? (
                        <Input
                          size="sm"
                          value={editedPhone}
                          onChange={(e) => setEditedPhone(e.target.value)}
                          placeholder="+374..."
                        />
                      ) : (
                        <Badge colorScheme={editedPhone ? 'green' : 'orange'}>
                          {editedPhone || 'Not specified'}
                        </Badge>
                      )}
                    </Box>
                    
                    {/* Diagnosis */}
                    {(editedDiagnosis || isEditing) && (
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Diagnosis</Text>
                        {isEditing ? (
                          <Textarea
                            size="sm"
                            rows={2}
                            value={editedDiagnosis}
                            onChange={(e) => setEditedDiagnosis(e.target.value)}
                            placeholder="Diagnosis..."
                          />
                        ) : (
                          <Text fontSize="sm">{editedDiagnosis}</Text>
                        )}
                      </Box>
                    )}
                    
                    {/* Birth Date */}
                    {(editedBirthDate || isEditing) && (
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>Birth Date</Text>
                        {isEditing ? (
                          <Input
                            type="date"
                            size="sm"
                            value={editedBirthDate}
                            onChange={(e) => setEditedBirthDate(e.target.value)}
                          />
                        ) : (
                          <Badge colorScheme="blue">{editedBirthDate}</Badge>
                        )}
                      </Box>
                    )}
                  </VStack>
                )}
                
                {/* Action Buttons */}
                <HStack spacing={2} pt={2}>
                  <Button
                    flex={1}
                    colorScheme="green"
                    leftIcon={<Box as={Check} w={4} h={4} />}
                    onClick={handleApply}
                    size="sm"
                    borderRadius="lg"
                  >
                    Apply
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

// Type guard functions
export function isPatientStructured(data: VoiceParseStructured | undefined): data is { patient: { first_name?: string; last_name?: string; phone?: string; diagnosis?: string; birth_date?: string } } {
  return !!data && 'patient' in data
}

export function isVisitStructured(data: VoiceParseStructured | undefined): data is { visit: { visit_date?: string; next_visit_date?: string; notes?: string; diagnosis?: string }; medications?: Array<{ name: string; dosage?: string; frequency?: string }> } {
  return !!data && 'visit' in data
}

export function isNoteStructured(data: VoiceParseStructured | undefined): data is { note: { notes?: string } } {
  return !!data && 'note' in data
}
