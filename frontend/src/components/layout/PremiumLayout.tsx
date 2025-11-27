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
      minH="100vh"
      w="100vw"
      bg={backgrounds[background]}
      position="relative"
    >
      {/* Header */}
      {showHeader && (
        <PremiumHeader
          title={title}
          showBack={showBack}
          onBack={onBack}
        />
      )}

      {/* Main Content */}
      <Box
        as="main"
        flex="1"
        w="full"
        maxW="600px"
        mx="auto"
        px={4}
        py={6}
        overflowY="auto"
      >
        {children}
      </Box>
    </Flex>
  )
}

