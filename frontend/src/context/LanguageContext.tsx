/**
 * Language Context for SmileCRM
 * Provides i18n functionality with Armenian as default language.
 * 
 * Usage:
 *   const { language, setLanguage, t } = useLanguage()
 *   <Text>{t('home.patients')}</Text>
 */

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'
import {
  type Language,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  translations,
  getNestedValue,
} from '../i18n'

// Context type
interface LanguageContextType {
  /** Current language code */
  language: Language
  /** Change language and save to localStorage */
  setLanguage: (lang: Language) => void
  /** Translate a key path (e.g., 'home.patients') */
  t: (path: string) => string
}

// Create context with undefined default (will be provided by LanguageProvider)
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

/**
 * Get initial language from localStorage or use default (Armenian)
 */
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  
  // Validate stored value
  if (stored === 'am' || stored === 'ru' || stored === 'en') {
    return stored
  }
  
  // Default to Armenian (NO browser detection)
  return DEFAULT_LANGUAGE
}

/**
 * Language Provider component
 * Wrap your app with this to enable i18n
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  
  // Change language and persist to localStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    }
  }, [])
  
  // Translation function
  const t = useCallback((path: string): string => {
    const currentTranslations = translations[language]
    return getNestedValue(currentTranslations as Record<string, unknown>, path)
  }, [language])
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t])
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

/**
 * Hook to access language context
 * Must be used within LanguageProvider
 */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  
  return context
}

// Export types for convenience
export type { Language, LanguageContextType }
