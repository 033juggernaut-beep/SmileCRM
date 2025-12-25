/**
 * AI Assistant API client
 */
import { apiClient } from './client'

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

// Voice types (for compatibility with VoiceAssistantButton)
export type VoiceLanguage = 'hy' | 'ru' | 'en'
export type VoiceMode = 'free' | 'patient_add' | 'visit_add'

export interface VoiceParseStructured {
  first_name?: string
  last_name?: string
  phone?: string
  diagnosis?: string
  birth_date?: string
  visit_date?: string
  next_visit_date?: string
  notes?: string
}

export interface VoiceParseResponse {
  text: string
  language: VoiceLanguage
  mode: VoiceMode
  structured?: VoiceParseStructured
}

/**
 * Parse voice input (placeholder - returns mock for now)
 */
export async function parseVoice(
  _audioBlob: Blob,
  _mode: VoiceMode = 'free',
  _language: VoiceLanguage = 'ru'
): Promise<VoiceParseResponse> {
  // TODO: Implement real voice parsing with Whisper API
  return {
    text: '',
    language: 'ru',
    mode: 'free',
  }
}

/**
 * Check if structured data is patient data
 */
export function isPatientStructured(data: VoiceParseStructured | undefined): data is VoiceParseStructured {
  return !!(data && (data.first_name || data.last_name || data.phone))
}

/**
 * AI API client
 */
export const aiApi = {
  /**
   * Send request to AI assistant
   */
  async assistant(request: AIAssistantRequest): Promise<AIAssistantResponse> {
    // apiClient interceptor handles auth token automatically
    const response = await apiClient.post<AIAssistantResponse>(
      '/ai/assistant',
      {
        category: request.category,
        patient_id: request.patient_id || null,
        text: request.text,
        locale: request.locale || 'ru',
      }
    )

    return response.data
  },

  /**
   * Apply AI-suggested actions
   */
  async apply(actions: AIAction[]): Promise<AIApplyResponse> {
    // apiClient interceptor handles auth token automatically
    const response = await apiClient.post<AIApplyResponse>(
      '/ai/apply',
      { actions }
    )

    return response.data
  },
}
