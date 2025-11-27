import { useEffect, useState } from 'react'

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

type InitDataUnsafe = {
  user?: TelegramUser
}

type TelegramInitData = {
  initDataRaw: string | null
  user: TelegramUser | null
  initDataUnsafe?: InitDataUnsafe
  isInTelegram: boolean // New field to indicate if running in Telegram
}

export const useTelegramInitData = (): TelegramInitData | null => {
  const [state, setState] = useState<TelegramInitData | null>(null)

  useEffect(() => {
    let isMounted = true

    const readInitData = () => {
      const telegram = window.Telegram?.WebApp
      
      // Check if running in Telegram by checking window.Telegram and user agent
      const userAgent = navigator.userAgent || ''
      const isInTelegram = !!(telegram || userAgent.includes('Telegram'))

      // Initialize Telegram WebApp if available
      if (telegram) {
        console.log('[Telegram WebApp] Initializing...', {
          hasExpand: !!telegram.expand,
          hasRequestFullscreen: !!telegram.requestFullscreen,
          hasReady: !!telegram.ready,
          isExpanded: telegram.isExpanded,
          platform: telegram.platform,
          viewportHeight: telegram.viewportHeight,
        })
        
        // IMPORTANT: Call ready() FIRST before other methods
        if (telegram.ready) {
          telegram.ready()
          console.log('[Telegram WebApp] ready() called')
        }
        
        // Detect device type
        const isDesktop = telegram.platform === 'tdesktop' || 
                         telegram.platform === 'web' || 
                         telegram.platform === 'macos' ||
                         telegram.platform === 'windows' ||
                         telegram.platform === 'linux'
        
        const isMobile = telegram.platform === 'ios' || 
                        telegram.platform === 'android'
        
        console.log('[Telegram WebApp] Device detection:', {
          platform: telegram.platform,
          isDesktop,
          isMobile,
          userAgent: navigator.userAgent,
        })
        
        // Function to aggressively expand the app
        const expandApp = () => {
          console.log('[Telegram WebApp] Attempting to expand...')
          
          // Try expand() first (works in all versions)
          if (telegram.expand) {
            telegram.expand()
            console.log('[Telegram WebApp] expand() called')
          }
          
          // For desktop/laptop, also try requestFullscreen if available
          if (isDesktop && telegram.requestFullscreen) {
            console.log('[Telegram WebApp] Requesting fullscreen for desktop...')
            try {
              telegram.requestFullscreen()
            } catch (e) {
              console.log('[Telegram WebApp] requestFullscreen failed:', e)
            }
          }
          
          console.log('[Telegram WebApp] After expand - isExpanded:', telegram.isExpanded)
        }
        
        // Call expand immediately
        expandApp()
        
        // Try multiple times with increasing delays to ensure it works
        const delays = [50, 100, 200, 300, 500]
        delays.forEach(delay => {
          setTimeout(() => {
            if (!telegram.isExpanded) {
              console.log(`[Telegram WebApp] Retrying expand after ${delay}ms (isExpanded: ${telegram.isExpanded})`)
              expandApp()
            }
          }, delay)
        })
        
        // Set header color to match app theme (after expand)
        setTimeout(() => {
          if (telegram.setHeaderColor) {
            telegram.setHeaderColor('#319795') // teal.600 from Chakra UI
            console.log('[Telegram WebApp] Header color set to #319795')
          }
        }, 100)
        
        // Lock orientation to portrait on mobile for better UX (optional)
        if (isMobile && telegram.lockOrientation) {
          telegram.lockOrientation()
          console.log('[Telegram WebApp] Orientation locked')
        }
        
        // Enable closing confirmation (optional)
        // if (telegram.enableClosingConfirmation) {
        //   telegram.enableClosingConfirmation()
        // }
      }

      // 1) Получаем initDataRaw
      let initDataRaw = telegram?.initData || null

      // 2) Если Telegram вернул пустую строку или пробел — считаем это null
      if (initDataRaw && initDataRaw.trim().length === 0) {
        initDataRaw = null
      }

      // 3) Читаем user из initDataUnsafe, если он есть
      const unsafeUser = telegram?.initDataUnsafe?.user

      const user: TelegramUser | null = unsafeUser
        ? {
            id: unsafeUser.id,
            first_name: unsafeUser.first_name,
            last_name: unsafeUser.last_name,
            username: unsafeUser.username,
          }
        : null

      if (isMounted) {
        setState({
          initDataRaw,
          user,
          initDataUnsafe: telegram?.initDataUnsafe as InitDataUnsafe | undefined,
          isInTelegram,
        })
      }
    }

    if (typeof window !== 'undefined') {
      readInitData()
    }

    return () => {
      isMounted = false
    }
  }, [])

  return state
}
