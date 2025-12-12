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
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
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
  { value: 'auto', label: 'Auto-detect' },
  { value: 'hy', label: 'Հdelays:րdelays:delays:' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

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
  buttonLabel = '🎤 Голосовой ввод',
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
          errorMessage = err.response.data.detail
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
        leftIcon={<Text>🎤</Text>}
        variant="outline"
        size="sm"
        colorScheme="blue"
        isDisabled={!isMediaRecorderSupported}
        title={!isMediaRecorderSupported ? 'Запись не поддерживается в вашем браузере' : undefined}
      >
        {buttonLabel}
      </Button>
      
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>
            🎤 Голосовой ввод {getModeLabel()}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <Stack spacing={4}>
              {/* Language selector */}
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Язык записи
                </Text>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as VoiceLanguage)}
                  isDisabled={recordingState === 'recording' || recordingState === 'processing'}
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
                  <Flex justify="center" align="center" py={4} gap={4}>
                    {recordingState === 'idle' && !audioBlob && (
                      <PremiumButton onClick={startRecording} size="lg">
                        🎙 Начать запись
                      </PremiumButton>
                    )}
                    
                    {recordingState === 'recording' && (
                      <>
                        <Box textAlign="center">
                          <Text fontSize="3xl" color="red.500" fontWeight="bold">
                            ⏺ {formatTime(recordingSeconds)}
                          </Text>
                          <Text fontSize="sm" color="text.muted">
                            Макс. {MAX_RECORDING_SECONDS} сек
                          </Text>
                        </Box>
                        <PremiumButton
                          onClick={stopRecording}
                          variant="secondary"
                          size="lg"
                        >
                          ⏹ Стоп
                        </PremiumButton>
                      </>
                    )}
                    
                    {recordingState === 'idle' && audioBlob && (
                      <HStack spacing={3}>
                        <PremiumButton onClick={sendAudio} size="lg">
                          📤 Отправить
                        </PremiumButton>
                        <PremiumButton
                          onClick={resetState}
                          variant="secondary"
                          size="lg"
                        >
                          🔄 Заново
                        </PremiumButton>
                      </HStack>
                    )}
                    
                    {recordingState === 'processing' && (
                      <Box textAlign="center" w="full">
                        <Text mb={2}>Обработка...</Text>
                        <Progress size="sm" isIndeterminate colorScheme="blue" />
                      </Box>
                    )}
                  </Flex>
                </Box>
              )}
              
              {/* Error message */}
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              
              {/* Recording info when we have audio but haven't processed yet */}
              {recordingState === 'idle' && audioBlob && !parseResult && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  Запись готова ({formatTime(recordingSeconds)}). Нажмите "Отправить" для распознавания.
                </Alert>
              )}
              
              {/* Parse result */}
              {recordingState === 'done' && parseResult && (
                <Stack spacing={4}>
                  {/* Transcript */}
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" mb={2}>
                      Распознанный текст
                    </Text>
                    <Textarea
                      value={parseResult.transcript}
                      isReadOnly
                      rows={3}
                      fontSize="sm"
                      bg="bg.gray"
                    />
                  </Box>
                  
                  {/* Warnings */}
                  {parseResult.warnings.length > 0 && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="semibold">Обратите внимание:</Text>
                        {parseResult.warnings.map((w, i) => (
                          <Text key={i} fontSize="sm">• {w}</Text>
                        ))}
                      </Box>
                    </Alert>
                  )}
                  
                  {/* Empty result warning */}
                  {isStructuredEmpty(parseResult) && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      Не удалось распознать данные. Попробуйте записать ещё раз, более чётко.
                    </Alert>
                  )}
                  
                  {/* Extracted data preview */}
                  {!isStructuredEmpty(parseResult) && (
                    <Box>
                      <Text fontSize="sm" fontWeight="semibold" mb={2}>
                        Извлечённые данные
                      </Text>
                      <Box
                        bg="bg.gray"
                        p={3}
                        borderRadius="md"
                        fontSize="sm"
                        fontFamily="mono"
                        whiteSpace="pre-wrap"
                        maxH="200px"
                        overflowY="auto"
                      >
                        {JSON.stringify(parseResult.structured, null, 2)}
                      </Box>
                    </Box>
                  )}
                </Stack>
              )}
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            {recordingState === 'done' && parseResult && !isStructuredEmpty(parseResult) ? (
              <HStack spacing={3}>
                <Button onClick={handleDiscard} variant="outline">
                  🔄 Заново
                </Button>
                <PremiumButton onClick={handleApply}>
                  ✓ Применить
                </PremiumButton>
              </HStack>
            ) : (
              <Button onClick={handleClose} variant="ghost">
                Закрыть
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
