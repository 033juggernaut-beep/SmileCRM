import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

interface PremiumHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightElement?: React.ReactNode
}

export const PremiumHeader = ({ 
  title, 
  showBack = false, 
  onBack,
  rightElement,
}: PremiumHeaderProps) => {
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
      zIndex={100}
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.subtle"
    >
      <Flex
        align="center"
        justify="space-between"
        px={{ base: 4, md: 6, lg: 8 }}
        py={3}
        maxW={{ base: '100%', md: '720px', lg: '960px', xl: '1200px' }}
        mx="auto"
        minH="56px"
      >
        {/* Left side - Back button or logo */}
        <Flex align="center" gap={2} minW="44px">
          {showBack ? (
            <IconButton
              aria-label="Back"
              icon={<Text fontSize="xl">←</Text>}
              variant="ghost"
              color="text.primary"
              size="sm"
              onClick={handleBack}
              borderRadius="lg"
              _hover={{ bg: 'bg.hover' }}
            />
          ) : (
            <Text fontSize="2xl" role="img" aria-label="SmileCRM">
              🦷
            </Text>
          )}
        </Flex>

        {/* Center - Title */}
        <Heading
          size="md"
          color="text.primary"
          fontWeight="bold"
          textAlign="center"
          flex={1}
          letterSpacing="-0.01em"
        >
          {title}
        </Heading>

        {/* Right side */}
        <Box minW="44px" display="flex" justifyContent="flex-end">
          {rightElement}
        </Box>
      </Flex>
    </Box>
  )
}
