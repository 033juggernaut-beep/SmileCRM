import {
  Alert,
  AlertIcon,
  Box,
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
import {
  getCurrentHref,
  getDebugQueryParam,
  isDebugMode,
} from '../utils/debug'

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
  const debugEnabled = isDebugMode()
  const locationSearch = getDebugQueryParam()
  const locationHref = getCurrentHref()

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

      console.log('[AUTH] Sending auth request')
      console.log('[AUTH] initDataRaw length:', safeInitDataRaw.length)
      console.log('[AUTH] initDataRaw preview:', safeInitDataRaw.substring(0, 100))

      try {
        const { data } = await apiClient.post<AuthResponse>(
          '/auth/telegram',
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

        console.error('[AUTH] Request failed:', err)
        let errorMessage = 'Не удалось связаться с сервером авторизации'
        
        if (err && typeof err === 'object' && 'response' in err) {
          const response = (err as any).response
          if (response?.data?.detail) {
            errorMessage = `${errorMessage}: ${response.data.detail}`
            console.error('[AUTH] Server error detail:', response.data.detail)
          }
        }

        setError(
          err instanceof Error
            ? err.message
            : errorMessage,
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

  // If not in Telegram app, show friendly message with link to bot
  if (!initData.isInTelegram) {
    return (
      <Stack spacing={4} textAlign="center" bg="white" borderRadius="xl" p={6}>
        <Heading size="md">Откройте в Telegram</Heading>
        <Text color="gray.600">
          Это приложение работает только внутри Telegram.
        </Text>
        <Text color="gray.600">
          Откройте бота <strong>@SmileCRM_bot</strong> в Telegram и нажмите кнопку "Բացել Mini App".
        </Text>
        <Button
          as="a"
          href="https://t.me/SmileCRM_bot"
          target="_blank"
          colorScheme="telegram"
          size="lg"
        >
          Открыть @SmileCRM_bot
        </Button>
      </Stack>
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
        {debugEnabled ? (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            borderColor="purple.200"
            bg="purple.50"
            p={4}
          >
            <Text fontSize="sm" color="gray.600" fontWeight="semibold">
              DEBUG initDataRaw:
            </Text>
            <Text fontFamily="mono" fontSize="sm" wordBreak="break-all">
              {initData?.initDataRaw ?? '—'}
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="semibold" mt={3}>
              DEBUG initDataUnsafe.user?.id:
            </Text>
            <Text fontFamily="mono" fontSize="sm">
              {initData?.initDataUnsafe?.user?.id ?? '—'}
            </Text>
            <Text mt={3} fontSize="sm" color="gray.500">
              DEBUG location.search: {locationSearch || '—'}
            </Text>
            <Text mt={1} fontSize="sm" color="gray.500" noOfLines={3}>
              DEBUG location.href: {locationHref || '—'}
            </Text>
          </Box>
        ) : null}
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

