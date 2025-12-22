/**
 * useTelegramSafeArea - Hook to get Telegram Mini App safe area insets
 * 
 * Returns safe area values to prevent content from being hidden under:
 * - Telegram native controls (Close X, Menu ...) on the right
 * - Status bar / notch on iOS
 * - Navigation bar on Android
 * 
 * Usage:
 * const { topInset, rightInset, isInTelegram, platform, headerHeight } = useTelegramSafeArea()
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
  /** Recommended header height including safe area (topInset + base header) */
  headerHeight: number
}

// Conservative fallback values for Telegram overlay areas
// These are intentionally aggressive to ensure controls are always visible
const FALLBACK_TOP_IOS = 56 // iOS status bar (44-47px) + small buffer for Telegram header area
const FALLBACK_TOP_ANDROID = 48 // Android status bar (~24px) + Telegram header area
const FALLBACK_TOP_DESKTOP = 0 // Desktop doesn't need top padding
const FALLBACK_RIGHT_MOBILE = 64 // Telegram X and ... buttons width (~56px) + padding
const FALLBACK_RIGHT_DESKTOP = 0 // Desktop doesn't have overlay buttons

// Base header height (without safe area)
const BASE_HEADER_HEIGHT = 56

// Helper to detect platform from user agent when Telegram API is not available
function detectPlatformFromUA(): 'ios' | 'android' | 'desktop' | 'unknown' {
  const ua = navigator.userAgent || ''
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  if (/Windows|Macintosh|Linux/.test(ua) && !/Mobile/.test(ua)) return 'desktop'
  return 'unknown'
}

// Calculate insets synchronously (for initial state)
function calculateInsetsSync(): TelegramSafeAreaInsets {
  const telegram = window.Telegram?.WebApp
  
  // Check if in Telegram - more robust detection
  const userAgent = navigator.userAgent || ''
  const hasWebApp = !!telegram
  const hasTelegramInUA = userAgent.includes('Telegram')
  const hasInitData = !!telegram?.initData
  const isInTelegram = hasWebApp || hasTelegramInUA || hasInitData
  
  if (!isInTelegram) {
    // Not in Telegram, no safe area needed
    return {
      topInset: 0,
      rightInset: 0,
      bottomInset: 0,
      leftInset: 0,
      isInTelegram: false,
      platform: 'web',
      headerHeight: BASE_HEADER_HEIGHT,
    }
  }
  
  // Get platform from Telegram API or detect from UA
  let platform = telegram?.platform || 'unknown'
  const uaPlatform = detectPlatformFromUA()
  
  // If platform is unknown but we can detect from UA, use that
  if (platform === 'unknown' && uaPlatform !== 'unknown') {
    platform = uaPlatform
  }
  
  // Determine if mobile or desktop
  const isMobile = platform === 'ios' || platform === 'android' || platform === 'android_x'
  const isIOS = platform === 'ios'
  const isDesktop = platform === 'tdesktop' || platform === 'macos' || 
                    platform === 'windows' || platform === 'linux' ||
                    platform === 'web' || platform === 'weba' || platform === 'webk'
  
  // If unknown platform but in Telegram, assume mobile (safer)
  const assumeMobile = !isMobile && !isDesktop && isInTelegram
  
  // Get safe area from Telegram API if available
  const safeArea = telegram?.safeAreaInset
  const contentSafeArea = telegram?.contentSafeAreaInset
  
  let topInset = 0
  let rightInset = 0
  let bottomInset = 0
  let leftInset = 0
  
  // Use Telegram's contentSafeAreaInset if available (preferred for content area)
  if (contentSafeArea && (contentSafeArea.top > 0 || contentSafeArea.right > 0)) {
    topInset = contentSafeArea.top || 0
    rightInset = contentSafeArea.right || 0
    bottomInset = contentSafeArea.bottom || 0
    leftInset = contentSafeArea.left || 0
  } 
  // Fallback to safeAreaInset
  else if (safeArea && (safeArea.top > 0 || safeArea.right > 0)) {
    topInset = safeArea.top || 0
    rightInset = safeArea.right || 0
    bottomInset = safeArea.bottom || 0
    leftInset = safeArea.left || 0
  }
  // Use conservative fallbacks when API doesn't provide values
  else if (isMobile || assumeMobile) {
    topInset = isIOS || uaPlatform === 'ios' ? FALLBACK_TOP_IOS : FALLBACK_TOP_ANDROID
    rightInset = FALLBACK_RIGHT_MOBILE
  } else if (isDesktop) {
    topInset = FALLBACK_TOP_DESKTOP
    rightInset = FALLBACK_RIGHT_DESKTOP
  }
  
  // On mobile/unknown, always ensure minimum padding for Telegram buttons
  // Even if API returns 0, Telegram's X and ... buttons are there on mobile
  if ((isMobile || assumeMobile) && rightInset < FALLBACK_RIGHT_MOBILE) {
    rightInset = FALLBACK_RIGHT_MOBILE
  }
  
  // Ensure minimum top inset on mobile even if API returns 0
  // Telegram always has some header area on mobile
  if ((isMobile || assumeMobile) && topInset < 24) {
    topInset = isIOS || uaPlatform === 'ios' ? FALLBACK_TOP_IOS : FALLBACK_TOP_ANDROID
  }
  
  return {
    topInset,
    rightInset,
    bottomInset,
    leftInset,
    isInTelegram,
    platform,
    headerHeight: BASE_HEADER_HEIGHT + topInset,
  }
}

export function useTelegramSafeArea(): TelegramSafeAreaInsets {
  // Initialize with calculated values immediately (SSR-safe)
  const [insets, setInsets] = useState<TelegramSafeAreaInsets>(calculateInsetsSync)

  const calculateInsets = useCallback(() => {
    return calculateInsetsSync()
  }, [])

  useEffect(() => {
    const telegram = window.Telegram?.WebApp
    
    // Initialize Telegram WebApp if available
    if (telegram) {
      // Mark as ready
      if (telegram.ready) {
        telegram.ready()
      }
      
      // Expand to fullscreen
      if (telegram.expand) {
        telegram.expand()
      }
    }
    
    // Recalculate on mount (in case values changed)
    setInsets(calculateInsets())
    
    // Listen for viewport changes which might affect safe areas
    const handleViewportChange = () => {
      // Small delay to let Telegram update its values
      setTimeout(() => {
        setInsets(calculateInsets())
      }, 50)
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

