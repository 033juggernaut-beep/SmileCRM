/**
 * Patient basic info block - top section of patient card
 * Extended with:
 * - Full name (large, prominent)
 * - Status badge (in_progress / completed)
 * - Phone number
 * - Last visit date
 * - Date of birth
 * - Patient segment (VIP / Regular)
 */

import { Box, Flex, Text, Grid, useColorMode } from '@chakra-ui/react'
import { Phone, User, Star } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { Patient, PatientStatus, PatientSegment } from '../../api/patients'

interface PatientInfoCardProps {
  patient: Patient
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const statusConfig: Record<PatientStatus, { label: string; bg: string; text: string }> = {
    in_progress: {
      label: t('patients.statusInProgress'),
      bg: isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.100',
      text: isDark ? 'blue.300' : 'blue.700',
    },
    completed: {
      label: t('patients.statusCompleted'),
      bg: isDark ? 'rgba(71, 85, 105, 0.3)' : 'gray.200',
      text: isDark ? 'gray.400' : 'gray.600',
    },
  }

  const segmentConfig: Record<PatientSegment, { label: string; bg: string; text: string; border: string; icon: boolean }> = {
    vip: {
      label: 'VIP',
      bg: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.1)',
      text: isDark ? 'blue.300' : 'blue.600',
      border: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.300',
      icon: true,
    },
    regular: {
      label: t('segment.regular'),
      bg: isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100',
      text: isDark ? 'gray.400' : 'gray.500',
      border: 'transparent',
      icon: false,
    },
  }

  const status = patient.status ? statusConfig[patient.status] : null
  const segment = patient.segment ? segmentConfig[patient.segment] : segmentConfig.regular

  const formatDate = (input?: string | null) => {
    if (!input) return '—'
    try {
      return new Date(input).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return input
    }
  }

  return (
    <Box
      w="full"
      borderRadius="2xl"
      p={5}
      transition="colors 0.2s"
      bg={isDark ? 'rgba(30, 41, 59, 0.6)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
    >
      {/* Name and Status Row */}
      <Flex align="flex-start" justify="space-between" gap={3} mb={3} flexWrap="wrap">
        <Text
          as="h2"
          fontSize="xl"
          fontWeight="semibold"
          letterSpacing="tight"
          color={isDark ? 'white' : 'gray.800'}
        >
          {patient.firstName} {patient.lastName}
        </Text>
        <Flex align="center" gap={2} flexShrink={0}>
          {/* Segment Badge */}
          <Flex
            as="span"
            align="center"
            gap={1}
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="medium"
            border="1px solid"
            bg={segment.bg}
            color={segment.text}
            borderColor={segment.border}
          >
            {segment.icon && <Box as={Star} w={3} h={3} />}
            {segment.label}
          </Flex>
          {/* Status Badge */}
          {status && (
            <Flex
              as="span"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="medium"
              whiteSpace="nowrap"
              bg={status.bg}
              color={status.text}
            >
              {status.label}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Info Grid - Compact 2x2 */}
      <Grid templateColumns="repeat(2, 1fr)" gap={2} columnGap={4}>
        {/* Phone */}
        <Flex align="center" gap={2}>
          <Box
            as={Phone}
            w={4}
            h={4}
            flexShrink={0}
            color={isDark ? 'gray.500' : 'gray.400'}
          />
          <Text
            fontSize="sm"
            isTruncated
            color={isDark ? 'gray.300' : 'gray.600'}
          >
            {patient.phone ?? '—'}
          </Text>
        </Flex>

        {/* Date of Birth */}
        <Flex align="center" gap={2}>
          <Box
            as={User}
            w={4}
            h={4}
            flexShrink={0}
            color={isDark ? 'gray.500' : 'gray.400'}
          />
          <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.600'}>
            <Text as="span" color={isDark ? 'gray.500' : 'gray.400'}>
              {t('patientDetails.birthDate')}:{' '}
            </Text>
            {formatDate(patient.birthDate)}
          </Text>
        </Flex>
      </Grid>
    </Box>
  )
}

export default PatientInfoCard

