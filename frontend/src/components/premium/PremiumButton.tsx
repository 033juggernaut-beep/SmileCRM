import { Button, type ButtonProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const PremiumButton = ({ 
  children, 
  variant = 'primary',
  ...props 
}: PremiumButtonProps) => {
  return (
    <Button
      variant={variant}
      borderRadius="md"
      fontWeight="semibold"
      size="md"
      transition="all 0.2s"
      {...props}
    >
      {children}
    </Button>
  )
}

