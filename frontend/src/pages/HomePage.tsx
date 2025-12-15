import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, Megaphone, CreditCard, HelpCircle, Shield } from 'lucide-react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { Dashboard, DashboardCard } from '../components/dashboard'
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
        {/* Primary Card - Patients */}
        <DashboardCard
          title={t('home.patients')}
          subtitle={t('home.patientsHelper')}
          icon={<Users />}
          isPrimary
          onClick={() => navigate('/patients')}
        />

        {/* Add Patient */}
        <DashboardCard
          title={t('home.addPatient')}
          subtitle={t('home.addPatientHelper')}
          icon={<UserPlus />}
          onClick={() => navigate('/patients/new')}
        />

        {/* Marketing */}
        <DashboardCard
          title={t('home.marketing')}
          subtitle={t('home.marketingHelper')}
          icon={<Megaphone />}
          onClick={() => navigate('/marketing')}
        />

        {/* Subscription */}
        <DashboardCard
          title={t('home.subscription')}
          subtitle={t('home.subscriptionHelper')}
          icon={<CreditCard />}
          onClick={() => navigate('/subscription')}
        />

        {/* Help */}
        <DashboardCard
          title={t('home.help')}
          subtitle={t('home.helpHelper')}
          icon={<HelpCircle />}
          onClick={() => navigate('/help')}
        />

        {/* Privacy */}
        <DashboardCard
          title={t('home.privacy')}
          subtitle={t('home.privacyHelper')}
          icon={<Shield />}
          onClick={() => navigate('/privacy')}
        />
      </Dashboard>
    </PremiumLayout>
  )
}
