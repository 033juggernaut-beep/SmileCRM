/**
 * StatsPage - Statistics page matching Superdesign reference 1:1
 * 
 * Features:
 * - General metrics: Total patients, Active, VIP
 * - Finance: Today revenue, Month revenue, Month expenses
 * - Visits: Period breakdown with toggle
 * - Visit dynamics: Line chart with animation
 * - All styled with Chakra UI (no Tailwind)
 */

import { useState } from 'react'
import { Box, SimpleGrid, useColorMode } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Users, Activity, Crown, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

import { Header } from '../components/dashboard/Header'
import { Footer } from '../components/dashboard/Footer'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'
import { BackButton } from '../components/patientCard/BackButton'
import { useLanguage } from '../context/LanguageContext'

import {
  StatCard,
  StatsSection,
  StatisticsHeader,
  VisitsCard,
  VisitDynamicsChart,
} from '../components/statistics'
import type { VisitPeriod } from '../components/statistics'

const MotionMain = motion.create(Box)

export const StatsPage = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'
  const [period, setPeriod] = useState<VisitPeriod>('7d')

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

  // Mock data - ready to be replaced with real API data
  const mockData = {
    totalPatients: '1,247',
    activePatients: '854',
    vipPatients: '87',
    todayRevenue: '42,500 ₽',
    monthRevenue: '1.24 M ₽',
    monthExpenses: '486,200 ₽',
    todayVisits: 14,
    weekVisits: 84,
    monthVisits: 345,
  }

  return (
    <Box
      minH="100vh"
      w="full"
      position="relative"
      transition="colors 0.3s"
      bg={pageBg}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDirection="column" minH="100vh">
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
          gap={{ base: 8, md: 10 }}
        >
          <Box w="full" maxW="3xl" mx="auto" px={2}>
            {/* Back Button */}
            <Box mb={4}>
              <BackButton onClick={() => navigate('/home')} />
            </Box>

            {/* Page Title Block */}
            <StatisticsHeader />

            {/* Stats Grid - Two columns on large screens */}
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
                    <StatCard
                      icon={<Users />}
                      badge={t('stats.total')}
                      value={mockData.totalPatients}
                      label={t('stats.totalPatients')}
                      color="blue"
                    />
                    <StatCard
                      icon={<Activity />}
                      badge={t('stats.active')}
                      value={mockData.activePatients}
                      label={t('stats.activePatients')}
                      color="emerald"
                    />
                    <StatCard
                      icon={<Crown />}
                      badge={t('stats.vip')}
                      value={mockData.vipPatients}
                      label={t('stats.vipPatients')}
                      color="amber"
                    />
                  </SimpleGrid>
                </StatsSection>

                {/* Section 2: Finance */}
                <StatsSection
                  title={t('stats.finance')}
                  icon={<Wallet />}
                  delay={0.2}
                >
                  <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
                    <StatCard
                      icon={<Wallet />}
                      badge="+12%"
                      value={mockData.todayRevenue}
                      label={t('stats.todayRevenue')}
                      color="emerald"
                    />
                    <StatCard
                      icon={<TrendingUp />}
                      badge={t('stats.month')}
                      value={mockData.monthRevenue}
                      label={t('stats.monthRevenue')}
                      color="slate"
                    />
                    <StatCard
                      icon={<TrendingDown />}
                      badge="-3%"
                      value={mockData.monthExpenses}
                      label={t('stats.monthExpenses')}
                      color="red"
                    />
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
                    onPeriodChange={setPeriod}
                    todayVisits={mockData.todayVisits}
                    weekVisits={mockData.weekVisits}
                    monthVisits={mockData.monthVisits}
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
                    onPeriodChange={setPeriod}
                  />
                </StatsSection>
              </Box>
            </SimpleGrid>
          </Box>
        </MotionMain>

        {/* Footer */}
        <Footer links={footerLinks} />
      </Box>
    </Box>
  )
}

export default StatsPage
