// =============================================
// 🎨 SMILECRM LIGHT THEME
// Medical SaaS with soft blue palette (Superdesign style)
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
// ☀️ THEME CONFIGURATION — LIGHT MODE ONLY
// =============================================

const config: ThemeConfig = {
  initialColorMode: 'light',
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
      background: 'bg.primary',
      lineHeight: 'tall',
    },
    
    // Custom scrollbar (light theme)
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
    
    // Text selection (blue)
    '::selection': {
      bg: 'primary.500',
      color: 'text.inverse',
    },
    
    // Focus visible
    '*:focus-visible': {
      outline: 'none',
      boxShadow: 'focusRing',
    },
  },
}

// =============================================
// 📦 SEMANTIC TOKENS
// =============================================

const semanticTokens = {
  colors: {
    'chakra-body-bg': 'bg.primary',
    'chakra-body-text': 'text.primary',
    'chakra-border-color': 'border.subtle',
    'chakra-placeholder-color': 'text.muted',
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

// Alias for backward compatibility
export const premiumTheme = theme

// Export gradients for external use
export { gradients }

// Export foundations and components
export * from './foundations'
export * from './components'
