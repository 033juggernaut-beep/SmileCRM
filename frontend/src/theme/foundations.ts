// =============================================
// 🎨 PREMIUM ONYX — Design Foundations
// A premium dark SaaS UI theme with desaturated gold accents
// =============================================

// =============================================
// 🎨 COLOR PALETTE
// =============================================

export const colors = {
  // Background hierarchy (Onyx dark)
  bg: {
    primary: '#0B0B0D',      // Main app background
    surface: '#131316',      // Cards, panels
    surface2: '#1A1A1E',     // Elevated surfaces, inputs
    hover: '#222226',        // Hover states
    active: '#28282E',       // Active/pressed states
    // Legacy aliases for backward compatibility
    secondary: '#131316',    // Maps to surface
    tertiary: '#1A1A1E',     // Maps to surface2
  },

  // Border colors
  border: {
    subtle: '#26262C',       // Default border
    default: '#32323A',      // Stronger border
    strong: '#3E3E48',       // Emphasized border
  },

  // Accent (desaturated gold)
  accent: {
    50: '#FAF6EB',
    100: '#F2EBD3',
    200: '#E5D9AB',
    300: '#D4C380',
    400: '#C4AD68',
    500: '#B8A060',          // Main accent
    600: '#A08850',
    700: '#877042',
    800: '#6E5A36',
    900: '#56462B',
  },

  // Text colors
  text: {
    primary: '#F5F5F7',      // Primary text
    secondary: '#B0B0B8',    // Secondary text
    muted: '#707078',        // Muted/disabled text
    disabled: '#505058',     // Fully disabled
    inverse: '#0B0B0D',      // Text on light backgrounds
    // Legacy aliases for backward compatibility
    main: '#F5F5F7',         // Maps to primary
    white: '#F5F5F7',        // Maps to primary
    light: '#B0B0B8',        // Maps to secondary
  },

  // Semantic colors — Success (emerald green)
  success: {
    50: '#E8FAF0',
    100: '#C5F2DA',
    200: '#9EE8C2',
    300: '#6BDDA6',
    400: '#45D48F',
    500: '#2ECC71',          // Main success
    600: '#27AE60',
    700: '#1E8449',
    800: '#196F3D',
    900: '#145A32',
  },

  // Semantic colors — Warning (amber)
  warning: {
    50: '#FEF7E8',
    100: '#FCEBC5',
    200: '#F9D99A',
    300: '#F7C76E',
    400: '#F5B942',
    500: '#F5A524',          // Main warning
    600: '#D9901F',
    700: '#B8781A',
    800: '#966115',
    900: '#754B10',
  },

  // Semantic colors — Error (coral red)
  error: {
    50: '#FDECEC',
    100: '#FAC9CA',
    200: '#F5A3A5',
    300: '#EE7B7E',
    400: '#E96064',
    500: '#E5484D',          // Main error
    600: '#CD3D41',
    700: '#B03236',
    800: '#93282B',
    900: '#761E21',
  },

  // Info (slate blue)
  info: {
    50: '#EBEEF5',
    100: '#CDD4E6',
    200: '#ABB5D4',
    300: '#8896C0',
    400: '#6D7EB0',
    500: '#5568A0',
    600: '#4A5A8A',
    700: '#3F4C74',
    800: '#343E5E',
    900: '#2A3149',
  },

  // White/Black alpha scales for overlays
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
    300: 'rgba(0, 0, 0, 0.16)',
    400: 'rgba(0, 0, 0, 0.24)',
    500: 'rgba(0, 0, 0, 0.36)',
    600: 'rgba(0, 0, 0, 0.48)',
    700: 'rgba(0, 0, 0, 0.64)',
    800: 'rgba(0, 0, 0, 0.80)',
    900: 'rgba(0, 0, 0, 0.92)',
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
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  md: '1rem',         // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
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
  tall: 1.55,         // Body text line height
  taller: 1.625,
  relaxed: 1.75,
}

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.08em',   // Labels, small caps
}

// =============================================
// 📏 SPACING & SIZING
// =============================================

export const radii = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',         // Default button/card radius
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
}

export const shadows = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.24)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.28)',
  base: '0 4px 8px rgba(0, 0, 0, 0.32)',
  md: '0 6px 12px rgba(0, 0, 0, 0.36)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.40)',
  xl: '0 12px 32px rgba(0, 0, 0, 0.44)',
  '2xl': '0 20px 48px rgba(0, 0, 0, 0.48)',
  
  // Card shadows (subtle)
  card: '0 2px 8px rgba(0, 0, 0, 0.24)',
  cardHover: '0 6px 20px rgba(0, 0, 0, 0.32)',
  
  // Accent glow effects
  accentGlow: `0 0 20px rgba(184, 160, 96, 0.25)`,
  accentRing: `0 0 0 3px rgba(184, 160, 96, 0.35)`,
  
  // Focus ring
  focusRing: `0 0 0 3px rgba(184, 160, 96, 0.4)`,
  
  // Inner shadows
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  innerLg: 'inset 0 4px 8px rgba(0, 0, 0, 0.4)',
}

// =============================================
// 🎨 GRADIENTS (for external component use)
// =============================================

export const gradients = {
  // Subtle background gradient
  bgGradient: 'linear-gradient(180deg, #0E0E10 0%, #0B0B0D 100%)',
  
  // Surface gradients
  surface: 'linear-gradient(135deg, #151518 0%, #131316 100%)',
  surfaceHover: 'linear-gradient(135deg, #1E1E22 0%, #1A1A1E 100%)',
  
  // Accent button gradient
  accent: 'linear-gradient(135deg, #C4AD68 0%, #B8A060 100%)',
  accentHover: 'linear-gradient(135deg, #D4BD78 0%, #C4AD68 100%)',
  
  // Success gradient
  success: 'linear-gradient(135deg, #45D48F 0%, #2ECC71 100%)',
  
  // Error gradient
  error: 'linear-gradient(135deg, #E96064 0%, #E5484D 100%)',
  
  // Legacy aliases (backward compatibility)
  navy: 'linear-gradient(135deg, #151518 0%, #131316 100%)',
  navyVertical: 'linear-gradient(180deg, #0E0E10 0%, #0B0B0D 100%)',
  darkBg: 'linear-gradient(180deg, #0E0E10 0%, #0B0B0D 100%)',
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
