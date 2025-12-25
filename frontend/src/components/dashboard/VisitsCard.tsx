/**
 * VisitsCard - Shows today's visits summary on the dashboard
 * First card in the grid, displays:
 * - "Today: N visits" header
 * - Up to 5 visit previews
 * - Click to open /visits page
 */

import { Box, Flex, Text, Skeleton, VStack, HStack, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Phone, CheckCircle, XCircle, Clock3 } from 'lucide-react'
import { useTodayVisits } from '../../hooks/useTodayVisits'
import { useLanguage } from '../../context/LanguageContext'
import type { Visit, VisitStatus } from '../../api/visits'

const MotionBox = motion.create(Box)

const MAX_VISIBLE_VISITS = 5

// Status badge colors and icons
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
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
      color: isDark ? '#4ADE80' : '#16A34A',
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

  // Colors matching DashboardCard style
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'
  const borderHoverColor = isDark ? 'rgba(59, 130, 246, 0.5)' : '#60A5FA'
  const shadow = isDark 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)'
    : '0 4px 6px -1px rgba(239, 246, 255, 1), 0 2px 4px -2px rgba(239, 246, 255, 1)'
  const shadowHover = isDark 
    ? '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)'
    : '0 10px 15px -3px rgba(219, 234, 254, 1), 0 4px 6px -4px rgba(219, 234, 254, 1)'
  
  const iconBoxBg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5'
  const iconColor = isDark ? '#34D399' : '#059669'
  const titleColor = isDark ? 'white' : '#1E293B'
  const accentColor = isDark ? '#34D399' : '#059669'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      w="100%"
      minH="180px"
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
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Header */}
      <Flex align="center" justify="space-between" mb={3}>
        <Flex align="center" gap={3}>
          <Flex
            align="center"
            justify="center"
            w="40px"
            h="40px"
            bg={iconBoxBg}
            borderRadius="lg"
            color={iconColor}
          >
            <Calendar size={24} />
          </Flex>
          <Box>
            <Text fontSize="md" fontWeight="semibold" color={titleColor}>
              {t('visits.title') || 'Visits'}
            </Text>
            {isLoading ? (
              <Skeleton height="16px" width="80px" mt={1} />
            ) : (
              <Text fontSize="sm" fontWeight="bold" color={accentColor}>
                {t('visits.today') || 'Today'}: {count}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>

      {/* Visits List */}
      {isLoading ? (
        <VStack spacing={2} align="stretch" flex={1}>
          <Skeleton height="36px" />
          <Skeleton height="36px" />
          <Skeleton height="36px" />
        </VStack>
      ) : count === 0 ? (
        <Flex 
          flex={1} 
          align="center" 
          justify="center" 
          py={4}
        >
          <Text fontSize="sm" color={mutedColor}>
            ✅ {t('visits.noVisitsToday') || 'No visits today'}
          </Text>
        </Flex>
      ) : (
        <VStack spacing={1.5} align="stretch" flex={1}>
          {visibleVisits.map((visit) => (
            <VisitRow key={visit.id} visit={visit} isDark={isDark} />
          ))}
          {hasMore && (
            <Text fontSize="xs" color={mutedColor} textAlign="center" mt={1}>
              +{visits.length - MAX_VISIBLE_VISITS} {t('visits.more') || 'more'}
            </Text>
          )}
        </VStack>
      )}

      {/* Footer hint */}
      <Text fontSize="xs" color={mutedColor} mt={2} textAlign="center">
        {t('visits.tapToOpen') || 'Tap to open all visits'}
      </Text>
    </MotionBox>
  )
}

// Individual visit row
function VisitRow({ visit, isDark }: { visit: Visit; isDark: boolean }) {
  const statusConfig = getStatusConfig(visit.status, isDark)
  const StatusIcon = statusConfig.icon
  
  const patientName = visit.patient 
    ? `${visit.patient.firstName} ${visit.patient.lastName}`.trim()
    : 'Unknown'
  
  const timeDisplay = visit.visitTime 
    ? visit.visitTime.slice(0, 5) // HH:MM
    : '—'

  const textColor = isDark ? '#CBD5E1' : '#475569'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'

  return (
    <HStack 
      spacing={2} 
      py={1.5} 
      px={2} 
      bg={statusConfig.bg} 
      borderRadius="md"
      align="center"
    >
      <StatusIcon size={14} color={statusConfig.color} />
      <Text 
        fontSize="xs" 
        fontWeight="medium" 
        color={statusConfig.color}
        minW="40px"
      >
        {timeDisplay}
      </Text>
      <Text 
        fontSize="xs" 
        color={textColor} 
        flex={1} 
        noOfLines={1}
        fontWeight={visit.status === 'completed' ? 'normal' : 'medium'}
        textDecoration={visit.status === 'completed' ? 'line-through' : 'none'}
        opacity={visit.status === 'completed' ? 0.7 : 1}
      >
        {patientName}
      </Text>
      {visit.patient?.phone && (
        <HStack spacing={1} color={mutedColor}>
          <Phone size={10} />
          <Text fontSize="10px" display={{ base: 'none', sm: 'block' }}>
            {visit.patient.phone}
          </Text>
        </HStack>
      )}
    </HStack>
  )
}

export default VisitsCard

