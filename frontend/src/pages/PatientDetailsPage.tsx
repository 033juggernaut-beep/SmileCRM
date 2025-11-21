import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
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
    } catch (err) {
      setVisitError(
        err instanceof Error
          ? err.message
          : 'Не удалось создать визит. Попробуйте снова.',
      )
    } finally {
      setIsCreatingVisit(false)
    }
  }

  if (isLoading) {
    return (
      <Stack spacing={4}>
        <Heading size="md">Загружаем данные пациента…</Heading>
        <Text color="gray.500">Пожалуйста, подождите пару секунд.</Text>
      </Stack>
    )
  }

  if (error || !patient || !id) {
    return (
      <Stack spacing={4}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error ?? 'Пациент не найден'}
        </Alert>
        <Button onClick={() => navigate('/patients')} colorScheme="teal">
          Вернуться к списку
        </Button>
      </Stack>
    )
  }

  const statusMeta = patient.status
    ? {
        label: statusLabels[patient.status] ?? patient.status,
        color: statusColors[patient.status] ?? 'teal',
      }
    : null

  return (
    <Stack spacing={6}>
      <Button variant="link" onClick={() => navigate('/patients')}>
        ← Назад к пациентам
      </Button>

      <Stack spacing={2}>
        <Flex align="center" gap={3} wrap="wrap">
          <Heading size="lg">
            {patient.firstName} {patient.lastName}
          </Heading>
          {statusMeta ? (
            <Tag colorScheme={statusMeta.color}>{statusMeta.label}</Tag>
          ) : null}
        </Flex>
        <Text color="gray.500">{patient.diagnosis}</Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <InfoCard label="Телефон" value={patient.phone ?? '—'} />
        <InfoCard label="ID пациента" value={patient.id} />
        <InfoCard label="Создан" value={formatDateTime(patient.createdAt)} />
        <InfoCard label="Статус" value={statusMeta?.label ?? '—'} />
      </SimpleGrid>

      <Divider />

      <Stack spacing={4}>
        <Heading size="sm">Создать визит</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Дата визита</FormLabel>
            <Input
              type="date"
              value={visitForm.visitDate}
              onChange={handleVisitFieldChange('visitDate')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Следующий визит</FormLabel>
            <Input
              type="date"
              value={visitForm.nextVisitDate}
              onChange={handleVisitFieldChange('nextVisitDate')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Заметки</FormLabel>
            <Textarea
              rows={3}
              value={visitForm.notes}
              onChange={handleVisitFieldChange('notes')}
              placeholder="Опишите рекомендации или прогресс лечения"
            />
          </FormControl>
        </SimpleGrid>
        {visitError ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {visitError}
          </Alert>
        ) : null}
        <Button
          colorScheme="teal"
          onClick={handleCreateVisit}
          isLoading={isCreatingVisit}
        >
          Добавить визит
        </Button>
      </Stack>

      <Divider />

      <Stack spacing={4}>
        <Heading size="sm">История визитов</Heading>
        {sortedVisits.length ? (
          <Stack spacing={3}>
            {sortedVisits.map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </Stack>
        ) : (
          <Text color="gray.500">Для этого пациента еще нет визитов.</Text>
        )}
      </Stack>
    </Stack>
  )
}

type InfoCardProps = {
  label: string
  value?: string | null
}

const InfoCard = ({ label, value }: InfoCardProps) => (
  <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
    <Text fontSize="xs" textTransform="uppercase" color="gray.500" mb={1}>
      {label}
    </Text>
    <Text fontWeight="semibold">{value || '—'}</Text>
  </Box>
)

const VisitCard = ({ visit }: { visit: Visit }) => (
  <Box borderWidth="1px" borderRadius="md" p={4} bg="white">
    <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
      <Stack spacing={0}>
        <Text fontWeight="semibold">{formatDate(visit.visitDate)}</Text>
        <Text fontSize="sm" color="gray.500">
          ID визита: {visit.id}
        </Text>
      </Stack>
      <Text fontSize="sm" color="gray.500">
        Создан {formatDateTime(visit.createdAt)}
      </Text>
    </Flex>
    {visit.notes ? (
      <Text mt={3} whiteSpace="pre-wrap">
        {visit.notes}
      </Text>
    ) : null}
    <Text mt={3} fontSize="sm" color="gray.600">
      Следующий визит: {formatDate(visit.nextVisitDate)}
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

