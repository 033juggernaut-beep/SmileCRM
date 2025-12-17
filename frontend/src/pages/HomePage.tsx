import { Box, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react';
import {
  WelcomeBlock,
  DashboardGrid,
  SuperDashboardCard,
  SuperStatisticsCard,
} from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';

// =============================================
// 🎨 HOMEPAGE — FORCED LIGHT THEME (Superdesign)
// No global dark theme, no useColorModeValue
// =============================================

// Force light mode (temporary toggle for testing)
const FORCE_LIGHT = true;

// Light theme colors (hardcoded, no theme tokens)
const LIGHT = {
  pageBg: '#F7FAFF',
  footerColor: '#64748B',
  footerHoverColor: '#0F172A',
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Always use light styles when FORCE_LIGHT is true
  if (!FORCE_LIGHT) {
    return null; // Fallback (not used)
  }

  return (
    <Box
      minH="100vh"
      w="100%"
      bg={LIGHT.pageBg}
      // Remove any inherited dark styles
      color="#0F172A"
    >
      {/* Main Content Container */}
      <Box
        maxW="960px"
        mx="auto"
        px={{ base: 5, md: 8 }}
        py={{ base: 6, md: 10 }}
      >
        {/* Welcome Block */}
        <Box mb={6}>
          <WelcomeBlock
            title={t('home.welcome')}
            subtitle={t('home.subtitle')}
          />
        </Box>

        {/* Dashboard Cards Grid */}
        <DashboardGrid columns={{ base: 1, sm: 2 }} gap={16} animated>
          {/* Card 1: My Patients */}
          <SuperDashboardCard
            title={t('home.patients')}
            description={t('home.patientsHelper')}
            icon={<Users />}
            onClick={() => navigate('/patients')}
          />

          {/* Card 2: Add Patient */}
          <SuperDashboardCard
            title={t('home.addPatient')}
            description={t('home.addPatientHelper')}
            icon={<UserPlus />}
            onClick={() => navigate('/patients/new')}
          />

          {/* Card 3: Marketing */}
          <SuperDashboardCard
            title={t('home.marketing')}
            description={t('home.marketingHelper')}
            icon={<Megaphone />}
            onClick={() => navigate('/marketing')}
          />

          {/* Card 4: Statistics */}
          <SuperStatisticsCard
            title={t('home.statistics')}
            icon={<TrendingUp />}
            stats={[
              { value: '247', label: t('home.totalPatients') },
              { value: '8', label: t('home.todayVisits') },
            ]}
            onClick={() => navigate('/patients')}
          />
        </DashboardGrid>

        {/* Footer Links */}
        <Flex
          justify="center"
          gap={6}
          mt={10}
          pb={6}
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
      </Box>
    </Box>
  );
};

/** Footer link - light theme, no background */
function FooterLink({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      as="button"
      onClick={onClick}
      color={LIGHT.footerColor}
      fontSize="sm"
      fontWeight="medium"
      transition="color 150ms ease"
      _hover={{ color: LIGHT.footerHoverColor }}
      _active={{ color: LIGHT.footerHoverColor }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Text>{label}</Text>
    </Box>
  );
}
