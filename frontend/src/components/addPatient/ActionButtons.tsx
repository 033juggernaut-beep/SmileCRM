/**
 * ActionButtons - form submit/cancel buttons
 * - Clear visual hierarchy
 * - Primary: Save button (blue)
 * - Secondary: Cancel button (ghost)
 * - Responsive layout (column on mobile, row on desktop)
 * 
 * Matches Superdesign reference exactly:
 * - Container: flex flex-col-reverse sm:flex-row gap-3 pt-4
 * - Cancel: px-6 py-3 rounded-xl text-sm font-medium
 * - Save: px-8 py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md
 */

import { Flex, Box, Spinner, useColorMode } from '@chakra-ui/react'
import { useLanguage } from '../../context/LanguageContext'

export interface ActionButtonsProps {
  onSave: () => void
  onCancel: () => void
  isLoading?: boolean
  saveLabel?: string
  cancelLabel?: string
  isDisabled?: boolean
}

export function ActionButtons({
  onSave,
  onCancel,
  isLoading = false,
  saveLabel,
  cancelLabel,
  isDisabled = false,
}: ActionButtonsProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const displaySaveLabel = saveLabel ?? t('addPatient.save')
  const displayCancelLabel = cancelLabel ?? t('addPatient.cancel')

  const isSaveDisabled = isLoading || isDisabled

  return (
    <Flex
      direction={{ base: 'column-reverse', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="flex-end"
      gap={3}
      pt={4}
    >
      {/* Cancel Button */}
      <Box
        as="button"
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        px={6}
        py={3}
        borderRadius="xl"
        fontSize="sm"
        fontWeight="medium"
        transition="all 0.15s"
        cursor={isLoading ? 'not-allowed' : 'pointer'}
        opacity={isLoading ? 0.5 : 1}
        color={isDark ? 'slate.400' : 'slate.600'}
        bg="transparent"
        border="none"
        outline="none"
        _hover={{
          color: isDark ? 'slate.300' : 'slate.700',
          bg: isDark ? 'slate.800' : 'slate.100',
        }}
        textAlign="center"
      >
        {displayCancelLabel}
      </Box>

      {/* Save Button */}
      <Box
        as="button"
        type="submit"
        onClick={onSave}
        disabled={isSaveDisabled}
        px={8}
        py={3}
        borderRadius="xl"
        fontSize="sm"
        fontWeight="semibold"
        transition="all 0.15s"
        cursor={isSaveDisabled ? 'not-allowed' : 'pointer'}
        opacity={isLoading ? 0.7 : 1}
        bg={isDark ? 'blue.600' : 'blue.500'}
        color="white"
        border="none"
        outline="none"
        boxShadow="sm"
        _hover={{
          bg: isSaveDisabled ? undefined : (isDark ? 'blue.500' : 'blue.600'),
          boxShadow: isSaveDisabled ? undefined : 'md',
        }}
        _active={{
          transform: isSaveDisabled ? undefined : 'scale(0.98)',
        }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap={2}
        textAlign="center"
      >
        {isLoading ? (
          <>
            <Spinner
              size="sm"
              thickness="2px"
              color="whiteAlpha.700"
              sx={{
                borderTopColor: 'white',
              }}
            />
            <span>{t('addPatient.saving')}</span>
          </>
        ) : (
          displaySaveLabel
        )}
      </Box>
    </Flex>
  )
}

export default ActionButtons

