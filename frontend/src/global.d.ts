interface TelegramWebAppUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
}

interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser
}

interface TelegramWebApp {
  initData?: string
  initDataUnsafe?: TelegramWebAppInitDataUnsafe
  openLink?: (url: string, options?: { try_instant_view?: boolean }) => void
}

interface TelegramSdk {
  WebApp?: TelegramWebApp
}

interface Window {
  Telegram?: TelegramSdk
}

