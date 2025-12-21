/**
 * StatisticsHeader - page title block with welcome-style background
 * 
 * Matches Superdesign reference exactly:
 * - Container: w-full px-8 py-10 rounded-2xl mb-10
 * - Light: bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg shadow-blue-100/50
 * - Dark: bg-slate-800/60 shadow-xl shadow-slate-900/30
 * - Title: text-3xl md:text-4xl font-semibold tracking-tight text-center
 * - Subtitle: mt-3 text-base md:text-lg text-center
 */

import { Box, Heading, Text, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

const MotionBox = motion.create(Box)

export interface StatisticsHeaderProps {
  title?: string
  subtitle?: string
}

export function StatisticsHeader({ title, subtitle }: StatisticsHeaderProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const displayTitle = title ?? t('stats.title')
  const displaySubtitle = subtitle ?? t('stats.subtitle')

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      w="full"
      px={{ base: 6, md: 8 }}
      py={{ base: 8, md: 10 }}
      borderRadius="2xl"
      mb={10}
      transition-property="colors"
      sx={{
        transitionDuration: '0.3s',
      }}
      bg={
        isDark
          ? 'rgba(30, 41, 59, 0.6)'
          : 'linear-gradient(to bottom right, #EFF6FF, #F0F9FF)'
      }
      boxShadow={
        isDark
          ? '0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.3)'
          : '0 10px 15px -3px rgba(219, 234, 254, 0.5), 0 4px 6px -4px rgba(219, 234, 254, 0.5)'
      }
    >
      <Heading
        as="h1"
        fontSize={{ base: '1.875rem', md: '2.25rem' }}
        fontWeight="semibold"
        letterSpacing="tight"
        textAlign="center"
        color={isDark ? 'white' : 'slate.800'}
      >
        {displayTitle}
      </Heading>
      <Text
        mt={3}
        fontSize={{ base: 'md', md: 'lg' }}
        textAlign="center"
        fontWeight="normal"
        color={isDark ? 'slate.400' : 'slate.500'}
      >
        {displaySubtitle}
      </Text>
    </MotionBox>
  )
}

export default StatisticsHeader

