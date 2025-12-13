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
  patientsApi,
} from '../api/patients'
import type { PatientStatus } from '../api/patients'
import { type VoiceParseStructured, isPatientStructured } from '../api/ai'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { VoiceAssistantButton } from '../components/VoiceAssistantButton'
import { useLanguage } from '../context/LanguageContext'

type FormFields = {
  firstName: string
  lastName: string
  diagnosis: string
  phone: string
  status: PatientStatus
  birthDate: string
}

const initialFormState: FormFields = {
  firstName: '',
  lastName: '',
  diagnosis: '',
  phone: '',
  status: 'in_progress',
  birthDate: '',
}

export const AddPatientPage = () => {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormFields>(initialFormState)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  
  // Translated status options
  const statusOptions = [
    { value: 'in_progress' as PatientStatus, label: t('patients.statusInProgress') },
    { value: 'completed' as PatientStatus, label: t('patients.statusCompleted') },
  ]

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
        birthDate: prev.birthDate, // Keep existing birth date from form
      }))
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(t('addPatient.validationError'))
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
        birthDate: form.birthDate || undefined,
      })

      toast({
        title: t('addPatient.successTitle'),
        description: `${newPatient.firstName} ${newPatient.lastName} ${t('addPatient.successDescription')}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      navigate(`/patients/${newPatient.id}`, { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('addPatient.errorCreate'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PremiumLayout 
      title={t('addPatient.title')} 
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
                {t('addPatient.dataTitle')}
              </Heading>
              <Text fontSize="sm" color="text.muted" mt={1}>
                {t('addPatient.dataHint')}
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
                  {t('addPatient.firstName')}
                </FormLabel>
                <Input
                  placeholder={t('addPatient.firstNamePlaceholder')}
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="text.secondary" fontSize="sm">
                  {t('addPatient.lastName')}
                </FormLabel>
                <Input
                  placeholder={t('addPatient.lastNamePlaceholder')}
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  {t('addPatient.phone')}
                </FormLabel>
                <Input
                  placeholder={t('addPatient.phonePlaceholder')}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  size="lg"
                  type="tel"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  {t('addPatient.status')}
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
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  {t('addPatient.birthDate')}
                </FormLabel>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange('birthDate')}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="text.secondary" fontSize="sm">
                  {t('addPatient.diagnosis')}
                </FormLabel>
                <Textarea
                  placeholder={t('addPatient.diagnosisPlaceholder')}
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
            loadingText={t('addPatient.saving')}
            fullWidth
          >
            {t('addPatient.save')}
          </PremiumButton>
        </Stack>
      </chakra.form>
    </PremiumLayout>
  )
}
