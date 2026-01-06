/**
 * AI Assistant Local Storage Helper
 * 
 * Persists the last Q&A to localStorage with 24-hour TTL.
 */

const STORAGE_KEY = 'smilecrm_ai_assistant_last'
const TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export type AiAssistantSaved = {
  question: string
  answer: string
  lang: 'am' | 'ru' | 'en'
  createdAt: string // ISO string
}

/**
 * Load the last saved AI answer from localStorage.
 * Returns null if not found, invalid, or expired (>24h).
 */
export function loadLastAiAnswer(): AiAssistantSaved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw) as unknown

    // Validate required fields
    if (
      typeof data !== 'object' ||
      data === null ||
      typeof (data as AiAssistantSaved).question !== 'string' ||
      typeof (data as AiAssistantSaved).answer !== 'string' ||
      typeof (data as AiAssistantSaved).lang !== 'string' ||
      typeof (data as AiAssistantSaved).createdAt !== 'string'
    ) {
      console.warn('[AI Storage] Invalid saved data, clearing')
      clearLastAiAnswer()
      return null
    }

    const saved = data as AiAssistantSaved

    // Check TTL (24 hours)
    const createdAt = new Date(saved.createdAt).getTime()
    const now = Date.now()
    if (isNaN(createdAt) || now - createdAt > TTL_MS) {
      console.info('[AI Storage] Saved answer expired, clearing')
      clearLastAiAnswer()
      return null
    }

    return saved
  } catch (err) {
    console.error('[AI Storage] Error loading:', err)
    clearLastAiAnswer()
    return null
  }
}

/**
 * Save the AI answer to localStorage.
 */
export function saveLastAiAnswer(data: AiAssistantSaved): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('[AI Storage] Error saving:', err)
  }
}

/**
 * Clear the saved AI answer from localStorage.
 */
export function clearLastAiAnswer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.error('[AI Storage] Error clearing:', err)
  }
}

/**
 * Format the saved time for display (e.g., "2 hours ago").
 */
export function formatSavedTime(isoString: string, t: (key: string) => string): string {
  try {
    const saved = new Date(isoString).getTime()
    const now = Date.now()
    const diffMs = now - saved
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) {
      return t('ai.savedJustNow') || 'Just now'
    } else if (diffMins < 60) {
      return `${diffMins} ${t('ai.savedMinutesAgo') || 'min ago'}`
    } else {
      return `${diffHours} ${t('ai.savedHoursAgo') || 'h ago'}`
    }
  } catch {
    return ''
  }
}

