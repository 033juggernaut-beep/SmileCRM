/**
 * AI Preview Modal - Allows doctor to preview, edit, and copy AI-generated marketing messages
 */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  HStack,
  Text,
  Badge,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { PremiumButton } from './premium/PremiumButton'
import { useLanguage } from '../context/LanguageContext'
import { marketingApi, type AIMessageType, type AILanguage } from '../api/marketing'

type AIPreviewModalProps = {
  isOpen: boolean
  onClose: () => void
  patientId: string
  patientName: string
  messageType: AIMessageType
  discountPercent?: number
  onCopied?: (text: string) => void
}

const SMS_LIMIT = 160

export const AIPreviewModal = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  messageType,
  discountPercent = 10,
  onCopied,
}: AIPreviewModalProps) => {
  const { t, language: appLanguage } = useLanguage()
  const toast = useToast()

  // State
  const [selectedLanguage, setSelectedLanguage] = useState<AILanguage>(appLanguage as AILanguage)
  const [generatedText, setGeneratedText] = useState('')
  const [editedText, setEditedText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [segment, setSegment] = useState<string>('regular')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGeneratedText('')
      setEditedText('')
      setIsEditing(false)
      setSelectedLanguage(appLanguage as AILanguage)
    }
  }, [isOpen, appLanguage])

  // Generate AI text
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    try {
      const response = await marketingApi.generateAIText({
        type: messageType,
        language: selectedLanguage,
        patientId,
        discountPercent: messageType === 'discount' ? discountPercent : undefined,
      })
      setGeneratedText(response.text)
      setEditedText(response.text)
      setSegment(response.segment)
    } catch (err) {
      console.error('AI generation failed:', err)
      toast({
        title: t('marketing.ai.error'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [messageType, selectedLanguage, patientId, discountPercent, t, toast])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    const textToCopy = isEditing ? editedText : generatedText
    try {
      await navigator.clipboard.writeText(textToCopy)
      
      // Log the copy event
      marketingApi.createEvent({
        patientId,
        type: `${messageType}_greeting` as any,
        channel: 'copy',
        payload: {
          text: textToCopy,
          language: selectedLanguage,
          segment,
          aiGenerated: true,
        },
      }).catch(console.error)
      
      toast({
        title: t('marketing.copySuccess'),
        status: 'success',
        duration: 2000,
      })
      
      onCopied?.(textToCopy)
      onClose()
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [generatedText, editedText, isEditing, patientId, messageType, selectedLanguage, segment, t, toast, onCopied, onClose])

  const currentText = isEditing ? editedText : generatedText
  const charCount = currentText.length
  const isSmsOk = charCount <= SMS_LIMIT

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent mx={4} borderRadius="xl">
        <ModalHeader>
          {t('marketing.ai.preview')}
          <Text fontSize="sm" fontWeight="normal" color="text.muted" mt={1}>
            {patientName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <Stack spacing={4}>
            {/* Language selector */}
            <FormControl>
              <FormLabel fontWeight="semibold" fontSize="sm">
                {t('marketing.ai.language')}
              </FormLabel>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as AILanguage)}
                size="md"
              >
                <option value="am">{t('marketing.ai.languageAm')}</option>
                <option value="ru">{t('marketing.ai.languageRu')}</option>
                <option value="en">{t('marketing.ai.languageEn')}</option>
              </Select>
            </FormControl>

            {/* Generate button (shown before generation) */}
            {!generatedText && (
              <PremiumButton
                onClick={handleGenerate}
                isLoading={isGenerating}
                loadingText={t('marketing.ai.generating')}
                w="full"
              >
                {t('marketing.ai.generate')}
              </PremiumButton>
            )}

            {/* Generated text preview */}
            {generatedText && (
              <>
                {/* Segment badge */}
                {segment === 'vip' && (
                  <Badge colorScheme="orange" alignSelf="flex-start">
                    🔥 VIP
                  </Badge>
                )}
                
                <FormControl>
                  <Textarea
                    value={isEditing ? editedText : generatedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    isReadOnly={!isEditing}
                    rows={6}
                    resize="vertical"
                    bg={isEditing ? 'white' : 'gray.50'}
                    fontSize="sm"
                  />
                </FormControl>

                {/* SMS length indicator */}
                <HStack justify="space-between">
                  <Badge colorScheme={isSmsOk ? 'green' : 'orange'}>
                    {isSmsOk ? t('marketing.ai.smsOk') : t('marketing.ai.smsLong')}
                  </Badge>
                  <Text fontSize="xs" color="text.muted">
                    {charCount} {t('marketing.ai.smsLength')}
                  </Text>
                </HStack>

                {/* Segment hint */}
                <Text fontSize="xs" color="text.muted">
                  ℹ️ {t('marketing.ai.segmentHint')}
                </Text>
              </>
            )}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={2} w="full">
            <PremiumButton
              variant="secondary"
              onClick={onClose}
              flex={1}
            >
              {t('marketing.ai.cancel')}
            </PremiumButton>
            
            {generatedText && (
              <>
                <PremiumButton
                  variant="secondary"
                  onClick={() => setIsEditing(!isEditing)}
                  flex={1}
                >
                  {t('marketing.ai.edit')}
                </PremiumButton>
                
                <PremiumButton
                  onClick={handleCopy}
                  flex={1}
                >
                  {t('marketing.ai.copy')}
                </PremiumButton>
              </>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
