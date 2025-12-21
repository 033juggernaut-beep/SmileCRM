import { Box, type BoxProps, useColorMode } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumCardProps extends BoxProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'flat' | 'glass'
  isHoverable?: boolean
}

export const PremiumCard = ({ 
  children, 
  variant = 'default',
  isHoverable = false,
  ...props 
}: PremiumCardProps) => {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const variants = {
    default: {
      bg: 'bg.surface',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'card',
    },
    elevated: {
      bg: 'bg.surface',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'lg',
    },
    flat: {
      bg: 'bg.surface2',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'none',
    },
    glass: {
      bg: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      backdropFilter: 'blur(12px)',
      boxShadow: 'card',
    },
  }

  const hoverStyles = isHoverable ? {
    _hover: {
      bg: 'bg.hover',
      borderColor: 'border.default',
      boxShadow: 'cardHover',
      transform: 'translateY(-2px)',
    },
    cursor: 'pointer',
  } : {}

  return (
    <Box
      borderRadius="xl"
      p={4}
      transition="all 0.2s ease"
      {...variants[variant]}
      {...hoverStyles}
      {...props}
    >
      {children}
    </Box>
  )
}
