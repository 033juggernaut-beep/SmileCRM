/**
 * HomePage - SmileCRM Dashboard
 * Exact match to Superdesign reference
 * Light: bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/50
 * Dark: bg-slate-900
 * 
 * Uses sticky Header with Telegram safe area support
 */

import { Box, Flex, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react';
import {
  Header,
  WelcomeBlock,
  DashboardGrid,
  DashboardCard,
  Footer,
  BackgroundPattern,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea';

export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  // Get safe area info for Telegram
  const { isInTelegram, platform, topInset, rightInset } = useTelegramSafeArea();
  
  // Log Telegram info for debugging (only in development)
  if (import.meta.env.DEV && isInTelegram) {
    console.log('[HomePage] Telegram detected:', { platform, topInset, rightInset });
  }

  // Reference: from-slate-50 via-blue-50/30 to-sky-50/50 (light) / bg-slate-900 (dark)
  const pageBg = isDark 
    ? '#0F172A' // slate-900
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))';

  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ];

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
      {/* Subtle Background Pattern */}
      <BackgroundPattern />

      {/* Main Content - z-10 relative */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        {/* Header */}
        <Header notificationCount={3} />

        {/* Main Content Area */}
        {/* Reference: px-4 py-8 md:py-12 gap-8 md:gap-10 */}
        <Flex
          as="main"
          direction="column"
          align="center"
          justify="flex-start"
          flex="1"
          px="16px" // px-4
          py={{ base: '32px', md: '48px' }} // py-8 md:py-12
          gap={{ base: '32px', md: '40px' }} // gap-8 md:gap-10
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
    </Box>
  );
};

export default HomePage;
