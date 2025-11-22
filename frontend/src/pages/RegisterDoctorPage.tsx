import {
  Alert,
  AlertIcon,
  Button,
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
import { apiClient } from '../api/client'
import {
  TELEGRAM_INIT_DATA_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '../constants/storage'

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

      const response = await apiClient.post<RegisterResponse>(
        '/doctors/register',
        payload,
        { authToken: token },
      )

      if (response?.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
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
    <chakra.form onSubmit={handleSubmit} w="full">
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Heading size="md">Регистрация врача</Heading>
          <Text fontSize="sm" color="gray.500">
            Заполните информацию о себе, чтобы продолжить работу в Dental Mini App.
          </Text>
        </Stack>

        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Имя</FormLabel>
            <Input
              value={form.firstName}
              onChange={handleChange('firstName')}
              placeholder="Например, Арман"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Фамилия</FormLabel>
            <Input
              value={form.lastName}
              onChange={handleChange('lastName')}
              placeholder="Например, Петросян"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Специализация</FormLabel>
            <Input
              value={form.specialization}
              onChange={handleChange('specialization')}
              placeholder="Ортодонт, терапевт и т.д."
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Телефон</FormLabel>
            <Input
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="+374 XX XX XX"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Название клиники</FormLabel>
            <Textarea
              value={form.clinicName}
              onChange={handleChange('clinicName')}
              placeholder="Укажите клинику или индивидуальную практику"
              rows={2}
            />
          </FormControl>
        </Stack>

        {error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}

        <Button
          type="submit"
          colorScheme="teal"
          size="lg"
          isLoading={isSubmitting}
        >
          Зарегистрироваться
        </Button>
      </Stack>
    </chakra.form>
  )
}

