/**
 * Marketing API for patient marketing events and birthday management
 */
import { apiClient, buildAuthHeaders } from './client'
import { getAuthToken } from './auth'

// Types
export type MarketingEventType = 'birthday_greeting' | 'promo_offer' | 'recall_reminder' | 'ai_birthday_generated' | 'ai_discount_generated' | 'ai_recall_generated'

export type AIMessageType = 'birthday' | 'discount' | 'recall'

export type AILanguage = 'am' | 'ru' | 'en'

export type AIGenerateInput = {
  type: AIMessageType
  language: AILanguage
  patientId: string
  discountPercent?: number
}

export type AIGenerateResponse = {
  text: string
  type: AIMessageType
  language: AILanguage
  segment: string
  charCount: number
}

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
  segment?: string | null
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
  segment?: string | null
  days_until_birthday?: number | null
}

type ApiAIGenerateResponse = {
  text: string
  type: string
  language: string
  segment: string
  char_count: number
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
  segment: data.segment,
  daysUntilBirthday: data.days_until_birthday,
})

const mapAIGenerateResponse = (data: ApiAIGenerateResponse): AIGenerateResponse => ({
  text: data.text,
  type: data.type as AIMessageType,
  language: data.language as AILanguage,
  segment: data.segment,
  charCount: data.char_count,
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

  /**
   * Generate AI-powered marketing text
   */
  async generateAIText(input: AIGenerateInput): Promise<AIGenerateResponse> {
    const authToken = getAuthToken()
    const { data } = await apiClient.post<ApiAIGenerateResponse>(
      '/marketing/ai-generate',
      {
        type: input.type,
        language: input.language,
        patient_id: input.patientId,
        discount_percent: input.discountPercent,
      },
      { headers: buildAuthHeaders(authToken) }
    )
    return mapAIGenerateResponse(data)
  },
}

// Template generators (MVP without AI)
export const marketingTemplates = {
  /**
   * Generate birthday greeting message
   */
  birthdayGreeting(patientName: string, lang: 'am' | 'ru' | 'en' = 'am'): string {
    const templates = {
      am: `🎂 Shnorhavor cnndan, ${patientName}!\n\nSmileCRM-e jer cankanam e lav aroxjutyun, gexxecik jpit ev hianali tram!\n\nAroxj ekeq!\n🦷 Jer SmileCRM`,
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
      am: `👋 Barev, ${patientName}!\n\nHishecnum enq, vor jam e grancvel planayin znnum. Kanonavor vizitner ognum en pahpanel atamneri aroxjutyune!\n\n📞 Granceq viziti!\n🦷 SmileCRM`,
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
      am: `🎁 ${patientName}, unecek anhatakan arajark!\n\nUrax enq arajarkelu jer anhatakan ${discountPercent}% zexche hajord viziti hamar!\n\nSpanum enq jer!\n🦷 SmileCRM`,
      ru: `🎁 ${patientName}, специальное предложение для вас!\n\nМы рады предложить вам персональную скидку ${discountPercent}% на следующее посещение!\n\nЖдём вас!\n🦷 SmileCRM`,
      en: `🎁 ${patientName}, special offer for you!\n\nWe're happy to offer you a personal ${discountPercent}% discount on your next visit!\n\nLooking forward to seeing you!\n🦷 SmileCRM`,
    }
    return templates[lang]
  },
}
