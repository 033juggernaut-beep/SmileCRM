import { Box, Flex, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Megaphone, TrendingUp, CreditCard, HelpCircle, Shield } from 'lucide-react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { Dashboard, DashboardCard, StatisticsCard } from '../components/dashboard'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'

export const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <PremiumLayout 
      title="SmileCRM" 
      showBack={false}
      background="gradient"
      safeAreaBottom
      headerRightElement={<LanguageSwitcher />}
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

      {/* Footer Links */}
      <Flex
        justify="center"
        gap={6}
        mt={6}
        pb={4}
        flexWrap="wrap"
      >
        <FooterLink
          icon={<CreditCard size={16} />}
          label={t('home.subscription')}
          onClick={() => navigate('/subscription')}
        />
        <FooterLink
          icon={<HelpCircle size={16} />}
          label={t('home.help')}
          onClick={() => navigate('/help')}
        />
        <FooterLink
          icon={<Shield size={16} />}
          label={t('home.privacy')}
          onClick={() => navigate('/privacy')}
        />
      </Flex>
    </PremiumLayout>
  )
}

/** Footer link component */
function FooterLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={1.5}
      color="text.muted"
      fontSize="sm"
      fontWeight="medium"
      transition="color 150ms ease"
      _hover={{ color: 'text.secondary' }}
      _active={{ color: 'text.primary' }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      <Text>{label}</Text>
    </Box>
  )
}
