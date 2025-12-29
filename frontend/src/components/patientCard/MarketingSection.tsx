/**
 * Marketing & Communication section - AI powered
 * - AI assistant block for message generation
 * - Four message types: birthday, visit reminder, discount, post-treatment
 * - Editable message preview with regenerate/copy actions
 */

import { useState, useCallback } from 'react'
import { Box, Flex, Text, Button, Textarea, VStack, HStack, useColorMode, useToast } from '@chakra-ui/react'
import { Sparkles, RefreshCw, Copy, Check, Pencil, MessageCircle } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

// Telegram icon component
const TelegramIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

// WhatsApp icon component
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

// Viber icon component
const ViberIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.623 6.747.564 9.94c-.06 3.193-.134 9.179 5.61 10.853h.003l-.004 2.482s-.038.984.632 1.183c.801.245 1.248-.496 2.01-1.327.415-.453.986-1.123 1.416-1.638 3.905.327 6.905-.419 7.244-.528.784-.253 5.216-.816 5.936-6.652.744-6.01-.358-9.807-2.354-11.503l-.002-.001c-.6-.55-2.998-2.288-8.535-2.32 0 0-.398-.027-1.121-.019zm.129 1.795c.628-.007.963.019.963.019 4.572.025 6.68 1.389 7.18 1.845 1.6 1.363 2.544 4.63 1.91 9.662-.594 4.77-4.149 5.128-4.822 5.345-.278.09-2.896.732-6.164.548 0 0-2.443 2.937-3.211 3.704-.12.122-.263.168-.357.143-.132-.035-.168-.191-.166-.422l.022-4.013c-4.738-1.378-4.665-6.286-4.617-8.904.049-2.62.602-4.722 1.996-6.1 1.908-1.724 5.39-1.957 7.266-1.827zm.557 2.537c-.123 0-.224.1-.221.224.003.124.1.221.224.221 1.03.003 1.977.416 2.663 1.086.687.672 1.115 1.612 1.118 2.64 0 .122.1.22.223.22h.003c.123 0 .222-.101.222-.224-.004-1.153-.483-2.2-1.247-2.954-.766-.755-1.82-1.212-2.983-1.214h-.002zm-3.395.553c-.27-.012-.545.088-.752.318l-.003.001c-.243.274-.477.576-.68.848-.204.272-.38.52-.503.678-.032.04-.077.101-.13.173-.114.151-.26.35-.343.51-.113.22-.115.455-.06.724.102.527.454 1.233 1.133 2.104.879 1.129 1.962 2.138 3.197 2.969.676.454 1.257.774 1.824 1.038.567.264 1.117.471 1.723.522.244.019.475-.058.69-.17.16-.083.36-.228.51-.343.072-.052.133-.097.173-.129.158-.123.406-.299.678-.503.272-.203.574-.437.848-.68l.001-.003c.462-.414.458-1.004.048-1.515-.498-.622-.934-1.058-1.464-1.536-.558-.505-1.107-.457-1.538-.025l-.545.545c-.17.17-.44.205-.44.205l-.003.002c-.113.025-.334.065-.527.004-.6-.19-1.5-.63-2.349-1.483-.85-.852-1.293-1.753-1.483-2.351-.06-.194-.02-.415.004-.528v-.003s.035-.27.205-.44l.546-.545c.432-.43.48-.98-.025-1.538-.478-.53-.914-.966-1.537-1.465-.185-.149-.389-.215-.596-.233zm3.875.416c-.123-.003-.225.093-.229.217-.003.124.093.227.217.23.6.016 1.14.264 1.545.656.405.393.663.935.678 1.536.003.124.104.221.227.218.124-.003.221-.104.218-.228-.019-.724-.33-1.373-.818-1.847-.487-.473-1.144-.767-1.838-.782zm-.114 1.31c-.123-.006-.228.088-.234.21-.007.124.088.228.21.234.323.019.602.158.81.368.207.21.343.492.362.813.01.123.115.216.238.206.123-.01.216-.115.206-.238-.025-.44-.213-.83-.5-1.12-.286-.29-.673-.445-1.092-.473z"/>
  </svg>
)

type MessageType = 'birthday' | 'reminder' | 'discount' | 'recommendation'

interface MessageConfig {
  id: MessageType
  labelKey: string
  emoji: string
}

interface GeneratedMessage {
  type: MessageType
  title: string
  content: string
  isEditing: boolean
}

interface MarketingSectionProps {
  patientName: string
  dateOfBirth?: string
  telegramUsername?: string | null
  whatsappPhone?: string | null
  viberPhone?: string | null
  phone?: string | null
  defaultOpen?: boolean
  patientId?: string
  onContactUpdate?: (field: 'telegramUsername' | 'whatsappPhone' | 'viberPhone', value: string) => Promise<void>
}

const messageTypes: MessageConfig[] = [
  { id: 'birthday', labelKey: 'patientCard.marketing.birthday', emoji: '🎉' },
  { id: 'reminder', labelKey: 'patientCard.marketing.reminder', emoji: '🦷' },
  { id: 'discount', labelKey: 'patientCard.marketing.discount', emoji: '💸' },
  { id: 'recommendation', labelKey: 'patientCard.marketing.recommendation', emoji: '📋' },
]

export function MarketingSection({
  patientName,
  telegramUsername,
  whatsappPhone,
  viberPhone,
  phone,
  defaultOpen = false,
  patientId: _patientId,
  onContactUpdate,
}: MarketingSectionProps) {
  // patientId available as _patientId for future use (e.g., API calls)
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [selectedType, setSelectedType] = useState<MessageType | null>(null)
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState(false)

  // Contact editing state
  const [editingTelegram, setEditingTelegram] = useState(false)
  const [editingWhatsApp, setEditingWhatsApp] = useState(false)
  const [editingViber, setEditingViber] = useState(false)
  const [tempTelegram, setTempTelegram] = useState(telegramUsername || '')
  const [tempWhatsApp, setTempWhatsApp] = useState(whatsappPhone || '')
  const [tempViber, setTempViber] = useState(viberPhone || '')
  const [savingContact, setSavingContact] = useState(false)

  // Save telegram username
  const handleSaveTelegram = useCallback(async () => {
    if (!onContactUpdate) return
    setSavingContact(true)
    try {
      await onContactUpdate('telegramUsername', tempTelegram.replace(/^@/, ''))
      setEditingTelegram(false)
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      console.error('Failed to save telegram:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 2000,
      })
    } finally {
      setSavingContact(false)
    }
  }, [onContactUpdate, tempTelegram, toast, t])

  // Save whatsapp phone
  const handleSaveWhatsApp = useCallback(async () => {
    if (!onContactUpdate) return
    setSavingContact(true)
    try {
      await onContactUpdate('whatsappPhone', tempWhatsApp)
      setEditingWhatsApp(false)
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      console.error('Failed to save whatsapp:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 2000,
      })
    } finally {
      setSavingContact(false)
    }
  }, [onContactUpdate, tempWhatsApp, toast, t])

  // Save viber phone
  const handleSaveViber = useCallback(async () => {
    if (!onContactUpdate) return
    setSavingContact(true)
    try {
      await onContactUpdate('viberPhone', tempViber)
      setEditingViber(false)
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      console.error('Failed to save viber:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 2000,
      })
    } finally {
      setSavingContact(false)
    }
  }, [onContactUpdate, tempViber, toast, t])

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
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

  // Handle send via Telegram
  const handleSendTelegram = useCallback(async () => {
    if (!generatedMessage) return
    
    if (!telegramUsername) {
      toast({
        title: t('patientCard.marketing.noTelegram'),
        status: 'warning',
        duration: 3000,
      })
      return
    }

    // Copy text first
    await copyToClipboard(generatedMessage.content)
    
    // Clean username and open
    const cleanUsername = telegramUsername.replace(/^@/, '')
    const telegramUrl = `https://t.me/${cleanUsername}`
    
    const tg = window.Telegram?.WebApp
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(telegramUrl)
    } else if (tg?.openLink) {
      tg.openLink(telegramUrl)
    } else {
      window.open(telegramUrl, '_blank')
    }

    toast({
      title: t('patientCard.marketing.textCopied'),
      description: t('patientCard.marketing.telegramOpening'),
      status: 'success',
      duration: 3000,
    })
  }, [generatedMessage, telegramUsername, copyToClipboard, toast, t])

  // Handle send via WhatsApp
  const handleSendWhatsApp = useCallback(() => {
    if (!generatedMessage) return
    
    const phoneNumber = whatsappPhone || phone
    if (!phoneNumber) {
      toast({
        title: t('patientCard.marketing.noWhatsApp'),
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '')
    const encodedText = encodeURIComponent(generatedMessage.content)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`
    
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) {
      tg.openLink(whatsappUrl)
    } else {
      window.open(whatsappUrl, '_blank')
    }

    toast({
      title: t('patientCard.marketing.whatsappOpening'),
      status: 'success',
      duration: 2000,
    })
  }, [generatedMessage, whatsappPhone, phone, toast, t])

  // Handle send via Viber
  const handleSendViber = useCallback(() => {
    if (!generatedMessage) return
    
    const phoneNumber = viberPhone || phone
    if (!phoneNumber) {
      toast({
        title: 'Viber not configured',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '').replace(/^\+/, '')
    const encodedText = encodeURIComponent(generatedMessage.content)
    const viberUrl = `viber://chat?number=${cleanPhone}&text=${encodedText}`
    
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) {
      tg.openLink(viberUrl)
    } else {
      window.open(viberUrl, '_blank')
    }

    toast({
      title: 'Viber opening...',
      status: 'success',
      duration: 2000,
    })
  }, [generatedMessage, viberPhone, phone, toast])

  const generateMessage = (type: MessageType) => {
    setIsGenerating(true)
    setSelectedType(type)

    // Simulate AI generation delay
    setTimeout(() => {
      const messages: Record<MessageType, { title: string; content: string }> = {
        birthday: {
          title: t('patientCard.marketing.birthdayTitle'),
          content: `${t('patientCard.marketing.dearPatient')} ${patientName}!\n\n${t('patientCard.marketing.birthdayMessage')}\n\n${t('patientCard.marketing.clinicSignature')}`,
        },
        reminder: {
          title: t('patientCard.marketing.reminderTitle'),
          content: `${t('patientCard.marketing.dearPatient')} ${patientName}!\n\n${t('patientCard.marketing.reminderMessage')}\n\n${t('patientCard.marketing.clinicSignature')}`,
        },
        discount: {
          title: t('patientCard.marketing.discountTitle'),
          content: `${t('patientCard.marketing.dearPatient')} ${patientName}!\n\n${t('patientCard.marketing.discountMessage')}\n\n${t('patientCard.marketing.clinicSignature')}`,
        },
        recommendation: {
          title: t('patientCard.marketing.recommendationTitle'),
          content: `${t('patientCard.marketing.dearPatient')} ${patientName}!\n\n${t('patientCard.marketing.recommendationMessage')}\n\n${t('patientCard.marketing.clinicSignature')}`,
        },
      }

      const msg = messages[type]
      setGeneratedMessage({
        type,
        title: msg.title,
        content: msg.content,
        isEditing: false,
      })
      setEditText(msg.content)
      setIsGenerating(false)
    }, 1200)
  }

  const handleRegenerate = () => {
    if (selectedType) {
      generateMessage(selectedType)
    }
  }

  const handleStartEdit = () => {
    if (generatedMessage) {
      setEditText(generatedMessage.content)
      setGeneratedMessage({ ...generatedMessage, isEditing: true })
    }
  }

  const handleSaveEdit = () => {
    if (generatedMessage) {
      setGeneratedMessage({
        ...generatedMessage,
        content: editText,
        isEditing: false,
      })
    }
  }

  const handleCancelEdit = () => {
    if (generatedMessage) {
      setEditText(generatedMessage.content)
      setGeneratedMessage({ ...generatedMessage, isEditing: false })
    }
  }

  const handleCopy = async () => {
    if (generatedMessage) {
      try {
        await navigator.clipboard.writeText(generatedMessage.content)
        setCopied(true)
        toast({
          title: t('common.copied'),
          status: 'success',
          duration: 2000,
        })
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  return (
    <CollapsibleSection
      title={t('patientCard.marketing.title')}
      defaultOpen={defaultOpen}
    >
      <VStack spacing={4} align="stretch">
        {/* Helper text */}
        <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
          {t('patientCard.marketing.hint')}
        </Text>

        {/* Contact Info Block */}
        <Box
          borderRadius="xl"
          p={4}
          border="1px solid"
          bg={isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.6)'}
          borderColor={isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(226, 232, 240, 0.6)'}
        >
          <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'} mb={3}>
            {t('patientCard.marketing.contacts') || 'Контакты для связи'}
          </Text>
          <VStack spacing={3} align="stretch">
            {/* Telegram */}
            <Flex align="center" gap={2}>
              <Flex
                w={6}
                h={6}
                borderRadius="md"
                align="center"
                justify="center"
                bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50'}
                color={isDark ? 'blue.400' : 'blue.500'}
                flexShrink={0}
              >
                <TelegramIcon />
              </Flex>
              {editingTelegram ? (
                <HStack flex={1} spacing={2}>
                  <input
                    type="text"
                    value={tempTelegram}
                    onChange={(e) => setTempTelegram(e.target.value)}
                    placeholder="@username"
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      background: isDark ? '#1e293b' : '#fff',
                      color: isDark ? '#fff' : '#1e293b',
                    }}
                  />
                  <Button size="xs" colorScheme="blue" onClick={handleSaveTelegram} isLoading={savingContact}>
                    {t('common.save')}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setEditingTelegram(false)}>
                    ✕
                  </Button>
                </HStack>
              ) : (
                <Flex flex={1} align="center" justify="space-between">
                  <Text fontSize="sm" color={telegramUsername ? (isDark ? 'white' : 'gray.700') : (isDark ? 'gray.500' : 'gray.400')}>
                    {telegramUsername ? `@${telegramUsername.replace(/^@/, '')}` : t('patientCard.marketing.notSet') || 'Не указан'}
                  </Text>
                  {onContactUpdate && (
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Pencil size={12} />}
                      onClick={() => {
                        setTempTelegram(telegramUsername || '')
                        setEditingTelegram(true)
                      }}
                      color={isDark ? 'blue.400' : 'blue.600'}
                    >
                      {telegramUsername ? t('common.edit') : t('common.add') || 'Добавить'}
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            {/* WhatsApp */}
            <Flex align="center" gap={2}>
              <Flex
                w={6}
                h={6}
                borderRadius="md"
                align="center"
                justify="center"
                bg={isDark ? 'rgba(34, 197, 94, 0.2)' : 'green.50'}
                color={isDark ? 'green.400' : 'green.500'}
                flexShrink={0}
              >
                <WhatsAppIcon />
              </Flex>
              {editingWhatsApp ? (
                <HStack flex={1} spacing={2}>
                  <input
                    type="text"
                    value={tempWhatsApp}
                    onChange={(e) => setTempWhatsApp(e.target.value)}
                    placeholder="+374..."
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      background: isDark ? '#1e293b' : '#fff',
                      color: isDark ? '#fff' : '#1e293b',
                    }}
                  />
                  <Button size="xs" colorScheme="green" onClick={handleSaveWhatsApp} isLoading={savingContact}>
                    {t('common.save')}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setEditingWhatsApp(false)}>
                    ✕
                  </Button>
                </HStack>
              ) : (
                <Flex flex={1} align="center" justify="space-between">
                  <Text fontSize="sm" color={whatsappPhone ? (isDark ? 'white' : 'gray.700') : (isDark ? 'gray.500' : 'gray.400')}>
                    {whatsappPhone || phone || t('patientCard.marketing.notSet') || 'Не указан'}
                  </Text>
                  {onContactUpdate && (
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Pencil size={12} />}
                      onClick={() => {
                        setTempWhatsApp(whatsappPhone || phone || '')
                        setEditingWhatsApp(true)
                      }}
                      color={isDark ? 'green.400' : 'green.600'}
                    >
                      {whatsappPhone ? t('common.edit') : t('common.add') || 'Добавить'}
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>

            {/* Viber */}
            <Flex align="center" gap={2}>
              <Flex
                w={6}
                h={6}
                borderRadius="md"
                align="center"
                justify="center"
                bg={isDark ? 'rgba(124, 58, 237, 0.2)' : 'purple.50'}
                color={isDark ? 'purple.400' : 'purple.500'}
                flexShrink={0}
              >
                <ViberIcon />
              </Flex>
              {editingViber ? (
                <HStack flex={1} spacing={2}>
                  <input
                    type="text"
                    value={tempViber}
                    onChange={(e) => setTempViber(e.target.value)}
                    placeholder="+374..."
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      fontSize: '14px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                      background: isDark ? '#1e293b' : '#fff',
                      color: isDark ? '#fff' : '#1e293b',
                    }}
                  />
                  <Button size="xs" colorScheme="purple" onClick={handleSaveViber} isLoading={savingContact}>
                    {t('common.save')}
                  </Button>
                  <Button size="xs" variant="ghost" onClick={() => setEditingViber(false)}>
                    ✕
                  </Button>
                </HStack>
              ) : (
                <Flex flex={1} align="center" justify="space-between">
                  <Text fontSize="sm" color={viberPhone ? (isDark ? 'white' : 'gray.700') : (isDark ? 'gray.500' : 'gray.400')}>
                    {viberPhone || phone || t('patientCard.marketing.notSet') || 'Не указан'}
                  </Text>
                  {onContactUpdate && (
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Pencil size={12} />}
                      onClick={() => {
                        setTempViber(viberPhone || phone || '')
                        setEditingViber(true)
                      }}
                      color={isDark ? 'purple.400' : 'purple.600'}
                    >
                      {viberPhone ? t('common.edit') : t('common.add') || 'Добавить'}
                    </Button>
                  )}
                </Flex>
              )}
            </Flex>
          </VStack>
        </Box>

        {/* AI Assistant Block */}
        <Box
          borderRadius="xl"
          p={4}
          border="1px solid"
          transition="colors 0.2s"
          bg={isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.8)'}
          borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
        >
          {/* AI Header */}
          <Flex align="center" gap={2} mb={3}>
            <Flex
              w={7}
              h={7}
              borderRadius="lg"
              align="center"
              justify="center"
              bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.100'}
            >
              <Box as={Sparkles} w={4} h={4} color={isDark ? 'blue.400' : 'blue.600'} />
            </Flex>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color={isDark ? 'white' : 'gray.800'}>
                {t('patientCard.marketing.aiAssistant')}
              </Text>
              <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                {t('patientCard.marketing.aiHint')}
              </Text>
            </Box>
          </Flex>

          {/* Message Type Buttons */}
          <Flex flexWrap="wrap" gap={2}>
            {messageTypes.map(({ id, labelKey, emoji }) => {
              const isSelected = selectedType === id
              const isActive = isGenerating && isSelected

              return (
                <Button
                  key={id}
                  onClick={() => generateMessage(id)}
                  isDisabled={isGenerating}
                  size="sm"
                  fontWeight="medium"
                  leftIcon={<Text fontSize="md">{emoji}</Text>}
                  rightIcon={isActive ? <Box as={RefreshCw} w={3.5} h={3.5} animation="spin 1s linear infinite" /> : undefined}
                  bg={
                    isSelected
                      ? isDark
                        ? 'rgba(59, 130, 246, 0.3)'
                        : 'blue.100'
                      : isDark
                      ? 'rgba(51, 65, 85, 0.5)'
                      : 'white'
                  }
                  color={
                    isSelected
                      ? isDark
                        ? 'blue.300'
                        : 'blue.700'
                      : isDark
                      ? 'gray.300'
                      : 'gray.600'
                  }
                  border="1px solid"
                  borderColor={
                    isSelected
                      ? isDark
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'blue.200'
                      : isDark
                      ? 'rgba(71, 85, 105, 0.5)'
                      : 'gray.200'
                  }
                  _hover={{
                    bg: isSelected
                      ? isDark
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'blue.200'
                      : isDark
                      ? 'rgba(51, 65, 85, 0.7)'
                      : 'gray.100',
                  }}
                  opacity={isActive ? 0.7 : 1}
                >
                  {t(labelKey)}
                </Button>
              )
            })}
          </Flex>
        </Box>

        {/* Generated Message Preview Card */}
        {generatedMessage && !isGenerating && (
          <Box
            borderRadius="xl"
            border="1px solid"
            overflow="hidden"
            transition="colors 0.2s"
            bg={isDark ? 'rgba(30, 41, 59, 0.3)' : 'white'}
            borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
          >
            {/* Message Header */}
            <Box
              px={4}
              py={3}
              borderBottom="1px solid"
              borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100'}
            >
              <Text fontSize="sm" fontWeight="medium" color={isDark ? 'white' : 'gray.800'}>
                {generatedMessage.title}
              </Text>
            </Box>

            {/* Message Content */}
            <Box p={4}>
              {generatedMessage.isEditing ? (
                <VStack spacing={3} align="stretch">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={8}
                    resize="none"
                    fontSize="sm"
                    borderRadius="lg"
                    bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}
                    color={isDark ? 'white' : 'gray.800'}
                    border="1px solid"
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                    _focus={{ borderColor: 'blue.500' }}
                  />
                  <HStack justify="flex-end" spacing={2}>
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="xs"
                      fontWeight="medium"
                      color={isDark ? 'gray.400' : 'gray.500'}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      size="xs"
                      fontWeight="medium"
                      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50'}
                      color={isDark ? 'blue.400' : 'blue.600'}
                      _hover={{ bg: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.100' }}
                    >
                      {t('common.save')}
                    </Button>
                  </HStack>
                </VStack>
              ) : (
                <Text
                  fontSize="sm"
                  whiteSpace="pre-line"
                  lineHeight="relaxed"
                  color={isDark ? 'gray.300' : 'gray.600'}
                >
                  {generatedMessage.content}
                </Text>
              )}
            </Box>

            {/* Message Actions */}
            {!generatedMessage.isEditing && (
              <VStack
                px={4}
                py={3}
                borderTop="1px solid"
                borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100'}
                spacing={2}
                align="stretch"
              >
                {/* Send buttons row */}
                <HStack spacing={2} justify="center">
                  <Button
                    onClick={handleSendTelegram}
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<TelegramIcon />}
                    fontWeight="medium"
                  >
                    Telegram
                  </Button>
                  <Button
                    onClick={handleSendWhatsApp}
                    size="sm"
                    colorScheme="green"
                    leftIcon={<WhatsAppIcon />}
                    fontWeight="medium"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    onClick={handleSendViber}
                    size="sm"
                    colorScheme="purple"
                    leftIcon={<ViberIcon />}
                    fontWeight="medium"
                  >
                    Viber
                  </Button>
                </HStack>

                {/* Edit/Regenerate/Copy row */}
                <Flex flexWrap="wrap" gap={2} justify="center">
                  <Button
                    onClick={handleRegenerate}
                    variant="ghost"
                    size="xs"
                    fontWeight="medium"
                    leftIcon={<Box as={RefreshCw} w={3.5} h={3.5} />}
                    color={isDark ? 'gray.400' : 'gray.500'}
                    _hover={{
                      color: isDark ? 'gray.300' : 'gray.700',
                      bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.100',
                    }}
                  >
                    {t('patientCard.marketing.regenerate')}
                  </Button>
                  <Button
                    onClick={handleStartEdit}
                    variant="ghost"
                    size="xs"
                    fontWeight="medium"
                    leftIcon={<Box as={Pencil} w={3.5} h={3.5} />}
                    color={isDark ? 'gray.400' : 'gray.500'}
                    _hover={{
                      color: isDark ? 'gray.300' : 'gray.700',
                      bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.100',
                    }}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="ghost"
                    size="xs"
                    fontWeight="medium"
                    leftIcon={<Box as={copied ? Check : Copy} w={3.5} h={3.5} />}
                    color={
                      copied
                        ? isDark
                          ? 'green.400'
                          : 'green.600'
                        : isDark
                        ? 'gray.400'
                        : 'gray.500'
                    }
                    bg={copied ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'green.50') : 'transparent'}
                    _hover={{
                      color: isDark ? 'gray.300' : 'gray.700',
                      bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.100',
                    }}
                  >
                    {copied ? t('patientCard.marketing.copied') : t('patientCard.marketing.copy')}
                  </Button>
                </Flex>
              </VStack>
            )}
          </Box>
        )}

        {/* Delivery Info Hint */}
        <Flex
          align="center"
          gap={2}
          px={3}
          py={2.5}
          borderRadius="lg"
          bg={isDark ? 'rgba(30, 41, 59, 0.3)' : 'rgba(248, 250, 252, 0.5)'}
        >
          <Box
            as={MessageCircle}
            w={4}
            h={4}
            flexShrink={0}
            color={isDark ? 'gray.600' : 'gray.300'}
          />
          <Text fontSize="xs" color={isDark ? 'gray.600' : 'gray.400'}>
            {t('patientCard.marketing.deliveryHint')}
          </Text>
        </Flex>
      </VStack>
    </CollapsibleSection>
  )
}

export default MarketingSection

