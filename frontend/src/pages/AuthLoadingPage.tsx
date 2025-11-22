import {
  Alert,
  AlertIcon,
  Button,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../api/client'
import {
  TELEGRAM_INIT_DATA_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '../constants/storage'
import { useTelegramInitData } from '../hooks/useTelegramInitData'

type AuthResponse = {
  doctorExists: boolean
  accessToken: string
}

export const AuthLoadingPage = () => {
  const initData = useTelegramInitData()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (!initData) {
      return
    }

    const { initDataRaw } = initData

    if (!initDataRaw) {
      setError('Telegram WebApp initData missing')
      return
    }

    const safeInitDataRaw = initDataRaw

    let cancelled = false

    const authenticate = async () => {
      setIsAuthenticating(true)
      setError(null)

      sessionStorage.setItem(TELEGRAM_INIT_DATA_STORAGE_KEY, safeInitDataRaw)

      try {
        const { data } = await apiClient.post<AuthResponse>(
          '/api/auth/telegram',
          {
            initData: safeInitDataRaw,
          },
        )

        if (cancelled) {
          return
        }

        if (data.doctorExists) {
          if (!data.accessToken) {
            throw new Error('Сервер не вернул accessToken')
          }
          localStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken)
          navigate('/home', { replace: true })
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          navigate('/register', { replace: true })
        }
      } catch (err) {
        if (cancelled) {
          return
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось связаться с сервером авторизации',
        )
      } finally {
        if (!cancelled) {
          setIsAuthenticating(false)
        }
      }
    }

    void authenticate()

    return () => {
      cancelled = true
    }
  }, [initData, navigate, retryCount])

  const handleRetry = () => setRetryCount((count) => count + 1)

  if (!initData) {
    return (
      <LoadingState
        title="Подключаем Telegram"
        subtitle="Получаем initData из Telegram WebApp"
      />
    )
  }

  if (!initData.initDataRaw) {
    return (
      <ErrorState
        message="Telegram WebApp initData missing"
        onRetry={handleRetry}
      />
    )
  }

  if (error) {
    return (
      <Stack spacing={4}>
        <Heading size="md">Пробуем авторизоваться…</Heading>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={handleRetry} colorScheme="teal" isLoading={isAuthenticating}>
          Повторить попытку
        </Button>
      </Stack>
    )
  }

  return (
    <LoadingState
      title="Авторизуем вас…"
      subtitle="Проверяем данные врача на сервере Dental Mini App"
      isBusy={isAuthenticating}
    />
  )
}

type LoadingStateProps = {
  title: string
  subtitle: string
  isBusy?: boolean
}

const LoadingState = ({ title, subtitle, isBusy = true }: LoadingStateProps) => (
  <Stack
    spacing={4}
    align="center"
    textAlign="center"
    bg="white"
    borderRadius="xl"
    borderWidth="1px"
    borderColor="teal.100"
    boxShadow="sm"
    p={6}
  >
    {isBusy && <Spinner size="lg" color="teal.500" thickness="4px" />}
    <Heading size="md">{title}</Heading>
    <Text fontSize="sm" color="gray.500">
      {subtitle}
    </Text>
  </Stack>
)

type ErrorStateProps = {
  message: string
  onRetry?: () => void
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <Stack spacing={4} textAlign="center" bg="white" borderRadius="xl" p={6}>
    <Alert status="error" borderRadius="md">
      <AlertIcon />
      {message}
    </Alert>
    {onRetry ? (
      <Button onClick={onRetry} colorScheme="teal">
        Повторить попытку
      </Button>
    ) : null}
  </Stack>
)

