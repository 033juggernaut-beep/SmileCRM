/**
 * VisitsCard - Shows today's visits summary on the dashboard
 * Matches DashboardCard style with blue accent colors
 * Fixed height 180px like other cards
 */

import { Box, Flex, Text, Skeleton, VStack, HStack, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Phone, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import { useTodayVisits } from '../../hooks/useTodayVisits'
import { useLanguage } from '../../context/LanguageContext'
import type { Visit, VisitStatus } from '../../api/visits'

const MotionBox = motion.create(Box)

const MAX_VISIBLE_VISITS = 3

// Status badge colors and icons - using blue accent for scheduled
const getStatusConfig = (status: VisitStatus, isDark: boolean) => {
  const configs: Record<VisitStatus, { bg: string; color: string; icon: typeof Clock }> = {
    scheduled: {
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
      color: isDark ? '#60A5FA' : '#2563EB',
      icon: Clock,
    },
    in_progress: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      color: isDark ? '#FBBF24' : '#D97706',
      icon: Clock3,
    },
    completed: {
      bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9',
      color: isDark ? '#94A3B8' : '#64748B',
      icon: CheckCircle,
    },
    no_show: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      color: isDark ? '#F87171' : '#DC2626',
      icon: XCircle,
    },
    rescheduled: {
      bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9',
      color: isDark ? '#94A3B8' : '#64748B',
      icon: Calendar,
    },
  }
  return configs[status] || configs.scheduled
}

interface VisitsCardProps {
  onClick?: () => void
}

export function VisitsCard({ onClick }: VisitsCardProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { t } = useLanguage()
  const { visits, count, isLoading } = useTodayVisits()

  // Limit visible visits
  const visibleVisits = visits.slice(0, MAX_VISIBLE_VISITS)
  const hasMore = visits.length > MAX_VISIBLE_VISITS

  // Colors matching DashboardCard style exactly - BLUE accent
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'
  const borderHoverColor = isDark ? 'rgba(59, 130, 246, 0.5)' : '#60A5FA'
  const shadow = isDark 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)'
    : '0 4px 6px -1px rgba(239, 246, 255, 1), 0 2px 4px -2px rgba(239, 246, 255, 1)'
  const shadowHover = isDark 
    ? '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)'
    : '0 10px 15px -3px rgba(219, 234, 254, 1), 0 4px 6px -4px rgba(219, 234, 254, 1)'
  
  // BLUE accent like other cards
  const iconBoxBg = isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE'
  const iconColor = isDark ? '#60A5FA' : '#2563EB'
  const titleColor = isDark ? 'white' : '#1E293B'
  const accentColor = isDark ? '#60A5FA' : '#2563EB'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      w="100%"
      h="180px"
      p="20px"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow={shadow}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      _hover={{
        borderColor: borderHoverColor,
        boxShadow: shadowHover,
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.4)',
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Icon Container - matching DashboardCard exactly */}
      <Flex
        align="center"
        justify="center"
        w="40px"
        h="40px"
        bg={iconBoxBg}
        borderRadius="lg"
        flexShrink={0}
        color={iconColor}
      >
        <Calendar size={24} strokeWidth={2} />
      </Flex>

      {/* Title + Count */}
      <Flex align="center" gap="8px" mt="12px">
        <Text fontSize="md" fontWeight="semibold" color={titleColor} lineHeight="1.4">
          {t('visits.title') || 'Visits'}
        </Text>
        {isLoading ? (
          <Skeleton height="16px" width="60px" />
        ) : (
          <Text fontSize="sm" fontWeight="bold" color={accentColor}>
            {t('visits.today') || 'Today'}: {count}
          </Text>
        )}
      </Flex>

      {/* Visits List or Empty State */}
      <Box flex={1} mt="8px" overflow="hidden">
        {isLoading ? (
          <VStack spacing={1} align="stretch">
            <Skeleton height="20px" />
            <Skeleton height="20px" />
          </VStack>
        ) : count === 0 ? (
          <Text fontSize="sm" color={mutedColor}>
            {t('visits.noVisitsToday') || 'No visits today'}
          </Text>
        ) : (
          <VStack spacing={1} align="stretch">
            {visibleVisits.map((visit) => (
              <VisitRow key={visit.id} visit={visit} isDark={isDark} />
            ))}
            {hasMore && (
              <Text fontSize="xs" color={mutedColor}>
                +{visits.length - MAX_VISIBLE_VISITS} {t('visits.more') || 'more'}
              </Text>
            )}
          </VStack>
        )}
      </Box>
    </MotionBox>
  )
}

// Compact visit row
function VisitRow({ visit, isDark }: { visit: Visit; isDark: boolean }) {
  const statusConfig = getStatusConfig(visit.status, isDark)
  const StatusIcon = statusConfig.icon
  
  const patientName = visit.patient 
    ? `${visit.patient.firstName} ${visit.patient.lastName}`.trim()
    : 'Unknown'
  
  const timeDisplay = visit.visitTime 
    ? visit.visitTime.slice(0, 5)
    : '—'

  const textColor = isDark ? '#CBD5E1' : '#475569'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'

  return (
    <HStack spacing={2} py={0.5}>
      <StatusIcon size={12} color={statusConfig.color} />
      <Text 
        fontSize="xs" 
        fontWeight="medium" 
        color={statusConfig.color}
        minW="32px"
      >
        {timeDisplay}
      </Text>
      <Text 
        fontSize="xs" 
        color={textColor} 
        flex={1} 
        noOfLines={1}
        fontWeight="medium"
        textDecoration={visit.status === 'completed' ? 'line-through' : 'none'}
        opacity={visit.status === 'completed' ? 0.6 : 1}
      >
        {patientName}
      </Text>
      {visit.patient?.phone && (
        <HStack spacing={0.5} color={mutedColor} display={{ base: 'none', sm: 'flex' }}>
          <Phone size={10} />
        </HStack>
      )}
    </HStack>
  )
}

export default VisitsCard
