/**
 * StatCard - individual stat card with icon, badge, value, and label
 * 
 * Matches Superdesign reference exactly:
 * - Card: rounded-xl p-5
 * - Light: bg-white border-blue-100 shadow-md shadow-blue-50 hover:shadow-lg
 * - Dark: bg-slate-800/70 border-slate-700/50 hover:border-blue-500/50
 * - Icon box: w-10 h-10 rounded-lg
 * - Badge: text-xs font-bold px-2 py-1 rounded-full
 * - Value: text-2xl font-bold
 * - Label: text-sm font-medium
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type StatCardColor = 'blue' | 'emerald' | 'amber' | 'red' | 'slate'

export interface StatCardProps {
  icon: ReactNode
  badge: string
  value: string | number
  label: string
  color?: StatCardColor
  onClick?: () => void
  children?: ReactNode
}

const colorConfig: Record<StatCardColor, {
  iconBgLight: string
  iconBgDark: string
  iconColorLight: string
  iconColorDark: string
  badgeBgLight: string
  badgeBgDark: string
  badgeColorLight: string
  badgeColorDark: string
}> = {
  blue: {
    iconBgLight: '#DBEAFE', // blue-100
    iconBgDark: 'rgba(59, 130, 246, 0.15)', // blue-500/15
    iconColorLight: '#2563EB', // blue-600
    iconColorDark: '#60A5FA', // blue-400
    badgeBgLight: 'rgba(59, 130, 246, 0.1)', // blue-500/10
    badgeBgDark: 'rgba(59, 130, 246, 0.15)', // blue-500/15
    badgeColorLight: '#2563EB', // blue-600
    badgeColorDark: '#60A5FA', // blue-400
  },
  emerald: {
    iconBgLight: '#D1FAE5', // emerald-100
    iconBgDark: 'rgba(16, 185, 129, 0.15)', // emerald-500/15
    iconColorLight: '#059669', // emerald-600
    iconColorDark: '#34D399', // emerald-400
    badgeBgLight: 'rgba(16, 185, 129, 0.1)',
    badgeBgDark: 'rgba(16, 185, 129, 0.15)',
    badgeColorLight: '#059669',
    badgeColorDark: '#34D399',
  },
  amber: {
    iconBgLight: '#FEF3C7', // amber-100
    iconBgDark: 'rgba(245, 158, 11, 0.15)', // amber-500/15
    iconColorLight: '#D97706', // amber-600
    iconColorDark: '#FBBF24', // amber-400
    badgeBgLight: 'rgba(245, 158, 11, 0.1)',
    badgeBgDark: 'rgba(245, 158, 11, 0.15)',
    badgeColorLight: '#D97706',
    badgeColorDark: '#FBBF24',
  },
  red: {
    iconBgLight: '#FEE2E2', // red-100
    iconBgDark: 'rgba(239, 68, 68, 0.15)', // red-500/15
    iconColorLight: '#DC2626', // red-600
    iconColorDark: '#F87171', // red-400
    badgeBgLight: 'rgba(239, 68, 68, 0.1)',
    badgeBgDark: 'rgba(239, 68, 68, 0.15)',
    badgeColorLight: '#DC2626',
    badgeColorDark: '#F87171',
  },
  slate: {
    iconBgLight: '#F1F5F9', // slate-100
    iconBgDark: 'rgba(100, 116, 139, 0.15)', // slate-500/15
    iconColorLight: '#64748B', // slate-500
    iconColorDark: '#94A3B8', // slate-400
    badgeBgLight: '#F1F5F9',
    badgeBgDark: 'rgba(51, 65, 85, 1)', // slate-700
    badgeColorLight: '#64748B',
    badgeColorDark: '#94A3B8',
  },
}

export function StatCard({
  icon,
  badge,
  value,
  label,
  color = 'blue',
  onClick,
  children,
}: StatCardProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const config = colorConfig[color]

  return (
    <Box
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      borderRadius="xl"
      p={5}
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      bg={isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'}
      boxShadow={isDark ? 'none' : '0 4px 6px -1px rgba(239, 246, 255, 1), 0 2px 4px -2px rgba(239, 246, 255, 1)'}
      _hover={{
        borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : '#60A5FA',
        boxShadow: isDark
          ? '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)'
          : '0 10px 15px -3px rgba(219, 234, 254, 1), 0 4px 6px -4px rgba(219, 234, 254, 1)',
        transform: onClick ? 'scale(0.99)' : undefined,
      }}
      _active={{
        transform: onClick ? 'scale(0.99)' : undefined,
      }}
    >
      {/* Default card content */}
      {!children && (
        <>
          <Flex align="flex-start" justify="space-between" mb={4}>
            {/* Icon Box */}
            <Box
              w="40px"
              h="40px"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={isDark ? config.iconBgDark : config.iconBgLight}
              color={isDark ? config.iconColorDark : config.iconColorLight}
              sx={{
                '& svg': {
                  width: '20px',
                  height: '20px',
                },
              }}
            >
              {icon}
            </Box>

            {/* Badge */}
            <Box
              fontSize="xs"
              fontWeight="bold"
              px={2}
              py={1}
              borderRadius="full"
              bg={isDark ? config.badgeBgDark : config.badgeBgLight}
              color={isDark ? config.badgeColorDark : config.badgeColorLight}
            >
              {badge}
            </Box>
          </Flex>

          {/* Value and Label */}
          <Box>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={isDark ? 'slate.400' : 'slate.500'}
              mb={1}
            >
              {label}
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isDark ? 'white' : 'slate.800'}
            >
              {value}
            </Text>
          </Box>
        </>
      )}

      {/* Custom children for complex cards */}
      {children}
    </Box>
  )
}

export default StatCard

