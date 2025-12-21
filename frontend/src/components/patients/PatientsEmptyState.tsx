/**
 * Empty state when no patients exist - Exact match to Superdesign reference
 * - Abstract medical illustration (clipboard with plus)
 * - Title, subtitle, primary action button
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const MotionBox = motion.create(Box);

interface PatientsEmptyStateProps {
  onAddPatient: () => void;
}

export function PatientsEmptyState({ onAddPatient }: PatientsEmptyStateProps) {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const isDark = colorMode === 'dark';

  const containerBg = isDark ? '#1E293B' : '#EFF6FF';
  const clipboardBg = isDark ? '#334155' : '#DBEAFE';
  const lineBg = isDark ? '#475569' : '#BFDBFE';
  const titleColor = isDark ? 'white' : '#1E293B';
  const subtitleColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      w="100%"
      maxW="896px"
      mx="auto"
      px="16px"
      py="64px"
    >
      <Flex direction="column" align="center" justify="center" textAlign="center">
        {/* Abstract Medical Illustration */}
        <Flex
          align="center"
          justify="center"
          w="96px"
          h="96px"
          borderRadius="2xl"
          bg={containerBg}
          mb="24px"
        >
          <Box as="svg" viewBox="0 0 64 64" w="56px" h="56px" fill="none">
            {/* Clipboard/document shape */}
            <rect
              x="16"
              y="8"
              width="32"
              height="48"
              rx="4"
              fill={clipboardBg}
            />
            <rect
              x="24"
              y="4"
              width="16"
              height="8"
              rx="2"
              fill="#3B82F6"
            />
            {/* Lines representing content */}
            <rect x="22" y="20" width="20" height="3" rx="1.5" fill={lineBg} />
            <rect x="22" y="28" width="16" height="3" rx="1.5" fill={lineBg} />
            <rect x="22" y="36" width="18" height="3" rx="1.5" fill={lineBg} />
            {/* Plus circle */}
            <circle cx="42" cy="46" r="10" fill="#3B82F6" />
            <rect x="40" y="41" width="4" height="10" rx="1" fill="white" />
            <rect x="37" y="44" width="10" height="4" rx="1" fill="white" />
          </Box>
        </Flex>

        {/* Title */}
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color={titleColor}
          mb="8px"
        >
          {t('patients.noPatients')}
        </Text>

        {/* Subtitle */}
        <Text
          fontSize="sm"
          color={subtitleColor}
          maxW="280px"
          mb="24px"
        >
          {t('patients.noPatientsHint')}
        </Text>

        {/* Primary Action Button */}
        <Box
          as="button"
          onClick={onAddPatient}
          display="inline-flex"
          alignItems="center"
          gap="8px"
          px="20px"
          py="10px"
          bg="#3B82F6"
          color="white"
          fontSize="sm"
          fontWeight="medium"
          borderRadius="xl"
          transition="background 0.15s"
          _hover={{ bg: '#2563EB' }}
          _focusVisible={{
            outline: 'none',
            boxShadow: '0 0 0 2px #60A5FA, 0 0 0 4px rgba(59, 130, 246, 0.3)',
          }}
          sx={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <UserPlus size={16} />
          {t('patients.addPatient')}
        </Box>
      </Flex>
    </MotionBox>
  );
}

export default PatientsEmptyState;

