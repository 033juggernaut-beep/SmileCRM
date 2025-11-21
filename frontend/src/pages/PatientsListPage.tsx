import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tag,
  Skeleton,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PATIENT_STATUSES,
  type Patient,
  type PatientStatus,
  patientsApi,
} from '../api/patients'

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

  const renderTable = () => {
    if (isLoading) {
      return (
        <Stack spacing={4}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height="60px" borderRadius="md" />
          ))}
        </Stack>
      )
    }

    if (error) {
      return (
        <Stack spacing={3}>
          <Text color="red.500">{error}</Text>
          <Button onClick={() => navigate(0)} variant="outline">
            Обновить страницу
          </Button>
        </Stack>
      )
    }

    if (!patients.length) {
      return (
        <Stack spacing={2} textAlign="center">
          <Text>Пациенты пока не добавлены</Text>
          <Button colorScheme="teal" onClick={() => navigate('/patients/new')}>
            Добавить пациента
          </Button>
        </Stack>
      )
    }

    return (
      <Table variant="simple" bg="white" borderRadius="lg" overflow="hidden">
        <Thead bg="gray.50">
          <Tr>
            <Th>Пациент</Th>
            <Th>Диагноз</Th>
            <Th>Статус</Th>
            <Th textAlign="right">Действия</Th>
          </Tr>
        </Thead>
        <Tbody>
          {patients.map((patient) => (
            <Tr key={patient.id}>
              <Td>
                <Stack spacing={0}>
                  <Text fontWeight="semibold">
                    {patient.firstName} {patient.lastName}
                  </Text>
                  {patient.phone ? (
                    <Text fontSize="xs" color="gray.500">
                      {patient.phone}
                    </Text>
                  ) : null}
                </Stack>
              </Td>
              <Td>{patient.diagnosis}</Td>
              <Td>
                {patient.status ? (
                  <Tag colorScheme={statusColors[patient.status] ?? 'gray'}>
                    {statusLabels[patient.status] ?? patient.status}
                  </Tag>
                ) : (
                  <Tag colorScheme="gray">—</Tag>
                )}
              </Td>
              <Td textAlign="right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  Открыть
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    )
  }

  return (
    <Stack spacing={5}>
      <Flex justify="space-between" align="center">
        <Heading size="md">Пациенты</Heading>
        <Button colorScheme="teal" onClick={() => navigate('/patients/new')}>
          Добавить пациента
        </Button>
      </Flex>
      <Box maxH="calc(100vh - 200px)" overflowY="auto">
        {renderTable()}
      </Box>
    </Stack>
  )
}

