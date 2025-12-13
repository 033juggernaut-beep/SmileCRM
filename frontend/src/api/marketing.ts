/**
 * Marketing API for patient marketing events and birthday management
 */
import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

// Types
export type MarketingEventType = 'birthday_greeting' | 'promo_offer' | 'recall_reminder'

export type MarketingEventChannel = 'copy' | 'telegram'

export type MarketingEventPayload = {
  text?: string
  discountPercent?: number
  [key: string]: unknown
}

export type MarketingEvent = {
  id: string
  doctorId: string
  patientId: string
  type: MarketingEventType
  channel: MarketingEventChannel
  payload?: MarketingEventPayload | null
  createdAt?: string
}

export type CreateMarketingEventInput = {
  patientId: string
  type: MarketingEventType
  channel?: MarketingEventChannel
  payload?: MarketingEventPayload
}

export type PatientBirthday = {
  id: string
  firstName: string
  lastName: string
  phone?: string | null
  birthDate?: string | null
  daysUntilBirthday?: number | null
}

export type BirthdayRange = 'today' | 'week' | 'month'

// API types (snake_case)
type ApiMarketingEvent = {
  id: string
  doctor_id: string
  patient_id: string
  type: string
  channel: string
  payload?: Record<string, unknown> | null
  created_at?: string
}

type ApiPatientBirthday = {
  id: string
  first_name: string
  last_name: string
  phone?: string | null
  birth_date?: string | null
  days_until_birthday?: number | null
}

// Mappers
const mapMarketingEvent = (data: ApiMarketingEvent): MarketingEvent => ({
  id: data.id,
  doctorId: data.doctor_id,
  patientId: data.patient_id,
  type: data.type as MarketingEventType,
  channel: data.channel as MarketingEventChannel,
  payload: data.payload as MarketingEventPayload | undefined,
  createdAt: data.created_at,
})

const mapPatientBirthday = (data: ApiPatientBirthday): PatientBirthday => ({
  id: data.id,
  firstName: data.first_name,
  lastName: data.last_name,
  phone: data.phone,
  birthDate: data.birth_date,
  daysUntilBirthday: data.days_until_birthday,
})

// API functions
export const marketingApi = {
  /**
   * Create a marketing event log (e.g., when copying birthday greeting to clipboard)
   */
  async createEvent(input: CreateMarketingEventInput): Promise<MarketingEvent> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiMarketingEvent>(
      '/marketing/events',
      {
        patient_id: input.patientId,
        type: input.type,
        channel: input.channel ?? 'copy',
        payload: input.payload,
      },
      { headers: buildAuthHeaders(authToken) }
    )
    return mapMarketingEvent(data)
  },

  /**
   * Get list of marketing events (for analytics)
   */
  async listEvents(patientId?: string, eventType?: MarketingEventType): Promise<MarketingEvent[]> {
    const authToken = getAuthToken()
    const params = new URLSearchParams()
    if (patientId) params.append('patient_id', patientId)
    if (eventType) params.append('event_type', eventType)
    
    const { data } = await apiClient.get<ApiMarketingEvent[]>(
      `/marketing/events?${params.toString()}`,
      { headers: buildAuthHeaders(authToken) }
    )
    return Array.isArray(data) ? data.map(mapMarketingEvent) : []
  },

  /**
   * Get patients with upcoming birthdays
   */
  async getUpcomingBirthdays(range: BirthdayRange = 'month'): Promise<PatientBirthday[]> {
    const authToken = getAuthToken()
    const { data } = await apiClient.get<ApiPatientBirthday[]>(
      `/marketing/birthdays?range=${range}`,
      { headers: buildAuthHeaders(authToken) }
    )
    return Array.isArray(data) ? data.map(mapPatientBirthday) : []
  },
}

// Template generators (MVP without AI)
export const marketingTemplates = {
  /**
   * Generate birthday greeting message
   */
  birthdayGreeting(patientName: string, lang: 'am' | 'ru' | 'en' = 'am'): string {
    const templates = {
      am: `🎂 Շdelays shnorհdelays, ${patientName}!\n\nSmileCRM թdelays-delays delays-delays delays-delays ջdelays delays- delays-delays !\n\nԱdelays- delays ժdelays !\n🦷 Ձdelays SmileCRM delays`,
      ru: `🎂 С днём рождения, ${patientName}!\n\nОт всего сердца желаем вам крепкого здоровья, красивой улыбки и отличного настроения!\n\nБудьте здоровы!\n🦷 Ваш SmileCRM`,
      en: `🎂 Happy Birthday, ${patientName}!\n\nWishing you good health, a beautiful smile, and wonderful moments!\n\nStay healthy!\n🦷 Your SmileCRM`,
    }
    return templates[lang]
  },

  /**
   * Generate recall reminder message
   */
  recallReminder(patientName: string, lang: 'am' | 'ru' | 'en' = 'am'): string {
    const templates = {
      am: `👋 Բdelays, ${patientName}!\n\ndelays-delays delays- delays-delays delays-delays delays-delays! delays-ается ратный в!\n\n📞 Зdelete запdelays Visits у нас!\n🦷 SmileCRM`,
      ru: `👋 Здравствуйте, ${patientName}!\n\nНапоминаем, что пора записаться на плановый осмотр. Регулярные визиты помогают сохранить здоровье зубов!\n\n📞 Запишитесь на приём!\n🦷 SmileCRM`,
      en: `👋 Hello, ${patientName}!\n\nJust a friendly reminder that it's time for your regular checkup. Regular visits help maintain your dental health!\n\n📞 Book your appointment!\n🦷 SmileCRM`,
    }
    return templates[lang]
  },

  /**
   * Generate discount offer message
   */
  discountOffer(patientName: string, discountPercent: number, lang: 'am' | 'ru' | 'en' = 'am'): string {
    const templates = {
      am: `🎁 ${patientName}, ունdelays անhat շնdelays!\n\nМdelay delays-delays ${discountPercent}% ելdelay մdelay-delays!\n\nШdelay delays-delays!\n🦷 SmileCRM`,
      ru: `🎁 ${patientName}, специальное предложение для вас!\n\nМы рады предложить вам персональную скидку ${discountPercent}% на следующее посещение!\n\nЖдём вас!\n🦷 SmileCRM`,
      en: `🎁 ${patientName}, special offer for you!\n\nWe're happy to offer you a personal ${discountPercent}% discount on your next visit!\n\nLooking forward to seeing you!\n🦷 SmileCRM`,
    }
    return templates[lang]
  },
}
