/**
 * AddPatientCollapsibleSection - collapsible wrapper for optional form fields
 * - Smooth open/close animation
 * - Collapsed by default
 * 
 * Matches Superdesign reference exactly:
 * - Container: rounded-xl
 * - Light: bg-white border-slate-200/80 shadow-sm
 * - Dark: bg-slate-800/40 border-slate-700/50
 * - Header: px-4 py-3.5, hover:bg-slate-50/700/30
 * - Chevron: w-4 h-4, rotates 180deg on open
 */

import { useState, type ReactNode } from 'react'
import { Box, Flex, Collapse, useColorMode } from '@chakra-ui/react'
import { ChevronDown } from 'lucide-react'

export interface AddPatientCollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function AddPatientCollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: AddPatientCollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <Box
      w="full"
      borderRadius="xl"
      overflow="hidden"
      transition="colors 0.2s"
      bg={isDark ? 'rgba(30, 41, 59, 0.4)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
      boxShadow={isDark ? 'none' : 'sm'}
    >
      {/* Toggle Header */}
      <Flex
        as="button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        w="full"
        px={4}
        py={3.5}
        align="center"
        justify="space-between"
        transition="colors 0.2s"
        _hover={{
          bg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'slate.50',
        }}
        cursor="pointer"
        bg="transparent"
        border="none"
        textAlign="left"
        outline="none"
      >
        <Box
          as="span"
          fontSize="sm"
          fontWeight="medium"
          color={isDark ? 'slate.300' : 'slate.700'}
        >
          {title}
        </Box>
        <Box
          as={ChevronDown}
          w={4}
          h={4}
          color={isDark ? 'slate.500' : 'slate.400'}
          transition="transform 0.2s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        />
      </Flex>

      {/* Content */}
      <Collapse in={isOpen} animateOpacity>
        <Box
          px={4}
          pb={4}
          pt={1}
          borderTop="1px solid"
          borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : 'slate.100'}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

export default AddPatientCollapsibleSection

