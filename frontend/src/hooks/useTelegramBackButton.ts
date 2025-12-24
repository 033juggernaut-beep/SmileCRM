/**
 * useTelegramBackButton - Hook for Telegram Mini App BackButton
 * 
 * Uses Telegram's native BackButton when running inside Telegram,
 * otherwise signals that a fallback UI button should be shown.
 * 
 * Usage:
 * const { showFallbackButton } = useTelegramBackButton(() => navigate(-1))
 * 
 * // Only show custom back button if not in Telegram
 * {showFallbackButton && <BackButton onClick={onBack} />}
 */

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseTelegramBackButtonResult {
  /** Whether to show a fallback UI button (true when NOT in Telegram) */
  showFallbackButton: boolean
  /** Whether we're running inside Telegram */
  isInTelegram: boolean
}

export function useTelegramBackButton(
  onBack: () => void
): UseTelegramBackButtonResult {
  const [isInTelegram, setIsInTelegram] = useState(false)
  const callbackRef = useRef(onBack)
  
  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = onBack
  }, [onBack])
  
  // Stable callback for Telegram event listener
  const handleBackClick = useCallback(() => {
    callbackRef.current()
  }, [])

  useEffect(() => {
    const telegram = window.Telegram?.WebApp
    const backButton = telegram?.BackButton
    
    // Check if we're in Telegram with BackButton support
    const hasTelegramBackButton = !!backButton?.show && !!backButton?.onClick
    
    setIsInTelegram(hasTelegramBackButton)
    
    if (hasTelegramBackButton) {
      // Show Telegram's native back button
      backButton.show()
      
      // Attach click handler
      backButton.onClick(handleBackClick)
      
      // Cleanup on unmount
      return () => {
        backButton.offClick(handleBackClick)
        backButton.hide()
      }
    }
    
    // Not in Telegram - no cleanup needed
    return undefined
  }, [handleBackClick])

  return {
    showFallbackButton: !isInTelegram,
    isInTelegram,
  }
}

export default useTelegramBackButton

