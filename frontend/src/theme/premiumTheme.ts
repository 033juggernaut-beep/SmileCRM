import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// =============================================
// 🎨 TIMEWEB CLOUD INSPIRED DARK THEME
// Premium SaaS dark theme for clinical systems
// =============================================

const colors = {
  // Background hierarchy
  bg: {
    primary: '#0B1220',      // Main app background
    secondary: '#111A2E',    // Cards, surfaces
    tertiary: '#162236',     // Elevated elements
    hover: '#1A2942',        // Hover states
    active: '#1E3050',       // Active/pressed states
  },
  
  // Primary accent (blue)
  primary: {
    50: '#E8EDFF',
    100: '#C5D3FF',
    200: '#9EB5FF',
    300: '#7696FF',
    400: '#5A7EFF',
    500: '#4F6BFF',    // Main primary
    600: '#4560E6',
    700: '#3A52CC',
    800: '#2F44B3',
    900: '#243699',
  },
  
  // Success green
  success: {
    50: '#E6FFF0',
    100: '#B3FFD1',
    200: '#80FFB3',
    300: '#4DFF94',
    400: '#26FF7A',
    500: '#00E676',    // Main success
    600: '#00C765',
    700: '#00A854',
    800: '#008943',
    900: '#006A32',
  },
  
  // Warning orange
  warning: {
    50: '#FFF8E6',
    100: '#FFEBB3',
    200: '#FFDD80',
    300: '#FFD04D',
    400: '#FFC726',
    500: '#FFB800',    // Main warning
    600: '#E6A600',
    700: '#CC9400',
    800: '#B38200',
    900: '#996F00',
  },
  
  // Error red
  error: {
    50: '#FFE6E9',
    100: '#FFB3BC',
    200: '#FF808F',
    300: '#FF4D62',
    400: '#FF2643',
    500: '#FF0A2D',    // Main error
    600: '#E60027',
    700: '#CC0022',
    800: '#B3001D',
    900: '#990018',
  },
  
  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#AAB2D5',
    muted: '#6B7499',
    disabled: '#4A5270',
    // Legacy aliases
    main: '#FFFFFF',
    white: '#FFFFFF',
    light: '#AAB2D5',
  },
  
  // Border colors
  border: {
    subtle: '#1E2A4A',
    default: '#2A3A5E',
    strong: '#3D4F7A',
    // Legacy aliases
    light: '#1E2A4A',
    medium: '#2A3A5E',
    dark: '#3D4F7A',
  },
  
  // Legacy color tokens for compatibility
  navy: {
    50: '#E8EDFF',
    100: '#C5D3FF',
    500: '#4F6BFF',
    600: '#4560E6',
    700: '#3A52CC',
    900: '#0B1220',
  },
  
  accent: {
    500: '#4F6BFF',
    600: '#4560E6',
  },
}

// =============================================
// 🎨 GRADIENTS
// =============================================

const gradients = {
  // Main background gradient (subtle)
  bgGradient: 'linear-gradient(180deg, #0F1829 0%, #0B1220 100%)',
  // Header gradient
  header: 'linear-gradient(135deg, #111A2E 0%, #162236 100%)',
  // Card hover gradient
  cardHover: 'linear-gradient(135deg, #1A2942 0%, #162236 100%)',
  // Primary button gradient
  primary: 'linear-gradient(135deg, #5A7EFF 0%, #4F6BFF 100%)',
  // Success gradient
  success: 'linear-gradient(135deg, #00E676 0%, #00C765 100%)',
  // Legacy gradients
  navy: 'linear-gradient(135deg, #111A2E 0%, #162236 100%)',
  navyVertical: 'linear-gradient(180deg, #0F1829 0%, #0B1220 100%)',
  darkBg: 'linear-gradient(180deg, #0F1829 0%, #0B1220 100%)',
  accent: 'linear-gradient(135deg, #5A7EFF 0%, #4F6BFF 100%)',
}

// =============================================
// 📐 TYPOGRAPHY
// =============================================

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
}

const fontSizes = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '36px',
  '5xl': '48px',
}

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
  taller: 2,
}

// =============================================
// 📏 SPACING & SIZING
// =============================================

const radii = {
  none: '0',
  sm: '6px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
}

const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  base: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.3)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.4)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.5)',
  '2xl': '0 20px 40px rgba(0, 0, 0, 0.5)',
  // Premium shadows with blue glow
  premium: '0 4px 20px rgba(79, 107, 255, 0.15)',
  premiumLg: '0 8px 32px rgba(79, 107, 255, 0.2)',
  premiumGlow: '0 0 20px rgba(79, 107, 255, 0.3)',
  // Card shadows
  card: '0 4px 12px rgba(0, 0, 0, 0.25)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.35)',
}

// =============================================
// 🎨 COMPONENT STYLES
// =============================================

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'xl',
      transition: 'all 0.2s ease',
      _focus: {
        boxShadow: 'none',
      },
      _focusVisible: {
        boxShadow: '0 0 0 3px rgba(79, 107, 255, 0.4)',
      },
    },
    sizes: {
      sm: {
        h: '36px',
        fontSize: 'sm',
        px: 4,
      },
      md: {
        h: '44px',
        fontSize: 'md',
        px: 5,
      },
      lg: {
        h: '52px',
        fontSize: 'lg',
        px: 6,
      },
      xl: {
        h: '60px',
        fontSize: 'xl',
        px: 8,
      },
    },
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.400',
          transform: 'translateY(-1px)',
          boxShadow: 'premium',
        },
        _active: {
          bg: 'primary.600',
          transform: 'translateY(0)',
        },
        _disabled: {
          bg: 'primary.700',
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
      secondary: {
        bg: 'bg.secondary',
        color: 'text.primary',
        borderWidth: '1px',
        borderColor: 'border.default',
        _hover: {
          bg: 'bg.hover',
          borderColor: 'border.strong',
        },
        _active: {
          bg: 'bg.active',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'text.secondary',
        _hover: {
          bg: 'bg.hover',
          color: 'text.primary',
        },
        _active: {
          bg: 'bg.active',
        },
      },
      subtle: {
        bg: 'whiteAlpha.100',
        color: 'text.primary',
        _hover: {
          bg: 'whiteAlpha.200',
        },
        _active: {
          bg: 'whiteAlpha.300',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'primary.500',
        borderWidth: '1px',
        borderColor: 'primary.500',
        _hover: {
          bg: 'primary.500',
          color: 'white',
        },
        _active: {
          bg: 'primary.600',
        },
      },
      success: {
        bg: 'success.500',
        color: 'white',
        _hover: {
          bg: 'success.400',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: 'success.600',
        },
      },
      danger: {
        bg: 'error.500',
        color: 'white',
        _hover: {
          bg: 'error.400',
          transform: 'translateY(-1px)',
        },
        _active: {
          bg: 'error.600',
        },
      },
    },
    defaultProps: {
      variant: 'primary',
      size: 'lg',
    },
  },
  
  Input: {
    variants: {
      outline: {
        field: {
          bg: 'bg.secondary',
          borderRadius: 'lg',
          borderWidth: '1px',
          borderColor: 'border.subtle',
          color: 'text.primary',
          _placeholder: {
            color: 'text.muted',
          },
          _hover: {
            borderColor: 'border.default',
          },
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
          _invalid: {
            borderColor: 'error.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-error-500)',
          },
        },
      },
      filled: {
        field: {
          bg: 'bg.tertiary',
          borderRadius: 'lg',
          borderWidth: '1px',
          borderColor: 'transparent',
          color: 'text.primary',
          _placeholder: {
            color: 'text.muted',
          },
          _hover: {
            bg: 'bg.hover',
          },
          _focus: {
            bg: 'bg.secondary',
            borderColor: 'primary.500',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'lg',
    },
  },
  
  Textarea: {
    variants: {
      outline: {
        bg: 'bg.secondary',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        color: 'text.primary',
        _placeholder: {
          color: 'text.muted',
        },
        _hover: {
          borderColor: 'border.default',
        },
        _focus: {
          borderColor: 'primary.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'lg',
    },
  },
  
  Select: {
    variants: {
      outline: {
        field: {
          bg: 'bg.secondary',
          borderRadius: 'lg',
          borderWidth: '1px',
          borderColor: 'border.subtle',
          color: 'text.primary',
          _hover: {
            borderColor: 'border.default',
          },
          _focus: {
            borderColor: 'primary.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
      size: 'lg',
    },
  },
  
  FormLabel: {
    baseStyle: {
      color: 'text.secondary',
      fontSize: 'sm',
      fontWeight: 'medium',
      mb: 2,
    },
  },
  
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'bg.secondary',
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: 'border.subtle',
      },
      header: {
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'border.subtle',
      },
      body: {
        color: 'text.primary',
      },
      footer: {
        borderTop: '1px solid',
        borderColor: 'border.subtle',
      },
      closeButton: {
        color: 'text.secondary',
        _hover: {
          bg: 'bg.hover',
        },
      },
      overlay: {
        bg: 'blackAlpha.700',
        backdropFilter: 'blur(8px)',
      },
    },
  },
  
  Alert: {
    variants: {
      solid: {
        container: {
          borderRadius: 'lg',
        },
      },
      subtle: {
        container: {
          bg: 'bg.tertiary',
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'border.subtle',
        },
      },
    },
  },
  
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'full',
        fontWeight: 'medium',
      },
    },
    variants: {
      solid: {
        container: {
          bg: 'primary.500',
          color: 'white',
        },
      },
      subtle: {
        container: {
          bg: 'bg.tertiary',
          color: 'text.secondary',
        },
      },
      outline: {
        container: {
          borderWidth: '1px',
          borderColor: 'border.default',
          color: 'text.secondary',
        },
      },
    },
  },
  
  Progress: {
    baseStyle: {
      track: {
        bg: 'bg.tertiary',
        borderRadius: 'full',
      },
      filledTrack: {
        bg: 'primary.500',
        borderRadius: 'full',
      },
    },
  },
  
  Spinner: {
    baseStyle: {
      color: 'primary.500',
    },
  },
  
  Divider: {
    baseStyle: {
      borderColor: 'border.subtle',
    },
  },
  
  Heading: {
    baseStyle: {
      color: 'text.primary',
      fontWeight: 'bold',
    },
  },
  
  Text: {
    baseStyle: {
      color: 'text.primary',
    },
  },
  
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.secondary',
        borderRadius: 'xl',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        boxShadow: 'card',
        p: 4,
      },
    },
  },
  
  Table: {
    variants: {
      simple: {
        th: {
          color: 'text.secondary',
          borderColor: 'border.subtle',
        },
        td: {
          color: 'text.primary',
          borderColor: 'border.subtle',
        },
      },
    },
  },
  
  Tooltip: {
    baseStyle: {
      bg: 'bg.tertiary',
      color: 'text.primary',
      borderRadius: 'md',
      px: 3,
      py: 2,
    },
  },
}

// =============================================
// 🌙 DARK MODE CONFIG (Always dark)
// =============================================

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

// =============================================
// 🎨 GLOBAL STYLES
// =============================================

const styles = {
  global: {
    'html, body': {
      bg: 'bg.primary',
      color: 'text.primary',
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    body: {
      background: gradients.bgGradient,
    },
    // Custom scrollbar for dark theme
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'bg.primary',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'border.default',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'border.strong',
    },
    // Selection
    '::selection': {
      bg: 'primary.500',
      color: 'white',
    },
    // Focus visible
    '*:focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(79, 107, 255, 0.4)',
    },
  },
}

// =============================================
// 🎨 EXPORT THEME
// =============================================

export const premiumTheme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  shadows,
  components,
  styles,
})

// Export gradients separately for use in components
export { gradients }
