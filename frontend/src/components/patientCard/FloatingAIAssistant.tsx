/**
 * Floating AI Assistant Widget - Discreet bottom-right helper
 * - Minimal robot/assistant icon
 * - Opens small panel on click
 * - Voice input and text command options
 * - Help with: diagnosis, visits, finance, marketing
 */

import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  Grid,
  useColorMode,
  IconButton,
} from '@chakra-ui/react'
import { Mic, MessageSquare, X, Stethoscope, Calendar, Wallet, Megaphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

interface AIAssistantAction {
  type: 'diagnosis' | 'visit' | 'finance' | 'marketing'
  text: string
}

interface FloatingAIAssistantProps {
  onAction?: (action: AIAssistantAction) => void
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

export function FloatingAIAssistant({ onAction }: FloatingAIAssistantProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<'voice' | 'text' | null>(null)
  const [inputText, setInputText] = useState('')

  const capabilities = [
    {
      id: 'diagnosis' as const,
      icon: Stethoscope,
      labelKey: 'patientCard.ai.diagnosis',
      descKey: 'patientCard.ai.diagnosisDesc',
    },
    {
      id: 'visit' as const,
      icon: Calendar,
      labelKey: 'patientCard.ai.visits',
      descKey: 'patientCard.ai.visitsDesc',
    },
    {
      id: 'finance' as const,
      icon: Wallet,
      labelKey: 'patientCard.ai.finance',
      descKey: 'patientCard.ai.financeDesc',
    },
    {
      id: 'marketing' as const,
      icon: Megaphone,
      labelKey: 'patientCard.ai.marketing',
      descKey: 'patientCard.ai.marketingDesc',
    },
  ]

  const handleCapabilityClick = (capId: AIAssistantAction['type']) => {
    if (inputText.trim()) {
      onAction?.({ type: capId, text: inputText })
      setInputText('')
    }
    console.log(`AI Assistant: ${capId} action`)
  }

  const handleVoiceStart = () => {
    setActiveMode('voice')
    // Simulate voice recording
    console.log('Voice recording started')
    setTimeout(() => {
      setActiveMode(null)
    }, 3000)
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
            w="72"
            borderRadius="2xl"
            boxShadow="2xl"
            overflow="hidden"
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

            {/* Input Methods */}
            <Box p={3}>
              <Flex gap={2} mb={3}>
                {/* Voice Input Button */}
                <Button
                  onClick={handleVoiceStart}
                  flex={1}
                  size="sm"
                  fontWeight="medium"
                  leftIcon={<Box as={Mic} w={4} h={4} />}
                  bg={
                    activeMode === 'voice'
                      ? 'blue.600'
                      : isDark
                      ? 'rgba(51, 65, 85, 0.5)'
                      : 'gray.100'
                  }
                  color={
                    activeMode === 'voice'
                      ? 'white'
                      : isDark
                      ? 'gray.300'
                      : 'gray.600'
                  }
                  _hover={{
                    bg: activeMode === 'voice' ? 'blue.500' : isDark ? 'gray.700' : 'gray.200',
                  }}
                >
                  {t('patientCard.ai.voice')}
                </Button>

                {/* Text Input Button */}
                <Button
                  onClick={() => setActiveMode(activeMode === 'text' ? null : 'text')}
                  flex={1}
                  size="sm"
                  fontWeight="medium"
                  leftIcon={<Box as={MessageSquare} w={4} h={4} />}
                  bg={
                    activeMode === 'text'
                      ? 'blue.600'
                      : isDark
                      ? 'rgba(51, 65, 85, 0.5)'
                      : 'gray.100'
                  }
                  color={
                    activeMode === 'text'
                      ? 'white'
                      : isDark
                      ? 'gray.300'
                      : 'gray.600'
                  }
                  _hover={{
                    bg: activeMode === 'text' ? 'blue.500' : isDark ? 'gray.700' : 'gray.200',
                  }}
                >
                  {t('patientCard.ai.text')}
                </Button>
              </Flex>

              {/* Text Input Field */}
              {activeMode === 'text' && (
                <Box mb={3}>
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('patientCard.ai.placeholder')}
                    rows={2}
                    resize="none"
                    fontSize="sm"
                    borderRadius="xl"
                    bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}
                    color={isDark ? 'white' : 'gray.800'}
                    border="1px solid"
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                    _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: isDark ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 0 0 2px rgba(59, 130, 246, 0.3)',
                    }}
                  />
                </Box>
              )}

              {/* Voice Recording Indicator */}
              {activeMode === 'voice' && (
                <Flex
                  mb={3}
                  p={3}
                  borderRadius="xl"
                  justify="center"
                  align="center"
                  gap={2}
                  bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}
                >
                  <Box w={2} h={2} borderRadius="full" bg="blue.500" animation="pulse 1s infinite" />
                  <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.600'}>
                    {t('patientCard.ai.listening')}
                  </Text>
                </Flex>
              )}

              {/* Capabilities */}
              <Box>
                <Text fontSize="xs" mb={2} color={isDark ? 'gray.500' : 'gray.400'}>
                  {t('patientCard.ai.helpWith')}
                </Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {capabilities.map((cap) => (
                    <Button
                      key={cap.id}
                      onClick={() => handleCapabilityClick(cap.id)}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      gap={2}
                      p={2.5}
                      h="auto"
                      borderRadius="xl"
                      _hover={{ bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50' }}
                    >
                      <Box
                        as={cap.icon}
                        w={4}
                        h={4}
                        flexShrink={0}
                        color={isDark ? 'blue.400' : 'blue.600'}
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
                  ))}
                </Grid>
              </Box>
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

