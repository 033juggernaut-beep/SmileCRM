/**
 * SubscriptionPage - Premium subscription management
 * UI/UX styled like main dashboard (HomePage)
 * No header, no back buttons - clean content-focused design
 */

import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Flex,
  Grid,
  Heading,
  Skeleton,
  Stack,
  Text,
  useColorMode,
  useToast,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Crown, CreditCard, Clock, CheckCircle, AlertCircle } from 'lucide-react'

import { createPayment, getSubscription } from '../api/subscription'
import type { PaymentProvider, SubscriptionSnapshot } from '../api/subscription'
import { PremiumButton } from '../components/premium/PremiumButton'
import { BackgroundPattern } from '../components/dashboard'
import { useLanguage } from '../context/LanguageContext'

const MotionDiv = motion.div

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
}

const STATUS_CONFIG: Record<SubscriptionSnapshot['status'], {
  color: string
  lightColor: string
  icon: typeof Crown
  gradient: string
}> = {
  trial: {
    color: 'blue.400',
    lightColor: 'blue.600',
    icon: Clock,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  },
  active: {
    color: 'green.400',
    lightColor: 'green.600',
    icon: CheckCircle,
    gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  },
  expired: {
    color: 'red.400',
    lightColor: 'red.600',
    icon: AlertCircle,
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  },
}

const formatDate = (value: string | null, locale: string): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  
  // Use locale-specific formatting
  const localeMap: Record<string, string> = {
    ru: 'ru-RU',
    en: 'en-US',
    am: 'hy-AM',
  }
  
  return new Intl.DateTimeFormat(localeMap[locale] || 'hy-AM', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(date)
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
  const { t, language } = useLanguage()
  const toast = useToast()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  const [snapshot, setSnapshot] = useState<SubscriptionSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [paymentInProgress, setPaymentInProgress] = useState<PaymentProvider | null>(null)

  // Status labels
  const STATUS_LABELS: Record<SubscriptionSnapshot['status'], string> = {
    trial: t('subscription.trial'),
    active: t('subscription.active'),
    expired: t('subscription.expired'),
  }

  // Payment options
  const PAYMENT_OPTIONS: { label: string; provider: PaymentProvider }[] = [
    { label: t('subscription.payIdram'), provider: 'idram' },
    { label: t('subscription.payIdbank'), provider: 'idbank' },
  ]

  const buildStatusMessage = useCallback((status: SubscriptionSnapshot['status'], formattedDate: string) => {
    switch (status) {
      case 'trial':
        return formattedDate === '—'
          ? t('subscription.trialActiveNoDate')
          : `${t('subscription.trialActive')} ${formattedDate}.`
      case 'active':
        return formattedDate === '—'
          ? t('subscription.subscriptionActiveNoDate')
          : `${t('subscription.subscriptionActive')} ${formattedDate}.`
      case 'expired':
        return t('subscription.subscriptionExpired')
      default:
        return ''
    }
  }, [t])

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const response = await getSubscription()
      setSnapshot(response)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('subscription.errorLoad')
      setErrorMessage(message)
      toast({
        title: t('subscription.errorLoad'),
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, t])

  useEffect(() => {
    void fetchSubscription()
  }, [fetchSubscription])

  const status = snapshot?.status ?? 'trial'
  const statusLabel = STATUS_LABELS[status]
  const statusConfig = STATUS_CONFIG[status]
  const StatusIcon = statusConfig.icon
  const relevantDate = status === 'trial' ? snapshot?.trialEndsAt : snapshot?.currentPeriodEnd
  const formattedDate = formatDate(relevantDate ?? null, language)
  const statusMessage = buildStatusMessage(status, formattedDate)

  const handlePayment = async (provider: PaymentProvider) => {
    setPaymentInProgress(provider)
    try {
      const { paymentUrl } = await createPayment(provider)
      openPaymentLink(paymentUrl)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('subscription.errorPayment')
      toast({
        title: t('subscription.paymentFailed'),
        description: message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setPaymentInProgress(null)
    }
  }

  // Background gradient matching HomePage
  const pageBg = isDark 
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  // Card styles matching dashboard
  const cardBg = isDark 
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  
  const cardBorder = isDark 
    ? '1px solid rgba(71, 85, 105, 0.3)'
    : '1px solid rgba(226, 232, 240, 0.8)'

  return (
    <Box
      minH="100dvh"
      w="100%"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      position="relative"
      transition="background 0.3s"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        <Flex
          as="main"
          direction="column"
          align="center"
          justify="flex-start"
          flex="1"
          px="16px"
          py={{ base: '32px', md: '48px' }}
          gap={{ base: '24px', md: '32px' }}
        >
          {/* Premium Banner Card */}
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <MotionDiv variants={itemVariants}>
              <Box
                bg={statusConfig.gradient}
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
                boxShadow="0 20px 40px -12px rgba(59, 130, 246, 0.25)"
              >
                {/* Decorative circles */}
                <Box
                  position="absolute"
                  top="-40px"
                  right="-40px"
                  w="160px"
                  h="160px"
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  filter="blur(40px)"
                />
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="-20px"
                  w="100px"
                  h="100px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  filter="blur(30px)"
                />
                
                <Flex direction="column" align="center" gap={4} position="relative">
                  {/* Icon */}
                  <Flex
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    align="center"
                    justify="center"
                  >
                    <Crown size={32} color="white" />
                  </Flex>
                  
                  <Heading 
                    size="lg" 
                    color="white" 
                    textAlign="center"
                    fontWeight="bold"
                  >
                    SmileCRM Premium
                  </Heading>
                  
                  <Text 
                    fontSize="sm" 
                    color="whiteAlpha.900" 
                    textAlign="center"
                    maxW="280px"
                  >
                    {t('subscription.premiumHint')}
                  </Text>
                </Flex>
              </Box>
            </MotionDiv>
          </MotionDiv>

          {/* Status Card */}
          <Grid
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            w="100%"
            maxW="480px"
            gap={{ base: '16px', md: '20px' }}
          >
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Stack spacing={5}>
                  {/* Status */}
                  <Flex align="center" gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={isDark ? 'rgba(59, 130, 246, 0.15)' : 'blue.50'}
                      align="center"
                      justify="center"
                    >
                      <StatusIcon 
                        size={20} 
                        color={isDark ? statusConfig.color : statusConfig.lightColor}
                        style={{ color: isDark ? '#60A5FA' : '#2563EB' }}
                      />
                    </Flex>
                    <Stack spacing={0}>
                      <Text 
                        fontSize="xs" 
                        color={isDark ? 'gray.400' : 'gray.500'} 
                        textTransform="uppercase"
                        fontWeight="medium"
                        letterSpacing="wider"
                      >
                        {t('subscription.status')}
                      </Text>
                      {isLoading ? (
                        <Skeleton height="28px" width="120px" />
                      ) : (
                        <Heading 
                          size="md" 
                          color={isDark ? 'white' : 'gray.800'}
                        >
                          {statusLabel}
                        </Heading>
                      )}
                    </Stack>
                  </Flex>

                  {/* Deadline */}
                  <Flex align="center" gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={isDark ? 'rgba(139, 92, 246, 0.15)' : 'purple.50'}
                      align="center"
                      justify="center"
                    >
                      <Clock 
                        size={20} 
                        style={{ color: isDark ? '#A78BFA' : '#7C3AED' }}
                      />
                    </Flex>
                    <Stack spacing={0}>
                      <Text 
                        fontSize="xs" 
                        color={isDark ? 'gray.400' : 'gray.500'} 
                        textTransform="uppercase"
                        fontWeight="medium"
                        letterSpacing="wider"
                      >
                        {t('subscription.deadline')}
                      </Text>
                      {isLoading ? (
                        <Skeleton height="24px" width="160px" />
                      ) : (
                        <Text 
                          fontWeight="semibold" 
                          fontSize="md" 
                          color={isDark ? 'white' : 'gray.800'}
                        >
                          {formattedDate}
                        </Text>
                      )}
                    </Stack>
                  </Flex>

                  {/* Status Message */}
                  <Alert 
                    status="info" 
                    borderRadius="xl"
                    bg={isDark ? 'rgba(59, 130, 246, 0.1)' : 'blue.50'}
                    border="1px solid"
                    borderColor={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.100'}
                  >
                    <AlertIcon color={isDark ? 'blue.400' : 'blue.500'} />
                    <AlertDescription 
                      fontSize="sm"
                      color={isDark ? 'blue.200' : 'blue.700'}
                    >
                      {isLoading ? t('common.loading') : statusMessage}
                    </AlertDescription>
                  </Alert>

                  {errorMessage && (
                    <Alert 
                      status="error" 
                      borderRadius="xl"
                      bg={isDark ? 'rgba(239, 68, 68, 0.1)' : 'red.50'}
                    >
                      <AlertIcon />
                      <AlertDescription fontSize="sm">{errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </Stack>
              </Box>
            </MotionDiv>

            {/* Payment Options */}
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Stack spacing={4}>
                  <Flex align="center" gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={isDark ? 'rgba(34, 197, 94, 0.15)' : 'green.50'}
                      align="center"
                      justify="center"
                    >
                      <CreditCard 
                        size={20} 
                        style={{ color: isDark ? '#4ADE80' : '#16A34A' }}
                      />
                    </Flex>
                    <Stack spacing={0}>
                      <Heading 
                        size="sm" 
                        color={isDark ? 'white' : 'gray.800'}
                      >
                        {t('subscription.paymentOptions')}
                      </Heading>
                      <Text 
                        fontSize="xs" 
                        color={isDark ? 'gray.400' : 'gray.500'}
                      >
                        {t('subscription.choosePayment')}
                      </Text>
                    </Stack>
                  </Flex>

                  <Stack spacing={3}>
                    {PAYMENT_OPTIONS.map((option) => (
                      <PremiumButton
                        key={option.provider}
                        onClick={() => handlePayment(option.provider)}
                        isLoading={paymentInProgress === option.provider}
                        loadingText={t('subscription.opening')}
                        size="lg"
                        w="full"
                      >
                        {option.label}
                      </PremiumButton>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </MotionDiv>

            {/* Info Hint */}
            <MotionDiv variants={itemVariants}>
              <Text 
                fontSize="xs" 
                color={isDark ? 'gray.500' : 'gray.400'}
                textAlign="center"
                px={4}
              >
                {t('subscription.hint')}
              </Text>
            </MotionDiv>
          </Grid>
        </Flex>
      </Box>
    </Box>
  )
}
