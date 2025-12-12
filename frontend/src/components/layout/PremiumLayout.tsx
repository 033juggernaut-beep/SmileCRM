import { Box, Flex } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { PremiumHeader } from '../premium/PremiumHeader'

interface PremiumLayoutProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showBack?: boolean
  onBack?: () => void
  background?: 'gradient' | 'solid' | 'light' | 'white'
  /** Add extra bottom padding for fixed buttons (Telegram safe area) */
  safeAreaBottom?: boolean
}

export const PremiumLayout = ({
  children,
  title = 'SmileCRM',
  showHeader = true,
  showBack = false,
  onBack,
  background = 'gradient',
  safeAreaBottom = false,
}: PremiumLayoutProps) => {
  const backgrounds = {
    gradient: 'linear-gradient(180deg, #0F1829 0%, #0B1220 100%)',
    solid: 'bg.primary',
    light: 'bg.primary',
    white: 'bg.primary',
  }

  return (
    <Flex
      direction="column"
      h="var(--app-height, 100vh)"
      minH="var(--app-height, 100vh)"
      w="100%"
      bg={backgrounds[background]}
      position="relative"
      overflow="hidden"
    >
      {/* Header */}
      {showHeader && (
        <PremiumHeader
          title={title}
          showBack={showBack}
          onBack={onBack}
        />
      )}

      {/* Main Content - Scrollable */}
      <Box
        as="main"
        flex="1"
        w="full"
        maxW="420px"
        mx="auto"
        px={4}
        py={5}
        pb={safeAreaBottom ? '100px' : 6}
        overflowY="auto"
        overflowX="hidden"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
          },
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}
