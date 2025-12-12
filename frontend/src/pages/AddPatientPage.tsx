import {
  Alert,
  AlertIcon,
  Flex,
  FormControl,
  FormLabel,
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
      title="Добавить пациента" 
      showBack={true}
      onBack={() => navigate('/patients')}
      background="light"
    >
      <chakra.form onSubmit={handleSubmit} w="full">
        <Stack spacing={5}>
          {/* Info Card with Voice Button */}
          <PremiumCard variant="elevated" p={4}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
              <Text fontSize="sm" color="text.muted">
                После сохранения пациент станет доступен в общем списке.
              </Text>
              <VoiceAssistantButton
                mode="patient"
                onApply={handleVoiceApply}
                buttonLabel="🎤 Голос"
              />
            </Flex>
          </PremiumCard>

          {/* Form Card */}
          <PremiumCard variant="elevated">
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Имя
                </FormLabel>
                <Input
                  placeholder="Например, Անի"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Фамилия
                </FormLabel>
                <Input
                  placeholder="Например, Սարգսյան"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="text.main">
                  Диагноз
                </FormLabel>
                <Textarea
                  placeholder="Короткое описание диагноза (необязательно)"
                  rows={3}
                  value={form.diagnosis}
                  onChange={handleChange('diagnosis')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="text.main">
                  Телефон
                </FormLabel>
                <Input
                  placeholder="+374 ..."
                  value={form.phone}
                  onChange={handleChange('phone')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold" color="text.main">
                  Статус
                </FormLabel>
                <Select 
                  value={form.status} 
                  onChange={handleStatusChange}
                  size="lg"
                >
                  {PATIENT_STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </PremiumCard>

          {/* Error Alert */}
          {error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}

          {/* Submit Button */}
          <PremiumButton
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            w="full"
          >
            Сохранить данные
          </PremiumButton>
        </Stack>
      </chakra.form>
    </PremiumLayout>
  )
}

