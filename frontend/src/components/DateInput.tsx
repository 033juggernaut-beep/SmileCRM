/**
 * DateInput - Custom date picker with blue theme
 * Replaces native date input for consistent blue styling across all devices
 * Uses react-datepicker for mobile-friendly calendar
 */

import { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ru } from 'date-fns/locale/ru'
import { Input, InputGroup, InputRightElement, useColorMode } from '@chakra-ui/react'
import { Calendar } from 'lucide-react'
import 'react-datepicker/dist/react-datepicker.css'

// Register Russian locale
registerLocale('ru', ru)

interface DateInputProps {
  value: string // ISO date string YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  isDisabled?: boolean
  minDate?: Date
  maxDate?: Date
}

// Custom input component for Chakra UI styling
const CustomInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; placeholder?: string; isDark?: boolean }>(
  ({ value, onClick, placeholder, isDark }, ref) => (
    <InputGroup>
      <Input
        ref={ref}
        value={value}
        onClick={onClick}
        readOnly
        placeholder={placeholder}
        cursor="pointer"
        bg={isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'}
        borderColor={isDark ? 'gray.600' : 'gray.200'}
        color={isDark ? 'white' : 'gray.800'}
        _hover={{ borderColor: isDark ? 'gray.500' : 'gray.300' }}
        _focus={{
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        }}
      />
      <InputRightElement pointerEvents="none">
        <Calendar size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      </InputRightElement>
    </InputGroup>
  )
)
CustomInput.displayName = 'CustomInput'

export function DateInput({
  value,
  onChange,
  placeholder = 'Выберите дату',
  isDisabled = false,
  minDate,
  maxDate,
}: DateInputProps) {
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Parse ISO string to Date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null

  // Handle date change
  const handleChange = (date: Date | null) => {
    if (date) {
      // Convert to ISO string YYYY-MM-DD
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    } else {
      onChange('')
    }
  }

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      dateFormat="dd.MM.yyyy"
      locale="ru"
      disabled={isDisabled}
      minDate={minDate}
      maxDate={maxDate}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      customInput={<CustomInput isDark={isDark} placeholder={placeholder} />}
      popperClassName={isDark ? 'date-picker-dark' : 'date-picker-light'}
      calendarClassName="blue-calendar"
      wrapperClassName="date-picker-wrapper"
      portalId="root"
    />
  )
}

export default DateInput
