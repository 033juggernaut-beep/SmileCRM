/**
 * useDailyMotivation - Hook for daily personalized motivation messages
 * 
 * Returns a motivation quote that changes once per day based on day-of-year.
 * Same index is used across all languages for consistent meaning.
 */

import { useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useTelegramInitData } from './useTelegramInitData'
import { translations } from '../i18n'

interface DailyMotivation {
  /** Personalized prefix: "Доктор LastName," / "Doktor LastName," / "Dr. LastName," */
  prefix: string
  /** Daily motivation quote in current language */
  quote: string
  /** Whether doctor name is available */
  hasName: boolean
}

/**
 * Get day of year (1-365) for consistent daily quote selection
 */
function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

/**
 * Hook that returns daily personalized motivation
 */
export function useDailyMotivation(): DailyMotivation {
  const { t, language } = useLanguage()
  const telegramData = useTelegramInitData()

  return useMemo(() => {
    // Get doctor name from Telegram user data
    const user = telegramData?.user
    const lastName = user?.last_name || user?.first_name || user?.username || null
    const hasName = !!lastName

    // Get doctor prefix from i18n
    const doctorPrefix = t('home.doctorPrefix')

    // Build personalized prefix
    const prefix = hasName 
      ? `${doctorPrefix} ${lastName},`
      : `${doctorPrefix},`

    // Get quotes array directly from translations (not via t() which only returns strings)
    const currentTranslations = translations[language]
    const quotes = currentTranslations.motivation?.quotes || []

    // Calculate daily index
    const dayOfYear = getDayOfYear()
    const quoteIndex = quotes.length > 0 ? dayOfYear % quotes.length : 0

    // Get today's quote
    const quote = quotes[quoteIndex] || ''

    return {
      prefix,
      quote,
      hasName,
    }
  }, [t, language, telegramData])
}

export default useDailyMotivation

