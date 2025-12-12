import { Button, type ButtonProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'success' | 'danger' | 'subtle'
  fullWidth?: boolean
}

export const PremiumButton = ({ 
  children, 
  variant = 'primary',
  fullWidth = false,
  ...props 
}: PremiumButtonProps) => {
  return (
    <Button
      variant={variant}
      borderRadius="xl"
      fontWeight="semibold"
      size="lg"
      w={fullWidth ? 'full' : 'auto'}
      transition="all 0.2s ease"
      {...props}
    >
      {children}
    </Button>
  )
}
