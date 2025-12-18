// =============================================
// 🎨 SMILECRM LIGHT THEME — Design Foundations
// Medical SaaS with soft blue palette (Superdesign style)
// =============================================

// =============================================
// 🎨 COLOR PALETTE (Light Theme)
// =============================================

export const colors = {
  // Background hierarchy (Light)
  bg: {
    primary: '#F7FAFF',           // Main app background (light blue-gray)
    surface: '#FFFFFF',           // Cards, panels (white)
    surface2: '#F1F5F9',          // Elevated surfaces, inputs (slate-100)
    hover: '#E2E8F0',             // Hover states (slate-200)
    active: '#CBD5E1',            // Active/pressed states (slate-300)
    // Aliases
    secondary: '#FFFFFF',
    tertiary: '#F1F5F9',
  },

  // Border colors
  border: {
    subtle: '#E6EEFF',            // Default border (soft blue)
    default: '#DBEAFE',           // Stronger border (blue-100)
    strong: '#BFDBFE',            // Emphasized border (blue-200)
  },

  // Primary accent (Medical blue)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',               // Main primary
    600: '#2563EB',               // Darker blue for icons/accents
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary accent (Teal - medical feel)
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',               // Main accent
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // Text colors
  text: {
    primary: '#0F172A',           // Primary text (slate-900)
    secondary: '#64748B',         // Secondary text (slate-500)
    muted: '#94A3B8',             // Muted text (slate-400)
    disabled: '#CBD5E1',          // Fully disabled (slate-300)
    inverse: '#FFFFFF',           // Text on dark backgrounds
    // Aliases
    main: '#0F172A',
    light: '#64748B',
  },

  // Semantic colors — Success
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

  // Semantic colors — Warning
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

  // Semantic colors — Error
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

  // Info (Blue)
  info: {
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
}

// =============================================
// 📐 TYPOGRAPHY
// =============================================

export const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  mono: `'SF Mono', 'Fira Code', 'Fira Mono', Menlo, Consolas, monospace`,
}

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
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
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.08em',
}

// =============================================
// 📏 SPACING & SIZING
// =============================================

export const radii = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
}

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Card shadows (soft blue)
  card: '0 2px 8px rgba(59, 130, 246, 0.08)',
  cardHover: '0 8px 24px rgba(59, 130, 246, 0.12)',
  
  // Focus ring (blue)
  focusRing: '0 0 0 3px rgba(59, 130, 246, 0.4)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px rgba(0, 0, 0, 0.1)',
}

// =============================================
// 🎨 GRADIENTS (not used in light theme, kept for compatibility)
// =============================================

export const gradients = {
  bgGradient: '#F7FAFF',          // Flat color, no gradient
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  accent: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
  accentHover: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
  success: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
}

// =============================================
// 📦 SIZES
// =============================================

export const sizes = {
  max: 'max-content',
  min: 'min-content',
  full: '100%',
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}
