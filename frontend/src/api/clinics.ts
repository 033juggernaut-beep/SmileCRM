/**
 * Clinics API client
 * 
 * Provides methods for the Clinic → Doctor → Patients flow
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

// ============================================================
// Types
// ============================================================

export type Clinic = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  createdAt?: string
}

export type DoctorInClinic = {
  id: string
  firstName: string
  lastName?: string | null
  specialization?: string | null
  clinicId?: string | null
  clinicName?: string | null
  fullName?: string
}

// API response types (snake_case from backend)
type ApiClinic = {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  created_at?: string
}

type ApiDoctorInClinic = {
  id: string
  first_name: string
  last_name?: string | null
  specialization?: string | null
  clinic_id?: string | null
  clinic_name?: string | null
}

// ============================================================
// Mappers
// ============================================================

const mapClinic = (data: ApiClinic): Clinic => ({
  id: data.id,
  name: data.name,
  address: data.address ?? undefined,
  phone: data.phone ?? undefined,
  createdAt: data.created_at,
})

const mapDoctorInClinic = (data: ApiDoctorInClinic): DoctorInClinic => {
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ')
  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name ?? undefined,
    specialization: data.specialization ?? undefined,
    clinicId: data.clinic_id ?? undefined,
    clinicName: data.clinic_name ?? undefined,
    fullName: fullName || data.first_name,
  }
}

// ============================================================
// API Methods
// ============================================================

export const clinicsApi = {
  /**
   * List clinics visible to current doctor.
   * Usually returns just one clinic (the doctor's own clinic).
   */
  async list(): Promise<Clinic[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiClinic[]>('/clinics', {
      headers: buildAuthHeaders(authToken),
    })
    return Array.isArray(data) ? data.map(mapClinic) : []
  },

  /**
   * Get a specific clinic by ID.
   */
  async getById(clinicId: string): Promise<Clinic> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiClinic>(`/clinics/${clinicId}`, {
      headers: buildAuthHeaders(authToken),
    })
    return mapClinic(data)
  },

  /**
   * List all doctors in a clinic.
   */
  async listDoctors(clinicId: string): Promise<DoctorInClinic[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiDoctorInClinic[]>(
      `/clinics/${clinicId}/doctors`,
      { headers: buildAuthHeaders(authToken) }
    )
    return Array.isArray(data) ? data.map(mapDoctorInClinic) : []
  },

  /**
   * Get current doctor's clinic.
   * Returns null if doctor is not assigned to any clinic.
   */
  async getMyClinic(): Promise<Clinic | null> {
    const authToken = getAuthToken()
    try {
      const { data } = await apiClient.get<ApiClinic | null>('/doctors/me/clinic', {
        headers: buildAuthHeaders(authToken),
      })
      return data ? mapClinic(data) : null
    } catch {
      return null
    }
  },
}

