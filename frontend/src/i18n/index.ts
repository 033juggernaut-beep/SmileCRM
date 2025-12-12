/**
 * i18n module - Simple internationalization for SmileCRM
 * Default language: Armenian (am)
 */

import am from './am'
import ru from './ru'
import en from './en'

// Supported languages
export type Language = 'am' | 'ru' | 'en'

// Default language is Armenian
export const DEFAULT_LANGUAGE: Language = 'am'

// All translations
export const translations = {
  am,
  ru,
  en,
} as const

// Type for translation keys (derived from Armenian as it's the default)
export type TranslationKeys = typeof am

// Language display names with flags
export const languageNames: Record<Language, { flag: string; name: string; native: string }> = {
  am: { flag: '\u{1F1E6}\u{1F1F2}', name: 'Armenian', native: '\u0540\u0561\u0575\u0565\u0580\u0565\u0576' },
  ru: { flag: '\u{1F1F7}\u{1F1FA}', name: 'Russian', native: '\u0420\u0443\u0441\u0441\u056F\u0438\u0439' },
  en: { flag: '\u{1F1EC}\u{1F1E7}', name: 'English', native: 'English' },
}

// localStorage key for language preference
export const LANGUAGE_STORAGE_KEY = 'smilecrm_language'

/**
 * Get translation value by dot-notation path
 * Example: getNestedValue(translations.am, 'home.patients') => 'Իdelays delays'
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      // Key not found, return path as fallback
      return path
    }
  }
  
  return typeof current === 'string' ? current : path
}
