import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Tag,
  Skeleton,
  Text,
  Heading,
} from '@chakra-ui/react'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PATIENT_STATUSES,
  type Patient,
  type PatientStatus,
  patientsApi,
} from '../api/patients'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { getErrorMessage, isPaymentRequiredError } from '../utils/errorHandler'

const statusLabels = PATIENT_STATUSES.reduce(
  (acc, item) => {
    acc[item.value] = item.label
    return acc
  },
  {} as Record<PatientStatus, string>,
)

const statusColors: Record<PatientStatus, { bg: string; color: string }> = {
  in_progress: { bg: 'warning.500', color: 'black' },
  completed: { bg: 'success.500', color: 'white' },
}

export const PatientsListPage = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const fetchPatients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await patientsApi.list()
        if (mounted) {
          setPatients(data)
        }
      } catch (err) {
        if (mounted) {
          if (isPaymentRequiredError(err)) {
            navigate('/subscription')
            return
          }
          setError(getErrorMessage(err))
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchPatients()

    return () => {
      mounted = false
    }
  }, [navigate])

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients
    const query = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.phone?.toLowerCase().includes(query) ||
        p.diagnosis?.toLowerCase().includes(query)
    )
  }, [patients, search])

  const renderContent = () => {
    if (isLoading) {
      return (
        <Stack spacing={3}>
          {Array.from({ length: 5 }).map((_, index) => (
            <PremiumCard key={index} variant="default">
              <Skeleton height="60px" borderRadius="md" startColor="bg.tertiary" endColor="bg.hover" />
            </PremiumCard>
          ))}
        </Stack>
      )
    }

    if (error) {
      return (
        <PremiumCard variant="elevated">
          <Stack spacing={4} align="center" py={8}>
            <Text fontSize="4xl">⚠️</Text>
            <Stack spacing={2} textAlign="center">
              <Text fontWeight="semibold" fontSize="lg" color="error.400">
                Ошибка загрузки
              </Text>
              <Text fontSize="sm" color="text.muted">
                {error}
              </Text>
            </Stack>
            <Stack spacing={2} w="full" maxW="280px">
              <PremiumButton 
                onClick={() => {
                  setError(null)
                  setIsLoading(true)
                  void patientsApi.list().then(
                    (data) => {
                      setPatients(data)
                      setIsLoading(false)
                    },
                    (err) => {
                      if (isPaymentRequiredError(err)) {
                        navigate('/subscription')
                        return
                      }
                      setError(getErrorMessage(err))
                      setIsLoading(false)
                    }
                  )
                }}
                fullWidth
              >
                Попробовать снова
              </PremiumButton>
            </Stack>
          </Stack>
        </PremiumCard>
      )
    }

    if (!patients.length) {
      return (
        <PremiumCard variant="elevated">
          <Stack spacing={4} align="center" py={8}>
            <Text fontSize="5xl">👤</Text>
            <Stack spacing={2} textAlign="center">
              <Text fontWeight="bold" fontSize="xl" color="text.primary">
                Нет пациентов
              </Text>
              <Text fontSize="sm" color="text.muted">
                Добавьте первого пациента для начала работы
              </Text>
            </Stack>
            <PremiumButton 
              onClick={() => navigate('/patients/new')}
              leftIcon={<Text>➕</Text>}
            >
              Добавить пациента
            </PremiumButton>
          </Stack>
        </PremiumCard>
      )
    }

    if (!filteredPatients.length) {
      return (
        <PremiumCard variant="flat">
          <Stack spacing={2} align="center" py={6}>
            <Text fontSize="3xl">🔍</Text>
            <Text color="text.muted">Ничего не найдено</Text>
          </Stack>
        </PremiumCard>
      )
    }

    return (
      <Stack spacing={3}>
        {filteredPatients.map((patient) => (
          <PremiumCard
            key={patient.id}
            variant="default"
            isHoverable
            onClick={() => navigate(`/patients/${patient.id}`)}
            p={0}
          >
            <Flex align="center" gap={3} p={4}>
              {/* Avatar */}
              <Box
                w="48px"
                h="48px"
                borderRadius="lg"
                bg="bg.tertiary"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xl"
                flexShrink={0}
              >
                👤
              </Box>

              {/* Info */}
              <Box flex={1} minW={0}>
                <Text
                  fontWeight="semibold"
                  fontSize="md"
                  color="text.primary"
                  noOfLines={1}
                >
                  {patient.firstName} {patient.lastName}
                </Text>
                {patient.diagnosis && (
                  <Text
                    fontSize="sm"
                    color="text.muted"
                    noOfLines={1}
                    mt={0.5}
                  >
                    {patient.diagnosis}
                  </Text>
                )}
              </Box>

              {/* Status & Arrow */}
              <Flex align="center" gap={2} flexShrink={0}>
                {patient.status && (
                  <Tag
                    size="sm"
                    bg={statusColors[patient.status]?.bg ?? 'bg.tertiary'}
                    color={statusColors[patient.status]?.color ?? 'text.secondary'}
                    borderRadius="full"
                    fontWeight="medium"
                    fontSize="xs"
                  >
                    {statusLabels[patient.status] ?? patient.status}
                  </Tag>
                )}
                <Text color="text.muted" fontSize="lg">→</Text>
              </Flex>
            </Flex>
          </PremiumCard>
        ))}
      </Stack>
    )
  }

  return (
    <PremiumLayout 
      title="Пациенты" 
      showBack={true}
      onBack={() => navigate('/home')}
      background="gradient"
      safeAreaBottom
    >
      <Stack spacing={4}>
        {/* Header with count */}
        <Flex justify="space-between" align="center">
          <Heading size="md" color="text.primary">
            {isLoading ? 'Загрузка...' : `${patients.length} пациентов`}
          </Heading>
          <PremiumButton
            size="sm"
            onClick={() => navigate('/patients/new')}
            leftIcon={<Text fontSize="sm">➕</Text>}
          >
            Добавить
          </PremiumButton>
        </Flex>

        {/* Search */}
        {patients.length > 0 && (
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Text color="text.muted">🔍</Text>
            </InputLeftElement>
            <Input
              placeholder="Поиск пациента..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              bg="bg.secondary"
              borderColor="border.subtle"
              _placeholder={{ color: 'text.muted' }}
            />
          </InputGroup>
        )}

        {/* Patients List */}
        {renderContent()}
      </Stack>
    </PremiumLayout>
  )
}
