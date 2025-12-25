/**
 * StatsPage - Statistics page with real data from API
 * 
 * Features:
 * - General metrics: Total patients, Active, VIP
 * - Finance: Today revenue, Month revenue, Month expenses (AMD)
 * - Visits: Period breakdown with toggle
 * - Visit dynamics: Line chart with animation
 * - All styled with Chakra UI (no Tailwind)
 */

import { useState, useCallback, useEffect } from 'react'
import { Box, SimpleGrid, useColorMode, Skeleton, VStack, Text, Button, Flex } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Users, Activity, Crown, Wallet, TrendingUp, TrendingDown, Calendar, RefreshCw, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'

import { Header } from '../components/dashboard/Header'
import { Footer } from '../components/dashboard/Footer'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'
import { BackButton } from '../components/patientCard/BackButton'
import { useLanguage } from '../context/LanguageContext'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { statsApi, type StatsOverview, type StatsRange } from '../api/stats'

import {
  StatCard,
  StatsSection,
  StatisticsHeader,
  VisitsCard,
  VisitDynamicsChart,
} from '../components/statistics'
import type { VisitPeriod } from '../components/statistics'

const MotionMain = motion.create(Box)

/**
 * Format AMD currency with thousands separator, no decimals
 */
function formatAMD(amount: number): string {
  return new Intl.NumberFormat('hy-AM', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' ֏'
}

/**
 * Format number with thousands separator
 */
function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export const StatsPage = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'
  const [period, setPeriod] = useState<VisitPeriod>('7d')
  
  // API state
  const [data, setData] = useState<StatsOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const handleBack = useCallback(() => navigate('/home'), [navigate])
  const { showFallbackButton } = useTelegramBackButton(handleBack)

  // Page background
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  // Footer links
  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ]

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await statsApi.getOverview(period as StatsRange)
      setData(result)
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
      setError(t('stats.loadError') || 'Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }, [period, t])

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Handle period change - refetch data
  const handlePeriodChange = (newPeriod: VisitPeriod) => {
    setPeriod(newPeriod)
    // Data will be refetched via useEffect
  }

  // Error state component
  const ErrorState = () => (
    <Box 
      textAlign="center" 
      py={12}
      px={4}
    >
      <Flex
        w="64px"
        h="64px"
        mx="auto"
        mb={4}
        borderRadius="full"
        bg={isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2'}
        alignItems="center"
        justifyContent="center"
      >
        <AlertTriangle 
          size={28} 
          color={isDark ? '#F87171' : '#DC2626'}
        />
      </Flex>
      <Text
        fontSize="md"
        fontWeight="medium"
        color={isDark ? 'slate.300' : 'slate.700'}
        mb={2}
      >
        {error}
      </Text>
      <Button
        leftIcon={<RefreshCw size={16} />}
        onClick={fetchStats}
        size="sm"
        colorScheme="blue"
        variant="ghost"
        mt={4}
      >
        {t('common.retry') || 'Retry'}
      </Button>
    </Box>
  )

  // Skeleton loading for stat cards
  const StatCardSkeleton = () => (
    <Box
      borderRadius="xl"
      p={5}
      bg={isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'}
    >
      <Flex align="flex-start" justify="space-between" mb={4}>
        <Skeleton w="40px" h="40px" borderRadius="lg" />
        <Skeleton w="50px" h="24px" borderRadius="full" />
      </Flex>
      <VStack align="start" spacing={2}>
        <Skeleton h="16px" w="80px" />
        <Skeleton h="32px" w="100px" />
      </VStack>
    </Box>
  )

  return (
    <Box
      minH="100dvh"
      w="full"
      position="relative"
      transition="colors 0.3s"
      bg={pageBg}
      overflowY="auto"
      overflowX="hidden"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDirection="column" minH="100dvh" sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}>
        {/* Header */}
        <Header />

        {/* Content */}
        <MotionMain
          as="main"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          flex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="flex-start"
          px={4}
          py={{ base: 8, md: 12 }}
          pt={topInset > 0 ? `${topInset + 32}px` : { base: 8, md: 12 }}
          gap={{ base: 8, md: 10 }}
        >
          <Box w="full" maxW="3xl" mx="auto" px={2}>
            {/* Back Button - only show if not in Telegram */}
            {showFallbackButton && (
              <Box mb={4}>
                <BackButton onClick={handleBack} />
              </Box>
            )}

            {/* Page Title Block */}
            <StatisticsHeader />

            {/* Error State */}
            {error && !isLoading && <ErrorState />}

            {/* Stats Grid - Two columns on large screens */}
            {!error && (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} maxW="3xl" mx="auto">
                {/* Left Column */}
                <Box>
                  {/* Section 1: General Metrics */}
                  <StatsSection
                    title={t('stats.generalMetrics')}
                    icon={<Activity />}
                    delay={0.1}
                  >
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                      {isLoading ? (
                        <>
                          <StatCardSkeleton />
                          <StatCardSkeleton />
                          <StatCardSkeleton />
                        </>
                      ) : (
                        <>
                          <StatCard
                            icon={<Users />}
                            badge={t('stats.total')}
                            value={formatNumber(data?.patients_total ?? 0)}
                            label={t('stats.totalPatients')}
                            color="blue"
                          />
                          <StatCard
                            icon={<Activity />}
                            badge={t('stats.active')}
                            value={formatNumber(data?.patients_active ?? 0)}
                            label={t('stats.activePatients')}
                            color="emerald"
                          />
                          <StatCard
                            icon={<Crown />}
                            badge={t('stats.vip')}
                            value={formatNumber(data?.patients_vip ?? 0)}
                            label={t('stats.vipPatients')}
                            color="amber"
                          />
                        </>
                      )}
                    </SimpleGrid>
                  </StatsSection>

                  {/* Section 2: Finance */}
                  <StatsSection
                    title={t('stats.finance')}
                    icon={<Wallet />}
                    delay={0.2}
                  >
                    <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                      {isLoading ? (
                        <>
                          <StatCardSkeleton />
                          <StatCardSkeleton />
                          <StatCardSkeleton />
                        </>
                      ) : (
                        <>
                          <StatCard
                            icon={<Wallet />}
                            badge={t('stats.today')}
                            value={formatAMD(data?.finance_today_income_amd ?? 0)}
                            label={t('stats.todayRevenue')}
                            color="emerald"
                          />
                          <StatCard
                            icon={<TrendingUp />}
                            badge={t('stats.month')}
                            value={formatAMD(data?.finance_month_income_amd ?? 0)}
                            label={t('stats.monthRevenue')}
                            color="slate"
                          />
                          <StatCard
                            icon={<TrendingDown />}
                            badge={t('stats.month')}
                            value={formatAMD(data?.finance_month_expense_amd ?? 0)}
                            label={t('stats.monthExpenses')}
                            color="red"
                          />
                        </>
                      )}
                    </SimpleGrid>
                  </StatsSection>
                </Box>

                {/* Right Column */}
                <Box>
                  {/* Section 3: Visits */}
                  <StatsSection
                    title={t('stats.visits')}
                    icon={<Calendar />}
                    delay={0.3}
                  >
                    <VisitsCard
                      period={period}
                      onPeriodChange={handlePeriodChange}
                      todayVisits={data?.visits_today ?? 0}
                      weekVisits={data?.visits_last_7d ?? 0}
                      monthVisits={data?.visits_last_30d ?? 0}
                      isLoading={isLoading}
                    />
                  </StatsSection>

                  {/* Section 4: Visit Dynamics */}
                  <StatsSection
                    title={t('stats.visitDynamics')}
                    icon={<TrendingUp />}
                    delay={0.4}
                  >
                    <VisitDynamicsChart
                      period={period}
                      onPeriodChange={handlePeriodChange}
                      visitsSeries={data?.visits_series ?? []}
                      totalVisits={period === '7d' ? data?.visits_last_7d : data?.visits_last_30d}
                      isLoading={isLoading}
                    />
                  </StatsSection>
                </Box>
              </SimpleGrid>
            )}
          </Box>
        </MotionMain>

        {/* Footer */}
        <Footer links={footerLinks} />
      </Box>
    </Box>
  )
}

export default StatsPage
