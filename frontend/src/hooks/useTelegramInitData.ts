import { useEffect, useState } from 'react'

type TelegramUser = {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

type TelegramInitData = {
  initDataRaw: string | null
  user: TelegramUser | null
}

export const useTelegramInitData = (): TelegramInitData | null => {
  const [state, setState] = useState<TelegramInitData | null>(null)

  useEffect(() => {
    let isMounted = true

    const readInitData = () => {
      const telegram = window.Telegram?.WebApp

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
