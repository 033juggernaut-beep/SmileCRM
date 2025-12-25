/**
 * VisitsCard - visits statistics card with period toggle
 * 
 * Matches Superdesign reference exactly:
 * - Contains big value, label, period toggle, and breakdown list
 * - Period toggle: p-1 rounded-lg, buttons px-3 py-1.5 text-xs font-semibold
 * - Breakdown: list items with border-b
 */

import { Box, Flex, Text, useColorMode, Skeleton } from '@chakra-ui/react'
import { useLanguage } from '../../context/LanguageContext'

export type VisitPeriod = '7d' | '30d'

export interface VisitsCardProps {
  period: VisitPeriod
  onPeriodChange: (period: VisitPeriod) => void
  todayVisits?: number
  weekVisits?: number
  monthVisits?: number
  isLoading?: boolean
}

export function VisitsCard({
  period,
  onPeriodChange,
  todayVisits = 0,
  weekVisits = 0,
  monthVisits = 0,
  isLoading = false,
}: VisitsCardProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const totalVisits = period === '7d' ? weekVisits : monthVisits

  return (
    <Box
      borderRadius="xl"
      p={5}
      position="relative"
      overflow="visible"
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
      }}
    >
      {/* Header Row */}
      <Flex align="center" justify="space-between" mb={2}>
        <Box>
          {isLoading ? (
            <Skeleton height="36px" width="80px" mb={1} />
          ) : (
            <Text
              fontSize="3xl"
              fontWeight="bold"
              letterSpacing="tight"
              color={isDark ? 'white' : 'slate.800'}
            >
              {totalVisits.toLocaleString()}
            </Text>
          )}
          <Text
            fontSize="xs"
            fontWeight="medium"
            mt={1}
            color={isDark ? 'slate.400' : 'slate.500'}
          >
            {t('stats.totalVisits')}
          </Text>
        </Box>

        {/* Period Toggle */}
        <Flex
          p={1}
          borderRadius="lg"
          bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'slate.100'}
        >
          {(['7d', '30d'] as const).map((p) => (
            <Box
              key={p}
              as="button"
              onClick={() => onPeriodChange(p)}
              px={3}
              py={1.5}
              fontSize="xs"
              fontWeight="semibold"
              borderRadius="md"
              transition="all 0.2s"
              bg={
                period === p
                  ? isDark
                    ? 'slate.800'
                    : 'white'
                  : 'transparent'
              }
              color={
                period === p
                  ? isDark
                    ? 'white'
                    : 'slate.800'
                  : isDark
                    ? 'slate.400'
                    : 'slate.500'
              }
              boxShadow={period === p ? 'sm' : 'none'}
              border={period === p ? '1px solid' : 'none'}
              borderColor={
                period === p
                  ? isDark
                    ? 'slate.600'
                    : 'slate.200'
                  : 'transparent'
              }
              _hover={{
                color: period === p ? undefined : isDark ? 'white' : 'slate.800',
              }}
              cursor="pointer"
              outline="none"
            >
              {p === '7d' ? t('stats.period7d') : t('stats.period30d')}
            </Box>
          ))}
        </Flex>
      </Flex>

      {/* Breakdown List */}
      <Box mt={4} mb={4}>
        <Flex
          align="center"
          justify="space-between"
          py={2}
          borderBottom="1px solid"
          borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : 'slate.100'}
        >
          <Text fontSize="sm" color={isDark ? 'slate.400' : 'slate.500'}>
            {t('stats.todayVisits')}
          </Text>
          {isLoading ? (
            <Skeleton height="20px" width="40px" />
          ) : (
            <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'slate.800'}>
              {todayVisits.toLocaleString()}
            </Text>
          )}
        </Flex>
        <Flex
          align="center"
          justify="space-between"
          py={2}
          borderBottom="1px solid"
          borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : 'slate.100'}
        >
          <Text fontSize="sm" color={isDark ? 'slate.400' : 'slate.500'}>
            {t('stats.visitsLast7Days')}
          </Text>
          {isLoading ? (
            <Skeleton height="20px" width="40px" />
          ) : (
            <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'slate.800'}>
              {weekVisits.toLocaleString()}
            </Text>
          )}
        </Flex>
        <Flex
          align="center"
          justify="space-between"
          py={2}
        >
          <Text fontSize="sm" color={isDark ? 'slate.400' : 'slate.500'}>
            {t('stats.visitsLast30Days')}
          </Text>
          {isLoading ? (
            <Skeleton height="20px" width="40px" />
          ) : (
            <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'white' : 'slate.800'}>
              {monthVisits.toLocaleString()}
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  )
}

export default VisitsCard

