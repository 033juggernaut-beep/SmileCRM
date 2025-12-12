import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'

import { createPayment, getSubscription } from '../api/subscription'
import type { PaymentProvider, SubscriptionSnapshot } from '../api/subscription'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { gradients } from '../theme/premiumTheme'

const STATUS_LABELS: Record<SubscriptionSnapshot['status'], string> = {
  trial: 'Trial',
  active: 'Active',
  expired: 'Expired',
}

const STATUS_COLORS: Record<SubscriptionSnapshot['status'], string> = {
  trial: 'teal.600',
  active: 'green.600',
  expired: 'red.500',
}

const PAYMENT_OPTIONS: { label: string; provider: PaymentProvider }[] = [
  { label: 'Վճարել Idram-ով', provider: 'idram' },
  { label: 'Վճարել IDBank Pay-ով', provider: 'idbank' },
]

const formatDate = (value: string | null): string => {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '—'
  }
  return new Intl.DateTimeFormat('hy-AM', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(date)
}

const buildStatusMessage = (status: SubscriptionSnapshot['status'], formattedDate: string) => {
  switch (status) {
    case 'trial':
      return formattedDate === '—'
        ? 'Փորձաշրջանը ակտիվ է, հետեւեք ավարտի օրվան.'
        : `Փորձաշրջանը ակտիվ է մինչև ${formattedDate}.`
    case 'active':
      return formattedDate === '—'
        ? 'Բաժանորդագրությունը ակտիվ է.'
        : `Բաժանորդագրությունը ակտիվ է մինչև ${formattedDate}.`
    case 'expired':
      return 'Բաժանորդագրությունը սպառված է։ Շարունակելու համար կատարեք վճարում։'
    default:
      return ''
  }
}

const openPaymentLink = (url: string) => {
  if (typeof window === 'undefined') return
  const telegram = window.Telegram?.WebApp
  if (telegram?.openLink) {
    telegram.openLink(url)
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const SubscriptionPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentInProgress, setPaymentInProgress] = useState<PaymentProvider | null>(null)

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await getSubscription()
      setSnapshot(response)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Չհաջողվեց ստանալ բաժանորդագրության վիճակը'
      setErrorMessage(message)
      toast({
        title: 'Չհաջողվեց ստանալ բաժանորդագրությունը',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchSubscription()
  }, [fetchSubscription])

  const status = snapshot?.status ?? 'trial'
  const statusLabel = STATUS_LABELS[status]
  const relevantDate = status === 'trial' ? snapshot?.trialEndsAt : snapshot?.currentPeriodEnd
  const formattedDate = formatDate(relevantDate ?? null)
  const statusMessage = buildStatusMessage(status, formattedDate)

  const handlePayment = async (provider: PaymentProvider) => {
    setPaymentInProgress(provider)
    try {
      const { paymentUrl } = await createPayment(provider)
      openPaymentLink(paymentUrl)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Չհաջողվեց սկսել վճարումը'
      toast({
        title: 'Վճարումը ձախողվեց',
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setPaymentInProgress(null)
    }
  }

  return (
    <PremiumLayout 
      title="Բաժանորդագրություն" 
      showBack={true}
      onBack={() => navigate('/home')}
      background="gradient"
    >
      <Stack spacing={5}>
        {/* Premium Banner */}
        <Box
          background={gradients.navy}
          borderRadius="md"
          p={6}
          position="relative"
          overflow="hidden"
        >
          {/* Decorative elements */}
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="120px"
            h="120px"
            borderRadius="full"
            bg="whiteAlpha.100"
            filter="blur(30px)"
          />
          
          <Flex direction="column" align="center" gap={3} position="relative">
            <Text fontSize="4xl" lineHeight="1">🦷</Text>
            <Heading size="lg" color="white" textAlign="center">
              SmileCRM Premium
            </Heading>
            <Text fontSize="sm" color="whiteAlpha.800" textAlign="center">
              Կառավարեք ձեր փորձաշրջանը և բաժանորդագրությունը
            </Text>
          </Flex>
        </Box>

        {/* Subscription Status Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Stack spacing={2}>
              <Text fontSize="sm" color="text.muted" textTransform="uppercase">
                Կարգավիճակ
              </Text>
              {isLoading ? (
                <Skeleton height="36px" width="140px" />
              ) : (
                <Heading size="xl" color={STATUS_COLORS[status]}>
                  {statusLabel}
                </Heading>
              )}
            </Stack>

            <Stack spacing={2}>
              <Text fontSize="sm" color="text.muted" textTransform="uppercase">
                Վերջնաժամկետ
              </Text>
              {isLoading ? (
                <Skeleton height="24px" width="180px" />
              ) : (
                <Text fontWeight="semibold" fontSize="lg" color="text.main">
                  {formattedDate}
                </Text>
              )}
            </Stack>

            <Alert status="info" borderRadius="md" mt={2}>
              <AlertIcon />
              <AlertDescription fontSize="sm">
                {isLoading ? 'Բեռնվում է...' : statusMessage}
              </AlertDescription>
            </Alert>

            {errorMessage && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">{errorMessage}</AlertDescription>
              </Alert>
            )}
          </Stack>
        </PremiumCard>

        {/* Payment Options Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={4}>
            <Stack spacing={1}>
              <Heading size="md" color="text.main">
                Վճարման տարբերակներ
              </Heading>
              <Text fontSize="sm" color="text.muted">
                Ընտրեք հարմար վճարման համակարգը
              </Text>
            </Stack>

            <Stack spacing={3}>
              {PAYMENT_OPTIONS.map((option) => (
                <PremiumButton
                  key={option.provider}
                  onClick={() => handlePayment(option.provider)}
                  isLoading={paymentInProgress === option.provider}
                  loadingText="Բացում..."
                  size="lg"
                  w="full"
                >
                  {option.label}
                </PremiumButton>
              ))}
            </Stack>
          </Stack>
        </PremiumCard>

        {/* Info Card */}
        <PremiumCard variant="flat">
          <Stack spacing={2}>
            <Text fontSize="sm" color="text.muted">
              💡 <strong>Հուշում:</strong> Փորձաշրջանը տևում է 7 օր անվճար։ 
              Բաժանորդագրությունը ամսական 5000 դրամ է։
            </Text>
          </Stack>
        </PremiumCard>
      </Stack>
    </PremiumLayout>
  )
}

