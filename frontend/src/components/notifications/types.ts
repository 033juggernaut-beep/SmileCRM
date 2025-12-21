/**
 * Notification types for SmileCRM
 */

export type NotificationType =
  | 'visit_upcoming'
  | 'visit_remaining'
  | 'patient_no_show'
  | 'patient_overdue'
  | 'system_trial'
  | 'system_subscription'

export interface Notification {
  id: string
  type: NotificationType
  /** Direct message text (used if messageKey is not provided) */
  message: string
  /** i18n key for localized message (takes precedence over message) */
  messageKey?: string
  /** Timestamp when notification was created */
  timestamp: Date
  /** Whether the notification has been read */
  read?: boolean
  /** Target path for navigation when clicking */
  targetPath?: string
  /** Optional patient name for personalized messages */
  patientName?: string
}
