import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type Medication = {
  id: string
  patientId: string
  doctorId: string
  name: string
  dosage?: string | null
  comment?: string | null
  createdAt?: string
}

export type CreateMedicationInput = {
  name: string
  dosage?: string
  comment?: string
}

type ApiMedication = {
  id: string
  patient_id: string
  doctor_id: string
  name: string
  dosage?: string | null
  comment?: string | null
  created_at?: string
}

const mapMedication = (data: ApiMedication): Medication => ({
  id: data.id,
  patientId: data.patient_id,
  doctorId: data.doctor_id,
  name: data.name,
  dosage: data.dosage ?? undefined,
  comment: data.comment ?? undefined,
  createdAt: data.created_at,
})

export const medicationsApi = {
  async list(patientId: string): Promise<Medication[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiMedication[]>(
      `/patients/${patientId}/medications`,
      { headers: buildAuthHeaders(authToken) }
    )
    return Array.isArray(data) ? data.map(mapMedication) : []
  },

  async create(patientId: string, payload: CreateMedicationInput): Promise<Medication> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiMedication>(
      `/patients/${patientId}/medications`,
      {
        name: payload.name,
        dosage: payload.dosage || null,
        comment: payload.comment || null,
      },
      { headers: buildAuthHeaders(authToken) }
    )
    return mapMedication(data)
  },
}

