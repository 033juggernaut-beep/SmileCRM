/**
 * Patient Details Page - Matches Superdesign PatientCard reference
 * Uses new Chakra UI components that replicate the Superdesign export 1:1
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  Textarea,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'

import {
  type Patient,
  type Visit,
  patientsApi,
} from '../api/patients'
import {
  patientFinanceApi,
  type PatientFinanceSummary,
  type PatientPayment,
} from '../api/patientFinance'
import {
  medicationsApi,
  type Medication,
} from '../api/medications'
import { treatmentPlanApi } from '../api/treatmentPlan'
import { mediaApi, type MediaFile } from '../api/media'
import { apiClient } from '../api/client'
import { TOKEN_STORAGE_KEY } from '../constants/storage'

import { useLanguage } from '../context/LanguageContext'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'

// New patientCard components
import {
  BackButton,
  PatientInfoCard,
  DiagnosisSection,
  TreatmentPlanBlock,
  type TreatmentStep,
  VisitsSection,
  FilesSection,
  MedicationsSection,
  NotesSection,
  MarketingSection,
  FinanceSection,
  FloatingAIAssistant,
} from '../components/patientCard'
import { DateInput } from '../components/DateInput'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'

// Types for local finance structure
interface Payment {
  id: string
  date: string
  amount: number
  description?: string
}

interface PatientFinance {
  totalCost: number
  payments: Payment[]
  currency?: string
}


export const PatientDetailsPage = () => {
  const { t } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Telegram safe area for top padding
  const { topInset } = useTelegramSafeArea()

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate('/patients')
  }, [navigate])

  // Use Telegram's native BackButton when available
  const { showFallbackButton } = useTelegramBackButton(handleBack)

  // Core state
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Finance state
  const [financeSummary, setFinanceSummary] = useState<PatientFinanceSummary | null>(null)
  const [payments, setPayments] = useState<PatientPayment[]>([])

  // Medications state
  const [medications, setMedications] = useState<Medication[]>([])

  // Media files state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // New Visit modal state
  const newVisitModal = useDisclosure()
  const [newVisitDate, setNewVisitDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newVisitTime, setNewVisitTime] = useState('')
  const [newVisitNotes, setNewVisitNotes] = useState('')
  const [isCreatingVisit, setIsCreatingVisit] = useState(false)

  // Treatment plan state - loaded from API
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>([])

  // Page background
  const pageBg = isDark
    ? 'gray.900'
    : 'linear-gradient(135deg, #f8fafc 0%, rgba(239, 246, 255, 0.3) 50%, rgba(240, 249, 255, 0.5) 100%)'

  // Sorted visits (latest first)
  const sortedVisits = useMemo(
    () =>
      [...visits]
        .sort((a, b) => (b.visitDate ?? '').localeCompare(a.visitDate ?? ''))
        .map((v) => ({
          ...v,
          // Map to the format expected by VisitsSection
          date: v.visitDate,
          summary: v.notes,
          nextVisitDate: v.nextVisitDate,
        })),
    [visits]
  )

  // Finance data mapped to component format
  const financeData: PatientFinance | null = useMemo(() => {
    if (!financeSummary) return null
    return {
      totalCost: financeSummary.treatmentPlanTotal ?? 0,
      currency: financeSummary.treatmentPlanCurrency ?? 'AMD',
        payments: payments.map((p) => ({
          id: p.id,
          date: p.paidAt ? new Date(p.paidAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : '',
          amount: p.amount,
          description: p.comment ?? undefined,
        })),
    }
  }, [financeSummary, payments])

  // Load data
  useEffect(() => {
    if (!id) {
      setError(t('patientDetails.notFound'))
      setIsLoading(false)
      return
    }

    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [patientData, visitsData, financeData, paymentsData, medicationsData, treatmentData, mediaData] = await Promise.all([
          patientsApi.getById(id),
          patientsApi.getVisits(id),
          patientFinanceApi.getFinanceSummary(id),
          patientFinanceApi.listPayments(id),
          medicationsApi.list(id),
          treatmentPlanApi.list(id),
          mediaApi.getPatientMedia(id).catch(() => []),
        ])
        if (!cancelled) {
          setPatient(patientData)
          setVisits(visitsData)
          setFinanceSummary(financeData)
          setPayments(paymentsData)
          setMedications(medicationsData)
          setMediaFiles(mediaData)
          // Map treatment plan items to TreatmentStep format
          setTreatmentSteps(treatmentData.map((item) => ({
            id: item.id,
            title: item.title,
            priceAmd: item.priceAmd,
            done: item.isDone,
          })))
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('patientDetails.loadError')
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [id, t, refreshKey])

  // Handle diagnosis save
  const handleSaveDiagnosis = useCallback(
    async (diagnosis: string) => {
      if (!patient || !id) return

      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) throw new Error(t('patientDetails.authRequired'))

      await apiClient.patch(
        `/patients/${id}`,
        { diagnosis },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      setPatient({ ...patient, diagnosis })
    },
    [patient, id, t]
  )

  // Handle notes save
  const handleSaveNotes = useCallback(
    async (notes: string) => {
      if (!patient || !id) return

      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) throw new Error(t('patientDetails.authRequired'))

      await apiClient.patch(
        `/patients/${id}`,
        { notes },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      // Update local patient state with new notes
      setPatient({ ...patient, notes })
    },
    [patient, id, t]
  )

  // Handle open new visit modal
  const handleAddVisit = useCallback(() => {
    // Reset form fields
    setNewVisitDate(new Date().toISOString().split('T')[0])
    setNewVisitTime('')
    setNewVisitNotes('')
    newVisitModal.onOpen()
  }, [newVisitModal])

  // Handle create new visit
  const handleCreateVisit = useCallback(async () => {
    if (!id || !newVisitDate) return

    setIsCreatingVisit(true)
    try {
      const newVisit = await patientsApi.createVisit(id, {
        visitDate: newVisitDate,
        visitTime: newVisitTime || undefined,
        notes: newVisitNotes || undefined,
      })
      
      // Add new visit to the list
      setVisits((prev) => [newVisit, ...prev])
      
      // Close modal and show success
      newVisitModal.onClose()
      toast({
        title: t('patientCard.visitAdded') || 'Visit added',
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      console.error('Failed to create visit:', err)
      toast({
        title: t('common.error'),
        description: t('patientCard.visitAddError') || 'Failed to create visit',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsCreatingVisit(false)
    }
  }, [id, newVisitDate, newVisitTime, newVisitNotes, newVisitModal, toast, t])

  // Handle edit visit
  const handleEditVisit = useCallback(
    async (visit: Visit) => {
      try {
        const updated = await patientsApi.updateVisit(visit.id, {
          visitDate: visit.visitDate,
          notes: visit.notes,
          nextVisitDate: visit.nextVisitDate,
        })
        setVisits((prev) =>
          prev.map((v) => (v.id === visit.id ? updated : v))
        )
      } catch (err) {
        console.error('Failed to update visit:', err)
        throw err
      }
    },
    []
  )

  // Handle create medication
  const handleCreateMedication = useCallback(
    async (data: { name: string; dosage?: string; comment?: string }) => {
      if (!id) throw new Error('Patient ID is required')
      return await medicationsApi.create(id, data)
    },
    [id]
  )

  // Handle medication added - update local state
  const handleMedicationAdded = useCallback(
    (medication: Medication) => {
      setMedications((prev) => [medication, ...prev])
    },
    []
  )

  // Handle file upload
  const handleAddFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Handle file click - open in new tab/window
  const handleFileClick = useCallback((file: { url?: string; name: string }) => {
    if (file.url) {
      // Try to use Telegram's openLink if available, otherwise use window.open
      const tg = (window as { Telegram?: { WebApp?: { openLink?: (url: string) => void } } }).Telegram?.WebApp
      if (tg?.openLink) {
        tg.openLink(file.url)
      } else {
        window.open(file.url, '_blank')
      }
    }
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !id) return

    try {
      const uploaded = await mediaApi.uploadPatientMedia(id, file)
      setMediaFiles((prev) => [uploaded, ...prev])
      toast({
        title: t('common.saved'),
        description: file.name,
        status: 'success',
        duration: 3000,
      })
    } catch (err) {
      console.error('Failed to upload file:', err)
      toast({
        title: t('common.error'),
        description: 'Failed to upload file',
        status: 'error',
        duration: 3000,
      })
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [id, toast, t])

  // Handle finance update
  const handleUpdateFinance = useCallback(
    async (finance: PatientFinance) => {
      if (!id) return

      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) throw new Error(t('patientDetails.authRequired'))

      // Update treatment plan total
      await apiClient.patch(
        `/patients/${id}`,
        {
          treatment_plan_total: finance.totalCost,
          treatment_plan_currency: finance.currency || 'AMD',
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      // Refetch finance data
      const [newSummary, newPayments] = await Promise.all([
        patientFinanceApi.getFinanceSummary(id),
        patientFinanceApi.listPayments(id),
      ])
      setFinanceSummary(newSummary)
      setPayments(newPayments)
    },
    [id, t]
  )

  // Handle treatment steps change - called from TreatmentPlanBlock
  const handleTreatmentStepsChange = useCallback(
    async (newSteps: TreatmentStep[]) => {
      if (!id) return
      
      // Find what changed
      const oldIds = new Set(treatmentSteps.map((s) => s.id))
      const newIds = new Set(newSteps.map((s) => s.id))
      
      // Deleted items
      for (const oldStep of treatmentSteps) {
        if (!newIds.has(oldStep.id)) {
          try {
            await treatmentPlanApi.deleteItem(oldStep.id)
          } catch (err) {
            console.error('Failed to delete treatment item:', err)
          }
        }
      }
      
      // Added items (new items have temp IDs starting with 'step-')
      for (const newStep of newSteps) {
        if (!oldIds.has(newStep.id) && newStep.id.startsWith('step-')) {
          try {
            const created = await treatmentPlanApi.createItem(id, {
              title: newStep.title,
              priceAmd: newStep.priceAmd,
            })
            // Update the step with the real ID
            newStep.id = created.id
          } catch (err) {
            console.error('Failed to create treatment item:', err)
            toast({
              title: t('common.error'),
              description: t('treatmentPlan.addError') || 'Failed to add treatment step',
              status: 'error',
              duration: 3000,
            })
          }
        }
      }
      
      // Updated items (toggle done or other changes)
      for (const newStep of newSteps) {
        const oldStep = treatmentSteps.find((s) => s.id === newStep.id)
        if (oldStep && (oldStep.done !== newStep.done || oldStep.title !== newStep.title || oldStep.priceAmd !== newStep.priceAmd)) {
          try {
            await treatmentPlanApi.updateItem(newStep.id, {
              isDone: newStep.done,
              title: newStep.title,
              priceAmd: newStep.priceAmd,
            })
          } catch (err) {
            console.error('Failed to update treatment item:', err)
          }
        }
      }
      
      // Update local state
      setTreatmentSteps(newSteps)
      
      // Refetch finance summary to update totals
      try {
        const newSummary = await patientFinanceApi.getFinanceSummary(id)
        setFinanceSummary(newSummary)
      } catch (err) {
        console.error('Failed to refetch finance summary:', err)
      }
    },
    [id, treatmentSteps, toast, t]
  )

  // Loading state
  if (isLoading) {
    return (
      <Box
        minH="100dvh"
        w="full"
        position="relative"
        transition="colors 0.3s"
        bg={pageBg}
        overflowY="auto"
        overflowX="hidden"
        sx={{
          '@supports not (min-height: 100dvh)': {
            minH: 'var(--app-height, 100vh)',
          },
        }}
      >
        <BackgroundPattern />
        <Box position="relative" zIndex={10} maxW="4xl" mx="auto" px={4} py={4} pt={topInset > 0 ? `${topInset + 16}px` : 4}>
          {showFallbackButton && (
            <Box mb={4}>
              <BackButton onClick={handleBack} />
            </Box>
          )}
          <VStack spacing={4} align="stretch">
            <Skeleton height="140px" borderRadius="2xl" />
            <Skeleton height="200px" borderRadius="2xl" />
            <Skeleton height="300px" borderRadius="2xl" />
          </VStack>
        </Box>
      </Box>
    )
  }

  // Error state
  if (error || !patient || !id) {
    return (
      <Box
        minH="100dvh"
        w="full"
        position="relative"
        transition="colors 0.3s"
        bg={pageBg}
        overflowY="auto"
        overflowX="hidden"
        sx={{
          '@supports not (min-height: 100dvh)': {
            minH: 'var(--app-height, 100vh)',
          },
        }}
      >
        <BackgroundPattern />
        <Box position="relative" zIndex={10} maxW="4xl" mx="auto" px={4} py={4} pt={topInset > 0 ? `${topInset + 16}px` : 4}>
          {showFallbackButton && (
            <Box mb={4}>
              <BackButton onClick={handleBack} />
            </Box>
          )}
          <Box
            p={6}
            borderRadius="2xl"
            bg={isDark ? 'rgba(30, 41, 59, 0.6)' : 'white'}
            border="1px solid"
            borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
            textAlign="center"
          >
            <Text fontSize="3xl" mb={3}>❌</Text>
            <Heading size="md" mb={2} color={isDark ? 'white' : 'gray.800'}>
              {t('patientDetails.errorTitle')}
            </Heading>
            <Text color={isDark ? 'gray.400' : 'gray.600'}>
              {error ?? t('patientDetails.notFound')}
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      minH="100dvh"
      w="full"
      position="relative"
      transition="colors 0.3s"
      bg={pageBg}
      overflowY="auto"
      overflowX="hidden"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
        // Android WebView scroll optimization
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Subtle Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDirection="column" flex="1">
        {/* Page Content */}
        <Box as="main" flex={1} w="full" maxW="4xl" mx="auto" px={4} py={4} pt={topInset > 0 ? `${topInset + 16}px` : 4}>
          {/* Back Button - only show if not in Telegram */}
          {showFallbackButton && (
            <Box mb={4}>
              <BackButton onClick={handleBack} />
            </Box>
          )}

          {/* Content Sections - Ordered per Superdesign reference */}
          <VStack spacing={4} align="stretch" pb={8}>
            {/* 1. Patient Information - Always visible */}
            <PatientInfoCard patient={patient} onPatientUpdate={setPatient} />

            {/* 2. Diagnosis - Expandable, default closed */}
            <DiagnosisSection
              diagnosis={patient.diagnosis ?? ''}
              onSave={handleSaveDiagnosis}
              defaultOpen={false}
            />

            {/* 3. Treatment Plan - Interactive step list */}
            <TreatmentPlanBlock
              steps={treatmentSteps}
              onStepsChange={handleTreatmentStepsChange}
              defaultOpen={false}
            />

            {/* 4. Visits - Chronological list (latest first) */}
            <VisitsSection
              visits={sortedVisits as Visit[]}
              onAddVisit={handleAddVisit}
              onEditVisit={handleEditVisit}
              defaultOpen={false}
            />

            {/* 5. Files - X-rays, photos, documents */}
            <FilesSection
              files={mediaFiles.map(f => ({
                id: f.id,
                name: f.fileName,
                type: f.fileType.startsWith('image/') ? 'photo' as const : 'document' as const,
                url: f.publicUrl,
              }))}
              onAddFile={handleAddFile}
              onFileClick={handleFileClick}
              defaultOpen={false}
            />

            {/* Hidden file input for upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* 6. Prescribed Medications */}
            <MedicationsSection
              medications={medications}
              onMedicationAdded={handleMedicationAdded}
              onCreateMedication={handleCreateMedication}
              defaultOpen={false}
            />

            {/* 7. Doctor Notes - Free text notes */}
            <NotesSection
              notes={patient.notes ?? ''}
              onSave={handleSaveNotes}
              defaultOpen={false}
            />

            {/* 8. Marketing - AI-generated content */}
            <MarketingSection
              patientName={`${patient.firstName} ${patient.lastName}`}
              dateOfBirth={patient.birthDate ?? undefined}
              telegramUsername={patient.telegramUsername}
              whatsappPhone={patient.whatsappPhone}
              viberPhone={patient.viberPhone}
              phone={patient.phone}
              defaultOpen={false}
              patientId={id}
              onContactUpdate={async (field, value) => {
                const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
                if (!authToken) throw new Error(t('patientDetails.authRequired'))
                
                const payloadMap: Record<string, string> = {
                  telegramUsername: 'telegram_username',
                  whatsappPhone: 'whatsapp_phone',
                  viberPhone: 'viber_phone',
                }
                const payload = { [payloadMap[field]]: value }
                
                await apiClient.patch(
                  `/patients/${id}`,
                  payload,
                  { headers: { Authorization: `Bearer ${authToken}` } }
                )
                
                // Update local state
                setPatient({
                  ...patient,
                  [field]: value,
                })
              }}
            />

            {/* 9. Finance - Last section */}
            {financeData && id && (
              <FinanceSection
                finance={financeData}
                patientId={id}
                onUpdateFinance={handleUpdateFinance}
                onDataChange={async () => {
                  // Refetch finance summary and payments after payment changes
                  const [newSummary, newPayments] = await Promise.all([
                    patientFinanceApi.getFinanceSummary(id),
                    patientFinanceApi.listPayments(id),
                  ])
                  setFinanceSummary(newSummary)
                  setPayments(newPayments)
                }}
                defaultOpen={false}
              />
            )}
          </VStack>
        </Box>
      </Box>

      {/* Floating AI Assistant Widget - Bottom Right */}
      <FloatingAIAssistant 
        patientId={id} 
        onActionsApplied={() => {
          // Trigger refetch of patient and visits data after AI actions applied
          setRefreshKey(prev => prev + 1)
        }}
      />

      {/* New Visit Modal */}
      <Modal isOpen={newVisitModal.isOpen} onClose={newVisitModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4} bg={isDark ? '#1E293B' : 'white'} borderRadius="xl">
          <ModalHeader fontSize="md" color={isDark ? 'white' : 'gray.800'}>
            {t('patientCard.newVisit')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('patientCard.visitDate')}
                </FormLabel>
                <DateInput
                  value={newVisitDate}
                  onChange={setNewVisitDate}
                  placeholder={t('patientCard.visitDate')}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('visits.newTime') || 'Time'}
                </FormLabel>
                <Input
                  type="time"
                  size="sm"
                  value={newVisitTime}
                  onChange={(e) => setNewVisitTime(e.target.value)}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  bg={isDark ? 'gray.700' : 'white'}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('patientCard.description')}
                </FormLabel>
                <Textarea
                  size="sm"
                  value={newVisitNotes}
                  onChange={(e) => setNewVisitNotes(e.target.value)}
                  placeholder={t('patientCard.visitNotesPlaceholder')}
                  rows={3}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  bg={isDark ? 'gray.700' : 'white'}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button
              variant="ghost"
              size="sm"
              onClick={newVisitModal.onClose}
              color={isDark ? 'gray.300' : 'gray.600'}
            >
              {t('common.cancel')}
            </Button>
            <Button
              bg="#3B82F6"
              color="white"
              size="sm"
              onClick={handleCreateVisit}
              isLoading={isCreatingVisit}
              isDisabled={!newVisitDate}
              _hover={{ bg: '#2563EB' }}
            >
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default PatientDetailsPage
