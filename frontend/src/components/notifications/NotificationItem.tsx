/**
 * NotificationItem - single notification row in dropdown
 * 
 * Matches Superdesign reference exactly:
 * - Container: w-full flex items-start gap-3 p-3 rounded-lg
 * - Icon box: w-8 h-8 rounded-lg
 * - Unread: bg highlight + blue dot indicator
 * - Hover: bg change
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  UserX,
  AlertTriangle,
  CreditCard,
  Bell,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { Notification, NotificationType } from './types'

const MotionFlex = motion.create(Flex)

export interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
}

// Get icon for notification type
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'visit_upcoming':
      return Clock
    case 'visit_remaining':
      return Calendar
    case 'patient_no_show':
      return UserX
    case 'patient_overdue':
    case 'system_trial':
      return AlertTriangle
    case 'system_subscription':
      return CreditCard
    default:
      return Bell
  }
}

// Get colors for notification type
const getNotificationColors = (type: NotificationType, isDark: boolean) => {
  switch (type) {
    case 'visit_upcoming':
    case 'visit_remaining':
      return {
        iconBg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', // blue-50
        iconColor: isDark ? '#60A5FA' : '#2563EB', // blue-400 / blue-600
      }
    case 'patient_no_show':
    case 'patient_overdue':
      return {
        iconBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB', // amber-50
        iconColor: isDark ? '#FBBF24' : '#D97706', // amber-400 / amber-600
      }
    case 'system_trial':
      return {
        iconBg: isDark ? 'rgba(244, 63, 94, 0.15)' : '#FFF1F2', // rose-50
        iconColor: isDark ? '#FB7185' : '#DC2626', // rose-400 / red-600
      }
    case 'system_subscription':
      return {
        iconBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5', // emerald-50
        iconColor: isDark ? '#34D399' : '#059669', // emerald-400 / emerald-600
      }
    default:
      return {
        iconBg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9', // slate-100
        iconColor: isDark ? '#94A3B8' : '#64748B', // slate-400 / slate-500
      }
  }
}

// Format relative time with i18n
const useFormatRelativeTime = () => {
  const { t } = useLanguage()
  
  return (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('notifications.now')
    if (diffMins < 60) return `${diffMins} ${t('notifications.minutesAgo')}`
    if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo')}`
    if (diffDays === 1) return t('notifications.yesterday')
    return `${diffDays} ${t('notifications.daysAgo')}`
  }
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'
  const Icon = getNotificationIcon(notification.type)
  const colors = getNotificationColors(notification.type, isDark)
  const formatRelativeTime = useFormatRelativeTime()

  // Get localized message - check if messageKey exists, otherwise use message directly
  const displayMessage = notification.messageKey 
    ? t(notification.messageKey) 
    : notification.message

  return (
    <MotionFlex
      as="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      whileHover={{
        backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)',
      }}
      onClick={onClick}
      w="full"
      alignItems="flex-start"
      gap={3}
      p={3}
      textAlign="left"
      borderRadius="lg"
      cursor="pointer"
      bg={
        !notification.read
          ? isDark
            ? 'rgba(30, 41, 59, 0.3)' // slate-800/30
            : 'rgba(239, 246, 255, 0.5)' // blue-50/50
          : 'transparent'
      }
      style={{ transition: 'background 0.2s' }}
      border="none"
      outline="none"
      mb={1}
    >
      {/* Icon */}
      <Box
        flexShrink={0}
        w="32px"
        h="32px"
        borderRadius="lg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={colors.iconBg}
        color={colors.iconColor}
        sx={{
          '& svg': {
            width: '16px',
            height: '16px',
          },
        }}
      >
        <Icon />
      </Box>

      {/* Content */}
      <Box flex={1} minW={0}>
        <Text
          fontSize="sm"
          lineHeight="snug"
          color={
            notification.read
              ? isDark
                ? '#94A3B8' // slate-400
                : '#64748B' // slate-500
              : isDark
                ? '#E2E8F0' // slate-200
                : '#334155' // slate-700
          }
          fontWeight={notification.read ? 'normal' : 'medium'}
          noOfLines={2}
        >
          {displayMessage}
        </Text>
        <Text
          fontSize="xs"
          mt={1}
          color={isDark ? '#64748B' : '#94A3B8'} // slate-500 / slate-400
        >
          {formatRelativeTime(notification.timestamp)}
        </Text>
      </Box>

      {/* Unread indicator */}
      {!notification.read && (
        <Box
          flexShrink={0}
          w="8px"
          h="8px"
          borderRadius="full"
          mt={2}
          bg={isDark ? '#60A5FA' : '#3B82F6'} // blue-400 / blue-500
        />
      )}
    </MotionFlex>
  )
}

export default NotificationItem
