/**
 * VisitDynamicsChart - line chart showing visit trends
 * 
 * Matches Superdesign reference exactly:
 * - SVG-based simple line chart
 * - Gradient fill under line
 * - Period toggle
 * - Animated line drawing
 */

import { Box, Flex, Text, useColorMode, Skeleton } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

export type VisitPeriod = '7d' | '30d'

export type VisitSeriesPoint = {
  date: string
  count: number
}

export interface VisitDynamicsChartProps {
  period: VisitPeriod
  onPeriodChange: (period: VisitPeriod) => void
  visitsSeries?: VisitSeriesPoint[]
  totalVisits?: number
  isLoading?: boolean
}

const MotionPath = motion.path

export function VisitDynamicsChart({
  period,
  onPeriodChange,
  visitsSeries = [],
  totalVisits,
  isLoading = false,
}: VisitDynamicsChartProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  // Extract counts from series
  const data = visitsSeries.length > 0 
    ? visitsSeries.map(p => p.count) 
    : [0]

  // Calculate total from series if not provided
  const displayTotal = totalVisits ?? data.reduce((sum, n) => sum + n, 0)

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const height = 120
  const width = 100

  const points = data.length > 1 
    ? data.map((val, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((val - min) / range) * (height * 0.7) - (height * 0.15)
        return `${x},${y}`
      }).join(' ')
    : `50,${height / 2}` // Single point in the middle

  const strokeColor = isDark ? '#60a5fa' : '#3b82f6'
  const gradientStart = isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.25)'

  const lastPoint = points.split(' ').slice(-1)[0]
  const [lastX, lastY] = lastPoint ? lastPoint.split(',') : ['50', '60']

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
            <>
              <Skeleton height="36px" width="80px" mb={1} />
              <Skeleton height="16px" width="120px" />
            </>
          ) : (
            <>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                letterSpacing="tight"
                color={isDark ? 'white' : 'slate.800'}
              >
                {displayTotal.toLocaleString()}
              </Text>
              <Text
                fontSize="xs"
                fontWeight="medium"
                mt={1}
                color={isDark ? 'slate.400' : 'slate.500'}
              >
                {t('stats.visitsForPeriod')}
              </Text>
            </>
          )}
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

      {/* Chart */}
      <Box w="full" h="120px" position="relative" mt={6} mb={2}>
        {isLoading ? (
          <Skeleton height="100%" width="100%" borderRadius="md" />
        ) : (
          <Box
            as="svg"
            w="full"
            h="full"
            overflow="visible"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
                <stop offset="100%" stopColor={gradientStart} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            {data.length > 1 && (
              <path
                d={`M0,${height} L${points.split(' ')[0]} ${points} L${width},${height} Z`}
                fill="url(#chartGradientBlue)"
              />
            )}

            {/* Line */}
            {data.length > 1 && (
              <MotionPath
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                d={`M${points.split(' ').join(' L')}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {/* End dot */}
            <circle
              cx={lastX}
              cy={lastY}
              r="3"
              fill={isDark ? '#0F172A' : 'white'}
              stroke={isDark ? '#60a5fa' : '#2563EB'}
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
          </Box>
        )}

        {/* X-axis labels */}
        <Flex
          justify="space-between"
          mt={2}
          fontSize="10px"
          fontWeight="medium"
          textTransform="uppercase"
          color={isDark ? 'slate.500' : 'slate.400'}
        >
          <Text>{period === '7d' ? t('stats.daysAgo7') : t('stats.daysAgo30')}</Text>
          <Text>{t('stats.today')}</Text>
        </Flex>
      </Box>
    </Box>
  )
}

export default VisitDynamicsChart
