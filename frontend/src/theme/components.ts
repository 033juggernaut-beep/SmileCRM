// =============================================
// 🧩 SMILECRM LIGHT THEME — Component Styles
// Medical SaaS with soft blue palette
// =============================================

import type { ComponentStyleConfig } from '@chakra-ui/react'

// =============================================
// 🔘 BUTTON
// =============================================

export const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'lg',
    transition: 'all 0.2s ease',
    _focus: { boxShadow: 'none' },
    _focusVisible: { boxShadow: 'focusRing' },
    _disabled: { opacity: 0.5, cursor: 'not-allowed' },
  },
  sizes: {
    xs: { h: '28px', fontSize: 'xs', px: 3 },
    sm: { h: '36px', fontSize: 'sm', px: 4 },
    md: { h: '44px', fontSize: 'md', px: 5 },
    lg: { h: '52px', fontSize: 'lg', px: 6 },
    xl: { h: '60px', fontSize: 'xl', px: 8 },
  },
  variants: {
    solid: {
      bg: 'primary.600',
      color: 'white',
      _hover: {
        bg: 'primary.500',
        transform: 'translateY(-1px)',
        boxShadow: 'md',
        _disabled: { bg: 'primary.600', transform: 'none' },
      },
      _active: { bg: 'primary.700', transform: 'translateY(0)' },
    },
    ghost: {
      bg: 'transparent',
      color: 'text.secondary',
      _hover: { bg: 'bg.hover', color: 'text.primary' },
      _active: { bg: 'bg.active' },
    },
    outline: {
      bg: 'transparent',
      color: 'primary.600',
      borderWidth: '1px',
      borderColor: 'primary.600',
      _hover: { bg: 'primary.50' },
      _active: { bg: 'primary.100' },
    },
    secondary: {
      bg: 'bg.surface',
      color: 'text.primary',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      _hover: { bg: 'bg.surface2', borderColor: 'border.default' },
      _active: { bg: 'bg.active' },
    },
    success: {
      bg: 'success.500',
      color: 'white',
      _hover: { bg: 'success.400', transform: 'translateY(-1px)' },
      _active: { bg: 'success.600', transform: 'translateY(0)' },
    },
    danger: {
      bg: 'error.500',
      color: 'white',
      _hover: { bg: 'error.400', transform: 'translateY(-1px)' },
      _active: { bg: 'error.600', transform: 'translateY(0)' },
    },
  },
  defaultProps: { variant: 'solid', size: 'md' },
}

// =============================================
// 🃏 CARD
// =============================================

export const Card: ComponentStyleConfig = {
  baseStyle: {
    container: {
      bg: 'bg.surface',
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'card',
      p: 4,
      transition: 'all 0.2s ease',
    },
    header: { p: 4, pb: 0 },
    body: { p: 4 },
    footer: { p: 4, pt: 0 },
  },
  variants: {
    elevated: { container: { boxShadow: 'lg' } },
    outline: { container: { boxShadow: 'none', borderColor: 'border.default' } },
    filled: { container: { bg: 'bg.surface2', boxShadow: 'none' } },
    unstyled: { container: { bg: 'transparent', borderWidth: 0, boxShadow: 'none', p: 0 } },
  },
}

// =============================================
// 🏷️ BADGE
// =============================================

export const Badge: ComponentStyleConfig = {
  baseStyle: {
    textTransform: 'uppercase',
    fontWeight: 'semibold',
    letterSpacing: 'widest',
    fontSize: 'xs',
    borderRadius: 'base',
    px: 2,
    py: 0.5,
  },
  variants: {
    solid: { bg: 'primary.600', color: 'white' },
    subtle: { bg: 'primary.50', color: 'primary.700' },
    outline: { bg: 'transparent', borderWidth: '1px', borderColor: 'border.default', color: 'text.secondary' },
    success: { bg: 'success.500', color: 'white' },
    successSubtle: { bg: 'success.50', color: 'success.700' },
    warning: { bg: 'warning.500', color: 'white' },
    warningSubtle: { bg: 'warning.50', color: 'warning.700' },
    error: { bg: 'error.500', color: 'white' },
    errorSubtle: { bg: 'error.50', color: 'error.700' },
    info: { bg: 'info.500', color: 'white' },
    infoSubtle: { bg: 'info.50', color: 'info.700' },
  },
  defaultProps: { variant: 'subtle' },
}

// =============================================
// 📝 INPUT
// =============================================

export const Input: ComponentStyleConfig = {
  baseStyle: { field: { width: '100%' } },
  sizes: {
    sm: { field: { borderRadius: 'md', h: '36px', fontSize: 'sm', px: 3 } },
    md: { field: { borderRadius: 'lg', h: '44px', fontSize: 'md', px: 4 } },
    lg: { field: { borderRadius: 'lg', h: '52px', fontSize: 'lg', px: 4 } },
  },
  variants: {
    outline: {
      field: {
        bg: 'bg.surface',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        color: 'text.primary',
        _placeholder: { color: 'text.muted' },
        _hover: { borderColor: 'border.default' },
        _focus: { borderColor: 'primary.500', boxShadow: 'focusRing' },
        _invalid: { borderColor: 'error.500', boxShadow: '0 0 0 1px var(--chakra-colors-error-500)' },
        _disabled: { bg: 'bg.surface2', opacity: 0.5 },
      },
    },
    filled: {
      field: {
        bg: 'bg.surface2',
        borderWidth: '1px',
        borderColor: 'transparent',
        color: 'text.primary',
        _placeholder: { color: 'text.muted' },
        _hover: { bg: 'bg.hover' },
        _focus: { bg: 'bg.surface', borderColor: 'primary.500' },
      },
    },
  },
  defaultProps: { variant: 'outline', size: 'md' },
}

// =============================================
// 📝 TEXTAREA
// =============================================

export const Textarea: ComponentStyleConfig = {
  baseStyle: { width: '100%', minHeight: '100px' },
  variants: {
    outline: {
      bg: 'bg.surface',
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      color: 'text.primary',
      py: 3,
      px: 4,
      _placeholder: { color: 'text.muted' },
      _hover: { borderColor: 'border.default' },
      _focus: { borderColor: 'primary.500', boxShadow: 'focusRing' },
      _invalid: { borderColor: 'error.500' },
    },
  },
  defaultProps: { variant: 'outline' },
}

// =============================================
// 📋 SELECT
// =============================================

export const Select: ComponentStyleConfig = {
  variants: {
    outline: {
      field: {
        bg: 'bg.surface',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        color: 'text.primary',
        _hover: { borderColor: 'border.default' },
        _focus: { borderColor: 'primary.500', boxShadow: 'focusRing' },
      },
      icon: { color: 'text.muted' },
    },
  },
  defaultProps: { variant: 'outline', size: 'md' },
}

// =============================================
// 🏷️ FORM LABEL
// =============================================

export const FormLabel: ComponentStyleConfig = {
  baseStyle: {
    color: 'text.secondary',
    fontSize: 'sm',
    fontWeight: 'medium',
    mb: 2,
  },
}

// =============================================
// 💬 MODAL
// =============================================

export const Modal: ComponentStyleConfig = {
  baseStyle: {
    dialog: {
      bg: 'bg.surface',
      borderRadius: 'xl',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: '2xl',
    },
    header: {
      color: 'text.primary',
      fontWeight: 'semibold',
      borderBottomWidth: '1px',
      borderColor: 'border.subtle',
      py: 4,
    },
    body: { color: 'text.primary', py: 4 },
    footer: { borderTopWidth: '1px', borderColor: 'border.subtle', py: 4 },
    closeButton: { color: 'text.muted', _hover: { bg: 'bg.hover', color: 'text.secondary' } },
    overlay: { bg: 'blackAlpha.600', backdropFilter: 'blur(4px)' },
  },
}

// =============================================
// ⚠️ ALERT
// =============================================

export const Alert: ComponentStyleConfig = {
  baseStyle: { container: { borderRadius: 'lg', px: 4, py: 3 } },
  variants: {
    subtle: { container: { bg: 'bg.surface2', borderWidth: '1px', borderColor: 'border.subtle' } },
    'left-accent': { container: { bg: 'bg.surface2', borderLeftWidth: '4px', borderRadius: 'md' } },
  },
}

// =============================================
// 🏷️ TAG
// =============================================

export const Tag: ComponentStyleConfig = {
  baseStyle: { container: { borderRadius: 'full', fontWeight: 'medium', fontSize: 'sm' } },
  variants: {
    solid: { container: { bg: 'primary.600', color: 'white' } },
    subtle: { container: { bg: 'primary.50', color: 'primary.700' } },
    outline: { container: { borderWidth: '1px', borderColor: 'border.default', color: 'text.secondary', bg: 'transparent' } },
  },
}

// =============================================
// 📊 PROGRESS
// =============================================

export const Progress: ComponentStyleConfig = {
  baseStyle: {
    track: { bg: 'bg.surface2', borderRadius: 'full' },
    filledTrack: { bg: 'primary.500', borderRadius: 'full', transition: 'width 0.3s ease' },
  },
}

// =============================================
// 🔄 SPINNER
// =============================================

export const Spinner: ComponentStyleConfig = {
  baseStyle: { color: 'primary.500' },
}

// =============================================
// ➖ DIVIDER
// =============================================

export const Divider: ComponentStyleConfig = {
  baseStyle: { borderColor: 'border.subtle' },
}

// =============================================
// 📰 HEADING
// =============================================

export const Heading: ComponentStyleConfig = {
  baseStyle: { color: 'text.primary', fontWeight: 'bold', lineHeight: 'shorter' },
}

// =============================================
// 📝 TEXT
// =============================================

export const Text: ComponentStyleConfig = {
  baseStyle: { color: 'text.primary', lineHeight: 'tall' },
}

// =============================================
// 📋 TABLE
// =============================================

export const Table: ComponentStyleConfig = {
  variants: {
    simple: {
      th: {
        color: 'text.muted',
        fontWeight: 'semibold',
        textTransform: 'uppercase',
        letterSpacing: 'wider',
        fontSize: 'xs',
        borderColor: 'border.subtle',
      },
      td: { color: 'text.primary', borderColor: 'border.subtle' },
      tbody: { tr: { _hover: { bg: 'bg.hover' } } },
    },
  },
}

// =============================================
// 💡 TOOLTIP
// =============================================

export const Tooltip: ComponentStyleConfig = {
  baseStyle: {
    bg: 'bg.surface',
    color: 'text.primary',
    borderRadius: 'md',
    px: 3,
    py: 2,
    fontSize: 'sm',
    fontWeight: 'medium',
    boxShadow: 'lg',
    borderWidth: '1px',
    borderColor: 'border.subtle',
  },
}

// =============================================
// 📦 EXPORT ALL COMPONENTS
// =============================================

export const components = {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  FormLabel,
  Modal,
  Alert,
  Tag,
  Progress,
  Spinner,
  Divider,
  Heading,
  Text,
  Table,
  Tooltip,
}
