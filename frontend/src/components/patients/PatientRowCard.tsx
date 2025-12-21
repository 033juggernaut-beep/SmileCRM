/**
 * Individual patient row/card - Exact match to Superdesign reference
 * - Avatar with initials
 * - Patient name, VIP badge, status badge
 * - Last visit date, phone number
 * - Subtle hover with blue border
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const MotionBox = motion.create(Box);

export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status?: 'in_progress' | 'completed';
  lastVisit?: Date | string;
  segment?: 'vip' | 'regular';
}

interface PatientRowCardProps {
  patient: PatientData;
  onClick?: () => void;
}

export function PatientRowCard({ patient, onClick }: PatientRowCardProps) {
  const { colorMode } = useColorMode();
  const { t, language } = useLanguage();
  const isDark = colorMode === 'dark';

  const isInProgress = patient.status === 'in_progress';
  const isVIP = patient.segment === 'vip';

  // Format date based on language
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'ru' ? 'ru-RU' : language === 'am' ? 'hy-AM' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  const formatPhone = (phone: string | undefined) => {
    if (!phone) return '';
    // Handle various phone formats
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    return phone;
  };

  // Colors from reference
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'white';
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#EFF6FF'; // blue-50
  const borderHover = isDark ? 'rgba(59, 130, 246, 0.5)' : '#93C5FD'; // blue-300
  const shadow = isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)';
  const shadowHover = isDark ? 'none' : '0 4px 6px -1px rgba(239, 246, 255, 1)';

  const avatarBg = isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'; // blue-100
  const avatarColor = isDark ? '#60A5FA' : '#2563EB'; // blue-400/600

  const nameColor = isDark ? 'white' : '#1E293B';
  const mutedColor = isDark ? '#64748B' : '#94A3B8';
  const phoneColor = isDark ? '#94A3B8' : '#64748B';

  // Badge colors
  const vipBg = isDark ? 'rgba(14, 165, 233, 0.2)' : '#E0F2FE'; // sky
  const vipColor = isDark ? '#38BDF8' : '#0284C7';
  const statusBgActive = isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE';
  const statusColorActive = isDark ? '#60A5FA' : '#2563EB';
  const statusBgCompleted = isDark ? '#334155' : '#F1F5F9';
  const statusColorCompleted = isDark ? '#94A3B8' : '#64748B';

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
      w="100%"
      p="16px"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow={shadow}
      textAlign="left"
      display="flex"
      alignItems="center"
      gap="16px"
      cursor="pointer"
      _hover={{
        borderColor: borderHover,
        boxShadow: shadowHover,
        bg: isDark ? 'rgba(30, 41, 59, 0.8)' : 'white',
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
      }}
    >
      {/* Avatar */}
      <Flex
        align="center"
        justify="center"
        w="40px"
        h="40px"
        borderRadius="full"
        bg={avatarBg}
        color={avatarColor}
        fontSize="sm"
        fontWeight="semibold"
        flexShrink={0}
      >
        {patient.firstName?.[0] || ''}
        {patient.lastName?.[0] || ''}
      </Flex>

      {/* Patient Info */}
      <Box flex="1" minW={0}>
        <Flex align="center" gap="8px" flexWrap="wrap">
          {/* Name */}
          <Text
            fontWeight="medium"
            color={nameColor}
            isTruncated
            maxW="200px"
          >
            {patient.firstName} {patient.lastName}
          </Text>

          {/* VIP Badge */}
          {isVIP && (
            <Box
              px="8px"
              py="2px"
              fontSize="xs"
              fontWeight="medium"
              borderRadius="full"
              bg={vipBg}
              color={vipColor}
            >
              {t('patients.vipBadge')}
            </Box>
          )}

          {/* Status Badge */}
          <Box
            px="8px"
            py="2px"
            fontSize="xs"
            fontWeight="medium"
            borderRadius="full"
            bg={isInProgress ? statusBgActive : statusBgCompleted}
            color={isInProgress ? statusColorActive : statusColorCompleted}
          >
            {isInProgress ? t('patients.statusInProgress') : t('patients.statusCompleted')}
          </Box>
        </Flex>

        {/* Last Visit */}
        {patient.lastVisit && (
          <Text fontSize="xs" color={mutedColor} mt="2px">
            {t('patients.lastVisit')}: {formatDate(patient.lastVisit)}
          </Text>
        )}
      </Box>

      {/* Phone - hidden on mobile */}
      {patient.phone && (
        <Flex
          align="center"
          gap="6px"
          fontSize="sm"
          color={phoneColor}
          display={{ base: 'none', sm: 'flex' }}
        >
          <Phone size={14} />
          <Text>{formatPhone(patient.phone)}</Text>
        </Flex>
      )}
    </MotionBox>
  );
}

export default PatientRowCard;

