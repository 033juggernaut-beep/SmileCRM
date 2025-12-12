import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  chakra,
  useToast,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PATIENT_STATUSES,
  patientsApi,
} from '../api/patients'
import type { PatientStatus } from '../api/patients'
import { type VoiceParseStructured, isPatientStructured } from '../api/ai'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { VoiceAssistantButton } from '../components/VoiceAssistantButton'

type FormFields = {
  firstName: string
  lastName: string
  diagnosis: string
  phone: string
  status: PatientStatus
}

const initialFormState: FormFields = {
  firstName: '',
  lastName: '',
  diagnosis: '',
  phone: '',
  status: 'in_progress',
}

export const AddPatientPage = () => {
  const [form, setForm] = useState<FormFields>(initialFormState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleChange =
    (field: keyof FormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      status: event.target.value as PatientStatus,
    }))
  }

  // Handle voice assistant result
  const handleVoiceApply = useCallback((structured: VoiceParseStructured, transcript: string) => {
    console.log('[AddPatientPage] Voice apply:', { structured, transcript })
    
    if (isPatientStructured(structured)) {
      const { patient } = structured
      
      setForm((prev) => ({
        firstName: patient.first_name || prev.firstName,
        lastName: patient.last_name || prev.lastName,
        diagnosis: patient.diagnosis || prev.diagnosis,
        phone: patient.phone || prev.phone,
        status: patient.status || prev.status,
      }))
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('Пожалуйста, заполните имя и фамилию.')
      return
    }

    setIsSubmitting(true)

    try {
      const newPatient = await patientsApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        diagnosis: form.diagnosis.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: form.status,
      })

      toast({
        title: 'Пациент добавлен',
        description: `${newPatient.firstName} ${newPatient.lastName} создан в системе`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      navigate(`/patients/${newPatient.id}`, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось создать пациента. Попробуйте снова.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PremiumLayout 
      title="Новый пациент" 
      showBack={true}
      onBack={() => navigate('/patients')}
      background="gradient"
      safeAreaBottom
    >
      <chakra.form onSubmit={handleSubmit} w="full">
        <Stack spacing={5}>
          {/* Header with Voice Button */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" color="text.primary">
                Данные пациента
              </Heading>
              <Text fontSize="sm" color="text.muted" mt={1}>
                Заполните информацию о пациенте
              </Text>
            </Box>
            <VoiceAssistantButton
              mode="patient"
              onApply={handleVoiceApply}
              buttonLabel="🎤"
            />
          </Flex>

          {/* Form Card */}
          <PremiumCard variant="elevated">
            <Stack spacing={5}>
              <FormControl isRequired>
                <FormLabel color="text.secondary" fontSize="sm">
                  Имя
                </FormLabel>
                <Input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="text.secondary" fontSize="sm">
                  Фамилия
                </FormLabel>
                <Input
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  Телефон
                </FormLabel>
                <Input
                  placeholder="+374 XX XXX XXX"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  size="lg"
                  type="tel"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  Статус
                </FormLabel>
                <Select 
                  value={form.status} 
                  onChange={handleStatusChange}
                  size="lg"
                  sx={{
                    option: {
                      bg: 'bg.secondary',
                      color: 'text.primary',
                    },
                  }}
                >
                  {PATIENT_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  Диагноз / Заметки
                </FormLabel>
                <Textarea
                  placeholder="Описание диагноза или заметки..."
                  rows={4}
                  value={form.diagnosis}
                  onChange={handleChange('diagnosis')}
                  size="lg"
                />
              </FormControl>
            </Stack>
          </PremiumCard>

          {/* Error Alert */}
          {error && (
            <Alert 
              status="error" 
              borderRadius="lg"
              bg="error.500"
              color="white"
            >
              <AlertIcon color="white" />
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <PremiumButton
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            loadingText="Сохранение..."
            fullWidth
          >
            ✓ Сохранить пациента
          </PremiumButton>
        </Stack>
      </chakra.form>
    </PremiumLayout>
  )
}
