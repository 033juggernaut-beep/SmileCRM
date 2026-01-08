/**
 * Visits API Client
 * 
 * Provides methods for fetching and managing patient visits.
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

// Visit status enum
export const VISIT_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'no_show', label: 'No Show', color: 'red' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'gray' },
] as const

export type VisitStatus = (typeof VISIT_STATUSES)[number]['value']

export type PatientSummary = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  telegramUserId?: number | null
  telegramUsername?: string | null
  whatsappPhone?: string | null
}

export type Visit = {
  id: string
  doctorId?: string
  patientId: string
  visitDate: string
  visitTime?: string | null
  nextVisitDate?: string | null
  notes?: string | null
  medications?: string | null
  status: VisitStatus
  statusChangedAt?: string | null
  statusNote?: string | null
  rescheduledTo?: string | null
  rescheduledTime?: string | null
  reminderStatus?: string | null
  reminderSentAt?: string | null
  reminderChannel?: string | null
  createdAt?: string
  patient?: PatientSummary | null
}

export type TodayVisitsResponse = {
  date: string
  count: number
  visits: Visit[]
}

export type UpdateVisitStatusInput = {
  status: VisitStatus
  note?: string
  rescheduledTo?: string
  rescheduledTime?: string
}

// API response types (snake_case from backend)
type ApiPatientSummary = {
  id: string
  first_name: string
  last_name: string
  phone?: string | null
  telegram_user_id?: number | null
  telegram_username?: string | null
  whatsapp_phone?: string | null
}

type ApiVisit = {
  id: string
  doctor_id?: string | null
  patient_id: string
  visit_date: string
  visit_time?: string | null
  next_visit_date?: string | null
  notes?: string | null
  medications?: string | null
  status: string
  status_changed_at?: string | null
  status_note?: string | null
  rescheduled_to?: string | null
  rescheduled_time?: string | null
  reminder_status?: string | null
  reminder_sent_at?: string | null
  reminder_channel?: string | null
  created_at?: string
  patient?: ApiPatientSummary | null
}

type ApiTodayVisitsResponse = {
  date: string
  count: number
  visits: ApiVisit[]
}

// Mappers
const mapPatientSummary = (data: ApiPatientSummary): PatientSummary => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  phone: data.phone ?? undefined,
  telegramUserId: data.telegram_user_id ?? undefined,
  telegramUsername: data.telegram_username ?? undefined,
  whatsappPhone: data.whatsapp_phone ?? undefined,
})

const isValidStatus = (status: string): status is VisitStatus =>
  VISIT_STATUSES.some((s) => s.value === status)

const mapVisit = (data: ApiVisit): Visit => ({
  id: data.id,
  doctorId: data.doctor_id ?? undefined,
  patientId: data.patient_id,
  visitDate: data.visit_date,
  visitTime: data.visit_time ?? undefined,
  nextVisitDate: data.next_visit_date ?? undefined,
  notes: data.notes ?? undefined,
  medications: data.medications ?? undefined,
  status: isValidStatus(data.status) ? data.status : 'scheduled',
  statusChangedAt: data.status_changed_at ?? undefined,
  statusNote: data.status_note ?? undefined,
  rescheduledTo: data.rescheduled_to ?? undefined,
  rescheduledTime: data.rescheduled_time ?? undefined,
  reminderStatus: data.reminder_status ?? undefined,
  reminderSentAt: data.reminder_sent_at ?? undefined,
  reminderChannel: data.reminder_channel ?? undefined,
  createdAt: data.created_at,
  patient: data.patient ? mapPatientSummary(data.patient) : undefined,
})

// API methods
export const visitsApi = {
  /**
   * Get today's visits for the current doctor
   */
  async getTodayVisits(): Promise<TodayVisitsResponse> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiTodayVisitsResponse>('/visits/today', {
      headers: buildAuthHeaders(authToken),
    })
    return {
      date: data.date,
      count: data.count,
      visits: data.visits.map(mapVisit),
    }
  },

  /**
   * Get visits for a specific date
   */
  async getVisitsByDate(date: string): Promise<TodayVisitsResponse> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiTodayVisitsResponse>('/visits', {
      headers: buildAuthHeaders(authToken),
      params: { date },
    })
    return {
      date: data.date,
      count: data.count,
      visits: data.visits.map(mapVisit),
    }
  },

  /**
   * Update visit status
   */
  async updateStatus(visitId: string, input: UpdateVisitStatusInput): Promise<Visit> {
    const authToken = getAuthToken()
    const payload: Record<string, string | undefined> = {
      status: input.status,
    }
    
    if (input.note !== undefined) {
      payload.note = input.note
    }
    if (input.rescheduledTo !== undefined) {
      payload.rescheduled_to = input.rescheduledTo
    }
    if (input.rescheduledTime !== undefined) {
      payload.rescheduled_time = input.rescheduledTime
    }

    const { data } = await apiClient.patch<ApiVisit>(
      `/visits/${visitId}/status`,
      payload,
      { headers: buildAuthHeaders(authToken) }
    )
    return mapVisit(data)
  },

  /**
   * Delete a visit
   */
  async deleteVisit(visitId: string): Promise<void> {
    const authToken = getAuthToken()
    await apiClient.delete(`/visits/${visitId}`, {
      headers: buildAuthHeaders(authToken),
    })
  },
}

export default visitsApi

