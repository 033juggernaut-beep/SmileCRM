/**
 * Back navigation button - reusable across inner pages
 * - Left arrow icon with text label
 * - Subtle hover effect
 */

import { Button, Box, useColorMode } from '@chakra-ui/react'
import { ChevronLeft } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

interface BackButtonProps {
  label?: string
  onClick?: () => void
}

export function BackButton({ label, onClick }: BackButtonProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      fontWeight="medium"
      leftIcon={
        <Box
          as={ChevronLeft}
          w={4}
          h={4}
          transition="transform 0.15s"
          _groupHover={{ transform: 'translateX(-2px)' }}
        />
      }
      color={isDark ? 'gray.400' : 'gray.500'}
      _hover={{
        color: isDark ? 'blue.400' : 'blue.600',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
      }}
      role="group"
      px={0}
    >
      {label ?? t('common.back')}
    </Button>
  )
}

export default BackButton

