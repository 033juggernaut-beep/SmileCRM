import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { gradients } from '../../theme/premiumTheme'

interface PremiumHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
}

export const PremiumHeader = ({ title, showBack = false, onBack }: PremiumHeaderProps) => {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      background={gradients.navy}
      boxShadow="premium"
    >
      <Flex
        align="center"
        justify="space-between"
        px={4}
        py={3}
        maxW="600px"
        mx="auto"
        minH="56px"
      >
        {/* Left side - Back button or logo */}
        <Flex align="center" gap={2} minW="40px">
          {showBack ? (
            <IconButton
              aria-label="Back"
              icon={<Text fontSize="xl">←</Text>}
              variant="ghost"
              color="white"
              size="sm"
              onClick={handleBack}
              _hover={{
                bg: 'whiteAlpha.200',
              }}
            />
          ) : (
            <Text fontSize="2xl" role="img" aria-label="tooth">
              🦷
            </Text>
          )}
        </Flex>

        {/* Center - Title */}
        <Heading
          size="md"
          color="white"
          fontWeight="semibold"
          textAlign="center"
          flex={1}
        >
          {title}
        </Heading>

        {/* Right side - Spacer for balance */}
        <Box minW="40px" />
      </Flex>
    </Box>
  )
}

