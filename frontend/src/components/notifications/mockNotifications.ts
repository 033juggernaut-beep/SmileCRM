/**
 * Mock notifications for development/testing
 * Uses i18n keys for localized messages
 */

import type { Notification } from './types'

// Create a date relative to now
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000)
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'visit_upcoming',
    message: 'Visit in 30 minutes',
    messageKey: 'notifications.mockVisitUpcoming',
    timestamp: minutesAgo(30),
    read: false,
    targetPath: '/patients/1',
    patientName: 'Ivanov A.S.',
  },
  {
    id: '2',
    type: 'visit_remaining',
    message: '2 visits remaining today',
    messageKey: 'notifications.mockVisitRemaining',
    timestamp: hoursAgo(2),
    read: false,
    targetPath: '/patients',
  },
  {
    id: '3',
    type: 'patient_no_show',
    message: 'Patient did not show up',
    messageKey: 'notifications.mockPatientNoShow',
    timestamp: hoursAgo(4),
    read: false,
    targetPath: '/patients/2',
    patientName: 'Petrov V.M.',
  },
  {
    id: '4',
    type: 'system_trial',
    message: 'Trial ends in 3 days',
    messageKey: 'notifications.mockSystemTrial',
    timestamp: daysAgo(1),
    read: true,
    targetPath: '/subscription',
  },
  {
    id: '5',
    type: 'patient_overdue',
    message: 'Follow-up visit reminder',
    messageKey: 'notifications.mockPatientOverdue',
    timestamp: daysAgo(2),
    read: true,
    targetPath: '/patients/3',
    patientName: 'Sidorov I.K.',
  },
]

export default mockNotifications
