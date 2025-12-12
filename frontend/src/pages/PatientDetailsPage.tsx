import {
  Alert,
  AlertIcon,
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stack,
  Table,
  Tag,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
// Using emoji instead of @chakra-ui/icons for better compatibility
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  type Patient,
  type PatientStatus,
  type Visit,
  patientsApi,
} from '../api/patients'
import {
  patientFinanceApi,
  type PatientFinanceSummary,
  type PatientPayment,
} from '../api/patientFinance'
import { type VoiceParseStructured, isVisitStructured } from '../api/ai'
import { apiClient } from '../api/client'
import { TOKEN_STORAGE_KEY } from '../constants/storage'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { MediaGallery } from '../components/MediaGallery'
import { VoiceAssistantButton } from '../components/VoiceAssistantButton'
import { useLanguage } from '../context/LanguageContext'

type VisitFormFields = {
  visitDate: string
  nextVisitDate: string
  notes: string
  medications: string
}

const statusColors: Record<PatientStatus, { bg: string; color: string }> = {
  in_progress: { bg: 'warning.500', color: 'black' },
  completed: { bg: 'success.500', color: 'white' },
}

export const PatientDetailsPage = () => {
  const { t } = useLanguage()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  
  // Translated status labels
  const statusLabels: Record<PatientStatus, string> = {
    in_progress: t('patients.statusInProgress'),
    completed: t('patients.statusCompleted'),
  }

  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visitError, setVisitError] = useState<string | null>(null)
  const [isCreatingVisit, setIsCreatingVisit] = useState(false)
  const [visitForm, setVisitForm] = useState<VisitFormFields>({
    visitDate: '',
    nextVisitDate: '',
    notes: '',
    medications: '',
  })

  // Finance state
  const [financeSummary, setFinanceSummary] = useState<PatientFinanceSummary | null>(null)
  const [payments, setPayments] = useState<PatientPayment[]>([])
  const [treatmentPlanTotal, setTreatmentPlanTotal] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentComment, setPaymentComment] = useState<string>('')
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)
  const [isAddingPayment, setIsAddingPayment] = useState(false)

  // Edit state for payments
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null)
  const [editPaymentComment, setEditPaymentComment] = useState<string>('')
  const [isSavingPayment, setIsSavingPayment] = useState(false)

  // Edit state for visits
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [editVisitMedications, setEditVisitMedications] = useState<string>('')
  const [isSavingVisit, setIsSavingVisit] = useState(false)

  const sortedVisits = useMemo(
    () =>
      [...visits].sort((a, b) =>
        (b.visitDate ?? '').localeCompare(a.visitDate ?? ''),
      ),
    [visits],
  )

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
        const [patientData, visitsData, financeData, paymentsData] = await Promise.all([
          patientsApi.getById(id),
          patientsApi.getVisits(id),
          patientFinanceApi.getFinanceSummary(id),
          patientFinanceApi.listPayments(id),
        ])
        if (!cancelled) {
          setPatient(patientData)
          setVisits(visitsData)
          setFinanceSummary(financeData)
          setPayments(paymentsData)
          setTreatmentPlanTotal(financeData.treatmentPlanTotal?.toString() || '')
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t('patientDetails.loadError'),
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
  }, [id])

  const handleVisitFieldChange =
    (field: keyof VisitFormFields) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setVisitForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  // Handle voice assistant result for visit
  const handleVoiceApply = useCallback((structured: VoiceParseStructured, transcript: string) => {
    console.log('[PatientDetailsPage] Voice apply:', { structured, transcript })
    
    if (isVisitStructured(structured)) {
      const { visit, medications } = structured
      
      // Format medications into text
      let medicationsText = ''
      if (medications && medications.length > 0) {
        medicationsText = medications
          .map(m => {
            const parts = [m.name]
            if (m.dose) parts.push(m.dose)
            if (m.frequency) parts.push(m.frequency)
            if (m.duration) parts.push(`(${m.duration})`)
            return parts.join(' ')
          })
          .join('\n')
      }
      
      setVisitForm((prev) => ({
        visitDate: visit.visit_date || prev.visitDate,
        nextVisitDate: visit.next_visit_date || prev.nextVisitDate,
        notes: visit.notes || visit.diagnosis || prev.notes,
        medications: medicationsText || prev.medications,
      }))
    }
  }, [])

  const handleCreateVisit = async () => {
    if (!patient || !id) {
      return
    }
    if (!visitForm.visitDate) {
      setVisitError(t('patientDetails.visitDateRequired'))
      return
    }
    setVisitError(null)
    setIsCreatingVisit(true)
    try {
      const created = await patientsApi.createVisit(id, {
        visitDate: visitForm.visitDate,
        nextVisitDate: visitForm.nextVisitDate || undefined,
        notes: visitForm.notes || undefined,
        medications: visitForm.medications || undefined,
      })
      setVisits((prev) => [created, ...prev])
      setVisitForm({ visitDate: '', nextVisitDate: '', notes: '', medications: '' })
      toast({
        title: t('patientDetails.visitAdded'),
        description: formatDate(created.visitDate),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err: unknown) {
      console.error('Failed to create visit:', err)
      let errorMessage = 'Network Error'
      
      // Check if it's an axios error with response
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const detail = err.response.data?.detail
          errorMessage = detail || `${t('patientDetails.serverError')}: ${err.response.status}`
        } else if (err.request) {
          // Request was made but no response received
          errorMessage = t('patientDetails.serverNotResponding')
        } else {
          errorMessage = err.message
        }
      } else if (err instanceof Error) {
        // Something else happened
        errorMessage = err.message
      }
      
      setVisitError(errorMessage)
    } finally {
      setIsCreatingVisit(false)
    }
  }

  const handleUpdateTreatmentPlan = async () => {
    if (!patient || !id) return
    
    setIsUpdatingPlan(true)
    try {
      const totalValue = treatmentPlanTotal ? parseFloat(treatmentPlanTotal) : undefined
      
      // We need to call a patient update endpoint
      // Since we don't have a direct update method in patientsApi, 
      // we'll need to make a raw API call
      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) throw new Error(t('patientDetails.authRequired'))
      
      await apiClient.patch(
        `/patients/${id}`,
        {
          treatment_plan_total: totalValue,
          treatment_plan_currency: 'AMD',
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      
      // Update local patient state
      if (patient) {
        setPatient({
          ...patient,
          treatmentPlanTotal: totalValue,
          treatmentPlanCurrency: 'AMD',
        })
      }
      
      // Refetch finance summary
      const newSummary = await patientFinanceApi.getFinanceSummary(id)
      setFinanceSummary(newSummary)
      
      toast({
        title: t('patientDetails.planUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : t('patientDetails.updateError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUpdatingPlan(false)
    }
  }

  const handleAddPayment = async () => {
    if (!id || !paymentAmount) return
    
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('common.error'),
        description: t('patientDetails.invalidAmount'),
        status: 'error',
        duration: 3000,
      })
      return
    }
    
    setIsAddingPayment(true)
    try {
      // Log what we're sending
      console.log('[Payment] Creating payment:', { amount, comment: paymentComment || undefined })
      
      const newPayment = await patientFinanceApi.createPayment(id, {
        amount,
        comment: paymentComment.trim() || undefined,
      })
      
      console.log('[Payment] Created:', newPayment)
      
      setPayments((prev) => [newPayment, ...prev])
      setPaymentAmount('')
      setPaymentComment('')
      
      // Refetch summary to update totals
      const newSummary = await patientFinanceApi.getFinanceSummary(id)
      setFinanceSummary(newSummary)
      
      toast({
        title: t('patientDetails.paymentAdded'),
        description: `${amount} ${newSummary.treatmentPlanCurrency}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : t('patientDetails.addPaymentError'),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsAddingPayment(false)
    }
  }

  // Start editing a payment comment
  const handleStartEditPayment = (payment: PatientPayment) => {
    setEditingPaymentId(payment.id)
    setEditPaymentComment(payment.comment || '')
  }

  // Cancel editing a payment
  const handleCancelEditPayment = () => {
    setEditingPaymentId(null)
    setEditPaymentComment('')
  }

  // Save payment comment edit
  const handleSavePaymentComment = async (paymentId: string) => {
    if (!id) return
    
    setIsSavingPayment(true)
    try {
      const updated = await patientFinanceApi.updatePayment(id, paymentId, {
        comment: editPaymentComment.trim() || undefined,
      })
      
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? updated : p))
      )
      setEditingPaymentId(null)
      setEditPaymentComment('')
      
      toast({
        title: t('patientDetails.commentSaved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : t('patientDetails.saveError'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSavingPayment(false)
    }
  }

  // Start editing visit medications
  const handleStartEditVisit = (visit: Visit) => {
    setEditingVisitId(visit.id)
    setEditVisitMedications(visit.medications || '')
  }

  // Cancel editing visit
  const handleCancelEditVisit = () => {
    setEditingVisitId(null)
    setEditVisitMedications('')
  }

  // Save visit medications
  const handleSaveVisitMedications = async (visitId: string) => {
    setIsSavingVisit(true)
    try {
      const updated = await patientsApi.updateVisit(visitId, {
        medications: editVisitMedications.trim() || undefined,
      })
      
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? updated : v))
      )
      setEditingVisitId(null)
      setEditVisitMedications('')
      
      toast({
        title: t('patientDetails.medicationsSaved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: t('common.error'),
        description: err instanceof Error ? err.message : t('patientDetails.saveError'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSavingVisit(false)
    }
  }

  const formatCurrency = (amount: number | null | undefined, currency: string = 'AMD') => {
    if (amount === null || amount === undefined) return '—'
    return `${amount.toLocaleString('ru-RU')} ${currency}`
  }

  if (isLoading) {
    return (
      <PremiumLayout 
        title={t('common.loading')} 
        showBack={true}
        onBack={() => navigate('/patients')}
        background="gradient"
        safeAreaBottom
      >
        <PremiumCard variant="elevated">
          <Stack spacing={3} align="center" py={6}>
            <Box fontSize="3xl">⏳</Box>
            <Heading size="md" color="text.primary">{t('patientDetails.loading')}</Heading>
            <Text color="text.muted" textAlign="center">
              {t('patientDetails.loadingHint')}
            </Text>
          </Stack>
        </PremiumCard>
      </PremiumLayout>
    )
  }

  if (error || !patient || !id) {
    return (
      <PremiumLayout 
        title={t('patientDetails.errorTitle')} 
        showBack={true}
        onBack={() => navigate('/patients')}
        background="gradient"
        safeAreaBottom
      >
        <Stack spacing={4}>
          <Alert status="error" borderRadius="lg" bg="error.500" color="white">
            <AlertIcon color="white" />
            {error ?? t('patientDetails.notFound')}
          </Alert>
          <PremiumButton onClick={() => navigate('/patients')}>
            {t('patientDetails.backToList')}
          </PremiumButton>
        </Stack>
      </PremiumLayout>
    )
  }

  const statusMeta = patient.status
    ? {
        label: statusLabels[patient.status] ?? patient.status,
        bg: statusColors[patient.status]?.bg ?? 'bg.tertiary',
        color: statusColors[patient.status]?.color ?? 'text.secondary',
      }
    : null

  return (
    <PremiumLayout 
      title={`${patient.firstName} ${patient.lastName}`}
      showBack={true}
      onBack={() => navigate('/patients')}
      background="gradient"
      safeAreaBottom
    >
      <Stack spacing={5}>
        {/* Patient Info Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            <Flex align="center" gap={2} wrap="wrap">
              <Text fontSize="2xl">👤</Text>
              <Heading size="lg" color="text.primary">
                {patient.firstName} {patient.lastName}
              </Heading>
              {statusMeta && (
                <Tag 
                  bg={statusMeta.bg}
                  color={statusMeta.color}
                  size="md"
                  borderRadius="full"
                  fontWeight="medium"
                >
                  {statusMeta.label}
                </Tag>
              )}
            </Flex>
            <Text color="text.muted" fontSize="md">
              {patient.diagnosis}
            </Text>
          </Stack>
        </PremiumCard>

        {/* Patient Details Grid */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          <InfoCard label={t('patientDetails.phone')} value={patient.phone ?? '—'} />
          <InfoCard label={t('patientDetails.patientId')} value={patient.id} />
          <InfoCard label={t('patientDetails.created')} value={formatDateTime(patient.createdAt)} />
          <InfoCard label={t('patientDetails.status')} value={statusMeta?.label ?? '—'} />
        </SimpleGrid>

        {/* Create Visit Section */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <Heading size="md" color="text.primary">
                {t('patientDetails.createVisit')}
              </Heading>
              <VoiceAssistantButton
                mode="visit"
                contextPatientId={id}
                onApply={handleVoiceApply}
                buttonLabel={t('patientDetails.voiceButton')}
              />
            </Flex>
            
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.primary">
                  {t('patientDetails.visitDate')}
                </FormLabel>
                <Input
                  type="date"
                  value={visitForm.visitDate}
                  onChange={handleVisitFieldChange('visitDate')}
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="text.primary">
                  {t('patientDetails.nextVisit')}
                </FormLabel>
                <Input
                  type="date"
                  value={visitForm.nextVisitDate}
                  onChange={handleVisitFieldChange('nextVisitDate')}
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="text.primary">
                  {t('patientDetails.notes')}
                </FormLabel>
                <Textarea
                  rows={3}
                  value={visitForm.notes}
                  onChange={handleVisitFieldChange('notes')}
                  placeholder={t('patientDetails.notesPlaceholder')}
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="text.primary">
                  {t('patientDetails.medications')}
                </FormLabel>
                <Textarea
                  rows={4}
                  value={visitForm.medications}
                  onChange={handleVisitFieldChange('medications')}
                  placeholder={t('patientDetails.medicationsPlaceholder')}
                  size="lg"
                />
              </FormControl>
            </Stack>

            {visitError && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {visitError}
              </Alert>
            )}

            <PremiumButton
              onClick={handleCreateVisit}
              isLoading={isCreatingVisit}
              w="full"
            >
              {t('patientDetails.addVisit')}
            </PremiumButton>
          </Stack>
        </PremiumCard>

        {/* Visit History Section */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.primary">
              {t('patientDetails.visitHistory')}
            </Heading>
            
            {sortedVisits.length ? (
              <Stack spacing={3}>
                {sortedVisits.map((visit) => (
                  <VisitCard 
                    key={visit.id} 
                    visit={visit}
                    isEditing={editingVisitId === visit.id}
                    editMedications={editVisitMedications}
                    isSaving={isSavingVisit}
                    onStartEdit={() => handleStartEditVisit(visit)}
                    onCancelEdit={handleCancelEditVisit}
                    onSaveEdit={() => handleSaveVisitMedications(visit.id)}
                    onMedicationsChange={setEditVisitMedications}
                  />
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={6}>
                <Text fontSize="3xl" mb={2}>📅</Text>
                <Text color="text.muted">
                  {t('patientDetails.noVisits')}
                </Text>
              </Box>
            )}
          </Stack>
        </PremiumCard>

        {/* Finance Section */}
        {financeSummary && (
          <PremiumCard variant="elevated">
            <Stack spacing={5}>
              <Heading size="md" color="text.primary">
                {t('patientDetails.finance')}
              </Heading>
              
              {/* Treatment Plan Input */}
              <Box>
                <FormControl>
                  <FormLabel fontWeight="semibold" color="text.primary">
                    {t('patientDetails.treatmentPlan')}
                  </FormLabel>
                  <HStack>
                    <NumberInput
                      value={treatmentPlanTotal}
                      onChange={setTreatmentPlanTotal}
                      min={0}
                      size="lg"
                      flex={1}
                    >
                      <NumberInputField placeholder={t('patientDetails.treatmentPlanPlaceholder')} />
                    </NumberInput>
                    <PremiumButton
                      onClick={handleUpdateTreatmentPlan}
                      isLoading={isUpdatingPlan}
                      size="lg"
                    >
                      {t('patientDetails.savePlan')}
                    </PremiumButton>
                  </HStack>
                </FormControl>
              </Box>

              {/* Summary Cards */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
                <PremiumCard variant="flat" p={4} bg="blue.50">
                  <Text fontSize="xs" color="blue.700" mb={1} fontWeight="semibold">
                    {t('patientDetails.planTotal')}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">
                    {formatCurrency(financeSummary.treatmentPlanTotal, financeSummary.treatmentPlanCurrency)}
                  </Text>
                </PremiumCard>

                <PremiumCard variant="flat" p={4} bg="green.50">
                  <Text fontSize="xs" color="green.700" mb={1} fontWeight="semibold">
                    {t('patientDetails.totalPaid')}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">
                    {formatCurrency(financeSummary.totalPaid, financeSummary.treatmentPlanCurrency)}
                  </Text>
                </PremiumCard>

                <PremiumCard variant="flat" p={4} bg="orange.50">
                  <Text fontSize="xs" color="orange.700" mb={1} fontWeight="semibold">
                    {t('patientDetails.remaining')}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                    {formatCurrency(financeSummary.remaining, financeSummary.treatmentPlanCurrency)}
                  </Text>
                </PremiumCard>
              </SimpleGrid>

              <Divider />

              {/* Add Payment Form */}
              <Box>
                <Heading size="sm" color="text.primary" mb={3}>
                  {t('patientDetails.addPayment')}
                </Heading>
                <Stack spacing={3}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold" color="text.primary" fontSize="sm">
                      {t('patientDetails.amount')}
                    </FormLabel>
                    <NumberInput
                      value={paymentAmount}
                      onChange={setPaymentAmount}
                      min={0}
                      size="md"
                    >
                      <NumberInputField placeholder={t('patientDetails.amountPlaceholder')} />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="semibold" color="text.primary" fontSize="sm">
                      {t('patientDetails.commentOptional')}
                    </FormLabel>
                    <Input
                      value={paymentComment}
                      onChange={(e) => setPaymentComment(e.target.value)}
                      placeholder={t('patientDetails.commentPlaceholder')}
                      size="md"
                    />
                  </FormControl>

                  <PremiumButton
                    onClick={handleAddPayment}
                    isLoading={isAddingPayment}
                    w="full"
                    size="md"
                  >
                    {t('patientDetails.addPayment')}
                  </PremiumButton>
                </Stack>
              </Box>

              <Divider />

              {/* Payments History */}
              <Box>
                <Heading size="sm" color="text.primary" mb={3}>
                  {t('patientDetails.paymentHistory')}
                </Heading>
                {payments.length > 0 ? (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>{t('patientDetails.date')}</Th>
                          <Th isNumeric>{t('patientDetails.amount')}</Th>
                          <Th>{t('patientDetails.comment')}</Th>
                          <Th w="40px"></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {payments.map((payment) => (
                          <Tr key={payment.id}>
                            <Td fontSize="sm">
                              {formatDate(payment.paidAt)}
                            </Td>
                            <Td isNumeric fontWeight="semibold" fontSize="sm">
                              {formatCurrency(payment.amount, payment.currency)}
                            </Td>
                            <Td fontSize="sm">
                              {editingPaymentId === payment.id ? (
                                <HStack spacing={2}>
                                  <Input
                                    size="sm"
                                    value={editPaymentComment}
                                    onChange={(e) => setEditPaymentComment(e.target.value)}
                                    placeholder={t('patientDetails.comment')}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSavePaymentComment(payment.id)
                                      } else if (e.key === 'Escape') {
                                        handleCancelEditPayment()
                                      }
                                    }}
                                  />
                                  <Tooltip label={t('common.save')}>
                                    <IconButton
                                      aria-label="Save"
                                      icon={<Text>✓</Text>}
                                      size="sm"
                                      colorScheme="green"
                                      isLoading={isSavingPayment}
                                      onClick={() => handleSavePaymentComment(payment.id)}
                                    />
                                  </Tooltip>
                                  <Tooltip label={t('common.cancel')}>
                                    <IconButton
                                      aria-label="Cancel"
                                      icon={<Text>✕</Text>}
                                      size="sm"
                                      variant="ghost"
                                      onClick={handleCancelEditPayment}
                                    />
                                  </Tooltip>
                                </HStack>
                              ) : (
                                <Text color={payment.comment ? 'text.main' : 'text.muted'}>
                                  {payment.comment || '—'}
                                </Text>
                              )}
                            </Td>
                            <Td>
                              {editingPaymentId !== payment.id && (
                                <Tooltip label={t('common.edit')}>
                                  <IconButton
                                    aria-label="Edit comment"
                                    icon={<Text>✏️</Text>}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleStartEditPayment(payment)}
                                  />
                                </Tooltip>
                              )}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Box textAlign="center" py={6} bg="bg.gray" borderRadius="md">
                    <Text fontSize="3xl" mb={2}>💳</Text>
                    <Text color="text.muted" fontSize="sm">
                      {t('patientDetails.noPayments')}
                    </Text>
                  </Box>
                )}
              </Box>
            </Stack>
          </PremiumCard>
        )}

        {/* Media Gallery Section */}
        {id && <MediaGallery patientId={id} />}
      </Stack>
    </PremiumLayout>
  )
}

type InfoCardProps = {
  label: string
  value?: string | null
}

const InfoCard = ({ label, value }: InfoCardProps) => (
  <PremiumCard variant="flat" p={3}>
    <Text fontSize="xs" textTransform="uppercase" color="text.muted" mb={1}>
      {label}
    </Text>
    <Text fontWeight="semibold" color="text.primary">
      {value || '—'}
    </Text>
  </PremiumCard>
)

type VisitCardProps = {
  visit: Visit
  isEditing: boolean
  editMedications: string
  isSaving: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onMedicationsChange: (value: string) => void
}

const VisitCard = ({ 
  visit, 
  isEditing, 
  editMedications, 
  isSaving,
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit,
  onMedicationsChange,
}: VisitCardProps) => {
  const { t } = useLanguage()
  
  return (
    <Box 
      borderWidth="1px" 
      borderColor="border.subtle"
      borderRadius="md" 
      p={4} 
      bg="bg.gray"
      transition="all 0.2s"
      _hover={{ boxShadow: 'sm' }}
    >
      <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
        <Stack spacing={1}>
          <Text fontWeight="semibold" color="text.primary">
            📅 {formatDate(visit.visitDate)}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {t('patientDetails.visitId')}: {visit.id}
          </Text>
        </Stack>
        <Text fontSize="xs" color="text.muted">
          {formatDateTime(visit.createdAt)}
        </Text>
      </Flex>
      {visit.notes && (
        <Box 
          mt={3} 
          p={3} 
          bg="white" 
          borderRadius="base"
          borderWidth="1px"
          borderColor="border.subtle"
        >
          <Text fontSize="xs" color="text.muted" mb={1} fontWeight="semibold">
            {t('patientDetails.visitNotes')}
          </Text>
          <Text whiteSpace="pre-wrap" fontSize="sm" color="text.primary">
            {visit.notes}
          </Text>
        </Box>
      )}
      
      {/* Medications section with edit capability */}
      <Box 
        mt={3} 
        p={3} 
        bg={visit.medications ? 'blue.50' : 'gray.50'}
        borderRadius="base"
        borderWidth="1px"
        borderColor={visit.medications ? 'blue.200' : 'gray.200'}
      >
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xs" color={visit.medications ? 'blue.700' : 'gray.500'} fontWeight="semibold">
            {t('patientDetails.medicationsLabel')}
          </Text>
          {!isEditing && (
            <Tooltip label={t('common.edit')}>
              <IconButton
                aria-label="Edit medications"
                icon={<Text>✏️</Text>}
                size="xs"
                variant="ghost"
                onClick={onStartEdit}
              />
            </Tooltip>
          )}
        </Flex>
        
        {isEditing ? (
          <Stack spacing={2}>
            <Textarea
              value={editMedications}
              onChange={(e) => onMedicationsChange(e.target.value)}
              placeholder={t('patientDetails.medicationsPlaceholder')}
              size="sm"
              rows={3}
              autoFocus
            />
            <HStack justify="flex-end" spacing={2}>
              <PremiumButton
                size="sm"
                onClick={onSaveEdit}
                isLoading={isSaving}
              >
                💾 {t('common.save')}
              </PremiumButton>
              <PremiumButton
                size="sm"
                variant="secondary"
                onClick={onCancelEdit}
              >
                {t('common.cancel')}
              </PremiumButton>
            </HStack>
          </Stack>
        ) : (
          <Text whiteSpace="pre-wrap" fontSize="sm" color={visit.medications ? 'text.main' : 'text.muted'}>
            {visit.medications || t('patientDetails.medicationsEmpty')}
          </Text>
        )}
      </Box>
      
      <Text mt={3} fontSize="sm" color="text.muted">
        {t('patientDetails.nextVisitLabel')} {formatDate(visit.nextVisitDate)}
      </Text>
    </Box>
  )
}

const formatDate = (input?: string) => {
  if (!input) {
    return '—'
  }
  try {
    return new Date(input).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return input
  }
}

const formatDateTime = (input?: string) => {
  if (!input) {
    return '—'
  }
  try {
    return new Date(input).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return input
  }
}

