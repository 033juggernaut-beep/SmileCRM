/**
 * useTelegramSafeArea - Hook to get Telegram Mini App safe area insets
 * 
 * Returns safe area values to prevent content from being hidden under:
 * - Telegram native controls (Close X, Menu ...) on the right
 * - Status bar / notch on iOS
 * - Navigation bar on Android
 * 
 * Usage:
 * const { topInset, rightInset, isInTelegram, platform } = useTelegramSafeArea()
 */

import { useEffect, useState, useCallback } from 'react'

export interface TelegramSafeAreaInsets {
  /** Top safe area - accounts for Telegram header, status bar, notch */
  topInset: number
  /** Right safe area - accounts for Telegram native buttons (X, ...) */
  rightInset: number
  /** Bottom safe area - accounts for home indicator, navigation bar */
  bottomInset: number
  /** Left safe area - usually 0 */
  leftInset: number
  /** Whether the app is running inside Telegram */
  isInTelegram: boolean
  /** Platform identifier */
  platform: string
}

// Conservative fallback values for Telegram overlay areas
const FALLBACK_TOP_IOS = 44 // iOS status bar + Telegram header
const FALLBACK_TOP_ANDROID = 32 // Android status bar + Telegram header  
const FALLBACK_TOP_DESKTOP = 0 // Desktop doesn't need top padding
const FALLBACK_RIGHT_MOBILE = 56 // Telegram X and ... buttons width on mobile
const FALLBACK_RIGHT_DESKTOP = 0 // Desktop doesn't have overlay buttons

export function useTelegramSafeArea(): TelegramSafeAreaInsets {
  const [insets, setInsets] = useState<TelegramSafeAreaInsets>(() => ({
    topInset: 0,
    rightInset: 0,
    bottomInset: 0,
    leftInset: 0,
    isInTelegram: false,
    platform: 'unknown',
  }))

  const calculateInsets = useCallback(() => {
    const telegram = window.Telegram?.WebApp
    
    // Check if in Telegram
    const userAgent = navigator.userAgent || ''
    const isInTelegram = !!(telegram || userAgent.includes('Telegram'))
    
    if (!isInTelegram) {
      // Not in Telegram, no safe area needed
      return {
        topInset: 0,
        rightInset: 0,
        bottomInset: 0,
        leftInset: 0,
        isInTelegram: false,
        platform: 'web',
      }
    }
    
    const platform = telegram?.platform || 'unknown'
    
    // Determine if mobile or desktop
    const isMobile = platform === 'ios' || platform === 'android' || platform === 'android_x'
    const isIOS = platform === 'ios'
    const isDesktop = platform === 'tdesktop' || platform === 'macos' || 
                      platform === 'windows' || platform === 'linux' ||
                      platform === 'web' || platform === 'weba' || platform === 'webk'
    
    // Get safe area from Telegram API if available
    const safeArea = telegram?.safeAreaInset
    const contentSafeArea = telegram?.contentSafeAreaInset
    
    let topInset = 0
    let rightInset = 0
    let bottomInset = 0
    let leftInset = 0
    
    // Use Telegram's contentSafeAreaInset if available (preferred for content area)
    if (contentSafeArea) {
      topInset = contentSafeArea.top || 0
      rightInset = contentSafeArea.right || 0
      bottomInset = contentSafeArea.bottom || 0
      leftInset = contentSafeArea.left || 0
    } 
    // Fallback to safeAreaInset
    else if (safeArea) {
      topInset = safeArea.top || 0
      rightInset = safeArea.right || 0
      bottomInset = safeArea.bottom || 0
      leftInset = safeArea.left || 0
    }
    // Use conservative fallbacks when API doesn't provide values
    else if (isMobile) {
      topInset = isIOS ? FALLBACK_TOP_IOS : FALLBACK_TOP_ANDROID
      rightInset = FALLBACK_RIGHT_MOBILE
    } else if (isDesktop) {
      topInset = FALLBACK_TOP_DESKTOP
      rightInset = FALLBACK_RIGHT_DESKTOP
    }
    
    // On mobile, always ensure minimum right padding for Telegram buttons
    // Even if API returns 0, Telegram's X and ... buttons are there
    if (isMobile && rightInset < FALLBACK_RIGHT_MOBILE) {
      rightInset = FALLBACK_RIGHT_MOBILE
    }
    
    return {
      topInset,
      rightInset,
      bottomInset,
      leftInset,
      isInTelegram,
      platform,
    }
  }, [])

  useEffect(() => {
    // Initial calculation
    setInsets(calculateInsets())
    
    const telegram = window.Telegram?.WebApp
    
    // Listen for viewport changes which might affect safe areas
    const handleViewportChange = () => {
      setInsets(calculateInsets())
    }
    
    // Subscribe to Telegram viewport events
    if (telegram?.onEvent) {
      telegram.onEvent('viewportChanged', handleViewportChange)
      telegram.onEvent('safeAreaChanged', handleViewportChange)
      telegram.onEvent('contentSafeAreaChanged', handleViewportChange)
    }
    
    // Also listen for window resize as fallback
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('orientationchange', handleViewportChange)
    
    return () => {
      if (telegram?.offEvent) {
        telegram.offEvent('viewportChanged', handleViewportChange)
        telegram.offEvent('safeAreaChanged', handleViewportChange)
        telegram.offEvent('contentSafeAreaChanged', handleViewportChange)
      }
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('orientationchange', handleViewportChange)
    }
  }, [calculateInsets])

  return insets
}

export default useTelegramSafeArea

