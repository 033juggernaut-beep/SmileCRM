/**
 * AI Assistant API client
 * 
 * Provides methods for interacting with the AI dental assistant.
 */

import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

export type AILanguage = 'am' | 'ru' | 'en'

export interface AIAssistantAskRequest {
  question: string
  language?: AILanguage
  context?: {
    clinicName?: string
    specialization?: string
  }
}

export interface AIAssistantAskResponse {
  answer: string
  remainingToday: number
  limitToday: number
}

export interface AILimitsResponse {
  usedToday: number
  remainingToday: number
  limitToday: number
  subscriptionStatus: string
}

export interface AIAssistantError {
  message: string
  remainingToday?: number
  limitToday?: number
}

/**
 * Ask the AI dental assistant a question.
 */
export async function askAIAssistant(
  request: AIAssistantAskRequest
): Promise<AIAssistantAskResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post<AIAssistantAskResponse>(
    '/ai/assistant/ask',
    {
      question: request.question,
      language: request.language || 'ru',
      context: request.context,
    },
    { headers: buildAuthHeaders(authToken) }
  )
  
  return data
}

/**
 * Get current AI usage limits.
 */
export async function getAILimits(): Promise<AILimitsResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.get<AILimitsResponse>(
    '/ai/assistant/limits',
    { headers: buildAuthHeaders(authToken) }
  )
  
  return data
}

export const aiAssistantApi = {
  ask: askAIAssistant,
  getLimits: getAILimits,
}

