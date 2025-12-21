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
}

export function NotificationList({
  notifications,
  onNotificationClick,
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
          />
        ))}
      </AnimatePresence>
    </Box>
  )
}

export default NotificationList

