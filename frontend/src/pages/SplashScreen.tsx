import { Box, Flex, Heading, Spinner, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { gradients } from '../theme'

export const SplashScreen = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to auth loading page after 1 second
    const timer = setTimeout(() => {
      navigate('/', { replace: true })
    }, 1000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      background={gradients.navy}
      position="relative"
      overflow="hidden"
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="whiteAlpha.100"
        filter="blur(60px)"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="250px"
        h="250px"
        borderRadius="full"
        bg="whiteAlpha.100"
        filter="blur(50px)"
      />

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        gap={6}
        zIndex={1}
        px={4}
      >
        {/* Logo/Icon */}
        <Box
          fontSize="80px"
          lineHeight="1"
          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          sx={{
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
                transform: 'scale(1)',
              },
              '50%': {
                opacity: 0.8,
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          🦷
        </Box>

        {/* Brand Name */}
        <Flex direction="column" align="center" gap={2}>
          <Heading
            size="2xl"
            color="white"
            fontWeight="bold"
            letterSpacing="tight"
          >
            SmileCRM
          </Heading>
          <Text
            fontSize="md"
            color="whiteAlpha.800"
            fontWeight="medium"
          >
            Premium Dental Mini App
          </Text>
        </Flex>

        {/* Loading Spinner */}
        <Spinner
          size="md"
          color="white"
          thickness="3px"
          speed="0.8s"
          emptyColor="whiteAlpha.300"
          mt={4}
        />
      </Flex>
    </Flex>
  )
}

