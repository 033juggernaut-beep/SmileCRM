/**
 * Marketing & Communication section - AI powered
 * - AI assistant block for message generation
 * - Four message types: birthday, visit reminder, discount, post-treatment
 * - Editable message preview with regenerate/copy actions
 */

import { useState } from 'react'
import { Box, Flex, Text, Button, Textarea, VStack, HStack, useColorMode, useToast } from '@chakra-ui/react'
import { Sparkles, RefreshCw, Copy, Check, Pencil, MessageCircle } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dateOfBirth?: string // Reserved for future birthday detection
  defaultOpen?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars

const messageTypes: MessageConfig[] = [
  { id: 'birthday', labelKey: 'patientCard.marketing.birthday', emoji: '🎉' },
  { id: 'reminder', labelKey: 'patientCard.marketing.reminder', emoji: '🦷' },
  { id: 'discount', labelKey: 'patientCard.marketing.discount', emoji: '💸' },
  { id: 'recommendation', labelKey: 'patientCard.marketing.recommendation', emoji: '📋' },
]

export function MarketingSection({
  patientName,
  dateOfBirth: _dateOfBirth,
  defaultOpen = false,
}: MarketingSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [selectedType, setSelectedType] = useState<MessageType | null>(null)
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editText, setEditText] = useState('')
  const [copied, setCopied] = useState(false)

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
              <Flex
                px={4}
                py={3}
                borderTop="1px solid"
                borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100'}
                flexWrap="wrap"
                gap={2}
              >
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

