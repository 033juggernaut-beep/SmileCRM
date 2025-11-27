import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// =============================================
// 🎨 PREMIUM COLORS - Telegram × Navy Edition
// =============================================

const colors = {
  // Navy gradient colors
  navy: {
    50: '#E8EAF6',
    100: '#C5CAE9',
    200: '#9FA8DA',
    300: '#7986CB',
    400: '#5C6BC0',
    500: '#3F51B5',
    600: '#1A2F9F', // Main navy
    700: '#11237A',
    800: '#0B155E',
    900: '#060C3F',
  },
  
  // Primary blue (Telegram style)
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#0088cc', // Main primary
    600: '#0069a8', // Primary dark
    700: '#005A8E',
    800: '#004B74',
    900: '#003C5A',
  },
  
  // Accent blue (lighter)
  accent: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#00b5ff', // Main accent
    600: '#0099E6',
    700: '#007ACC',
    800: '#005CB3',
    900: '#003D99',
  },
  
  // Text colors
  text: {
    main: '#1c1c1e',
    muted: '#6e6e73',
    light: '#8e8e93',
    white: '#ffffff',
  },
  
  // Background colors
  bg: {
    light: '#ffffff',
    gray: '#f6f8fa',
    dark: '#02030F',
    darkCard: '#1A1A1C',
  },
  
  // Border colors
  border: {
    light: '#e5e5ea',
    medium: '#d1d1d6',
    dark: '#48484a',
  },
}

// =============================================
// 🎨 GRADIENTS
// =============================================

const gradients = {
  navy: 'linear-gradient(135deg, #060C3F 0%, #0B155E 25%, #11237A 50%, #1A2F9F 100%)',
  navyVertical: 'linear-gradient(180deg, #060C3F 0%, #0B155E 25%, #11237A 50%, #1A2F9F 100%)',
  darkBg: 'linear-gradient(135deg, #02030F 0%, #050A2A 100%)',
  accent: 'linear-gradient(135deg, #0088cc 0%, #00b5ff 100%)',
}

// =============================================
// 📐 TYPOGRAPHY
// =============================================

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
}

const fontSizes = {
  xs: '12px',
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',
  '5xl': '36px',
}

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

// =============================================
// 📏 SPACING & SIZING
// =============================================

const radii = {
  none: '0',
  sm: '8px',
  base: '10px',
  md: '12px',
  lg: '14px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
}

const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px rgba(0, 0, 0, 0.08)',
  md: '0 2px 4px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 6px rgba(0, 0, 0, 0.1)',
  xl: '0 8px 16px rgba(0, 0, 0, 0.12)',
  premium: '0 2px 8px rgba(6, 12, 63, 0.15)',
  premiumLg: '0 4px 12px rgba(6, 12, 63, 0.2)',
}

// =============================================
// 🎨 COMPONENT STYLES
// =============================================

const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'none',
      },
    },
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
          transform: 'translateY(-1px)',
          boxShadow: 'md',
        },
        _active: {
          bg: 'primary.700',
          transform: 'translateY(0)',
        },
      },
      secondary: {
        bg: 'bg.gray',
        color: 'text.main',
        borderWidth: '1px',
        borderColor: 'border.light',
        _hover: {
          bg: 'gray.100',
          borderColor: 'border.medium',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'text.muted',
        _hover: {
          bg: 'bg.gray',
          color: 'text.main',
        },
      },
    },
    defaultProps: {
      variant: 'primary',
    },
  },
  
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'md',
        borderWidth: '1px',
        borderColor: 'border.light',
        boxShadow: 'sm',
        p: 4,
      },
    },
  },
  
  Input: {
    variants: {
      outline: {
        field: {
          borderRadius: 'md',
          borderColor: 'border.light',
          _hover: {
            borderColor: 'border.medium',
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
    },
  },
  
  Textarea: {
    variants: {
      outline: {
        borderRadius: 'md',
        borderColor: 'border.light',
        _hover: {
          borderColor: 'border.medium',
        },
        _focus: {
          borderColor: 'primary.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  
  Tag: {
    baseStyle: {
      container: {
        borderRadius: 'base',
        fontWeight: 'medium',
      },
    },
  },
}

// =============================================
// 🌙 DARK MODE CONFIG
// =============================================

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
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
  radii,
  shadows,
  components,
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'bg.dark' : 'bg.gray',
        color: props.colorMode === 'dark' ? 'text.white' : 'text.main',
      },
    }),
  },
})

// Export gradients separately for use in components
export { gradients }

