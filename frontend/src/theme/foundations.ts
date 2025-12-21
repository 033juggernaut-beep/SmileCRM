// =============================================
// 🎨 SMILECRM DESIGN FOUNDATIONS
// Exact match to Superdesign reference export
// =============================================

// =============================================
// 🎨 COLOR PALETTE
// Matches Tailwind slate/blue palette from reference
// =============================================

export const colors = {
  // Slate palette (for text, borders, dark mode bg)
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Blue palette (primary accent)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Sky palette (for gradient mixing)
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
  },

  // Primary = blue (alias for Chakra compatibility)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Success (green)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning (amber)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error (red)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Alpha scales
  whiteAlpha: {
    50: 'rgba(255, 255, 255, 0.04)',
    100: 'rgba(255, 255, 255, 0.06)',
    200: 'rgba(255, 255, 255, 0.08)',
    300: 'rgba(255, 255, 255, 0.16)',
    400: 'rgba(255, 255, 255, 0.24)',
    500: 'rgba(255, 255, 255, 0.36)',
    600: 'rgba(255, 255, 255, 0.48)',
    700: 'rgba(255, 255, 255, 0.64)',
    800: 'rgba(255, 255, 255, 0.80)',
    900: 'rgba(255, 255, 255, 0.92)',
  },

  blackAlpha: {
    50: 'rgba(0, 0, 0, 0.04)',
    100: 'rgba(0, 0, 0, 0.06)',
    200: 'rgba(0, 0, 0, 0.08)',
    300: 'rgba(0, 0, 0, 0.12)',
    400: 'rgba(0, 0, 0, 0.16)',
    500: 'rgba(0, 0, 0, 0.24)',
    600: 'rgba(0, 0, 0, 0.36)',
    700: 'rgba(0, 0, 0, 0.48)',
    800: 'rgba(0, 0, 0, 0.64)',
    900: 'rgba(0, 0, 0, 0.80)',
  },

  // Legacy aliases for compatibility
  bg: {
    primary: '#F8FAFC',
    surface: '#FFFFFF',
    surface2: '#F1F5F9',
    hover: '#E2E8F0',
    active: '#CBD5E1',
    secondary: '#FFFFFF',
    tertiary: '#F1F5F9',
  },
  border: {
    subtle: '#DBEAFE',
    default: '#BFDBFE',
    strong: '#93C5FD',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    muted: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
    main: '#1E293B',
    light: '#64748B',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
  },
  accent: {
    500: '#14B8A6',
  },
}

// =============================================
// 📐 TYPOGRAPHY (matches reference)
// =============================================

export const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  mono: `'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace`,
}

export const fontSizes = {
  xs: '0.75rem',     // 12px - stat labels, footer
  sm: '0.875rem',    // 14px - descriptions, lang switch
  md: '1rem',        // 16px - card title
  lg: '1.125rem',    // 18px - brand name, welcome subtitle (md)
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px - welcome title
  '4xl': '2.25rem',  // 36px - welcome title (md)
  '5xl': '3rem',
  '6xl': '3.75rem',
}

export const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
}

export const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.55,
  taller: 1.625,
  relaxed: 1.75,
}

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',  // tracking-tight (welcome title)
  normal: '0',
  wide: '0.025em',    // tracking-wide (brand)
  wider: '0.05em',
  widest: '0.08em',
}

// =============================================
// 📏 RADII (matches reference)
// =============================================

export const radii = {
  none: '0',
  sm: '0.125rem',    // 2px
  base: '0.25rem',   // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px - icon box (rounded-lg)
  xl: '0.75rem',     // 12px - cards (rounded-xl)
  '2xl': '1rem',     // 16px - welcome block (rounded-2xl)
  '3xl': '1.5rem',   // 24px
  full: '9999px',
}

// =============================================
// 🌫️ SHADOWS (exact from reference)
// =============================================

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Card shadows (light) - shadow-md shadow-blue-50
  card: '0 4px 6px -1px rgba(239, 246, 255, 1), 0 2px 4px -2px rgba(239, 246, 255, 1)',
  // Card hover (light) - shadow-lg shadow-blue-100
  cardHover: '0 10px 15px -3px rgba(219, 234, 254, 1), 0 4px 6px -4px rgba(219, 234, 254, 1)',
  
  // Welcome shadow (light) - shadow-lg shadow-blue-100/50
  welcome: '0 10px 15px -3px rgba(219, 234, 254, 0.5), 0 4px 6px -4px rgba(219, 234, 254, 0.5)',
  
  // Dark mode card shadows
  cardDark: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
  cardHoverDark: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)',
  
  // Welcome shadow (dark) - shadow-xl shadow-slate-900/30
  welcomeDark: '0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.3)',
  
  // Focus ring
  focusRing: '0 0 0 3px rgba(59, 130, 246, 0.4)',
  
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
}

// =============================================
// 🎨 GRADIENTS (exact from reference)
// =============================================

export const gradients = {
  // Light mode page background: from-slate-50 via-blue-50/30 to-sky-50/50
  pageBgLight: 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))',
  
  // Welcome block light: from-blue-50 to-sky-50
  welcomeLight: 'linear-gradient(to bottom right, #EFF6FF, #F0F9FF)',
  
  // Accent gradients
  accent: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  accentHover: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
}

// =============================================
// 📦 SIZES (matches reference)
// =============================================

export const sizes = {
  max: 'max-content',
  min: 'min-content',
  full: '100%',
  
  // Icon sizes
  iconSm: '1rem',      // 16px
  icon: '1.25rem',     // 20px - bell, theme toggle (w-5 h-5)
  iconMd: '1.5rem',    // 24px - card icons (w-6 h-6)
  iconLg: '1.75rem',   // 28px - logo (w-7 h-7)
  
  // Icon box
  iconBox: '2.5rem',   // 40px (w-10 h-10)
  
  // Card height
  cardHeight: '180px', // fixed height for grid alignment
  
  // Container
  container: {
    sm: '640px',
    md: '768px',       // max-w-3xl = 48rem
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Specific widths
  dashboard: '768px', // max-w-3xl for dashboard content
}

// =============================================
// 📐 SPACING (matches reference gap/padding)
// =============================================

export const space = {
  // Standard scale
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem',
  3: '0.75rem',    // 12px
  3.5: '0.875rem',
  4: '1rem',       // 16px - gap-4, px-4
  5: '1.25rem',    // 20px - gap-5, p-5
  6: '1.5rem',     // 24px - px-6, py-6
  7: '1.75rem',
  8: '2rem',       // 32px - gap-8, py-8
  9: '2.25rem',
  10: '2.5rem',    // 40px - py-10
  12: '3rem',      // 48px - py-12
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
}
