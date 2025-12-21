/**
 * PatientsListPage - Exact match to Superdesign reference
 * Uses real API data with loading/error states
 */

import { useState, useMemo, useEffect } from 'react';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  type Patient,
  type PatientStatus,
  patientsApi,
} from '../api/patients';
import { Header, BackgroundPattern, Footer } from '../components/dashboard';
import {
  PatientsHeader,
  PatientsSearchBar,
  PatientsList,
  PatientsEmptyState,
  PatientsListSkeleton,
  AddPatientFAB,
  type PatientData,
} from '../components/patients';
import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage, isPaymentRequiredError } from '../utils/errorHandler';

type SegmentFilter = 'all' | 'vip';

export const PatientsListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');

  // Fetch patients
  useEffect(() => {
    let mounted = true;

    const fetchPatients = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await patientsApi.list();
        if (mounted) {
          setPatients(data);
        }
      } catch (err) {
        if (mounted) {
          if (isPaymentRequiredError(err)) {
            navigate('/subscription');
            return;
          }
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPatients();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchLower) || patient.phone?.includes(searchQuery);

      // Status filter
      const statusMatch = statusFilter === 'all' || patient.status === statusFilter;

      // Segment filter (VIP if segment field exists)
      const segmentMatch = segmentFilter === 'all' || 
        (segmentFilter === 'vip' && (patient as PatientData).segment === 'vip');

      return nameMatch && statusMatch && segmentMatch;
    });
  }, [patients, searchQuery, statusFilter, segmentFilter]);

  // Background gradient
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))';

  // Handlers
  const handlePatientClick = (patient: PatientData) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleRetry = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientsApi.list();
      setPatients(data);
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

  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ];

  // States
  const showEmptyState = !isLoading && !error && patients.length === 0;
  const showNoResults = !isLoading && !error && patients.length > 0 && filteredPatients.length === 0;
  const showList = !isLoading && !error && filteredPatients.length > 0;

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
        <Header notificationCount={3} />

        {/* Page Title with Back Button */}
        <PatientsHeader onBack={handleBack} />

        {/* Search & Filters (only if patients exist) */}
        {!showEmptyState && !isLoading && !error && (
          <PatientsSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            segmentFilter={segmentFilter}
            onSegmentFilterChange={setSegmentFilter}
          />
        )}

        {/* Main Content Area */}
        <Box as="main" flex="1" pb="96px">
          {/* Loading State */}
          {isLoading && <PatientsListSkeleton count={5} />}

          {/* Error State */}
          {error && (
            <Box w="100%" maxW="896px" mx="auto" px="16px" py="64px" textAlign="center">
              <Text fontSize="4xl" mb="16px">⚠️</Text>
              <Text
                fontWeight="semibold"
                fontSize="lg"
                color={isDark ? '#F87171' : '#DC2626'}
                mb="8px"
              >
                {t('patients.loadError')}
              </Text>
              <Text fontSize="sm" color={isDark ? '#94A3B8' : '#64748B'} mb="24px">
                {error}
              </Text>
              <Box
                as="button"
                onClick={handleRetry}
                px="20px"
                py="10px"
                bg="#3B82F6"
                color="white"
                fontSize="sm"
                fontWeight="medium"
                borderRadius="xl"
                _hover={{ bg: '#2563EB' }}
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {t('common.tryAgain')}
              </Box>
            </Box>
          )}

          {/* Empty State */}
          {showEmptyState && (
            <PatientsEmptyState onAddPatient={handleAddPatient} />
          )}

          {/* No Search Results */}
          {showNoResults && (
            <Box w="100%" maxW="896px" mx="auto" px="16px" py="48px" textAlign="center">
              <Text fontSize="sm" color={isDark ? '#94A3B8' : '#64748B'}>
                {t('patients.notFound')}
              </Text>
            </Box>
          )}

          {/* Patients List */}
          {showList && (
            <PatientsList
              patients={filteredPatients as PatientData[]}
              onPatientClick={handlePatientClick}
            />
          )}
        </Box>

        {/* Footer */}
        <Footer links={footerLinks} />

        {/* Floating Add Button (hide when empty state shown) */}
        {!showEmptyState && !isLoading && (
          <AddPatientFAB onClick={handleAddPatient} />
        )}
      </Box>
    </Box>
  );
};

export default PatientsListPage;
