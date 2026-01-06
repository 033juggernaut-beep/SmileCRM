/**
 * DoctorPatientsPage - Third step in Clinic → Doctor → Patients flow
 * 
 * Shows patients belonging to a specific doctor.
 * Reuses existing patient list components with doctor context.
 * 
 * Design: Follows SmileCRM design system, matching PatientsListPage
 */

import { useState, useMemo, useEffect } from 'react';
import { Box, Text, useColorMode, Flex } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { doctorsApi, type PatientWithDoctor } from '../api/doctors';
import { type PatientStatus } from '../api/patients';
import { Header, BackgroundPattern, Footer } from '../components/dashboard';
import {
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

export const DoctorPatientsPage = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { t } = useLanguage();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // State
  const [patients, setPatients] = useState<PatientWithDoctor[]>([]);
  const [doctorName, setDoctorName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');

  // Fetch patients
  useEffect(() => {
    let mounted = true;

    const fetchPatients = async () => {
      if (!doctorId) {
        navigate('/clinics', { replace: true });
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await doctorsApi.listPatients(doctorId);
        if (mounted) {
          setPatients(data);
          // Extract doctor name from first patient with doctor info
          const firstWithDoctor = data.find(p => p.doctor?.fullName);
          if (firstWithDoctor?.doctor?.fullName) {
            setDoctorName(firstWithDoctor.doctor.fullName);
          }
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
  }, [doctorId, navigate]);

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
        (segmentFilter === 'vip' && patient.segment === 'vip');

      return nameMatch && statusMatch && segmentMatch;
    });
  }, [patients, searchQuery, statusFilter, segmentFilter]);

  // Background gradient
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))';

  const textPrimary = isDark ? '#F1F5F9' : '#1E293B';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';

  // Handlers
  const handlePatientClick = (patient: PatientData) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleAddPatient = () => {
    navigate('/patients/new');
  };

  const handleBack = () => {
    // Go back to doctor selection (we need to get clinic ID from somewhere)
    // For now, go to clinics
    navigate('/clinics');
  };

  const handleRetry = async () => {
    if (!doctorId) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorsApi.listPatients(doctorId);
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
              {doctorName ? `${t('doctors.doctorPatients')}` : t('patients.title')}
            </Text>
            <Text fontSize="sm" color={textSecondary}>
              {doctorName || t('patients.subtitle')}
            </Text>
          </Box>
        </Flex>

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
              patients={filteredPatients as unknown as PatientData[]}
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

export default DoctorPatientsPage;

