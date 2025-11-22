import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Heading,
  Skeleton,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'

import { createPayment, getSubscription } from '../api/subscription'
import type { PaymentProvider, SubscriptionSnapshot } from '../api/subscription'

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
    <Stack spacing={6}>
      <Stack spacing={1}>
        <Heading size="md">Բաժանորդագրություն</Heading>
        <Text fontSize="sm" color="gray.500">
          Կառավարեք ձեր Dental Mini App փորձաշրջանը այստեղ.
        </Text>
      </Stack>

      <Stack
        spacing={4}
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="teal.100"
        p={6}
        boxShadow="sm"
      >
        <Stack spacing={0}>
          <Text fontSize="sm" color="gray.500">
            Վերաբերման կարգավիճակ
          </Text>
          {isLoading ? (
            <Skeleton height="32px" width="120px" />
          ) : (
            <Heading size="lg" color={STATUS_COLORS[status]}>
              {statusLabel}
            </Heading>
          )}
        </Stack>

        <Stack spacing={0}>
          <Text fontSize="sm" color="gray.500">
            Վերջնաժամկետ
          </Text>
          {isLoading ? (
            <Skeleton height="20px" width="160px" />
          ) : (
            <Text fontWeight="semibold">{formattedDate}</Text>
          )}
        </Stack>

        <Alert status="info" borderRadius="md">
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

        <Stack spacing={3}>
          {PAYMENT_OPTIONS.map((option) => (
            <Button
              key={option.provider}
              colorScheme="teal"
              variant="outline"
              onClick={() => handlePayment(option.provider)}
              isLoading={paymentInProgress === option.provider}
              loadingText="Բացում..."
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}

