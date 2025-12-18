/**
 * HomePage - SmileCRM Dashboard
 * Superdesign exact copy using DASHBOARD_TOKENS
 * 
 * Structure: Header -> WelcomeBlock -> DashboardGrid -> Footer
 * Forced light theme (pageBg overrides any global dark styles)
 */

import { Box, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react';
import {
  DASHBOARD_TOKENS as T,
  Header,
  WelcomeBlock,
  DashboardGrid,
  DashboardCard,
  Footer,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ];

  return (
    // Light theme isolator - covers any dark global/body backgrounds
    <Box
      position="absolute"
      inset={0}
      w="100%"
      h="100%"
      minH="var(--app-height, 100vh)"
      bg={T.pageBg}
      color={T.textTitle}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      // Ensure this covers any inherited dark backgrounds
      zIndex={1}
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
        px={T.paddingPageX}
        py={{ base: T.paddingPageY, md: T.paddingPageYMd }}
        gap={{ base: T.gapMain, md: T.gapMainMd }}
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
