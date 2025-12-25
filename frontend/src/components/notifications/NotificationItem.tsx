/**
 * NotificationItem - single notification row in dropdown
 * 
 * Matches Superdesign reference exactly:
 * - Container: w-full flex items-start gap-3 p-3 rounded-lg
 * - Icon box: w-8 h-8 rounded-lg
 * - Unread: bg highlight + blue dot indicator
 * - Hover: bg change
 * - Action buttons for actionable notifications
 */

import { Box, Flex, Text, Button, HStack, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  Clock,
  Calendar,
  UserX,
  AlertTriangle,
  CreditCard,
  Bell,
  Cake,
  UserMinus,
  MessageSquare,
  ExternalLink,
  Check,
  X,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import type { Notification, NotificationType } from './types'

const MotionBox = motion.create(Box)

export interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
  onGenerateMessage?: (notification: Notification) => void
  onOpenPatient?: (patientId: string) => void
  onMarkRead?: (notificationId: string) => void
  onDismiss?: (notificationId: string) => void
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
    case 'birthday':
      return Cake
    case 'inactive_6m':
      return UserMinus
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
    case 'inactive_6m':
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
    case 'birthday':
      return {
        iconBg: isDark ? 'rgba(236, 72, 153, 0.15)' : '#FDF2F8', // pink-50
        iconColor: isDark ? '#F472B6' : '#DB2777', // pink-400 / pink-600
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

export function NotificationItem({
  notification,
  onClick,
  onGenerateMessage,
  onOpenPatient,
  onMarkRead,
  onDismiss,
}: NotificationItemProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'
  const Icon = getNotificationIcon(notification.type)
  const colors = getNotificationColors(notification.type, isDark)
  const formatRelativeTime = useFormatRelativeTime()

  // Check if notification is actionable (has action buttons)
  const isActionable = notification.actionType === 'generate_message' || !!notification.patientId

  // Display title (bold) or fallback to message
  const displayTitle = notification.title || notification.message
  const displayBody = notification.body

  const handleGenerateMessage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onGenerateMessage?.(notification)
  }

  const handleOpenPatient = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (notification.patientId) {
      onOpenPatient?.(notification.patientId)
    }
  }

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkRead?.(notification.id)
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss?.(notification.id)
  }

  return (
    <MotionBox
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      w="full"
      p={3}
      borderRadius="lg"
      mb={1}
      bg={
        !notification.read
          ? isDark
            ? 'rgba(30, 41, 59, 0.3)'
            : 'rgba(239, 246, 255, 0.5)'
          : 'transparent'
      }
      _hover={{
        bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(241, 245, 249, 1)',
      }}
      style={{ transition: 'background 0.2s' }}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
    >
      <Flex alignItems="flex-start" gap={3}>
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
          {/* Title */}
          <Text
            fontSize="sm"
            fontWeight={notification.read ? 'normal' : 'semibold'}
            color={
              notification.read
                ? isDark
                  ? '#94A3B8'
                  : '#64748B'
                : isDark
                  ? '#E2E8F0'
                  : '#334155'
            }
            noOfLines={2}
          >
            {displayTitle}
          </Text>

          {/* Body */}
          {displayBody && (
            <Text
              fontSize="xs"
              mt={0.5}
              color={isDark ? '#94A3B8' : '#64748B'}
              noOfLines={2}
            >
              {displayBody}
            </Text>
          )}

          {/* Timestamp */}
          <Text
            fontSize="xs"
            mt={1}
            color={isDark ? '#64748B' : '#94A3B8'}
          >
            {formatRelativeTime(notification.timestamp)}
          </Text>

          {/* Action buttons for actionable notifications */}
          {isActionable && !notification.read && (
            <HStack mt={2} spacing={1} flexWrap="wrap">
              {notification.patientId && (
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<ExternalLink size={12} />}
                  onClick={handleOpenPatient}
                  fontWeight="medium"
                  fontSize="xs"
                  h={6}
                  px={2}
                  color={isDark ? 'blue.400' : 'blue.600'}
                  _hover={{
                    bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'blue.50',
                  }}
                >
                  {t('notifications.openPatient')}
                </Button>
              )}
              {notification.actionType === 'generate_message' && (
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<MessageSquare size={12} />}
                  onClick={handleGenerateMessage}
                  fontWeight="medium"
                  fontSize="xs"
                  h={6}
                  px={2}
                  color={isDark ? 'green.400' : 'green.600'}
                  _hover={{
                    bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'green.50',
                  }}
                >
                  {t('notifications.generateMessage')}
                </Button>
              )}
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Check size={12} />}
                onClick={handleMarkRead}
                fontWeight="medium"
                fontSize="xs"
                h={6}
                px={2}
                color={isDark ? 'gray.400' : 'gray.500'}
                _hover={{
                  bg: isDark ? 'rgba(100, 116, 139, 0.15)' : 'gray.100',
                }}
              >
                {t('notifications.markRead')}
              </Button>
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<X size={12} />}
                onClick={handleDismiss}
                fontWeight="medium"
                fontSize="xs"
                h={6}
                px={2}
                color={isDark ? 'gray.400' : 'gray.500'}
                _hover={{
                  bg: isDark ? 'rgba(100, 116, 139, 0.15)' : 'gray.100',
                }}
              >
                {t('notifications.dismiss')}
              </Button>
            </HStack>
          )}
        </Box>

        {/* Unread indicator */}
        {!notification.read && (
          <Box
            flexShrink={0}
            w="8px"
            h="8px"
            borderRadius="full"
            mt={2}
            bg={isDark ? '#60A5FA' : '#3B82F6'}
          />
        )}
      </Flex>
    </MotionBox>
  )
}

export default NotificationItem
