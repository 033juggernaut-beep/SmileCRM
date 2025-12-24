/**
 * MarketingSendModal - Modal for sending marketing messages via Telegram/WhatsApp
 * 
 * Features:
 * - Auto-generates message text from API
 * - Editable textarea for message customization
 * - Send via Telegram (copies text + opens chat)
 * - Send via WhatsApp (opens deeplink with pre-filled text)
 * - Copy to clipboard
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Textarea,
  VStack,
  HStack,
  Text,
  Box,
  Spinner,
  useToast,
  useColorMode,
  Alert,
  AlertIcon,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { Send, Copy, Check, MessageCircle, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { marketingApi, type MessageTemplate } from '../../api/marketing'
import { patientsApi, type Patient } from '../../api/patients'

// Telegram icon component
const TelegramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

// WhatsApp icon component
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export interface MarketingSendModalProps {
  isOpen: boolean
  onClose: () => void
  patientId: string
  template: MessageTemplate
  initialText?: string
  /** Patient data (optional, will be fetched if not provided) */
  patient?: Patient | null
}

export function MarketingSendModal({
  isOpen,
  onClose,
  patientId,
  template,
  initialText,
  patient: providedPatient,
}: MarketingSendModalProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const toast = useToast()
  const isDark = colorMode === 'dark'

  const [messageText, setMessageText] = useState(initialText ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(providedPatient ?? null)
  const [showTelegramInput, setShowTelegramInput] = useState(false)
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false)
  const [tempTelegram, setTempTelegram] = useState('')
  const [tempWhatsApp, setTempWhatsApp] = useState('')

  // Load message preview when modal opens
  useEffect(() => {
    if (isOpen && patientId && !initialText) {
      setIsLoading(true)
      marketingApi
        .previewMessage(patientId, template)
        .then((res) => {
          setMessageText(res.text)
        })
        .catch((err) => {
          console.error('Failed to generate message:', err)
          toast({
            title: t('marketing.generateError'),
            status: 'error',
            duration: 3000,
          })
        })
        .finally(() => setIsLoading(false))
    }
  }, [isOpen, patientId, template, initialText, toast, t])

  // Load patient data if not provided
  useEffect(() => {
    if (isOpen && patientId && !providedPatient) {
      patientsApi
        .getById(patientId)
        .then(setPatient)
        .catch((err) => {
          console.error('Failed to load patient:', err)
        })
    } else if (providedPatient) {
      setPatient(providedPatient)
    }
  }, [isOpen, patientId, providedPatient])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false)
      setShowTelegramInput(false)
      setShowWhatsAppInput(false)
      setTempTelegram('')
      setTempWhatsApp('')
    }
  }, [isOpen])

  // Copy text to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        return true
      } catch {
        return false
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }, [])

  // Handle copy button
  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(messageText)
    if (success) {
      setCopied(true)
      toast({
        title: t('common.copied'),
        status: 'success',
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }, [messageText, copyToClipboard, toast, t])

  // Handle Telegram send
  const handleTelegramSend = useCallback(async () => {
    const username = patient?.telegramUsername || tempTelegram
    
    if (!username) {
      setShowTelegramInput(true)
      return
    }

    // Copy text first
    await copyToClipboard(messageText)
    
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '')
    
    // Try to open via Telegram WebApp
    const tg = window.Telegram?.WebApp
    const telegramUrl = `https://t.me/${cleanUsername}`
    
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(telegramUrl)
    } else if (tg?.openLink) {
      tg.openLink(telegramUrl)
    } else {
      window.open(telegramUrl, '_blank')
    }

    toast({
      title: t('marketing.textCopied'),
      description: t('marketing.telegramOpening'),
      status: 'success',
      duration: 3000,
    })

    onClose()
  }, [patient, tempTelegram, messageText, copyToClipboard, toast, t, onClose])

  // Handle WhatsApp send
  const handleWhatsAppSend = useCallback(() => {
    const phone = patient?.whatsappPhone || patient?.phone || tempWhatsApp
    
    if (!phone) {
      setShowWhatsAppInput(true)
      return
    }

    // Clean phone number (remove non-digits except +)
    const cleanPhone = phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
    
    // Encode message for URL
    const encodedText = encodeURIComponent(messageText)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`
    
    // Open via Telegram WebApp or regular browser
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) {
      tg.openLink(whatsappUrl)
    } else {
      window.open(whatsappUrl, '_blank')
    }

    toast({
      title: t('marketing.whatsappOpening'),
      status: 'success',
      duration: 2000,
    })

    onClose()
  }, [patient, tempWhatsApp, messageText, toast, t, onClose])

  // Save telegram username to patient
  const handleSaveTelegram = useCallback(async () => {
    if (!tempTelegram || !patientId) return
    
    try {
      await patientsApi.update(patientId, { telegramUsername: tempTelegram.replace(/^@/, '') })
      setPatient(prev => prev ? { ...prev, telegramUsername: tempTelegram.replace(/^@/, '') } : null)
      setShowTelegramInput(false)
      handleTelegramSend()
    } catch (err) {
      console.error('Failed to save telegram:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 2000,
      })
    }
  }, [tempTelegram, patientId, handleTelegramSend, toast, t])

  // Save whatsapp phone to patient
  const handleSaveWhatsApp = useCallback(async () => {
    if (!tempWhatsApp || !patientId) return
    
    try {
      await patientsApi.update(patientId, { whatsappPhone: tempWhatsApp })
      setPatient(prev => prev ? { ...prev, whatsappPhone: tempWhatsApp } : null)
      setShowWhatsAppInput(false)
      handleWhatsAppSend()
    } catch (err) {
      console.error('Failed to save whatsapp:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 2000,
      })
    }
  }, [tempWhatsApp, patientId, handleWhatsAppSend, toast, t])

  const patientHasTelegram = !!patient?.telegramUsername
  const patientHasWhatsApp = !!(patient?.whatsappPhone || patient?.phone)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent
        bg={isDark ? 'gray.800' : 'white'}
        borderRadius="2xl"
        mx={4}
      >
        <ModalHeader
          borderBottom="1px solid"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          fontSize="md"
          fontWeight="semibold"
        >
          <HStack spacing={2}>
            <Box as={MessageCircle} w={5} h={5} color="blue.500" />
            <Text>{t('marketing.sendMessage')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={5}>
          <VStack spacing={4} align="stretch">
            {isLoading ? (
              <Box textAlign="center" py={8}>
                <Spinner size="lg" color="blue.500" />
                <Text mt={3} fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('marketing.generating')}
                </Text>
              </Box>
            ) : (
              <>
                <Textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={8}
                  resize="vertical"
                  fontSize="sm"
                  borderRadius="lg"
                  bg={isDark ? 'gray.700' : 'gray.50'}
                  color={isDark ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  _focus={{ borderColor: 'blue.500' }}
                  placeholder={t('marketing.messagePlaceholder')}
                />

                {/* Telegram input prompt */}
                {showTelegramInput && (
                  <Alert status="warning" borderRadius="lg" py={3}>
                    <AlertIcon as={AlertTriangle} />
                    <VStack align="stretch" flex={1} spacing={2} ml={2}>
                      <Text fontSize="sm">{t('marketing.noTelegram')}</Text>
                      <HStack>
                        <Input
                          placeholder="@username"
                          size="sm"
                          value={tempTelegram}
                          onChange={(e) => setTempTelegram(e.target.value)}
                          bg={isDark ? 'gray.700' : 'white'}
                        />
                        <Button size="sm" colorScheme="blue" onClick={handleSaveTelegram}>
                          {t('common.save')}
                        </Button>
                      </HStack>
                    </VStack>
                  </Alert>
                )}

                {/* WhatsApp input prompt */}
                {showWhatsAppInput && (
                  <Alert status="warning" borderRadius="lg" py={3}>
                    <AlertIcon as={AlertTriangle} />
                    <VStack align="stretch" flex={1} spacing={2} ml={2}>
                      <Text fontSize="sm">{t('marketing.noWhatsApp')}</Text>
                      <HStack>
                        <Input
                          placeholder="+374..."
                          size="sm"
                          value={tempWhatsApp}
                          onChange={(e) => setTempWhatsApp(e.target.value)}
                          bg={isDark ? 'gray.700' : 'white'}
                        />
                        <Button size="sm" colorScheme="green" onClick={handleSaveWhatsApp}>
                          {t('common.save')}
                        </Button>
                      </HStack>
                    </VStack>
                  </Alert>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
          gap={2}
          flexWrap="wrap"
          justifyContent="center"
        >
          {/* Telegram button */}
          <Button
            leftIcon={<TelegramIcon />}
            colorScheme="blue"
            variant="solid"
            size="sm"
            onClick={handleTelegramSend}
            isDisabled={isLoading || !messageText}
          >
            Telegram
          </Button>

          {/* WhatsApp button */}
          <Button
            leftIcon={<WhatsAppIcon />}
            colorScheme="green"
            variant="solid"
            size="sm"
            onClick={handleWhatsAppSend}
            isDisabled={isLoading || !messageText}
          >
            WhatsApp
          </Button>

          {/* Copy button */}
          <Button
            leftIcon={copied ? <Check /> : <Copy />}
            variant="outline"
            size="sm"
            onClick={handleCopy}
            isDisabled={isLoading || !messageText}
            colorScheme={copied ? 'green' : 'gray'}
          >
            {copied ? t('common.copied') : t('marketing.copy')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MarketingSendModal
