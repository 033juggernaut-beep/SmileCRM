import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Tag,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PATIENT_STATUSES,
  type Patient,
  type PatientStatus,
  type Visit,
  patientsApi,
} from '../api/patients'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { MediaGallery } from '../components/MediaGallery'

type VisitFormFields = {
  visitDate: string
  nextVisitDate: string
  notes: string
}

const statusLabels = PATIENT_STATUSES.reduce(
  (acc, item) => {
    acc[item.value] = item.label
    return acc
  },
  {} as Record<PatientStatus, string>,
)

const statusColors: Record<PatientStatus, string> = {
  in_progress: 'orange',
  completed: 'green',
}

export const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

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
  })

  const sortedVisits = useMemo(
    () =>
      [...visits].sort((a, b) =>
        (b.visitDate ?? '').localeCompare(a.visitDate ?? ''),
      ),
    [visits],
  )

  useEffect(() => {
    if (!id) {
      setError('Пациент не найден')
      setIsLoading(false)
      return
    }

    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [patientData, visitsData] = await Promise.all([
          patientsApi.getById(id),
          patientsApi.getVisits(id),
        ])
        if (!cancelled) {
          setPatient(patientData)
          setVisits(visitsData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Ошибка загрузки пациента',
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

  const handleCreateVisit = async () => {
    if (!patient || !id) {
      return
    }
    if (!visitForm.visitDate) {
      setVisitError('Укажите дату визита')
      return
    }
    setVisitError(null)
    setIsCreatingVisit(true)
    try {
      const created = await patientsApi.createVisit(id, {
        visitDate: visitForm.visitDate,
        nextVisitDate: visitForm.nextVisitDate || undefined,
        notes: visitForm.notes || undefined,
      })
      setVisits((prev) => [created, ...prev])
      setVisitForm({ visitDate: '', nextVisitDate: '', notes: '' })
      toast({
        title: 'Визит добавлен',
        description: formatDate(created.visitDate),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err: any) {
      console.error('Failed to create visit:', err)
      let errorMessage = 'Network Error'
      
      // Check if it's an axios error with response
      if (err.response) {
        // Server responded with error status
        const detail = err.response.data?.detail
        errorMessage = detail || `Ошибка сервера: ${err.response.status}`
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Сервер не отвечает. Проверьте подключение к интернету.'
      } else if (err instanceof Error) {
        // Something else happened
        errorMessage = err.message
      }
      
      setVisitError(errorMessage)
    } finally {
      setIsCreatingVisit(false)
    }
  }

  if (isLoading) {
    return (
      <PremiumLayout 
        title="Загрузка..." 
        showBack={true}
        onBack={() => navigate('/patients')}
        background="light"
      >
        <PremiumCard variant="elevated">
          <Stack spacing={3} align="center" py={6}>
            <Box fontSize="3xl">⏳</Box>
            <Heading size="md">Загружаем данные пациента…</Heading>
            <Text color="text.muted" textAlign="center">
              Пожалуйста, подождите пару секунд.
            </Text>
          </Stack>
        </PremiumCard>
      </PremiumLayout>
    )
  }

  if (error || !patient || !id) {
    return (
      <PremiumLayout 
        title="Ошибка" 
        showBack={true}
        onBack={() => navigate('/patients')}
        background="light"
      >
        <Stack spacing={4}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error ?? 'Пациент не найден'}
          </Alert>
          <PremiumButton onClick={() => navigate('/patients')}>
            Вернуться к списку
          </PremiumButton>
        </Stack>
      </PremiumLayout>
    )
  }

  const statusMeta = patient.status
    ? {
        label: statusLabels[patient.status] ?? patient.status,
        color: statusColors[patient.status] ?? 'teal',
      }
    : null

  return (
    <PremiumLayout 
      title={`${patient.firstName} ${patient.lastName}`}
      showBack={true}
      onBack={() => navigate('/patients')}
      background="light"
    >
      <Stack spacing={5}>
        {/* Patient Info Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            <Flex align="center" gap={2} wrap="wrap">
              <Text fontSize="2xl">👤</Text>
              <Heading size="lg" color="text.main">
                {patient.firstName} {patient.lastName}
              </Heading>
              {statusMeta && (
                <Tag 
                  colorScheme={statusMeta.color}
                  size="md"
                  borderRadius="base"
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
          <InfoCard label="Телефон" value={patient.phone ?? '—'} />
          <InfoCard label="ID пациента" value={patient.id} />
          <InfoCard label="Создан" value={formatDateTime(patient.createdAt)} />
          <InfoCard label="Статус" value={statusMeta?.label ?? '—'} />
        </SimpleGrid>

        {/* Create Visit Section */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.main">
              Создать визит
            </Heading>
            
            <Stack spacing={3}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Дата визита
                </FormLabel>
                <Input
                  type="date"
                  value={visitForm.visitDate}
                  onChange={handleVisitFieldChange('visitDate')}
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="text.main">
                  Следующий визит
                </FormLabel>
                <Input
                  type="date"
                  value={visitForm.nextVisitDate}
                  onChange={handleVisitFieldChange('nextVisitDate')}
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="semibold" color="text.main">
                  Заметки
                </FormLabel>
                <Textarea
                  rows={3}
                  value={visitForm.notes}
                  onChange={handleVisitFieldChange('notes')}
                  placeholder="Опишите рекомендации или прогресс лечения"
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
              Добавить визит
            </PremiumButton>
          </Stack>
        </PremiumCard>

        {/* Visit History Section */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Heading size="md" color="text.main">
              История визитов
            </Heading>
            
            {sortedVisits.length ? (
              <Stack spacing={3}>
                {sortedVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </Stack>
            ) : (
              <Box textAlign="center" py={6}>
                <Text fontSize="3xl" mb={2}>📅</Text>
                <Text color="text.muted">
                  Для этого пациента еще нет визитов.
                </Text>
              </Box>
            )}
          </Stack>
        </PremiumCard>

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
    <Text fontWeight="semibold" color="text.main">
      {value || '—'}
    </Text>
  </PremiumCard>
)

const VisitCard = ({ visit }: { visit: Visit }) => (
  <Box 
    borderWidth="1px" 
    borderColor="border.light"
    borderRadius="md" 
    p={4} 
    bg="bg.gray"
    transition="all 0.2s"
    _hover={{ boxShadow: 'sm' }}
  >
    <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
      <Stack spacing={1}>
        <Text fontWeight="semibold" color="text.main">
          📅 {formatDate(visit.visitDate)}
        </Text>
        <Text fontSize="xs" color="text.muted">
          ID визита: {visit.id}
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
        borderColor="border.light"
      >
        <Text whiteSpace="pre-wrap" fontSize="sm" color="text.main">
          {visit.notes}
        </Text>
      </Box>
    )}
    <Text mt={3} fontSize="sm" color="text.muted">
      ⏭️ Следующий визит: {formatDate(visit.nextVisitDate)}
    </Text>
  </Box>
)

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

