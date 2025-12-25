/**
 * Treatment Plan API Client
 * 
 * Provides methods for managing treatment plan items (steps) for patients.
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type TreatmentPlanItem = {
  id: string
  patientId: string
  doctorId: string
  title: string
  priceAmd: number
  isDone: boolean
  tooth?: string | null
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export type CreateTreatmentPlanItemInput = {
  title: string
  priceAmd?: number
  tooth?: string
}

export type UpdateTreatmentPlanItemInput = {
  title?: string
  priceAmd?: number
  isDone?: boolean
  tooth?: string
}

export type TreatmentPlanTotal = {
  totalAmd: number
  completedAmd: number
  pendingAmd: number
}

// API response types (snake_case from backend)
type ApiTreatmentPlanItem = {
  id: string
  patient_id: string
  doctor_id: string
  title: string
  price_amd: number
  is_done: boolean
  tooth?: string | null
  sort_order: number
  created_at?: string
  updated_at?: string
}

type ApiTreatmentPlanTotal = {
  total_amd: number
  completed_amd: number
  pending_amd: number
}

// Mappers
const mapItem = (data: ApiTreatmentPlanItem): TreatmentPlanItem => ({
  id: data.id,
  patientId: data.patient_id,
  doctorId: data.doctor_id,
  title: data.title,
  priceAmd: data.price_amd,
  isDone: data.is_done,
  tooth: data.tooth ?? undefined,
  sortOrder: data.sort_order,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})

const mapTotal = (data: ApiTreatmentPlanTotal): TreatmentPlanTotal => ({
  totalAmd: data.total_amd,
  completedAmd: data.completed_amd,
  pendingAmd: data.pending_amd,
})

export const treatmentPlanApi = {
  /**
   * Get all treatment plan items for a patient
   */
  async list(patientId: string): Promise<TreatmentPlanItem[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiTreatmentPlanItem[]>(
      `/patients/${patientId}/treatment-plan`,
      { headers: buildAuthHeaders(authToken) },
    )
    return Array.isArray(data) ? data.map(mapItem) : []
  },

  /**
   * Create a new treatment plan item
   */
  async createItem(
    patientId: string,
    payload: CreateTreatmentPlanItemInput,
  ): Promise<TreatmentPlanItem> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiTreatmentPlanItem>(
      `/patients/${patientId}/treatment-plan/items`,
      {
        title: payload.title,
        price_amd: payload.priceAmd ?? 0,
        tooth: payload.tooth,
      },
      { headers: buildAuthHeaders(authToken) },
    )
    return mapItem(data)
  },

  /**
   * Update a treatment plan item
   */
  async updateItem(
    itemId: string,
    payload: UpdateTreatmentPlanItemInput,
  ): Promise<TreatmentPlanItem> {
    const authToken = getAuthToken()
    const body: Record<string, unknown> = {}
    
    if (payload.title !== undefined) body.title = payload.title
    if (payload.priceAmd !== undefined) body.price_amd = payload.priceAmd
    if (payload.isDone !== undefined) body.is_done = payload.isDone
    if (payload.tooth !== undefined) body.tooth = payload.tooth
    
    const { data } = await apiClient.patch<ApiTreatmentPlanItem>(
      `/patients/treatment-plan/items/${itemId}`,
      body,
      { headers: buildAuthHeaders(authToken) },
    )
    return mapItem(data)
  },

  /**
   * Delete a treatment plan item
   */
  async deleteItem(itemId: string): Promise<void> {
    const authToken = getAuthToken()
    await apiClient.delete(`/patients/treatment-plan/items/${itemId}`, {
      headers: buildAuthHeaders(authToken),
    })
  },

  /**
   * Get treatment plan totals for a patient
   */
  async getTotal(patientId: string): Promise<TreatmentPlanTotal> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiTreatmentPlanTotal>(
      `/patients/${patientId}/treatment-plan/total`,
      { headers: buildAuthHeaders(authToken) },
    )
    return mapTotal(data)
  },
}

export default treatmentPlanApi

