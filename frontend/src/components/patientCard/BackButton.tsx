/**
 * Back navigation button - unified component for all pages
 * Features:
 * - Consistent hover/active states across light/dark themes
 * - Smooth icon animation on hover
 * - Accessible focus state
 * - Works with both onClick handler and navigate(-1)
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
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

  // Theme colors - consistent across light/dark
  const textColor = isDark ? '#94A3B8' : '#64748B'
  const hoverColor = isDark ? '#60A5FA' : '#2563EB'
  const hoverBg = isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)'
  const activeBg = isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'
  const focusRing = 'rgba(59, 130, 246, 0.5)'

  return (
    <Flex
      as="button"
      onClick={onClick}
      align="center"
      gap="4px"
      px="8px"
      py="4px"
      ml="-8px"
      borderRadius="lg"
      fontSize="sm"
      fontWeight="medium"
      color={textColor}
      bg="transparent"
      transition="all 0.15s ease"
      _hover={{
        color: hoverColor,
        bg: hoverBg,
        '& .back-icon': { transform: 'translateX(-2px)' },
        '& .back-text': { textDecoration: 'underline', textUnderlineOffset: '2px' },
      }}
      _active={{
        bg: activeBg,
        transform: 'translateY(1px)',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 2px ${focusRing}`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      <Box
        as={ChevronLeft}
        className="back-icon"
        w={4}
        h={4}
        flexShrink={0}
        transition="transform 0.15s ease"
      />
      <Text as="span" className="back-text">
        {label ?? t('common.back')}
      </Text>
    </Flex>
  )
}

export default BackButton
