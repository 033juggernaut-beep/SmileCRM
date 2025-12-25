/**
 * Marketing API module.
 * 
 * Provides functions to generate marketing messages for patients.
 */

import { apiClient } from './client'
import { getAuthToken } from './auth'
import type { Language } from '../i18n'

export type MessageTemplate = 'birthday' | 'visit_reminder' | 'promo' | 'post_treatment'
export type AIMessageType = 'birthday' | 'recall' | 'discount' | 'recommendation'
export type AILanguage = 'am' | 'ru' | 'en'

export interface MessagePreviewResponse {
  text: string
  template: MessageTemplate
}

export interface AITextRequest {
  type: AIMessageType
  language: AILanguage
  patientId: string
  discountPercent?: number
}

export interface AITextResponse {
  text: string
  segment: string
}

export interface PatientBirthday {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  daysUntilBirthday: number
}

export interface MarketingEvent {
  patientId: string
  type: string
  channel: string
  payload?: Record<string, unknown>
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
 * Generate AI-powered marketing text.
 */
export async function generateAIText(request: AITextRequest): Promise<AITextResponse> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.post<AITextResponse>(
    '/marketing/ai/generate',
    request,
    { headers: { Authorization: `Bearer ${authToken}` } }
  )
  
  return data
}

/**
 * Get upcoming patient birthdays.
 */
export async function getUpcomingBirthdays(period: 'week' | 'month' = 'month'): Promise<PatientBirthday[]> {
  const authToken = getAuthToken()
  
  const { data } = await apiClient.get<PatientBirthday[]>('/marketing/birthdays', {
    params: { period },
    headers: { Authorization: `Bearer ${authToken}` },
  })
  
  return data
}

/**
 * Log a marketing event (message copied, sent, etc.).
 */
export async function createEvent(event: MarketingEvent): Promise<void> {
  const authToken = getAuthToken()
  
  await apiClient.post('/marketing/events', event, {
    headers: { Authorization: `Bearer ${authToken}` },
  })
}

/**
 * Marketing message templates (client-side, for when API is not available).
 */
export const marketingTemplates = {
  birthdayGreeting: (patientName: string, language: Language): string => {
    const templates: Record<Language, string> = {
      en: `Dear ${patientName}! 🎉\n\nHappy Birthday! Wishing you a wonderful day filled with joy and beautiful smiles!\n\nYour dental clinic`,
      ru: `Дорогой(ая) ${patientName}! 🎉\n\nС Днем Рождения! Желаем вам прекрасного дня, наполненного радостью и красивыми улыбками!\n\nВаша стоматологическая клиника`,
      am: `Սիdelays ${patientName}! 🎉\n\ndelays ծdelays delays delays!\n\ndelaysdelays delays`,
    }
    return templates[language] || templates.en
  },
  
  recallReminder: (patientName: string, language: Language): string => {
    const templates: Record<Language, string> = {
      en: `Dear ${patientName},\n\nIt's been a while since your last visit! We recommend scheduling a check-up to maintain your dental health.\n\nCall us to book an appointment.\n\nYour dental clinic`,
      ru: `Уважаемый(ая) ${patientName},\n\nПрошло много времени с вашего последнего визита! Рекомендуем записаться на осмотр для поддержания здоровья зубов.\n\nПозвоните нам для записи.\n\nВаша стоматологическая клиника`,
      am: `Հdelays ${patientName},\n\ndelays delays delays! delays delays delays.\n\ndelays delays.\n\ndelays delays`,
    }
    return templates[language] || templates.en
  },
  
  discountOffer: (patientName: string, percent: number, language: Language): string => {
    const templates: Record<Language, string> = {
      en: `Dear ${patientName},\n\nWe have a special offer just for you! Get ${percent}% off on your next visit.\n\nBook now to take advantage of this exclusive discount!\n\nYour dental clinic`,
      ru: `Уважаемый(ая) ${patientName},\n\nУ нас есть специальное предложение для вас! Получите скидку ${percent}% на следующий визит.\n\nЗапишитесь сейчас, чтобы воспользоваться этой эксклюзивной скидкой!\n\nВаша стоматологическая клиника`,
      am: `Հարdelays ${patientName},\n\ndelays delays ${percent}% delays!\n\ndelays delays!\n\ndelays delays`,
    }
    return templates[language] || templates.en
  },
}

/**
 * Marketing API object for convenient access.
 */
export const marketingApi = {
  previewMessage,
  generateAIText,
  getUpcomingBirthdays,
  createEvent,
}

export default marketingApi
