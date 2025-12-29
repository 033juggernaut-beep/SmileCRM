/**
 * Voice Assistant Button Component
 * Clean design matching FloatingAIAssistant
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
} from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Edit2, RotateCcw, Square, X } from 'lucide-react'

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

// Constants
const MAX_RECORDING_SECONDS = 60
const SUPPORTED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
]

// Recording pulse animation
const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
`

type RecordingState = 'idle' | 'recording' | 'processing' | 'preview' | 'editing' | 'error'
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
  
  // Speech language
  const speechLanguageLabels: Record<SpeechLanguage, string> = {
    ru: 'RU',
    hy: 'AM',
    en: 'EN',
  }
  
  // State
  const [speechLanguage, setSpeechLanguage] = useState<SpeechLanguage>('ru')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
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
  
  // Check MediaRecorder support
  const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined'
  
  // Get supported MIME type
  const getSupportedMimeType = (): string => {
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
  
  // Reset state
  const handleReset = useCallback(() => {
    cleanup()
    setRecordingState('idle')
    setRecordingSeconds(0)
    setError(null)
    setTranscript('')
    setParseResult(null)
    setIsEditing(false)
    setEditedFirstName('')
    setEditedLastName('')
    setEditedPhone('')
    setEditedDiagnosis('')
    setEditedBirthDate('')
  }, [cleanup])
  
  // Close modal
  const handleClose = () => {
    handleReset()
    onClose()
  }
  
  // Start recording
  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mimeType = getSupportedMimeType()
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
        if (audioBlob.size > 100) {
          await processAudio(audioBlob)
        }
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
      console.error('Failed to start recording:', err)
      setError('Microphone access denied')
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
      setRecordingState('processing')
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
  }
  
  // Process audio - send to API
  const processAudio = async (audioBlob: Blob) => {
    try {
      // Map speech language to VoiceLanguage
      const language: VoiceLanguage = speechLanguage === 'hy' ? 'hy' : 
                                       speechLanguage === 'en' ? 'en' : 'ru'
      
      const result = await parseVoice({
        mode,
        language,
        contextPatientId,
        audioBlob,
      })
      
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
      console.error('Voice parsing failed:', err)
      setError('Recognition error. Try again.')
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
  
  return (
    <>
      <Button
        onClick={onOpen}
        leftIcon={<Box w={4} h={4}><AssistantIcon /></Box>}
        variant="outline"
        size="sm"
        borderRadius="lg"
        colorScheme="blue"
        isDisabled={!isMediaRecorderSupported}
      >
        {buttonLabel}
      </Button>
      
      <Modal isOpen={isOpen} onClose={handleClose} size="sm" isCentered>
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent mx={4} borderRadius="2xl" overflow="hidden">
          {/* Header */}
          <Flex
            px={4}
            py={3}
            align="center"
            justify="space-between"
            borderBottom="1px solid"
            borderColor="gray.200"
          >
            <Flex align="center" gap={2}>
              <Box w={5} h={5} color="blue.500"><AssistantIcon /></Box>
              <Text fontSize="sm" fontWeight="semibold">
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
            {/* Language Selection */}
            {recordingState === 'idle' && (
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
                <Text fontSize="sm" color="gray.500" textAlign="center">
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
                  <Box w={8} h={8}><AssistantIcon /></Box>
                </Button>
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
                <Text fontSize="sm" color="gray.500">Speaking...</Text>
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
                <Text fontSize="xs" color="gray.400">Press to stop</Text>
              </VStack>
            )}
            
            {/* Processing State */}
            {recordingState === 'processing' && (
              <VStack spacing={4} py={6}>
                <Spinner size="lg" color="blue.500" />
                <Text fontSize="sm" color="gray.500">AI processing...</Text>
                <Progress size="sm" isIndeterminate colorScheme="blue" w="full" borderRadius="full" />
              </VStack>
            )}
            
            {/* Error State */}
            {recordingState === 'error' && (
              <VStack spacing={4}>
                <Box p={3} borderRadius="lg" bg="red.50" w="full">
                  <Text fontSize="sm" color="red.500">{error}</Text>
                </Box>
                <Button
                  leftIcon={<Box as={RotateCcw} w={4} h={4} />}
                  onClick={handleReset}
                  size="sm"
                >
                  Try again
                </Button>
              </VStack>
            )}
            
            {/* Preview State */}
            {recordingState === 'preview' && parseResult && (
              <VStack spacing={3} align="stretch">
                {/* Transcript */}
                <Box p={3} borderRadius="lg" bg="gray.100">
                  <Text fontSize="xs" color="gray.500" mb={1}>Recognized:</Text>
                  <Text fontSize="sm">{transcript}</Text>
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
