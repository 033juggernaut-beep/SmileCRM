/**
 * Marketing API module.
 * 
 * Provides functions to generate marketing messages for patients.
 */

import { apiClient } from './client'
import { getAuthToken } from './auth'

export type MessageTemplate = 'birthday' | 'visit_reminder' | 'promo' | 'post_treatment'

export interface MessagePreviewResponse {
  text: string
  template: MessageTemplate
}

/**
 * Generate a marketing message preview for a patient.
 * 
 * @param patientId - The patient UUID
 * @param template - The message template type
 * @returns Promise with generated message text
 * @throws Error if request fails
 */
export async function previewMessage(
  patientId: string,
  template: MessageTemplate
): Promise<MessagePreviewResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post<MessagePreviewResponse>(
    '/marketing/message/preview',
    { patient_id: patientId, template },
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  
  return data
}

/**
 * Marketing API object for convenient access.
 */
export const marketingApi = {
  previewMessage,
}

export default marketingApi
