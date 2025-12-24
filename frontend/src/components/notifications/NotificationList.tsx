/**
 * NotificationList - List container for notification items
 * 
 * Matches Superdesign reference exactly:
 * - Container: p-2 space-y-1
 * - AnimatePresence for smooth enter/exit
 */

import { Box } from '@chakra-ui/react'
import { AnimatePresence } from 'framer-motion'
import { NotificationItem } from './NotificationItem'
import { NotificationsEmptyState } from './NotificationsEmptyState'
import type { Notification } from './types'

export interface NotificationListProps {
  notifications: Notification[]
  onNotificationClick?: (notification: Notification) => void
  onGenerateMessage?: (notification: Notification) => void
  onOpenPatient?: (patientId: string) => void
  onMarkRead?: (notificationId: string) => void
  onDismiss?: (notificationId: string) => void
}

export function NotificationList({
  notifications,
  onNotificationClick,
  onGenerateMessage,
  onOpenPatient,
  onMarkRead,
  onDismiss,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return <NotificationsEmptyState />
  }

  return (
    <Box p={2}>
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={() => onNotificationClick?.(notification)}
            onGenerateMessage={onGenerateMessage}
            onOpenPatient={onOpenPatient}
            onMarkRead={onMarkRead}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </Box>
  )
}

export default NotificationList

