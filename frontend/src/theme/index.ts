// =============================================
// 🎨 SMILECRM THEME
// Exact match to Superdesign reference export
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
  space,
  gradients,
} from './foundations'

// Import component styles
import { components } from './components'

// =============================================
// 🌓 THEME CONFIGURATION
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
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    },
    body: {
      lineHeight: 'tall',
      transitionProperty: 'background-color',
      transitionDuration: '300ms',
    },
    
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 'full',
    },
    '::-webkit-scrollbar-thumb:hover': {
      background: 'rgba(0, 0, 0, 0.2)',
    },
    
    // Text selection
    '::selection': {
      bg: 'blue.500',
      color: 'white',
    },
    
    // Focus visible
    '*:focus-visible': {
      outline: 'none',
      boxShadow: 'focusRing',
    },
  },
}

// =============================================
// 📦 SEMANTIC TOKENS (Light / Dark Mode)
// Exact match to reference Tailwind classes
// =============================================

const semanticTokens = {
  colors: {
    // Chakra system tokens
    'chakra-body-bg': { _light: 'slate.50', _dark: 'slate.900' },
    'chakra-body-text': { _light: 'slate.800', _dark: 'white' },
    'chakra-border-color': { _light: 'blue.100', _dark: 'slate.700' },
    'chakra-placeholder-color': { _light: 'slate.400', _dark: 'slate.500' },
    
    // === PAGE BACKGROUND ===
    // Light: bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/50
    // Dark: bg-slate-900
    'page.bg': { _light: 'slate.50', _dark: 'slate.900' },
    
    // === HEADER ===
    // Light: bg-white/90, border-blue-100
    // Dark: bg-slate-900/80, border-slate-700/50
    'header.bg': { _light: 'rgba(255, 255, 255, 0.9)', _dark: 'rgba(15, 23, 42, 0.8)' },
    'header.border': { _light: 'blue.100', _dark: 'rgba(51, 65, 85, 0.5)' },
    
    // === CARD ===
    // Light: bg-white, border-blue-100, shadow-md shadow-blue-50
    // Dark: bg-slate-800/70, border-slate-700/50
    'card.bg': { _light: 'white', _dark: 'rgba(30, 41, 59, 0.7)' },
    'card.border': { _light: 'blue.100', _dark: 'rgba(51, 65, 85, 0.5)' },
    'card.borderHover': { _light: 'blue.400', _dark: 'rgba(59, 130, 246, 0.5)' },
    
    // === WELCOME BLOCK ===
    // Light: bg-gradient-to-br from-blue-50 to-sky-50, shadow-lg shadow-blue-100/50
    // Dark: bg-slate-800/60, shadow-xl shadow-slate-900/30
    'welcome.bg': { _light: 'blue.50', _dark: 'rgba(30, 41, 59, 0.6)' },
    
    // === ICON BOX ===
    // Light: bg-blue-100 → hover:bg-blue-200
    // Dark: bg-blue-500/15 → hover:bg-blue-500/25
    'iconBox.bg': { _light: 'blue.100', _dark: 'rgba(59, 130, 246, 0.15)' },
    'iconBox.bgHover': { _light: 'blue.200', _dark: 'rgba(59, 130, 246, 0.25)' },
    
    // === ICON COLOR ===
    // Light: text-blue-600
    // Dark: text-blue-400
    'icon.color': { _light: 'blue.600', _dark: 'blue.400' },
    
    // === TEXT COLORS ===
    // Title: slate-800 (light) / white (dark)
    'text.title': { _light: 'slate.800', _dark: 'white' },
    // Body: slate-500 (light) / slate-400 (dark)
    'text.body': { _light: 'slate.500', _dark: 'slate.400' },
    // Muted: slate-400 (light) / slate-500 (dark)
    'text.muted': { _light: 'slate.400', _dark: 'slate.500' },
    // Accent: blue-600 (light) / blue-400 (dark)
    'text.accent': { _light: 'blue.600', _dark: 'blue.400' },
    // Divider: slate-300 (light) / slate-600 (dark)
    'text.divider': { _light: 'slate.300', _dark: 'slate.600' },
    
    // === FOOTER ===
    'footer.border': { _light: 'rgba(219, 234, 254, 0.5)', _dark: 'slate.800' },
    
    // === LEGACY ALIASES for compatibility ===
    'bg.primary': { _light: 'slate.50', _dark: 'slate.900' },
    'bg.surface': { _light: 'white', _dark: 'slate.800' },
    'bg.surface2': { _light: 'slate.100', _dark: 'slate.700' },
    'bg.hover': { _light: 'slate.200', _dark: 'slate.600' },
    'border.subtle': { _light: 'blue.100', _dark: 'slate.700' },
    'border.default': { _light: 'blue.200', _dark: 'slate.600' },
    'text.primary': { _light: 'slate.800', _dark: 'white' },
    'text.secondary': { _light: 'slate.500', _dark: 'slate.400' },
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
  space,
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
