import {
  Box,
  Flex,
  Stack,
  Tag,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
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
import { PremiumListItem } from '../components/premium/PremiumListItem'

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

export const PatientsListPage = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
          setError(
            err instanceof Error ? err.message : 'Не удалось загрузить пациентов',
          )
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
  }, [])

  const renderContent = () => {
    if (isLoading) {
      return (
        <PremiumCard variant="elevated" p={0}>
          <Stack spacing={0}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} p={4} borderBottomWidth={index < 4 ? '1px' : '0'} borderColor="border.light">
                <Skeleton height="60px" borderRadius="md" />
              </Box>
            ))}
          </Stack>
        </PremiumCard>
      )
    }

    if (error) {
      return (
        <PremiumCard variant="elevated">
          <Stack spacing={3} align="center" py={4}>
            <Text color="red.500" textAlign="center">{error}</Text>
            <PremiumButton 
              variant="secondary" 
              onClick={() => navigate(0)}
            >
              Обновить страницу
            </PremiumButton>
          </Stack>
        </PremiumCard>
      )
    }

    if (!patients.length) {
      return (
        <PremiumCard variant="elevated">
          <Stack spacing={4} align="center" py={6}>
            <Box fontSize="4xl">👤</Box>
            <Stack spacing={2} textAlign="center">
              <Text fontWeight="semibold" fontSize="lg">
                Нет пациентов
              </Text>
              <Text fontSize="sm" color="text.muted">
                Пациенты пока не добавлены
              </Text>
            </Stack>
            <PremiumButton onClick={() => navigate('/patients/new')}>
              Добавить первого пациента
            </PremiumButton>
          </Stack>
        </PremiumCard>
      )
    }

    return (
      <PremiumCard variant="elevated" p={0} overflow="hidden">
        {patients.map((patient, index) => (
          <PremiumListItem
            key={patient.id}
            icon="👤"
            title={`${patient.firstName} ${patient.lastName}`}
            subtitle={patient.diagnosis}
            rightElement={
              <Stack spacing={1} align="flex-end">
                {patient.status && (
                  <Tag 
                    size="sm" 
                    colorScheme={statusColors[patient.status] ?? 'gray'}
                    borderRadius="base"
                  >
                    {statusLabels[patient.status] ?? patient.status}
                  </Tag>
                )}
                {patient.phone && (
                  <Text fontSize="xs" color="text.muted">
                    {patient.phone}
                  </Text>
                )}
              </Stack>
            }
            showBorder={index < patients.length - 1}
            onClick={() => navigate(`/patients/${patient.id}`)}
          />
        ))}
      </PremiumCard>
    )
  }

  return (
    <PremiumLayout 
      title="Пациенты" 
      showBack={true}
      onBack={() => navigate('/home')}
      background="light"
    >
      <Stack spacing={4}>
        {/* Add Patient Button */}
        <Flex justify="flex-end">
          <PremiumButton 
            onClick={() => navigate('/patients/new')}
            leftIcon={<Text>+</Text>}
          >
            Добавить
          </PremiumButton>
        </Flex>

        {/* Patients List */}
        {renderContent()}
      </Stack>
    </PremiumLayout>
  )
}

