/**
 * AI Voice Assistant API module.
 * Handles voice recording upload and parsing.
 */

import { apiClient } from './client'
import { getAuthToken } from './auth'

// Types
export type VoiceMode = 'patient' | 'visit' | 'note'
export type VoiceLanguage = 'auto' | 'hy' | 'ru' | 'en'

export type PatientStructured = {
  patient: {
    first_name: string | null
    last_name: string | null
    phone: string | null
    diagnosis: string | null
    status: 'in_progress' | 'completed' | null
  }
}

export type MedicationItem = {
  name: string
  dose: string | null
  frequency: string | null
  duration: string | null
}

export type VisitStructured = {
  visit: {
    visit_date: string | null
    next_visit_date: string | null
    notes: string | null
    diagnosis: string | null
  }
  medications: MedicationItem[]
}

export type NoteStructured = {
  note: {
    notes: string | null
  }
}

export type VoiceParseStructured = PatientStructured | VisitStructured | NoteStructured

export type VoiceParseResponse = {
  mode: VoiceMode
  language: VoiceLanguage
  transcript: string
  structured: VoiceParseStructured
  warnings: string[]
}

export type ParseVoiceParams = {
  mode: VoiceMode
  language?: VoiceLanguage
  contextPatientId?: string
  audioBlob: Blob
}

/**
 * Type guard to check if structured is PatientStructured
 */
export const isPatientStructured = (
  structured: VoiceParseStructured
): structured is PatientStructured => {
  return 'patient' in structured
}

/**
 * Type guard to check if structured is VisitStructured
 */
export const isVisitStructured = (
  structured: VoiceParseStructured
): structured is VisitStructured => {
  return 'visit' in structured
}

/**
 * Type guard to check if structured is NoteStructured
 */
export const isNoteStructured = (
  structured: VoiceParseStructured
): structured is NoteStructured => {
  return 'note' in structured
}

/**
 * Parse voice recording to structured data.
 * 
 * @param params - Parse parameters
 * @returns Parsed voice response with transcript and structured data
 */
export const parseVoice = async (params: ParseVoiceParams): Promise<VoiceParseResponse> => {
  const authToken = getAuthToken()
  
  const formData = new FormData()
  formData.append('mode', params.mode)
  formData.append('language', params.language || 'auto')
  
  if (params.contextPatientId) {
    formData.append('contextPatientId', params.contextPatientId)
  }
  
  // Append audio file with proper filename
  const filename = `recording.webm`
  formData.append('audio', params.audioBlob, filename)
  
  const { data } = await apiClient.post<VoiceParseResponse>(
    '/ai/voice/parse',
    formData,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        // IMPORTANT: Set Content-Type to undefined to let axios set multipart/form-data
        // with correct boundary. The default 'application/json' from apiClient breaks FormData.
        'Content-Type': undefined,
      },
      timeout: 60000, // 60 seconds for voice processing
    }
  )
  
  return data
}

/**
 * AI API module
 */
export const aiApi = {
  parseVoice,
}
