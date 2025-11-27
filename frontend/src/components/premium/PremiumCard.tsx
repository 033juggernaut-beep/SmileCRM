import { Box, type BoxProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumCardProps extends BoxProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'flat'
}

export const PremiumCard = ({ 
  children, 
  variant = 'default',
  ...props 
}: PremiumCardProps) => {
  const variants = {
    default: {
      bg: 'white',
      borderWidth: '1px',
      borderColor: 'border.light',
      boxShadow: 'sm',
    },
    elevated: {
      bg: 'white',
      borderWidth: '0',
      boxShadow: 'premium',
    },
    flat: {
      bg: 'bg.gray',
      borderWidth: '1px',
      borderColor: 'border.light',
      boxShadow: 'none',
    },
  }

  return (
    <Box
      borderRadius="md"
      p={4}
      transition="all 0.2s"
      {...variants[variant]}
      {...props}
    >
      {children}
    </Box>
  )
}

