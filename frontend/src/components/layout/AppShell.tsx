/**
 * AppShell - Universal layout wrapper for all pages
 * 
 * Features:
 * - Full viewport height using 100dvh with 100vh fallback
 * - Proper scrolling via flex layout
 * - Footer always at bottom (sticky when content is short, scrolls with content when long)
 * - Works in Telegram Mini App and regular browser
 */

import { Box, Flex, useColorMode } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface AppShellProps {
  children: ReactNode
  /** Background color/gradient - defaults to theme-aware gradient */
  bg?: string
  /** Whether to show the background pattern (passed as child) */
  backgroundPattern?: ReactNode
  /** Header component */
  header?: ReactNode
  /** Footer component */
  footer?: ReactNode
  /** Additional padding top (e.g., for fixed headers) */
  pt?: string | number
}

export function AppShell({
  children,
  bg,
  backgroundPattern,
  header,
  footer,
  pt = 0,
}: AppShellProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Default background gradient matching Superdesign reference
  const defaultBg = isDark
    ? '#0F172A' // slate-900
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  return (
    <Box
      w="100%"
      minH="100dvh" // Modern viewport height
      h="auto"
      bg={bg || defaultBg}
      position="relative"
      transition="background 0.3s"
      // Fallback for browsers that don't support dvh
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background pattern (absolute positioned, z-0) */}
      {backgroundPattern}

      {/* Main flex container for proper scroll + footer positioning */}
      <Flex
        direction="column"
        minH="100dvh"
        position="relative"
        zIndex={10}
        sx={{
          '@supports not (min-height: 100dvh)': {
            minH: 'var(--app-height, 100vh)',
          },
        }}
      >
        {/* Header (if provided) */}
        {header}

        {/* Scrollable content area */}
        <Box
          as="main"
          flex="1"
          display="flex"
          flexDirection="column"
          overflowY="auto"
          overflowX="hidden"
          pt={pt}
          // Enable momentum scrolling on iOS
          sx={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </Box>

        {/* Footer (mt=auto pushes it to bottom when content is short) */}
        {footer && (
          <Box mt="auto" flexShrink={0}>
            {footer}
          </Box>
        )}
      </Flex>
    </Box>
  )
}

export default AppShell

