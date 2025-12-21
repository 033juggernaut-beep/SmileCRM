/**
 * FormField - universal form input component
 * - Label above input with required indicator
 * - Large, accessible input fields
 * - Calm blue focus state
 * - Support for text, tel, date types
 * - Error message display
 * 
 * Matches Superdesign reference exactly:
 * - Input: px-4 py-3 rounded-xl text-base
 * - Label: text-sm font-medium
 * - Light: bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-200
 * - Dark: bg-slate-800/70 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20
 */

import { Box, FormControl, FormLabel, Input, FormErrorMessage, useColorMode } from '@chakra-ui/react'

export interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: 'text' | 'tel' | 'date' | 'email'
  error?: string
  isDisabled?: boolean
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  error,
  isDisabled = false,
}: FormFieldProps) {
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
        {required && (
          <Box as="span" color="blue.500" ml={1}>*</Box>
        )}
      </FormLabel>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        isDisabled={isDisabled}
        h="auto"
        px={4}
        py={3}
        borderRadius="xl"
        fontSize="md"
        transition="all 0.2s"
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

export default FormField

