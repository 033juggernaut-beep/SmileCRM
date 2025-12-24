import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'
import type { Notification, NotificationStatus } from '../components/notifications/types'

// API response types
export type ApiNotification = {
  id: string
  doctorId: string
  type: string
  title: string
  body?: string | null
  createdAt: string
  readAt?: string | null
  meta?: Record<string, unknown> | null
  status: string
  patientId?: string | null
  actionType?: string | null
  actionPayload?: {
    template?: string
    patientId?: string
    channel?: string
  } | null
}

type NotificationListResponse = {
  items: ApiNotification[]
  unreadCount: number
}

const mapNotification = (data: ApiNotification): Notification => ({
  id: data.id,
  type: data.type as Notification['type'],
  message: data.body || data.title,
  title: data.title,
  body: data.body ?? undefined,
  timestamp: new Date(data.createdAt),
  read: data.status !== 'unread',
  status: data.status as NotificationStatus,
  patientId: data.patientId ?? undefined,
  actionType: data.actionType ?? undefined,
  actionPayload: data.actionPayload ?? undefined,
})

export const notificationsApi = {
  /**
   * Get notifications for current doctor
   */
  async list(status?: NotificationStatus): Promise<{ items: Notification[]; unreadCount: number }> {
    const authToken = getAuthToken()
    const params = status ? { status } : {}
    const { data } = await apiClient.get<NotificationListResponse>('/notifications', {
      headers: buildAuthHeaders(authToken),
      params,
    })
    return {
      items: data.items.map(mapNotification),
      unreadCount: data.unreadCount,
    }
  },

  /**
   * Update notification status
   */
  async updateStatus(notificationId: string, status: NotificationStatus): Promise<void> {
    const authToken = getAuthToken()
    await apiClient.patch(
      `/notifications/${notificationId}`,
      { status },
      { headers: buildAuthHeaders(authToken) }
    )
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<void> {
    const authToken = getAuthToken()
    await apiClient.post(
      '/notifications/mark-all-read',
      {},
      { headers: buildAuthHeaders(authToken) }
    )
  },

  /**
   * Generate birthday and inactive patient notifications (dev only)
   */
  async generate(): Promise<{ birthdayCount: number; inactiveCount: number; totalCreated: number }> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<{
      birthdayCount: number
      inactiveCount: number
      totalCreated: number
    }>(
      '/notifications/generate',
      {},
      { headers: buildAuthHeaders(authToken) }
    )
    return data
  },
}
