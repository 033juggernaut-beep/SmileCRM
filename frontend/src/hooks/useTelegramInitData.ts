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
