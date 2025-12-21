/**
 * StatsSection - section wrapper with title and icon
 * 
 * Matches Superdesign reference exactly:
 * - Container: mb-8
 * - Title row: flex items-center gap-2 mb-4 px-1
 * - Icon: w-4 h-4
 * - Title: text-sm font-semibold uppercase tracking-wider
 * - Light: icon text-blue-600, title text-slate-500
 * - Dark: icon text-blue-400, title text-slate-400
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const MotionBox = motion.create(Box)

export interface StatsSectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
  delay?: number
}

export function StatsSection({
  title,
  icon,
  children,
  delay = 0,
}: StatsSectionProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      mb={8}
    >
      {/* Section Header */}
      <Flex align="center" gap={2} mb={4} px={1}>
        <Box
          color={isDark ? 'blue.400' : 'blue.600'}
          sx={{
            '& svg': {
              width: '16px',
              height: '16px',
            },
          }}
        >
          {icon}
        </Box>
        <Text
          fontSize="sm"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="wider"
          color={isDark ? 'slate.400' : 'slate.500'}
        >
          {title}
        </Text>
      </Flex>

      {/* Section Content */}
      {children}
    </MotionBox>
  )
}

export default StatsSection

