/**
 * Voice Assistant Button Component
 * Provides voice recording, transcription, and auto-fill functionality.
 * Supports Armenian (HY), Russian (RU), English (EN) and mixed language input.
 */

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Select,
  Stack,
  Tag,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {
  type VoiceLanguage,
  type VoiceMode,
  type VoiceParseResponse,
  type VoiceParseStructured,
  parseVoice,
} from '../api/ai'
import { PremiumButton } from './premium/PremiumButton'

// Constants
const MAX_RECORDING_SECONDS = 60
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
]

// Language options
const LANGUAGE_OPTIONS: { value: VoiceLanguage; label: string }[] = [
  { value: 'auto', label: '🌐 Auto-detect' },
  { value: 'hy', label: '🇦🇲 Հdelays:րdelays:delays:' },
  { value: 'ru', label: '🇷🇺 Русский' },
  { value: 'en', label: '🇬🇧 English' },
]

// Recording pulse animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`

type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

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
  buttonLabel = '🎤 Голос',
}: VoiceAssistantButtonProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  // State
  const [language, setLanguage] = useState<VoiceLanguage>('auto')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [parseResult, setParseResult] = useState<VoiceParseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Check MediaRecorder support
  const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined'
  
  // Get supported MIME type
  const getSupportedMimeType = (): string => {
    for (const mimeType of SUPPORTED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    }
    return 'audio/webm' // fallback
  }
  
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
    mediaRecorderRef.current = null
    audioChunksRef.current = []
  }, [])
  
  // Reset state
  const resetState = useCallback(() => {
    cleanup()
    setRecordingState('idle')
    setRecordingSeconds(0)
    setAudioBlob(null)
    setParseResult(null)
    setError(null)
  }, [cleanup])
  
  // Handle modal close
  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])
  
  // Start recording
  const startRecording = async () => {
    try {
      setError(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mimeType = getSupportedMimeType()
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(audioBlob)
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
      
      mediaRecorder.onerror = () => {
        setError('Ошибка записи. Попробуйте снова.')
        setRecordingState('error')
        cleanup()
      }
      
      // Start recording
      mediaRecorder.start(1000) // Collect data every second
      setRecordingState('recording')
      setRecordingSeconds(0)
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            // Auto-stop at max duration
            stopRecording()
            return MAX_RECORDING_SECONDS
          }
          return prev + 1
        })
      }, 1000)
      
    } catch (err) {
      console.error('Failed to start recording:', err)
      
      let errorMessage = 'Не удалось получить доступ к микрофону.'
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Доступ к микрофону запрещен. Разрешите доступ в настройках.'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'Микрофон не найден. Подключите микрофон и попробуйте снова.'
        }
      }
      
      setError(errorMessage)
      setRecordingState('error')
    }
  }
  
  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setRecordingState('idle')
    }
  }
  
  // Send audio for processing
  const sendAudio = async () => {
    if (!audioBlob) {
      setError('Нет записи для отправки')
      return
    }
    
    setRecordingState('processing')
    setError(null)
    
    try {
      const result = await parseVoice({
        mode,
        language,
        contextPatientId,
        audioBlob,
      })
      
      setParseResult(result)
      setRecordingState('done')
      
      // Show warnings if any
      if (result.warnings.length > 0) {
        console.log('[VoiceAssistant] Warnings:', result.warnings)
      }
      
    } catch (err) {
      console.error('Voice parsing failed:', err)
      
      let errorMessage = 'Не удалось обработать запись. Попробуйте снова.'
      
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 501) {
          errorMessage = 'AI не настроен. Обратитесь к администратору.'
        } else if (err.response?.data?.detail) {
          const detail = err.response.data.detail
          // Handle FastAPI validation errors (array of objects)
          if (Array.isArray(detail)) {
            errorMessage = detail.map((e: { msg?: string }) => e.msg || 'Validation error').join(', ')
          } else if (typeof detail === 'string') {
            errorMessage = detail
          }
        }
      }
      
      setError(errorMessage)
      setRecordingState('error')
    }
  }
  
  // Apply result to form
  const handleApply = () => {
    if (parseResult) {
      onApply(parseResult.structured, parseResult.transcript)
      toast({
        title: 'Данные применены',
        description: 'Проверьте поля и сохраните форму.',
        status: 'success',
        duration: 3000,
      })
      handleClose()
    }
  }
  
  // Discard result
  const handleDiscard = () => {
    resetState()
  }
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])
  
  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Get mode label
  const getModeLabel = (): string => {
    switch (mode) {
      case 'patient':
        return 'пациента'
      case 'visit':
        return 'визита'
      case 'note':
        return 'заметки'
      default:
        return ''
    }
  }
  
  // Check if structured data is empty
  const isStructuredEmpty = (result: VoiceParseResponse): boolean => {
    const { structured } = result
    
    if ('patient' in structured) {
      const p = structured.patient
      return !p.first_name && !p.last_name && !p.phone && !p.diagnosis
    }
    
    if ('visit' in structured) {
      const v = structured.visit
      const m = structured.medications || []
      return !v.visit_date && !v.next_visit_date && !v.notes && !v.diagnosis && m.length === 0
    }
    
    if ('note' in structured) {
      return !structured.note.notes
    }
    
    return true
  }
  
  return (
    <>
      <Button
        onClick={onOpen}
        leftIcon={<Text fontSize="lg">🎤</Text>}
        variant="outline"
        size="sm"
        borderRadius="lg"
        borderColor="primary.500"
        color="primary.400"
        bg="transparent"
        _hover={{
          bg: 'primary.500',
          color: 'white',
        }}
        isDisabled={!isMediaRecorderSupported}
        title={!isMediaRecorderSupported ? 'Запись не поддерживается в вашем браузере' : undefined}
      >
        {buttonLabel}
      </Button>
      
      <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
        <ModalContent 
          mx={4} 
          bg="bg.secondary" 
          borderRadius="xl"
          border="1px solid"
          borderColor="border.subtle"
        >
          <ModalHeader color="text.primary" borderBottom="1px solid" borderColor="border.subtle">
            <Flex align="center" gap={2}>
              <Text fontSize="xl">🎤</Text>
              <Text>Голосовой ввод {getModeLabel()}</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton color="text.secondary" />
          
          <ModalBody py={6}>
            <Stack spacing={5}>
              {/* Language selector */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2} color="text.secondary">
                  Язык записи
                </Text>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as VoiceLanguage)}
                  isDisabled={recordingState === 'recording' || recordingState === 'processing'}
                  bg="bg.tertiary"
                  borderColor="border.subtle"
                  sx={{
                    option: {
                      bg: 'bg.secondary',
                      color: 'text.primary',
                    },
                  }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </Box>
              
              {/* Recording controls */}
              {recordingState !== 'done' && (
                <Box>
                  <Flex justify="center" align="center" py={6} direction="column" gap={4}>
                    {recordingState === 'idle' && !audioBlob && (
                      <PremiumButton onClick={startRecording} size="lg">
                        🎙 Начать запись
                      </PremiumButton>
                    )}
                    
                    {recordingState === 'recording' && (
                      <>
                        <Box 
                          textAlign="center"
                          animation={`${pulseAnimation} 1.5s ease-in-out infinite`}
                        >
                          <Box
                            w="80px"
                            h="80px"
                            borderRadius="full"
                            bg="error.500"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mx="auto"
                            mb={3}
                            boxShadow="0 0 30px rgba(255, 10, 45, 0.4)"
                          >
                            <Text fontSize="3xl">🎙</Text>
                          </Box>
                          <Text fontSize="2xl" color="text.primary" fontWeight="bold">
                            {formatTime(recordingSeconds)}
                          </Text>
                          <Text fontSize="sm" color="text.muted" mt={1}>
                            Макс. {MAX_RECORDING_SECONDS} сек
                          </Text>
                        </Box>
                        <PremiumButton
                          onClick={stopRecording}
                          variant="secondary"
                          size="lg"
                        >
                          ⏹ Остановить
                        </PremiumButton>
                      </>
                    )}
                    
                    {recordingState === 'idle' && audioBlob && (
                      <Stack spacing={3} w="full" align="center">
                        <Tag size="lg" bg="success.500" color="white" borderRadius="full">
                          ✓ Запись готова ({formatTime(recordingSeconds)})
                        </Tag>
                        <HStack spacing={3}>
                          <PremiumButton onClick={sendAudio}>
                            📤 Обработать
                          </PremiumButton>
                          <PremiumButton
                            onClick={resetState}
                            variant="ghost"
                          >
                            🔄
                          </PremiumButton>
                        </HStack>
                      </Stack>
                    )}
                    
                    {recordingState === 'processing' && (
                      <Box textAlign="center" w="full">
                        <Text mb={3} color="text.primary" fontWeight="medium">
                          Обработка записи...
                        </Text>
                        <Progress 
                          size="sm" 
                          isIndeterminate 
                          colorScheme="blue"
                          bg="bg.tertiary"
                          borderRadius="full"
                        />
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
              
              {/* Error message */}
              {error && (
                <Alert 
                  status="error" 
                  borderRadius="lg"
                  bg="error.500"
                  color="white"
                >
                  <AlertIcon color="white" />
                  <Text fontSize="sm">{error}</Text>
                </Alert>
              )}
              
              {/* Parse result */}
              {recordingState === 'done' && parseResult && (
                <Stack spacing={4}>
                  {/* Transcript */}
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2} color="text.secondary">
                      Распознанный текст
                    </Text>
                    <Textarea
                      value={parseResult.transcript}
                      isReadOnly
                      rows={3}
                      fontSize="sm"
                      bg="bg.tertiary"
                      borderColor="border.subtle"
                      color="text.primary"
                    />
                  </Box>
                  
                  {/* Warnings */}
                  {parseResult.warnings.length > 0 && (
                    <Box>
                      <HStack spacing={2} flexWrap="wrap">
                        {parseResult.warnings.map((w, i) => (
                          <Tag 
                            key={i} 
                            size="sm" 
                            bg="warning.500" 
                            color="black"
                            borderRadius="full"
                          >
                            ⚠️ {w}
                          </Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}
                  
                  {/* Empty result warning */}
                  {isStructuredEmpty(parseResult) && (
                    <Alert 
                      status="warning" 
                      borderRadius="lg"
                      bg="warning.500"
                      color="black"
                    >
                      <AlertIcon color="black" />
                      <Text fontSize="sm">
                        Не удалось распознать данные. Попробуйте записать ещё раз.
                      </Text>
                    </Alert>
                  )}
                  
                  {/* Extracted data preview */}
                  {!isStructuredEmpty(parseResult) && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="text.secondary">
                        Извлечённые данные
                      </Text>
                      <Box
                        bg="bg.tertiary"
                        p={3}
                        borderRadius="lg"
                        fontSize="xs"
                        fontFamily="mono"
                        whiteSpace="pre-wrap"
                        maxH="150px"
                        overflowY="auto"
                        color="text.secondary"
                        border="1px solid"
                        borderColor="border.subtle"
                      >
                        {JSON.stringify(parseResult.structured, null, 2)}
                      </Box>
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </ModalBody>
          
          <ModalFooter borderTop="1px solid" borderColor="border.subtle">
            {recordingState === 'done' && parseResult && !isStructuredEmpty(parseResult) ? (
              <HStack spacing={3} w="full" justify="flex-end">
                <Button 
                  onClick={handleDiscard} 
                  variant="ghost"
                  color="text.secondary"
                >
                  🔄 Заново
                </Button>
                <PremiumButton onClick={handleApply} variant="success">
                  ✓ Применить
                </PremiumButton>
              </HStack>
            ) : (
              <Button 
                onClick={handleClose} 
                variant="ghost"
                color="text.secondary"
              >
                Закрыть
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
