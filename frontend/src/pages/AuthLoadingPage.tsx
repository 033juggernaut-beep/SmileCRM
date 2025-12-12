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
import axios from 'axios'
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
        
        if (axios.isAxiosError(err) && err.response?.data?.detail) {
          errorMessage = `${errorMessage}: ${err.response.data.detail}`
          console.error('[AUTH] Server error detail:', err.response.data.detail)
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

  // If not in Telegram app OR initData is missing, show friendly message with link to bot
  // This covers both cases: opened in browser OR Telegram WebApp not properly initialized
  if (!initData.isInTelegram || !initData.initDataRaw) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bg.gray"
        p={4}
      >
        <Stack
          spacing={6}
          textAlign="center"
          bg="white"
          borderRadius="md"
          p={8}
          maxW="md"
          boxShadow="premiumLg"
          borderWidth="1px"
          borderColor="border.light"
        >
          <Box fontSize="6xl">📱</Box>
          
          <Stack spacing={2}>
            <Heading size="lg" color="primary.500">
              Dental Mini App
            </Heading>
            <Text fontSize="md" color="text.muted">
              Это мини-приложение работает только внутри Telegram
            </Text>
          </Stack>
          
          <Stack spacing={3} pt={2}>
            <Text fontSize="sm" color="text.muted">
              Чтобы использовать приложение:
            </Text>
            <Stack spacing={2} align="center">
              <Text fontSize="sm" color="text.main">
                1️⃣ Откройте Telegram на вашем устройстве
              </Text>
              <Text fontSize="sm" color="text.main">
                2️⃣ Найдите бота <strong>@SmileCRM_bot</strong>
              </Text>
              <Text fontSize="sm" color="text.main">
                3️⃣ Нажмите кнопку <strong>"Բացել Mini App"</strong>
              </Text>
            </Stack>
          </Stack>
          
          <Button
            as="a"
            href="https://t.me/SmileCRM_bot"
            target="_blank"
            bg="primary.500"
            color="white"
            size="lg"
            leftIcon={<Text fontSize="xl">▶️</Text>}
            _hover={{ bg: 'primary.600' }}
          >
            Открыть @SmileCRM_bot
          </Button>
          
          <Text fontSize="xs" color="text.muted">
            Приложение доступно только через Telegram
          </Text>
        </Stack>
      </Box>
    )
  }

  if (error) {
    return (
      <Stack spacing={4}>
        <Box 
          bg="white" 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor="border.light" 
          boxShadow="premium"
          p={6}
        >
          <Stack spacing={4}>
            <Heading size="md" color="text.main">Пробуем авторизоваться…</Heading>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
            <Button 
              onClick={handleRetry} 
              bg="primary.500"
              color="white"
              _hover={{ bg: 'primary.600' }}
              isLoading={isAuthenticating}
            >
              Повторить попытку
            </Button>
          </Stack>
        </Box>
        {debugEnabled ? (
          <Box
            borderWidth="1px"
            borderRadius="md"
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
    borderRadius="md"
    borderWidth="1px"
    borderColor="border.light"
    boxShadow="premium"
    p={6}
  >
    {isBusy && <Spinner size="lg" color="primary.500" thickness="4px" />}
    <Heading size="md" color="text.main">{title}</Heading>
    <Text fontSize="sm" color="text.muted">
      {subtitle}
    </Text>
  </Stack>
)


