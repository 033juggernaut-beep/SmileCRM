/**
 * ClinicSelectPage - First step in Clinic → Doctor → Patients flow
 * 
 * Shows clinics visible to the current doctor.
 * If only one clinic exists, auto-navigates to doctor selection.
 * 
 * Design: Follows SmileCRM design system with cards and gradients
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Spinner,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { clinicsApi, type Clinic } from '../api/clinics';
import { Header, BackgroundPattern, Footer } from '../components/dashboard';
import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage, isPaymentRequiredError } from '../utils/errorHandler';

const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
} as const;

export const ClinicSelectPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clinics on mount
  useEffect(() => {
    let mounted = true;

    const fetchClinics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await clinicsApi.list();
        
        if (!mounted) return;

        setClinics(data);

        // Auto-skip if only one clinic
        if (data.length === 1) {
          navigate(`/clinics/${data[0].id}/doctors`, { replace: true });
          return;
        }

        // If no clinics, go directly to patients (fallback for single-doctor flow)
        if (data.length === 0) {
          navigate('/patients', { replace: true });
          return;
        }
      } catch (err) {
        if (!mounted) return;
        
        if (isPaymentRequiredError(err)) {
          navigate('/subscription');
          return;
        }
        setError(getErrorMessage(err));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchClinics();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleClinicClick = (clinic: Clinic) => {
    navigate(`/clinics/${clinic.id}/doctors`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clinicsApi.list();
      setClinics(data);
      if (data.length === 1) {
        navigate(`/clinics/${data[0].id}/doctors`, { replace: true });
      } else if (data.length === 0) {
        navigate('/patients', { replace: true });
      }
    } catch (err) {
      if (isPaymentRequiredError(err)) {
        navigate('/subscription');
        return;
      }
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Background gradient
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))';

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.8)' : 'white';
  const cardBorder = isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.8)';
  const textPrimary = isDark ? '#F1F5F9' : '#1E293B';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const accentColor = '#3B82F6';

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
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        {/* Header */}
        <Header notificationCount={0} />

        {/* Page Title with Back Button */}
        <Flex
          as="header"
          w="100%"
          maxW="896px"
          mx="auto"
          px="16px"
          py="16px"
          align="center"
          gap="12px"
        >
          <Box
            as="button"
            onClick={handleBack}
            p="8px"
            borderRadius="xl"
            bg={isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(241, 245, 249, 0.8)'}
            color={textSecondary}
            _hover={{ bg: isDark ? 'rgba(71, 85, 105, 0.5)' : 'rgba(226, 232, 240, 0.8)' }}
            transition="all 0.2s"
          >
            <ChevronRight style={{ transform: 'rotate(180deg)' }} size={20} />
          </Box>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color={textPrimary}>
              {t('clinics.title')}
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              {t('clinics.subtitle')}
            </Text>
          </Box>
        </Flex>

        {/* Main Content Area */}
        <Box as="main" flex="1" px="16px" pb="96px">
          {/* Loading State */}
          {isLoading && (
            <Flex justify="center" align="center" py="64px">
              <Spinner size="lg" color={accentColor} thickness="3px" />
            </Flex>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Box w="100%" maxW="768px" mx="auto" py="64px" textAlign="center">
              <Flex justify="center" mb="16px">
                <AlertCircle size={48} color={isDark ? '#F87171' : '#DC2626'} />
              </Flex>
              <Text
                fontWeight="semibold"
                fontSize="lg"
                color={isDark ? '#F87171' : '#DC2626'}
                mb="8px"
              >
                {t('clinics.loadError')}
              </Text>
              <Text fontSize="sm" color={textSecondary} mb="24px">
                {error}
              </Text>
              <Box
                as="button"
                onClick={handleRetry}
                px="20px"
                py="10px"
                bg={accentColor}
                color="white"
                fontSize="sm"
                fontWeight="medium"
                borderRadius="xl"
                _hover={{ bg: '#2563EB' }}
              >
                {t('common.tryAgain')}
              </Box>
            </Box>
          )}

          {/* Clinics List */}
          {!isLoading && !error && clinics.length > 0 && (
            <VStack
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              w="100%"
              maxW="768px"
              mx="auto"
              spacing="12px"
              align="stretch"
            >
              {clinics.map((clinic) => (
                <MotionBox
                  key={clinic.id}
                  variants={itemVariants}
                  as="button"
                  onClick={() => handleClinicClick(clinic)}
                  w="100%"
                  p="20px"
                  bg={cardBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={cardBorder}
                  boxShadow="0 1px 3px rgba(0, 0, 0, 0.05)"
                  textAlign="left"
                  sx={{ transition: 'all 0.2s' }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderColor: accentColor,
                  }}
                  sx={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Flex align="center" justify="space-between">
                    <Flex align="center" gap="16px">
                      <Flex
                        w="48px"
                        h="48px"
                        borderRadius="xl"
                        bg={`${accentColor}15`}
                        align="center"
                        justify="center"
                      >
                        <Building2 size={24} color={accentColor} />
                      </Flex>
                      <Box>
                        <Text fontWeight="semibold" fontSize="md" color={textPrimary}>
                          {clinic.name}
                        </Text>
                        {clinic.address && (
                          <Text fontSize="sm" color={textSecondary}>
                            {clinic.address}
                          </Text>
                        )}
                      </Box>
                    </Flex>
                    <ChevronRight size={20} color={textSecondary} />
                  </Flex>
                </MotionBox>
              ))}
            </VStack>
          )}

          {/* Empty State (shouldn't normally happen as we redirect) */}
          {!isLoading && !error && clinics.length === 0 && (
            <Box w="100%" maxW="768px" mx="auto" py="64px" textAlign="center">
              <Flex justify="center" mb="16px">
                <Building2 size={48} color={textSecondary} />
              </Flex>
              <Text fontSize="md" color={textSecondary}>
                {t('clinics.noClinic')}
              </Text>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Footer links={footerLinks} />
      </Box>
    </Box>
  );
};

export default ClinicSelectPage;

