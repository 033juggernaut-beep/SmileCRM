/**
 * AddPatientHeader - page title section with back button
 * - Optional back button for navigation
 * - Main title and optional subtitle
 * - Clean spacing
 * 
 * Matches Superdesign reference exactly:
 * - Container: max-w-2xl mx-auto px-4 pt-4 pb-4
 * - Title: text-2xl font-semibold tracking-tight
 * - Subtitle: text-sm mt-1
 */

import { Box, Heading, Text, useColorMode } from '@chakra-ui/react'
import { BackButton } from '../patientCard/BackButton'
import { useLanguage } from '../../context/LanguageContext'

export interface AddPatientHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backLabel?: string
  onBack?: () => void
}

export function AddPatientHeader({
  title,
  subtitle,
  showBackButton = true,
  backLabel,
  onBack,
}: AddPatientHeaderProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const displayTitle = title ?? t('addPatient.title')
  const displaySubtitle = subtitle ?? t('addPatient.subtitle')
  const displayBackLabel = backLabel ?? t('common.back')

  return (
    <Box
      w="full"
      maxW="2xl"
      mx="auto"
      px={4}
      pt={4}
      pb={4}
    >
      {/* Back Button */}
      {showBackButton && (
        <Box mb={3}>
          <BackButton label={displayBackLabel} onClick={onBack} />
        </Box>
      )}

      <Heading
        as="h1"
        fontSize="2xl"
        fontWeight="semibold"
        letterSpacing="tight"
        color={isDark ? 'white' : 'slate.800'}
      >
        {displayTitle}
      </Heading>
      {displaySubtitle && (
        <Text
          fontSize="sm"
          mt={1}
          color={isDark ? 'slate.400' : 'slate.500'}
        >
          {displaySubtitle}
        </Text>
      )}
    </Box>
  )
}

export default AddPatientHeader

