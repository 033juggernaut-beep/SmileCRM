/**
 * Doctors API client
 * 
 * Provides methods for doctor-specific operations in the 
 * Clinic → Doctor → Patients flow
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'
import type { Patient } from './patients'

// ============================================================
// Types
// ============================================================

export type DoctorSummary = {
  id: string
  firstName: string
  lastName?: string | null
  fullName?: string | null
}

export type PatientWithDoctor = Patient & {
  doctor?: DoctorSummary | null
  clinicName?: string | null
}

// API response types (snake_case from backend)
type ApiDoctorSummary = {
  id: string
  first_name: string
  last_name?: string | null
  full_name?: string | null
}

type ApiPatientWithDoctor = {
  id: string
  first_name: string
  last_name: string
  diagnosis?: string | null
  phone?: string | null
  status?: string | null
  segment?: string | null
  gender?: string | null
  doctor_id?: string | null
  created_at?: string
  birth_date?: string | null
  notes?: string | null
  treatment_plan_total?: number | null
  treatment_plan_currency?: string | null
  marketing_opt_in?: boolean | null
  telegram_username?: string | null
  whatsapp_phone?: string | null
  viber_phone?: string | null
  // Embedded doctor info
  doctor?: ApiDoctorSummary | null
  clinic_name?: string | null
}

// ============================================================
// Mappers
// ============================================================

const mapDoctorSummary = (data: ApiDoctorSummary): DoctorSummary => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name ?? undefined,
  fullName: data.full_name ?? [data.first_name, data.last_name].filter(Boolean).join(' '),
})

const mapPatientWithDoctor = (data: ApiPatientWithDoctor): PatientWithDoctor => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  diagnosis: data.diagnosis ?? undefined,
  phone: data.phone ?? undefined,
  status: (data.status as PatientWithDoctor['status']) ?? 'in_progress',
  segment: (data.segment as PatientWithDoctor['segment']) ?? 'regular',
  gender: data.gender as PatientWithDoctor['gender'] ?? null,
  doctorId: data.doctor_id ?? undefined,
  createdAt: data.created_at,
  birthDate: data.birth_date ?? undefined,
  notes: data.notes ?? undefined,
  treatmentPlanTotal: data.treatment_plan_total ?? undefined,
  treatmentPlanCurrency: data.treatment_plan_currency ?? undefined,
  marketingOptIn: data.marketing_opt_in ?? undefined,
  telegramUsername: data.telegram_username ?? undefined,
  whatsappPhone: data.whatsapp_phone ?? undefined,
  viberPhone: data.viber_phone ?? undefined,
  // Doctor info
  doctor: data.doctor ? mapDoctorSummary(data.doctor) : null,
  clinicName: data.clinic_name ?? undefined,
})

// ============================================================
// API Methods
// ============================================================

export const doctorsApi = {
  /**
   * List patients for a specific doctor.
   * Returns patients with embedded doctor info.
   * 
   * Access control:
   * - Can list own patients
   * - Can list patients of doctors in the same clinic
   */
  async listPatients(doctorId: string): Promise<PatientWithDoctor[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiPatientWithDoctor[]>(
      `/doctors/${doctorId}/patients`,
      { headers: buildAuthHeaders(authToken) }
    )
    return Array.isArray(data) ? data.map(mapPatientWithDoctor) : []
  },

  /**
   * Get current doctor's profile with clinic info.
   */
  async getMyProfile(): Promise<{
    id: string
    firstName: string
    lastName?: string
    clinicId?: string
    clinicName?: string
  }> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<{
      id: string
      first_name: string
      last_name?: string
      clinic_id?: string
      clinic_name?: string
    }>('/doctors/me', {
      headers: buildAuthHeaders(authToken),
    })
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      clinicId: data.clinic_id,
      clinicName: data.clinic_name,
    }
  },
}

