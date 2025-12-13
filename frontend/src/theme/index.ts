// =============================================
// 🎨 PREMIUM ONYX THEME
// A sophisticated dark SaaS theme with desaturated gold accents
// =============================================

import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Import foundations
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  radii,
  shadows,
  sizes,
  gradients,
} from './foundations'

// Import component styles
import { components } from './components'

// =============================================
// 🌙 THEME CONFIGURATION
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
      textRendering: 'optimizeLegibility',
    },
    body: {
      background: gradients.bgGradient,
      lineHeight: 'tall',         // 1.55
    },
    
    // Custom scrollbar
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
    
    // Text selection
    '::selection': {
      bg: 'accent.500',
      color: 'text.inverse',
    },
    
    // Focus visible
    '*:focus-visible': {
      outline: 'none',
      boxShadow: 'focusRing',
    },
    
    // Smooth transitions for color scheme
    '*': {
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    },
  },
}

// =============================================
// 📦 SEMANTIC TOKENS
// =============================================

const semanticTokens = {
  colors: {
    // Background semantic tokens
    'chakra-body-bg': {
      default: 'bg.primary',
      _dark: 'bg.primary',
    },
    'chakra-body-text': {
      default: 'text.primary',
      _dark: 'text.primary',
    },
    'chakra-border-color': {
      default: 'border.subtle',
      _dark: 'border.subtle',
    },
    'chakra-placeholder-color': {
      default: 'text.muted',
      _dark: 'text.muted',
    },
  },
}

// =============================================
// 🎨 EXPORT THEME
// =============================================

export const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  radii,
  shadows,
  sizes,
  components,
  styles,
  semanticTokens,
})

// Re-export for backward compatibility
export const premiumTheme = theme

// Export gradients for external component use
export { gradients }

// Export foundations and components for customization
export * from './foundations'
export * from './components'
