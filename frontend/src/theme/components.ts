// =============================================
// 🧩 PREMIUM ONYX — Component Style Configs
// =============================================

import type { ComponentStyleConfig } from '@chakra-ui/react'

// =============================================
// 🔘 BUTTON
// =============================================

export const Button: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'semibold',
    borderRadius: 'lg',           // 16px
    transition: 'all 0.2s ease',
    letterSpacing: '0.01em',
    _focus: {
      boxShadow: 'none',
    },
    _focusVisible: {
      boxShadow: 'focusRing',     // Gold accent focus ring
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  sizes: {
    xs: {
      h: '28px',
      fontSize: 'xs',
      px: 3,
    },
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
    // Primary solid (accent gold)
    solid: {
      bg: 'accent.500',
      color: 'text.inverse',
      borderWidth: '1px',
      borderColor: 'accent.600',
      _hover: {
        bg: 'accent.400',
        transform: 'translateY(-1px)',
        boxShadow: 'accentGlow',
        _disabled: {
          bg: 'accent.500',
          transform: 'none',
        },
      },
      _active: {
        bg: 'accent.600',
        transform: 'translateY(0)',
      },
    },
    
    // Ghost (transparent)
    ghost: {
      bg: 'transparent',
      color: 'text.secondary',
      borderWidth: '1px',
      borderColor: 'transparent',
      _hover: {
        bg: 'bg.hover',
        color: 'text.primary',
        borderColor: 'border.subtle',
      },
      _active: {
        bg: 'bg.active',
      },
    },
    
    // Outline
    outline: {
      bg: 'transparent',
      color: 'accent.500',
      borderWidth: '1px',
      borderColor: 'accent.500',
      _hover: {
        bg: 'accent.500',
        color: 'text.inverse',
      },
      _active: {
        bg: 'accent.600',
      },
    },
    
    // Secondary (surface)
    secondary: {
      bg: 'bg.surface',
      color: 'text.primary',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      _hover: {
        bg: 'bg.surface2',
        borderColor: 'border.default',
      },
      _active: {
        bg: 'bg.active',
      },
    },
    
    // Subtle (light fill)
    subtle: {
      bg: 'whiteAlpha.100',
      color: 'text.primary',
      borderWidth: '1px',
      borderColor: 'transparent',
      _hover: {
        bg: 'whiteAlpha.200',
        borderColor: 'border.subtle',
      },
      _active: {
        bg: 'whiteAlpha.300',
      },
    },
    
    // Success
    success: {
      bg: 'success.500',
      color: 'white',
      borderWidth: '1px',
      borderColor: 'success.600',
      _hover: {
        bg: 'success.400',
        transform: 'translateY(-1px)',
      },
      _active: {
        bg: 'success.600',
        transform: 'translateY(0)',
      },
    },
    
    // Danger
    danger: {
      bg: 'error.500',
      color: 'white',
      borderWidth: '1px',
      borderColor: 'error.600',
      _hover: {
        bg: 'error.400',
        transform: 'translateY(-1px)',
      },
      _active: {
        bg: 'error.600',
        transform: 'translateY(0)',
      },
    },
    
    // Warning
    warning: {
      bg: 'warning.500',
      color: 'text.inverse',
      borderWidth: '1px',
      borderColor: 'warning.600',
      _hover: {
        bg: 'warning.400',
        transform: 'translateY(-1px)',
      },
      _active: {
        bg: 'warning.600',
        transform: 'translateY(0)',
      },
    },
  },
  defaultProps: {
    variant: 'solid',
    size: 'md',
  },
}

// =============================================
// 🃏 CARD
// =============================================

export const Card: ComponentStyleConfig = {
  baseStyle: {
    container: {
      bg: 'bg.surface',
      borderRadius: 'lg',         // 16px
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'card',
      p: 4,
      transition: 'all 0.2s ease',
    },
    header: {
      p: 4,
      pb: 0,
    },
    body: {
      p: 4,
    },
    footer: {
      p: 4,
      pt: 0,
    },
  },
  variants: {
    elevated: {
      container: {
        boxShadow: 'lg',
      },
    },
    outline: {
      container: {
        boxShadow: 'none',
        borderColor: 'border.default',
      },
    },
    filled: {
      container: {
        bg: 'bg.surface2',
        boxShadow: 'none',
      },
    },
    unstyled: {
      container: {
        bg: 'transparent',
        borderWidth: 0,
        boxShadow: 'none',
        p: 0,
      },
    },
  },
}

// =============================================
// 🏷️ BADGE
// =============================================

export const Badge: ComponentStyleConfig = {
  baseStyle: {
    textTransform: 'uppercase',
    fontWeight: 'semibold',
    letterSpacing: 'widest',      // 0.08em small caps
    fontSize: 'xs',
    borderRadius: 'base',         // 8px
    px: 2,
    py: 0.5,
  },
  variants: {
    // Solid variants
    solid: {
      bg: 'accent.500',
      color: 'text.inverse',
    },
    
    // Subtle (muted background)
    subtle: {
      bg: 'whiteAlpha.100',
      color: 'text.secondary',
    },
    
    // Outline
    outline: {
      bg: 'transparent',
      borderWidth: '1px',
      borderColor: 'border.default',
      color: 'text.secondary',
    },
    
    // Success
    success: {
      bg: 'success.500',
      color: 'white',
    },
    successSubtle: {
      bg: 'rgba(46, 204, 113, 0.15)',
      color: 'success.400',
    },
    
    // Warning
    warning: {
      bg: 'warning.500',
      color: 'text.inverse',
    },
    warningSubtle: {
      bg: 'rgba(245, 165, 36, 0.15)',
      color: 'warning.400',
    },
    
    // Error
    error: {
      bg: 'error.500',
      color: 'white',
    },
    errorSubtle: {
      bg: 'rgba(229, 72, 77, 0.15)',
      color: 'error.400',
    },
    
    // Info
    info: {
      bg: 'info.500',
      color: 'white',
    },
    infoSubtle: {
      bg: 'rgba(85, 104, 160, 0.15)',
      color: 'info.400',
    },
  },
  defaultProps: {
    variant: 'subtle',
  },
}

// =============================================
// 📝 INPUT
// =============================================

export const Input: ComponentStyleConfig = {
  baseStyle: {
    field: {
      width: '100%',
    },
  },
  sizes: {
    sm: {
      field: {
        borderRadius: 'md',
        h: '36px',
        fontSize: 'sm',
        px: 3,
      },
    },
    md: {
      field: {
        borderRadius: 'lg',
        h: '44px',
        fontSize: 'md',
        px: 4,
      },
    },
    lg: {
      field: {
        borderRadius: 'lg',
        h: '52px',
        fontSize: 'lg',
        px: 4,
      },
    },
  },
  variants: {
    outline: {
      field: {
        bg: 'bg.surface2',
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
          borderColor: 'accent.500',
          boxShadow: 'focusRing',
        },
        _invalid: {
          borderColor: 'error.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-error-500)',
        },
        _disabled: {
          bg: 'bg.surface',
          opacity: 0.5,
        },
      },
    },
    filled: {
      field: {
        bg: 'bg.surface2',
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
          bg: 'bg.surface',
          borderColor: 'accent.500',
        },
      },
    },
    flushed: {
      field: {
        bg: 'transparent',
        borderBottom: '1px solid',
        borderColor: 'border.subtle',
        borderRadius: 0,
        px: 0,
        _focus: {
          borderColor: 'accent.500',
          boxShadow: 'none',
        },
      },
    },
  },
  defaultProps: {
    variant: 'outline',
    size: 'md',
  },
}

// =============================================
// 📝 TEXTAREA
// =============================================

export const Textarea: ComponentStyleConfig = {
  baseStyle: {
    width: '100%',
    minHeight: '100px',
  },
  variants: {
    outline: {
      bg: 'bg.surface2',
      borderRadius: 'lg',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      color: 'text.primary',
      py: 3,
      px: 4,
      _placeholder: {
        color: 'text.muted',
      },
      _hover: {
        borderColor: 'border.default',
      },
      _focus: {
        borderColor: 'accent.500',
        boxShadow: 'focusRing',
      },
      _invalid: {
        borderColor: 'error.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-error-500)',
      },
    },
  },
  defaultProps: {
    variant: 'outline',
  },
}

// =============================================
// 📋 SELECT
// =============================================

export const Select: ComponentStyleConfig = {
  variants: {
    outline: {
      field: {
        bg: 'bg.surface2',
        borderRadius: 'lg',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        color: 'text.primary',
        _hover: {
          borderColor: 'border.default',
        },
        _focus: {
          borderColor: 'accent.500',
          boxShadow: 'focusRing',
        },
      },
      icon: {
        color: 'text.muted',
      },
    },
  },
  defaultProps: {
    variant: 'outline',
    size: 'md',
  },
}

// =============================================
// 🏷️ FORM LABEL
// =============================================

export const FormLabel: ComponentStyleConfig = {
  baseStyle: {
    color: 'text.secondary',
    fontSize: 'sm',
    fontWeight: 'medium',
    letterSpacing: 'widest',      // 0.08em for labels
    textTransform: 'uppercase',
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
    body: {
      color: 'text.primary',
      py: 4,
    },
    footer: {
      borderTopWidth: '1px',
      borderColor: 'border.subtle',
      py: 4,
    },
    closeButton: {
      color: 'text.muted',
      _hover: {
        bg: 'bg.hover',
        color: 'text.secondary',
      },
    },
    overlay: {
      bg: 'blackAlpha.700',
      backdropFilter: 'blur(8px)',
    },
  },
}

// =============================================
// ⚠️ ALERT
// =============================================

export const Alert: ComponentStyleConfig = {
  baseStyle: {
    container: {
      borderRadius: 'lg',
      px: 4,
      py: 3,
    },
  },
  variants: {
    solid: {
      container: {
        // Will be colored by colorScheme
      },
    },
    subtle: {
      container: {
        bg: 'bg.surface2',
        borderWidth: '1px',
        borderColor: 'border.subtle',
      },
    },
    'left-accent': {
      container: {
        bg: 'bg.surface2',
        borderLeftWidth: '4px',
        borderRadius: 'md',
      },
    },
  },
}

// =============================================
// 🏷️ TAG
// =============================================

export const Tag: ComponentStyleConfig = {
  baseStyle: {
    container: {
      borderRadius: 'full',
      fontWeight: 'medium',
      fontSize: 'sm',
    },
  },
  variants: {
    solid: {
      container: {
        bg: 'accent.500',
        color: 'text.inverse',
      },
    },
    subtle: {
      container: {
        bg: 'whiteAlpha.100',
        color: 'text.secondary',
      },
    },
    outline: {
      container: {
        borderWidth: '1px',
        borderColor: 'border.default',
        color: 'text.secondary',
        bg: 'transparent',
      },
    },
  },
}

// =============================================
// 📊 PROGRESS
// =============================================

export const Progress: ComponentStyleConfig = {
  baseStyle: {
    track: {
      bg: 'bg.surface2',
      borderRadius: 'full',
    },
    filledTrack: {
      bg: 'accent.500',
      borderRadius: 'full',
      transition: 'width 0.3s ease',
    },
  },
}

// =============================================
// 🔄 SPINNER
// =============================================

export const Spinner: ComponentStyleConfig = {
  baseStyle: {
    color: 'accent.500',
  },
}

// =============================================
// ➖ DIVIDER
// =============================================

export const Divider: ComponentStyleConfig = {
  baseStyle: {
    borderColor: 'border.subtle',
  },
}

// =============================================
// 📰 HEADING
// =============================================

export const Heading: ComponentStyleConfig = {
  baseStyle: {
    color: 'text.primary',
    fontWeight: 'bold',
    lineHeight: 'shorter',
  },
}

// =============================================
// 📝 TEXT
// =============================================

export const Text: ComponentStyleConfig = {
  baseStyle: {
    color: 'text.primary',
    lineHeight: 'tall',           // 1.55 line height for body
  },
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
      td: {
        color: 'text.primary',
        borderColor: 'border.subtle',
      },
      tbody: {
        tr: {
          _hover: {
            bg: 'bg.hover',
          },
        },
      },
    },
  },
}

// =============================================
// 💡 TOOLTIP
// =============================================

export const Tooltip: ComponentStyleConfig = {
  baseStyle: {
    bg: 'bg.surface2',
    color: 'text.primary',
    borderRadius: 'md',
    px: 3,
    py: 2,
    fontSize: 'sm',
    fontWeight: 'medium',
    boxShadow: 'lg',
    borderWidth: '1px',
    borderColor: 'border.subtle',
    '--popper-arrow-bg': 'var(--chakra-colors-bg-surface2)',
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
