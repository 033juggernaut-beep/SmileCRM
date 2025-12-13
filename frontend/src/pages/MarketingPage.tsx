import {
  Box,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Select,
  Stack,
  Text,
  Badge,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { AIPreviewModal } from '../components/AIPreviewModal'
import { useLanguage } from '../context/LanguageContext'
import { patientsApi, type Patient } from '../api/patients'
import { marketingApi, marketingTemplates, type PatientBirthday, type AIMessageType } from '../api/marketing'
import type { Language } from '../i18n'

export const MarketingPage = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const toast = useToast()

  // State
  const [patients, setPatients] = useState<Patient[]>([])
  const [birthdays, setBirthdays] = useState<PatientBirthday[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(true)
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(true)
  
  // Recall reminder state
  const [selectedRecallPatientId, setSelectedRecallPatientId] = useState<string>('')
  const [generatedRecall, setGeneratedRecall] = useState<string>('')
  
  // Discount state
  const [selectedDiscountPatientId, setSelectedDiscountPatientId] = useState<string>('')
  const [discountPercent, setDiscountPercent] = useState<number>(10)
  const [generatedDiscount, setGeneratedDiscount] = useState<string>('')
  
  // Birthday greeting state
  const [generatedBirthdayGreetings, setGeneratedBirthdayGreetings] = useState<Record<string, string>>({})

  // AI Modal state
  const aiModal = useDisclosure()
  const [aiMessageType, setAiMessageType] = useState<AIMessageType>('birthday')
  const [aiPatientId, setAiPatientId] = useState<string>('')
  const [aiPatientName, setAiPatientName] = useState<string>('')

  // Load patients and birthdays
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingPatients(true)
        const patientsData = await patientsApi.list()
        setPatients(patientsData)
        if (patientsData.length > 0) {
          setSelectedRecallPatientId(patientsData[0].id)
          setSelectedDiscountPatientId(patientsData[0].id)
        }
      } catch (err) {
        console.error('Failed to load patients:', err)
      } finally {
        setIsLoadingPatients(false)
      }
    }

    const loadBirthdays = async () => {
      try {
        setIsLoadingBirthdays(true)
        const birthdaysData = await marketingApi.getUpcomingBirthdays('month')
        setBirthdays(birthdaysData)
      } catch (err) {
        console.error('Failed to load birthdays:', err)
        // If endpoint doesn't exist yet, try to filter patients client-side
        setBirthdays([])
      } finally {
        setIsLoadingBirthdays(false)
      }
    }

    loadData()
    loadBirthdays()
  }, [])

  // Get patient name by ID
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : ''
  }

  // Generate recall reminder
  const handleGenerateRecall = useCallback(() => {
    if (!selectedRecallPatientId) return
    const patientName = getPatientName(selectedRecallPatientId)
    const text = marketingTemplates.recallReminder(patientName, language as Language)
    setGeneratedRecall(text)
  }, [selectedRecallPatientId, patients, language])

  // Generate discount
  const handleGenerateDiscount = useCallback(() => {
    if (!selectedDiscountPatientId) return
    const patientName = getPatientName(selectedDiscountPatientId)
    const text = marketingTemplates.discountOffer(patientName, discountPercent, language as Language)
    setGeneratedDiscount(text)
  }, [selectedDiscountPatientId, discountPercent, patients, language])

  // Generate birthday greeting
  const handleGenerateBirthdayGreeting = useCallback((patientId: string, patientName: string) => {
    const text = marketingTemplates.birthdayGreeting(patientName, language as Language)
    setGeneratedBirthdayGreetings(prev => ({ ...prev, [patientId]: text }))
  }, [language])

  // Open AI modal for a specific patient and message type
  const openAIModal = useCallback((type: AIMessageType, patientId: string, patientName: string) => {
    setAiMessageType(type)
    setAiPatientId(patientId)
    setAiPatientName(patientName)
    aiModal.onOpen()
  }, [aiModal])

  // Copy to clipboard and log event
  const handleCopyToClipboard = useCallback(async (
    text: string, 
    patientId: string, 
    type: 'birthday_greeting' | 'promo_offer' | 'recall_reminder'
  ) => {
    try {
      await navigator.clipboard.writeText(text)
      
      // Log marketing event
      marketingApi.createEvent({
        patientId,
        type,
        channel: 'copy',
        payload: { text, discountPercent: type === 'promo_offer' ? discountPercent : undefined },
      }).catch(console.error)
      
      toast({
        title: t('marketing.copySuccess'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [discountPercent, t, toast])

  return (
    <PremiumLayout
      title={t('marketing.title')}
      showBack={true}
      onBack={() => navigate('/home')}
      background="gradient"
      safeAreaBottom
    >
      <Stack spacing={5}>
        {/* Header */}
        <Box textAlign="center" py={2}>
          <Text fontSize="3xl" mb={2}>📣</Text>
          <Heading size="lg" color="text.primary">
            {t('marketing.title')}
          </Heading>
          <Text fontSize="md" color="text.secondary" mt={2}>
            {t('marketing.subtitle')}
          </Text>
        </Box>

        {/* Card 1: Visit Recall Reminder */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.primary">
              {t('marketing.cards.recall.title')}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t('marketing.cards.recall.desc')}
            </Text>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="text.primary" fontSize="sm">
                {t('marketing.cards.recall.selectPatient')}
              </FormLabel>
              <Select
                value={selectedRecallPatientId}
                onChange={(e) => setSelectedRecallPatientId(e.target.value)}
                isDisabled={isLoadingPatients}
                size="lg"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <HStack spacing={2}>
              <PremiumButton 
                onClick={handleGenerateRecall} 
                isDisabled={!selectedRecallPatientId}
                size="md"
                flex={1}
              >
                {t('marketing.cards.recall.generate')}
              </PremiumButton>
              <PremiumButton 
                onClick={() => {
                  const patient = patients.find(p => p.id === selectedRecallPatientId)
                  if (patient) {
                    openAIModal('recall', patient.id, `${patient.firstName} ${patient.lastName}`)
                  }
                }}
                isDisabled={!selectedRecallPatientId}
                size="md"
                variant="secondary"
                flex={1}
              >
                {t('marketing.ai.generate')}
              </PremiumButton>
            </HStack>
            
            {generatedRecall && (
              <Box 
                p={4} 
                bg="orange.50" 
                borderRadius="md" 
                borderWidth="1px"
                borderColor="orange.200"
              >
                <Text whiteSpace="pre-wrap" fontSize="sm" color="orange.900">
                  {generatedRecall}
                </Text>
                <PremiumButton 
                  size="sm" 
                  mt={3}
                  onClick={() => handleCopyToClipboard(generatedRecall, selectedRecallPatientId, 'recall_reminder')}
                >
                  {t('marketing.cards.recall.copy')}
                </PremiumButton>
              </Box>
            )}
          </Stack>
        </PremiumCard>

        {/* Card 2: Birthday Greetings */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.primary">
              {t('marketing.cards.birthday.title')}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t('marketing.cards.birthday.desc')}
            </Text>
            
            {isLoadingBirthdays ? (
              <Text color="text.muted">{t('common.loading')}</Text>
            ) : birthdays.length > 0 ? (
              <Stack spacing={3}>
                {birthdays.map((birthday) => (
                  <Box 
                    key={birthday.id}
                    p={4}
                    bg="purple.50"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="purple.200"
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="semibold" color="purple.900">
                        🎂 {birthday.firstName} {birthday.lastName}
                      </Text>
                      <Badge colorScheme="purple">
                        {birthday.daysUntilBirthday === 0 
                          ? t('marketing.cards.birthday.todayTitle')
                          : `${birthday.daysUntilBirthday} ${t('marketing.cards.birthday.daysUntil')}`
                        }
                      </Badge>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <PremiumButton 
                        size="sm"
                        onClick={() => handleGenerateBirthdayGreeting(
                          birthday.id, 
                          `${birthday.firstName} ${birthday.lastName}`
                        )}
                      >
                        {t('marketing.cards.recall.generate')}
                      </PremiumButton>
                      <PremiumButton 
                        size="sm"
                        variant="secondary"
                        onClick={() => openAIModal(
                          'birthday', 
                          birthday.id, 
                          `${birthday.firstName} ${birthday.lastName}`
                        )}
                      >
                        {t('marketing.ai.generate')}
                      </PremiumButton>
                    </HStack>
                    
                    {generatedBirthdayGreetings[birthday.id] && (
                      <Box mt={3} p={3} bg="white" borderRadius="md">
                        <Text whiteSpace="pre-wrap" fontSize="sm" color="purple.900">
                          {generatedBirthdayGreetings[birthday.id]}
                        </Text>
                        <PremiumButton 
                          size="sm" 
                          mt={2}
                          onClick={() => handleCopyToClipboard(
                            generatedBirthdayGreetings[birthday.id], 
                            birthday.id, 
                            'birthday_greeting'
                          )}
                        >
                          {t('marketing.cards.recall.copy')}
                        </PremiumButton>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={4}>
                <Text fontSize="2xl" mb={2}>📅</Text>
                <Text color="text.muted" fontSize="sm">
                  {t('marketing.cards.birthday.noBirthdays')}
                </Text>
              </Box>
            )}
          </Stack>
        </PremiumCard>

        {/* Card 3: Personal Discount */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.primary">
              {t('marketing.cards.discount.title')}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t('marketing.cards.discount.desc')}
            </Text>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="text.primary" fontSize="sm">
                {t('marketing.cards.recall.selectPatient')}
              </FormLabel>
              <Select
                value={selectedDiscountPatientId}
                onChange={(e) => setSelectedDiscountPatientId(e.target.value)}
                isDisabled={isLoadingPatients}
                size="lg"
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="semibold" color="text.primary" fontSize="sm">
                {t('marketing.cards.discount.percentLabel')}
              </FormLabel>
              <HStack spacing={2}>
                {[5, 10, 15, 20].map((percent) => (
                  <PremiumButton
                    key={percent}
                    size="sm"
                    variant={discountPercent === percent ? 'primary' : 'secondary'}
                    onClick={() => setDiscountPercent(percent)}
                  >
                    {percent}%
                  </PremiumButton>
                ))}
              </HStack>
            </FormControl>
            
            <HStack spacing={2}>
              <PremiumButton 
                onClick={handleGenerateDiscount} 
                isDisabled={!selectedDiscountPatientId}
                size="md"
                flex={1}
              >
                {t('marketing.cards.discount.generate')}
              </PremiumButton>
              <PremiumButton 
                onClick={() => {
                  const patient = patients.find(p => p.id === selectedDiscountPatientId)
                  if (patient) {
                    openAIModal('discount', patient.id, `${patient.firstName} ${patient.lastName}`)
                  }
                }}
                isDisabled={!selectedDiscountPatientId}
                size="md"
                variant="secondary"
                flex={1}
              >
                {t('marketing.ai.generate')}
              </PremiumButton>
            </HStack>
            
            {generatedDiscount && (
              <Box 
                p={4} 
                bg="green.50" 
                borderRadius="md" 
                borderWidth="1px"
                borderColor="green.200"
              >
                <Text whiteSpace="pre-wrap" fontSize="sm" color="green.900">
                  {generatedDiscount}
                </Text>
                <PremiumButton 
                  size="sm" 
                  mt={3}
                  onClick={() => handleCopyToClipboard(generatedDiscount, selectedDiscountPatientId, 'promo_offer')}
                >
                  {t('marketing.cards.discount.copy')}
                </PremiumButton>
              </Box>
            )}
          </Stack>
        </PremiumCard>
      </Stack>

      {/* AI Preview Modal */}
      <AIPreviewModal
        isOpen={aiModal.isOpen}
        onClose={aiModal.onClose}
        patientId={aiPatientId}
        patientName={aiPatientName}
        messageType={aiMessageType}
        discountPercent={discountPercent}
      />
    </PremiumLayout>
  )
}
