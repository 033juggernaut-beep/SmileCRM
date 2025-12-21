/**
 * Notifications API module.
 * 
 * Provides functions to interact with the notifications backend.
 * Designed for graceful fallback when API is unavailable.
 */

import { apiClient } from './client'
import { getAuthToken } from './auth'

// Types matching backend response
export type NotificationType = 
  | 'visit_reminder' 
  | 'trial_warning' 
  | 'no_show' 
  | 'info'

export interface ApiNotification {
  id: string
  doctorId: string
  type: NotificationType
  title: string
  body: string | null
  createdAt: string
  readAt: string | null
  meta: Record<string, unknown> | null
}

export interface NotificationListResponse {
  items: ApiNotification[]
  unreadCount: number
}

export interface MarkReadResponse {
  ok: boolean
  updatedCount: number
}

/**
 * Get notifications for the current doctor.
 * 
 * @param limit - Max number of notifications to fetch (default 20)
 * @param offset - Number of notifications to skip (default 0)
 * @returns Promise with notification list and unread count
 * @throws Error if request fails (network, auth, etc.)
 */
export async function getNotifications(
  limit = 20,
  offset = 0
): Promise<NotificationListResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.get<NotificationListResponse>('/notifications', {
    params: { limit, offset },
    headers: { Authorization: `Bearer ${authToken}` },
  })
  
  return data
}

/**
 * Mark specific notifications as read.
 * 
 * @param ids - Array of notification UUIDs to mark as read
 * @returns Promise with success status and count of updated notifications
 * @throws Error if request fails
 */
export async function markRead(ids: string[]): Promise<MarkReadResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post<MarkReadResponse>(
    '/notifications/mark-read',
    { ids },
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  
  return data
}

/**
 * Mark all notifications as read for the current doctor.
 * 
 * @returns Promise with success status and count of updated notifications
 * @throws Error if request fails
 */
export async function markAllRead(): Promise<MarkReadResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post<MarkReadResponse>(
    '/notifications/mark-all-read',
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  
  return data
}

/**
 * Seed demo notifications (development only).
 * 
 * @returns Promise with created notifications
 * @throws Error if request fails or not in dev mode
 */
export async function seedNotifications(): Promise<{
  ok: boolean
  createdCount: number
  items: ApiNotification[]
}> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post(
    '/notifications/seed',
    {},
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  
  return data
}

/**
 * Notifications API object for convenient access.
 */
export const notificationsApi = {
  getNotifications,
  markRead,
  markAllRead,
  seedNotifications,
}

export default notificationsApi

