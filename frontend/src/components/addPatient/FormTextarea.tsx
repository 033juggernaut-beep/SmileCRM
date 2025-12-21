/**
 * FormTextarea - multiline text input component
 * - Clear label above
 * - Calm blue focus state
 * - Resizable with min-height
 * 
 * Matches Superdesign reference exactly:
 * - Textarea: px-4 py-3 rounded-xl text-base min-h-[80px]
 * - Label: text-sm font-medium
 */

import { FormControl, FormLabel, Textarea, FormErrorMessage, useColorMode } from '@chakra-ui/react'

export interface FormTextareaProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  error?: string
  isDisabled?: boolean
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  isDisabled = false,
}: FormTextareaProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel
        fontSize="sm"
        fontWeight="medium"
        color={isDark ? 'slate.300' : 'slate.700'}
        mb={1.5}
      >
        {label}
      </FormLabel>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        isDisabled={isDisabled}
        px={4}
        py={3}
        borderRadius="xl"
        fontSize="md"
        transition="all 0.2s"
        resize="vertical"
        minH="80px"
        bg={isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'}
        border="1px solid"
        borderColor={isDark ? 'slate.700' : 'slate.200'}
        color={isDark ? 'white' : 'slate.800'}
        _placeholder={{
          color: isDark ? 'slate.500' : 'slate.400',
        }}
        _hover={{
          borderColor: isDark ? 'slate.600' : 'slate.300',
        }}
        _focus={{
          borderColor: isDark ? 'blue.500' : 'blue.400',
          boxShadow: isDark
            ? '0 0 0 2px rgba(59, 130, 246, 0.2)'
            : '0 0 0 2px rgba(191, 219, 254, 1)',
          outline: 'none',
        }}
        sx={{
          boxShadow: isDark ? 'none' : 'sm',
        }}
      />
      {error && (
        <FormErrorMessage color="error.500" fontSize="xs" mt={1}>
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  )
}

export default FormTextarea

