/**
 * AI Assistant API client
 */
import { apiClient } from './client'
import { buildAuthHeaders, TOKEN_STORAGE_KEY } from './patients'

// Types
export type AICategory = 'diagnosis' | 'visits' | 'finance' | 'marketing'
export type AILocale = 'hy' | 'ru' | 'en'

export interface AIAction {
  type: string
  patient_id?: string | null
  diagnosis?: string
  visit_date?: string
  next_visit_date?: string | null
  notes?: string
  note?: string
}

export interface AIDraft {
  marketing_message?: string | null
}

export interface AIAssistantRequest {
  category: AICategory
  patient_id?: string | null
  text: string
  locale?: AILocale
}

export interface AIAssistantResponse {
  summary: string
  actions: AIAction[]
  draft: AIDraft
  warnings: string[]
}

export interface AIApplyRequest {
  actions: AIAction[]
}

export interface AIApplyResult {
  applied: Array<{
    type: string
    patient_id?: string
    [key: string]: unknown
  }>
  failed: Array<{
    action: string
    error: string
  }>
}

export interface AIApplyResponse {
  success: boolean
  results: AIApplyResult
}

/**
 * AI API client
 */
export const aiApi = {
  /**
   * Send request to AI assistant
   */
  async assistant(request: AIAssistantRequest): Promise<AIAssistantResponse> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await apiClient.post<AIAssistantResponse>(
      '/ai/assistant',
      {
        category: request.category,
        patient_id: request.patient_id || null,
        text: request.text,
        locale: request.locale || 'ru',
      },
      { headers: buildAuthHeaders() }
    )

    return response.data
  },

  /**
   * Apply AI-suggested actions
   */
  async apply(actions: AIAction[]): Promise<AIApplyResponse> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await apiClient.post<AIApplyResponse>(
      '/ai/apply',
      { actions },
      { headers: buildAuthHeaders() }
    )

    return response.data
  },
}
