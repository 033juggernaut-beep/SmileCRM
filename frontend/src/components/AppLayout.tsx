import { Box, Flex, Heading } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

export const AppLayout = () => (
  <Flex direction="column" minH="100vh" bg="gray.50">
    <Box as="header" bg="teal.600" color="white" px={4} py={3} boxShadow="sm">
      <Heading size="md" fontWeight="semibold">
        Dental Mini App
      </Heading>
    </Box>

    <Flex
      as="main"
      flex="1"
      align="center"
      justify="center"
      px={4}
      py={8}
    >
      <Box w="full" maxW="sm">
        <Outlet />
      </Box>
    </Flex>
  </Flex>
)

