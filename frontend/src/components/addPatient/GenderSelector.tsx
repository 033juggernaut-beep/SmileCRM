/**
 * GenderSelector - toggle-style patient gender selector
 * - Male / Female selection
 * - Similar design to SegmentSelector
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react'
import { useLanguage } from '../../context/LanguageContext'

export type PatientGender = 'male' | 'female'

export interface GenderSelectorProps {
  value: PatientGender | undefined
  onChange: (gender: PatientGender) => void
}

export function GenderSelector({ value, onChange }: GenderSelectorProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const genders: { value: PatientGender; label: string }[] = [
    { value: 'male', label: t('addPatient.genderMale') },
    { value: 'female', label: t('addPatient.genderFemale') },
  ]

  return (
    <Box>
      <Text
        fontSize="sm"
        fontWeight="medium"
        color={isDark ? 'slate.300' : 'slate.700'}
        mb={1.5}
      >
        {t('addPatient.gender')}
      </Text>
      <Flex
        display="inline-flex"
        p={1}
        borderRadius="xl"
        bg={isDark ? 'slate.800' : 'slate.100'}
      >
        {genders.map((gender) => {
          const isActive = value === gender.value
          const isMale = gender.value === 'male'

          let bg = 'transparent'
          let color = isDark ? 'slate.400' : 'slate.500'
          let hoverColor = isDark ? 'slate.300' : 'slate.700'
          let shadow = 'none'

          if (isActive) {
            // Blue for male, pink for female
            bg = isMale ? 'blue.500' : 'pink.400'
            color = 'white'
            shadow = 'sm'
            hoverColor = color
          }

          return (
            <Box
              key={gender.value}
              as="button"
              type="button"
              onClick={() => onChange(gender.value)}
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
              {gender.label}
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}

export default GenderSelector

