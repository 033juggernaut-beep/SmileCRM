/**
 * SegmentSelector - toggle-style patient segment selector
 * - VIP / Regular selection
 * - Subtle, professional design
 * - VIP has sky-blue highlight
 * 
 * Matches Superdesign reference exactly:
 * - Container: inline-flex p-1 rounded-xl bg-slate-100/800
 * - Button: px-4 py-2 text-sm font-medium rounded-lg
 * - Active VIP: bg-sky-500 text-white shadow-sm
 * - Active Regular: bg-white text-slate-800 shadow-sm
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import { useLanguage } from '../../context/LanguageContext'

export type PatientSegment = 'regular' | 'vip'

export interface SegmentSelectorProps {
  value: PatientSegment
  onChange: (segment: PatientSegment) => void
}

export function SegmentSelector({ value, onChange }: SegmentSelectorProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const segments: { value: PatientSegment; label: string }[] = [
    { value: 'regular', label: t('addPatient.segmentRegular') },
    { value: 'vip', label: t('addPatient.segmentVip') },
  ]

  return (
    <Box>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color={isDark ? 'slate.300' : 'slate.700'}
        mb={1.5}
      >
        {t('addPatient.segment')}
      </Text>
      <Flex
        display="inline-flex"
        p={1}
        borderRadius="xl"
        bg={isDark ? 'slate.800' : 'slate.100'}
      >
        {segments.map((segment) => {
          const isActive = value === segment.value
          const isVip = segment.value === 'vip'

          let bg = 'transparent'
          let color = isDark ? 'slate.400' : 'slate.500'
          let hoverColor = isDark ? 'slate.300' : 'slate.700'
          let shadow = 'none'

          if (isActive) {
            if (isVip) {
              bg = 'sky.500'
              color = 'white'
              shadow = 'sm'
            } else {
              bg = isDark ? 'slate.700' : 'white'
              color = isDark ? 'white' : 'slate.800'
              shadow = 'sm'
            }
            hoverColor = color
          }

          return (
            <Box
              key={segment.value}
              as="button"
              type="button"
              onClick={() => onChange(segment.value)}
              px={4}
              py={2}
              fontSize="sm"
              fontWeight="medium"
              borderRadius="lg"
              transition="all 0.15s"
              bg={bg}
              color={color}
              boxShadow={shadow}
              _hover={{
                color: hoverColor,
              }}
              cursor="pointer"
              border="none"
              outline="none"
            >
              {segment.label}
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}

export default SegmentSelector

