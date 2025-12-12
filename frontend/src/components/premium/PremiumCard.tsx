import { Box, type BoxProps } from '@chakra-ui/react'
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
  const variants = {
    default: {
      bg: 'bg.secondary',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'card',
    },
    elevated: {
      bg: 'bg.secondary',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'lg',
    },
    flat: {
      bg: 'bg.tertiary',
      borderWidth: '1px',
      borderColor: 'border.subtle',
      boxShadow: 'none',
    },
    glass: {
      bg: 'rgba(17, 26, 46, 0.7)',
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
