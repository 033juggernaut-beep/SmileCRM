/**
 * Collapsible section wrapper - accordion-style component
 * - Smooth open/close animation
 * - Header with title and optional action
 * - Consistent card styling matching Superdesign reference
 */

import { useState, type ReactNode } from 'react'
import { Box, Flex, Heading, Collapse, useColorMode } from '@chakra-ui/react'
import { ChevronDown } from 'lucide-react'

export interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
  headerAction?: ReactNode
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  headerAction,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Box
      w="full"
      borderRadius="2xl"
      overflow="hidden"
      transition="colors 0.2s"
      bg={isDark ? 'rgba(30, 41, 59, 0.6)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
    >
      {/* Header - Always Visible */}
      <Flex
        as="button"
        onClick={() => setIsOpen(!isOpen)}
        w="full"
        px={5}
        py={4}
        align="center"
        justify="space-between"
        transition="colors 0.2s"
        _hover={{
          bg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50',
        }}
        cursor="pointer"
        bg="transparent"
        border="none"
        textAlign="left"
      >
        <Flex align="center" gap={3}>
          <Heading
            as="h3"
            fontSize="md"
            fontWeight="semibold"
            color={isDark ? 'white' : 'gray.800'}
          >
            {title}
          </Heading>
        </Flex>
        <Flex align="center" gap={2}>
          {headerAction && (
            <Box onClick={(e) => e.stopPropagation()}>{headerAction}</Box>
          )}
          <Box
            as={ChevronDown}
            w={5}
            h={5}
            color={isDark ? 'gray.400' : 'gray.500'}
            transition="transform 0.2s"
            transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          />
        </Flex>
      </Flex>

      {/* Content - Collapsible */}
      <Collapse in={isOpen} animateOpacity>
        <Box px={5} pb={5}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

export default CollapsibleSection

