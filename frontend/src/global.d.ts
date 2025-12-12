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
  
  // Methods for controlling the Mini App
  ready?: () => void
  expand?: () => void
  close?: () => void
  requestFullscreen?: () => void // Request fullscreen mode (for desktop/laptop)
  exitFullscreen?: () => void // Exit fullscreen mode
  
  // Theme and appearance
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  
  // Closing confirmation
  enableClosingConfirmation?: () => void
  disableClosingConfirmation?: () => void
  
  // Swipe control
  disableVerticalSwipes?: () => void
  enableVerticalSwipes?: () => void
  isVerticalSwipesEnabled?: boolean
  
  // Orientation control (mobile)
  lockOrientation?: () => void
  unlockOrientation?: () => void
  
  // Info about the Mini App state
  isExpanded?: boolean
  isFullscreen?: boolean
  viewportHeight?: number
  viewportStableHeight?: number
  
  // Platform information
  platform?: 'android' | 'android_x' | 'ios' | 'macos' | 'tdesktop' | 'web' | 'weba' | 'webk' | 'windows' | 'linux' | 'unknown'
  version?: string
  colorScheme?: 'light' | 'dark'
  
  // Event handling
  onEvent?: (eventType: string, callback: () => void) => void
  offEvent?: (eventType: string, callback: () => void) => void
  
  // Back button
  BackButton?: {
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    isVisible: boolean
  }
  
  // Main button
  MainButton?: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
}

interface TelegramSdk {
  WebApp?: TelegramWebApp
}

interface Window {
  Telegram?: TelegramSdk
}

