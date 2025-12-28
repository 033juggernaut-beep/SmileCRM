/**
 * AI Assistant API client
 */
import { apiClient } from './client'

// ============================================================================
// AI Assistant types (for FloatingAIAssistant component)
// ============================================================================

export type AICategory = 'diagnosis' | 'visits' | 'finance' | 'marketing'
export type AILocale = 'hy' | 'ru' | 'en'

export interface AIAction {
  type: string
  patient_id?: string | null
  diagnosis?: string
  visit_date?: string | null
  visit_date_raw?: string | null
  next_visit_date?: string | null
  notes?: string
  note?: string
  needs_clarification?: boolean
  clarification_question?: string | null
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

// ============================================================================
// Voice Assistant types (for VoiceAssistantButton component)
// ============================================================================

export type VoiceLanguage = 'auto' | 'hy' | 'ru' | 'en'
export type VoiceMode = 'patient' | 'visit' | 'note'

// Structured data for patient creation
export interface VoicePatientStructured {
  first_name?: string
  last_name?: string
  phone?: string
  diagnosis?: string
  birth_date?: string
}

// Structured data for visit creation
export interface VoiceVisitStructured {
  visit_date?: string
  next_visit_date?: string
  notes?: string
  diagnosis?: string
}

// Structured data for note
export interface VoiceNoteStructured {
  notes?: string
}

// Medication item
export interface VoiceMedication {
  name: string
  dosage?: string
  frequency?: string
}

// Union type for all structured data
export type VoiceParseStructured = 
  | { patient: VoicePatientStructured }
  | { visit: VoiceVisitStructured; medications?: VoiceMedication[] }
  | { note: VoiceNoteStructured }

export interface VoiceParseResponse {
  transcript: string
  language: VoiceLanguage
  mode: VoiceMode
  structured: VoiceParseStructured
  warnings: string[]
}

export interface VoiceParseRequest {
  mode: VoiceMode
  language: VoiceLanguage
  contextPatientId?: string
  audioBlob: Blob
}

/**
 * Parse voice input via backend API
 */
export async function parseVoice(request: VoiceParseRequest): Promise<VoiceParseResponse> {
  const formData = new FormData()
  formData.append('mode', request.mode)
  formData.append('language', request.language)
  if (request.contextPatientId) {
    formData.append('context_patient_id', request.contextPatientId)
  }
  formData.append('audio', request.audioBlob, 'recording.webm')

  const response = await apiClient.post<VoiceParseResponse>('/voice/parse', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

/**
 * Check if structured data is patient data
 */
export function isPatientStructured(data: VoiceParseStructured | undefined): data is { patient: VoicePatientStructured } {
  return !!data && 'patient' in data
}

/**
 * Check if structured data is visit data
 */
export function isVisitStructured(data: VoiceParseStructured | undefined): data is { visit: VoiceVisitStructured; medications?: VoiceMedication[] } {
  return !!data && 'visit' in data
}

/**
 * Check if structured data is note data
 */
export function isNoteStructured(data: VoiceParseStructured | undefined): data is { note: VoiceNoteStructured } {
  return !!data && 'note' in data
}

// ============================================================================
// Voice AI types (new Whisper-based voice parsing)
// ============================================================================

export type VoiceAIMode = 'visit' | 'diagnosis' | 'payment' | 'message'

export interface VoiceParsedData {
  visit_date: string | null
  next_visit_date: string | null
  diagnosis: string | null
  notes: string | null
  amount: number | null
  currency: string | null
}

export interface VoiceParseAPIResponse {
  ok: boolean
  text: string
  data: VoiceParsedData
  warnings: string[]
}

export interface VoiceCommitRequest {
  mode: VoiceAIMode
  patient_id: string
  data: VoiceParsedData
}

export interface VoiceCommitResponse {
  ok: boolean
  message: string
  created?: Record<string, unknown>
}

// ============================================================================
// AI Assistant API client
// ============================================================================

export const aiApi = {
  /**
   * Send request to AI assistant
   */
  async assistant(request: AIAssistantRequest): Promise<AIAssistantResponse> {
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
    const response = await apiClient.post<AIApplyResponse>(
      '/ai/apply',
      { actions }
    )

    return response.data
  },
}

// ============================================================================
// Voice AI API client (new Whisper-based)
// ============================================================================

export const voiceApi = {
  /**
   * Parse voice audio - sends to Whisper STT + LLM parsing
   */
  async parse(
    audioBlob: Blob,
    mode: VoiceAIMode,
    patientId: string,
    options?: {
      timezone?: string
      locale?: 'ru' | 'hy' | 'en'
      today?: string
    }
  ): Promise<VoiceParseAPIResponse> {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('mode', mode)
    formData.append('patient_id', patientId)
    formData.append('timezone', options?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
    formData.append('locale', options?.locale || 'ru')
    if (options?.today) {
      formData.append('today', options.today)
    }

    const response = await apiClient.post<VoiceParseAPIResponse>(
      '/ai/voice/parse',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response.data
  },

  /**
   * Commit parsed voice data to database
   */
  async commit(request: VoiceCommitRequest): Promise<VoiceCommitResponse> {
    const response = await apiClient.post<VoiceCommitResponse>(
      '/ai/voice/commit',
      request
    )

    return response.data
  },
}
