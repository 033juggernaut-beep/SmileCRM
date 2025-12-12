import { Box, Flex } from '@chakra-ui/react'
import { type ReactNode } from 'react'
import { PremiumHeader } from '../premium/PremiumHeader'
import { gradients } from '../../theme/premiumTheme'

interface PremiumLayoutProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  showBack?: boolean
  onBack?: () => void
  background?: 'gradient' | 'light' | 'white'
}

export const PremiumLayout = ({
  children,
  title = 'SmileCRM',
  showHeader = true,
  showBack = false,
  onBack,
  background = 'light',
}: PremiumLayoutProps) => {
  const backgrounds = {
    gradient: gradients.navy,
    light: 'bg.gray',
    white: 'white',
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
        maxW={{ base: '100%', md: '800px', lg: '1000px' }}
        mx="auto"
        px={{ base: 4, md: 6, lg: 8 }}
        py={6}
        pb={8}
        overflowY="auto"
        overflowX="hidden"
      >
        {children}
      </Box>
    </Flex>
  )
}

