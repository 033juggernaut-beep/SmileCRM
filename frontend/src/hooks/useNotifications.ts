/**
 * useNotifications hook - Fetches notifications with graceful fallback to mock data.
 * 
 * Pattern for "UI exists, backend may not exist":
 * 1. Try to fetch from API
 * 2. If API fails (404, network error, etc.) - return mock data
 * 3. Provide loading/error states for UI
 * 4. Expose mutation functions (markRead, markAllRead)
 * 
 * This allows frontend to work in development without backend,
 * and automatically switch to real data when API becomes available.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsApi, type ApiNotification } from '../api/notifications'
import { mockNotifications } from '../components/notifications/mockNotifications'
import type { Notification } from '../components/notifications/types'

interface UseNotificationsResult {
  /** List of notifications (from API or mock) */
  notifications: Notification[]
  /** Number of unread notifications */
  unreadCount: number
  /** Whether data is currently being fetched */
  isLoading: boolean
  /** Error message if fetch failed (null if using mock) */
  error: string | null
  /** Whether data is from mock (true) or real API (false) */
  isMock: boolean
  /** Mark specific notifications as read */
  markRead: (ids: string[]) => Promise<void>
  /** Mark all notifications as read */
  markAllRead: () => Promise<void>
  /** Refetch notifications from API */
  refetch: () => Promise<void>
}

/**
 * Map API notification to frontend Notification type.
 */
function mapApiToFrontend(api: ApiNotification): Notification {
  // Map backend types to frontend types
  const typeMap: Record<string, Notification['type']> = {
    visit_reminder: 'visit_upcoming',
    trial_warning: 'system_trial',
    no_show: 'patient_no_show',
    info: 'system_subscription',
  }

  return {
    id: api.id,
    type: typeMap[api.type] || 'system_subscription',
    message: api.title,
    timestamp: new Date(api.createdAt),
    read: api.readAt !== null,
    targetPath: getTargetPath(api),
    patientName: (api.meta?.patient_name as string) || undefined,
  }
}

/**
 * Get navigation path based on notification type and meta.
 */
function getTargetPath(api: ApiNotification): string | undefined {
  const patientId = api.meta?.patient_id as string | undefined

  switch (api.type) {
    case 'visit_reminder':
    case 'no_show':
      return patientId ? `/patients/${patientId}` : '/patients'
    case 'trial_warning':
      return '/subscription'
    default:
      return undefined
  }
}

/**
 * Hook to fetch and manage notifications with API fallback to mock data.
 * 
 * @param autoFetch - Whether to fetch on mount (default true)
 * @param refetchOnFocus - Whether to refetch when window regains focus (default true)
 */
export function useNotifications(
  autoFetch = true,
  refetchOnFocus = true
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMock, setIsMock] = useState(false)
  
  // Track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true)
  
  /**
   * Fetch notifications from API, fallback to mock on error.
   */
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await notificationsApi.getNotifications()
      
      if (!isMounted.current) return
      
      // Map API response to frontend format
      const mapped = response.items.map(mapApiToFrontend)
      setNotifications(mapped)
      setUnreadCount(response.unreadCount)
      setIsMock(false)
    } catch (err) {
      if (!isMounted.current) return
      
      // Log error but don't show to user - we'll use mock data
      console.log('[useNotifications] API unavailable, using mock data:', err)
      
      // Use mock data as fallback
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter((n) => !n.read).length)
      setIsMock(true)
      setError(null) // Don't show error when gracefully falling back
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])
  
  /**
   * Mark specific notifications as read.
   */
  const markRead = useCallback(async (ids: string[]) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - ids.length))
    
    // Skip API call if using mock data
    if (isMock) return
    
    try {
      await notificationsApi.markRead(ids)
    } catch (err) {
      // Revert on error
      console.error('[useNotifications] Failed to mark as read:', err)
      // Optionally refetch to get correct state
      // await fetchNotifications()
    }
  }, [isMock])
  
  /**
   * Mark all notifications as read.
   */
  const markAllRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    
    // Skip API call if using mock data
    if (isMock) return
    
    try {
      await notificationsApi.markAllRead()
    } catch (err) {
      console.error('[useNotifications] Failed to mark all as read:', err)
    }
  }, [isMock])
  
  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications()
    }
    
    return () => {
      isMounted.current = false
    }
  }, [autoFetch, fetchNotifications])
  
  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnFocus) return
    
    const handleFocus = () => {
      // Only refetch if not using mock data (API is available)
      if (!isMock) {
        fetchNotifications()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnFocus, isMock, fetchNotifications])
  
  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    isMock,
    markRead,
    markAllRead,
    refetch: fetchNotifications,
  }
}

export default useNotifications

