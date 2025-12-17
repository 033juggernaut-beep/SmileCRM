/**
 * HomePage - SmileCRM Dashboard (Superdesign Blue Theme)
 * 
 * FORCED LIGHT MODE - No global theme dependency
 * All styles hardcoded to match Superdesign reference exactly
 */

import { Box, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react';
import {
  Header,
  WelcomeBlock,
  DashboardGrid,
  DashboardCard,
  Footer,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';

// =============================================
// 🎨 LIGHT THEME COLORS (Superdesign Reference)
// =============================================
const COLORS = {
  // Page background: gradient from slate-50 via blue-50/30 to sky-50/50
  pageBg: 'linear-gradient(135deg, #f8fafc 0%, rgba(239, 246, 255, 0.3) 50%, rgba(240, 249, 255, 0.5) 100%)',
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Footer links configuration
  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ];

  return (
    <Box
      minH="100vh"
      w="100%"
      bg={COLORS.pageBg}
      // Force light mode text color
      color="#1e293b"
    >
      {/* Header */}
      <Header notificationCount={3} />

      {/* Main Content */}
      <Flex
        as="main"
        direction="column"
        align="center"
        justify="flex-start"
        flex="1"
        px={4}
        py={{ base: 8, md: 12 }}            // py-8 md:py-12
        gap={{ base: 8, md: 10 }}           // gap-8 md:gap-10
      >
        {/* Welcome Block */}
        <WelcomeBlock
          title={t('home.welcome')}
          subtitle={t('home.subtitle')}
        />

        {/* Dashboard Cards Grid */}
        <DashboardGrid animated>
          {/* Card 1: My Patients */}
          <DashboardCard
            icon={<Users />}
            title={t('home.patients')}
            description={t('home.patientsHelper')}
            onClick={() => navigate('/patients')}
          />

          {/* Card 2: Add Patient */}
          <DashboardCard
            icon={<UserPlus />}
            title={t('home.addPatient')}
            description={t('home.addPatientHelper')}
            onClick={() => navigate('/patients/new')}
          />

          {/* Card 3: Marketing */}
          <DashboardCard
            icon={<Megaphone />}
            title={t('home.marketing')}
            description={t('home.marketingHelper')}
            onClick={() => navigate('/marketing')}
          />

          {/* Card 4: Statistics */}
          <DashboardCard
            icon={<TrendingUp />}
            title={t('home.statistics')}
            stats={[
              { label: t('home.totalPatients'), value: 1247 },
              { label: t('home.todayVisits'), value: 12 },
            ]}
            onClick={() => navigate('/stats')}
          />
        </DashboardGrid>
      </Flex>

      {/* Footer */}
      <Footer links={footerLinks} />
    </Box>
  );
};

export default HomePage;
