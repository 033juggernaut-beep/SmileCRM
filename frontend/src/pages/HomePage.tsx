import { Box, Flex, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { Dashboard, DashboardCard, StatisticsCard } from '../components/dashboard'
import { useLanguage } from '../context/LanguageContext'

export const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <PremiumLayout 
      title="SmileCRM" 
      showHeader={false}
      background="gradient"
      safeAreaBottom
    >
      <Dashboard
        header={{
          title: t('home.welcome'),
          subtitle: t('home.subtitle'),
          quote: t('home.quote'),
        }}
        columns={2}
        gap={3}
      >
        {/* Card 1: My Patients */}
        <DashboardCard
          title={t('home.patients')}
          subtitle={t('home.patientsHelper')}
          icon={<Users />}
          onClick={() => navigate('/patients')}
        />

        {/* Card 2: Add Patient */}
        <DashboardCard
          title={t('home.addPatient')}
          subtitle={t('home.addPatientHelper')}
          icon={<UserPlus />}
          onClick={() => navigate('/patients/new')}
        />

        {/* Card 3: Marketing */}
        <DashboardCard
          title={t('home.marketing')}
          subtitle={t('home.marketingHelper')}
          icon={<Megaphone />}
          onClick={() => navigate('/marketing')}
        />

        {/* Card 4: Statistics */}
        <StatisticsCard
          title={t('home.statistics')}
          icon={<TrendingUp />}
          stats={[
            { value: '247', label: t('home.totalPatients') },
            { value: '8', label: t('home.todayVisits') },
          ]}
          onClick={() => navigate('/patients')}
        />
      </Dashboard>

      {/* Footer Links - Text only, no icons */}
      <Flex
        justify="center"
        gap={6}
        mt={6}
        pb={4}
        flexWrap="wrap"
      >
        <FooterLink
          label={t('home.subscription')}
          onClick={() => navigate('/subscription')}
        />
        <FooterLink
          label={t('home.help')}
          onClick={() => navigate('/help')}
        />
        <FooterLink
          label={t('home.privacy')}
          onClick={() => navigate('/privacy')}
        />
      </Flex>
    </PremiumLayout>
  )
}

/** Footer link - minimal text only */
function FooterLink({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      color="text.muted"
      fontSize="sm"
      fontWeight="medium"
      transition="color 150ms ease"
      _active={{ color: 'text.primary' }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Text>{label}</Text>
    </Box>
  )
}
