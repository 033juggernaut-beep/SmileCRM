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
  /** Element to show on the right side of the header */
  headerRightElement?: ReactNode
}

export const PremiumLayout = ({
  children,
  title = 'SmileCRM',
  showHeader = true,
  showBack = false,
  onBack,
  background = 'solid',
  safeAreaBottom = false,
  headerRightElement,
}: PremiumLayoutProps) => {
  // All backgrounds are light now
  const backgrounds = {
    gradient: 'bg.primary',
    solid: 'bg.primary',
    light: 'bg.primary',
    white: 'bg.surface',
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
          rightElement={headerRightElement}
        />
      )}

      {/* Main Content */}
      <Box
        as="main"
        flex="1"
        w="full"
        maxW={{ base: '100%', md: '720px', lg: '960px', xl: '1200px' }}
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        py={5}
        pb={safeAreaBottom ? '100px' : 6}
        overflowY="auto"
        overflowX="hidden"
        position="relative"
        zIndex={1}
        pointerEvents="auto"
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.2)' },
        }}
      >
        {children}
      </Box>
    </Flex>
  )
}
