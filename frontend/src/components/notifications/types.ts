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
  | 'visit_reminder'
  | 'trial_warning'
  | 'no_show'
  | 'info'
  | 'birthday'
  | 'inactive_6m'
  | 'completed_inactive'  // Completed patients not visited in 1+ month
  | 'holiday_3_8'         // Women's Day (March 8)
  | 'holiday_2_23'        // Defender's Day (Feb 23)
  | 'holiday_4_7'         // Armenian Mother's Day
  | 'holiday_12_31'       // New Year's Eve
  | 'holiday_1_1'         // New Year

export type NotificationStatus = 'unread' | 'read' | 'dismissed' | 'done'

export interface ActionPayload {
  template?: string
  patientId?: string
  channel?: string
}

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
  /** Notification status */
  status?: NotificationStatus
  /** Target path for navigation when clicking */
  targetPath?: string
  /** Optional patient name for personalized messages */
  patientName?: string
  /** Patient ID for patient-related notifications */
  patientId?: string
  /** Action type for actionable notifications */
  actionType?: string
  /** Action payload for actionable notifications */
  actionPayload?: ActionPayload
  /** Notification title */
  title?: string
  /** Notification body */
  body?: string
}
