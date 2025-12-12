import {
  Alert,
  AlertIcon,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  chakra,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, buildAuthHeaders } from '../api/client'
import {
  TELEGRAM_INIT_DATA_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '../constants/storage'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'

type RegisterResponse = {
  token?: string
}

type FormFields = {
  firstName: string
  lastName: string
  specialization: string
  phone: string
  clinicName: string
}

const initialForm: FormFields = {
  firstName: '',
  lastName: '',
  specialization: '',
  phone: '',
  clinicName: '',
}

export const RegisterDoctorPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormFields>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof FormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const validateForm = () =>
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.specialization.trim() &&
    form.phone.trim() &&
    form.clinicName.trim()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      setError('Пожалуйста, заполните все поля формы.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const initDataRaw =
        sessionStorage.getItem(TELEGRAM_INIT_DATA_STORAGE_KEY) ?? undefined

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        clinicName: form.clinicName.trim(),
        initData: initDataRaw,
      }

      const { data } = await apiClient.post<RegisterResponse>(
        '/doctors/register',
        payload,
        { headers: buildAuthHeaders(token) },
      )

      if (data?.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      }

      navigate('/home', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось отправить данные регистрации',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PremiumLayout 
      title="Регистрация" 
      showBack={false}
      background="gradient"
    >
      <chakra.form onSubmit={handleSubmit} w="full">
        <Stack spacing={5}>
          {/* Welcome Card */}
          <PremiumCard variant="elevated">
            <Stack spacing={3} align="center" textAlign="center">
              <Box fontSize="3xl">👨‍⚕️</Box>
              <Heading size="md" color="text.main">
                Регистрация врача
              </Heading>
              <Text fontSize="sm" color="text.muted">
                Заполните информацию о себе, чтобы продолжить работу в Dental Mini App.
              </Text>
            </Stack>
          </PremiumCard>

          {/* Form Card */}
          <PremiumCard variant="elevated">
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Имя
                </FormLabel>
                <Input
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  placeholder="Например, Արման"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Фамилия
                </FormLabel>
                <Input
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  placeholder="Например, Պետրոսյան"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Специализация
                </FormLabel>
                <Input
                  value={form.specialization}
                  onChange={handleChange('specialization')}
                  placeholder="Ортодонт, терапевт и т.д."
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Телефон
                </FormLabel>
                <Input
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+374 XX XX XX XX"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="semibold" color="text.main">
                  Название клиники
                </FormLabel>
                <Textarea
                  value={form.clinicName}
                  onChange={handleChange('clinicName')}
                  placeholder="Укажите клинику или индивидуальную практику"
                  rows={3}
                  size="lg"
                />
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
            Зарегистрироваться
          </PremiumButton>
        </Stack>
      </chakra.form>
    </PremiumLayout>
  )
}

