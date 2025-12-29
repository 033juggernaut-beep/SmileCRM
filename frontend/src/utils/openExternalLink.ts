/**
 * Utility for opening external links in Telegram Mini App
 * Handles fallbacks for different platforms and scenarios
 */

/**
 * Format phone number to E.164 format (+374XXXXXXXX)
 * Returns null if phone cannot be formatted
 */
export function formatPhoneToE164(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If already starts with +, assume it's E.164
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // If starts with 00, replace with +
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.slice(2)
  }

  // Armenia-specific: if starts with 0 and is 9 digits (0XX XXX XXX)
  if (cleaned.startsWith('0') && cleaned.length === 9) {
    return '+374' + cleaned.slice(1)
  }

  // If it's 8 digits and looks like Armenian mobile (starting with 9, 7, 5, 4, 3)
  if (cleaned.length === 8 && /^[97543]/.test(cleaned)) {
    return '+374' + cleaned
  }

  // If it's 11 digits starting with 374
  if (cleaned.length === 11 && cleaned.startsWith('374')) {
    return '+' + cleaned
  }

  // If it's 12 digits starting with 374 (maybe with extra 0)
  if (cleaned.length >= 10) {
    // Assume international format without +
    return '+' + cleaned
  }

  // Cannot format reliably
  return null
}

/**
 * Open external link with fallbacks for Telegram Mini App
 * 
 * Priority:
 * 1. Telegram.WebApp.openLink (for Telegram Mini App)
 * 2. window.open (for regular browsers)
 * 3. window.location.href (last resort for mobile)
 */
export function openExternalLink(
  url: string,
  options?: {
    onError?: (error: string) => void
    onBlocked?: () => void
  }
): void {
  const { onError, onBlocked } = options || {}

  try {
    // Get Telegram WebApp if available
    const tg = (window as Window & { 
      Telegram?: { 
        WebApp?: { 
          openLink?: (url: string) => void
          openTelegramLink?: (url: string) => void
          platform?: string
        } 
      } 
    }).Telegram?.WebApp

    // For Telegram links, use openTelegramLink
    if (url.startsWith('https://t.me/') && tg?.openTelegramLink) {
      tg.openTelegramLink(url)
      return
    }

    // Try Telegram's openLink first (works best in Mini App)
    if (tg?.openLink) {
      try {
        tg.openLink(url)
        return
      } catch (e) {
        console.warn('Telegram openLink failed:', e)
        // Continue to fallback
      }
    }

    // Fallback: window.open
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    
    // If window.open was blocked or failed
    if (!newWindow || newWindow.closed) {
      // Check if it's a deep link that might have been handled
      if (url.startsWith('viber://') || url.startsWith('whatsapp://')) {
        // Deep links might work even if window.open returns null
        // Give it a moment, then fallback
        setTimeout(() => {
          // Last resort: direct navigation
          window.location.href = url
        }, 100)
        return
      }
      
      // For http(s) links, try location.href
      window.location.href = url
    }
  } catch (error) {
    console.error('Failed to open external link:', error)
    
    // Check if it's a blocked deep link (common on some platforms)
    if (url.startsWith('viber://')) {
      onBlocked?.()
      onError?.('Viber не установлен или ссылка заблокирована')
      return
    }
    
    onError?.(error instanceof Error ? error.message : 'Не удалось открыть ссылку')
  }
}

/**
 * Build Viber chat URL
 * Returns null if phone is invalid
 */
export function buildViberLink(phone: string | null | undefined, message?: string): string | null {
  const e164Phone = formatPhoneToE164(phone)
  if (!e164Phone) return null

  // URL encode the phone number (including the +)
  const encodedPhone = encodeURIComponent(e164Phone)
  
  let url = `viber://chat?number=${encodedPhone}`
  
  if (message) {
    url += `&text=${encodeURIComponent(message)}`
  }
  
  return url
}

// Alias for compatibility
export const buildViberUrl = buildViberLink

/**
 * Build WhatsApp chat URL
 * Returns null if phone is invalid
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const e164Phone = formatPhoneToE164(phone)
  if (!e164Phone) return null

  // WhatsApp uses number without + prefix
  const cleanPhone = e164Phone.replace(/^\+/, '')
  
  let url = `https://wa.me/${cleanPhone}`
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  
  return url
}

/**
 * Build Telegram chat URL
 * Supports both username and phone
 */
export function buildTelegramUrl(
  usernameOrPhone: string | null | undefined, 
  message?: string
): string | null {
  if (!usernameOrPhone) return null

  let url: string

  // Check if it's a username (starts with @ or is alphanumeric)
  if (usernameOrPhone.startsWith('@') || /^[a-zA-Z]/.test(usernameOrPhone)) {
    const username = usernameOrPhone.replace(/^@/, '')
    url = `https://t.me/${username}`
  } else {
    // It's a phone number
    const e164Phone = formatPhoneToE164(usernameOrPhone)
    if (!e164Phone) return null
    
    const cleanPhone = e164Phone.replace(/^\+/, '')
    url = `https://t.me/+${cleanPhone}`
  }
  
  if (message) {
    url += `?text=${encodeURIComponent(message)}`
  }
  
  return url
}
