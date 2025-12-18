/**
 * HomePage - SmileCRM Dashboard
 * Light theme using DASHBOARD_TOKENS
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
    <Box
      minH="var(--app-height, 100vh)"
      w="100%"
      bg={T.pageBg}
      color={T.textTitle}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
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
          <DashboardCard
            icon={<Users />}
            title={t('home.patients')}
            description={t('home.patientsHelper')}
            onClick={() => navigate('/patients')}
          />
          <DashboardCard
            icon={<UserPlus />}
            title={t('home.addPatient')}
            description={t('home.addPatientHelper')}
            onClick={() => navigate('/patients/new')}
          />
          <DashboardCard
            icon={<Megaphone />}
            title={t('home.marketing')}
            description={t('home.marketingHelper')}
            onClick={() => navigate('/marketing')}
          />
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
