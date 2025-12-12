/**
 * Shared formatting utilities.
 * Centralized date, currency, and file size formatting.
 */

/**
 * Format a date string to localized short date format.
 * @param input - ISO date string or undefined
 * @returns Formatted date string or '—' if invalid
 */
export const formatDate = (input?: string | null): string => {
  if (!input) {
    return '—'
  }
  try {
    return new Date(input).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return input
  }
}

/**
 * Format a date string to localized date+time format.
 * @param input - ISO date string or undefined
 * @returns Formatted datetime string or '—' if invalid
 */
export const formatDateTime = (input?: string | null): string => {
  if (!input) {
    return '—'
  }
  try {
    return new Date(input).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return input
  }
}

/**
 * Format a number as currency with locale formatting.
 * @param amount - Amount to format (can be null/undefined)
 * @param currency - Currency code (default: AMD)
 * @returns Formatted currency string or '—' if no amount
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'AMD'
): string => {
  if (amount === null || amount === undefined) {
    return '—'
  }
  return `${amount.toLocaleString('ru-RU')} ${currency}`
}

/**
 * Format file size in bytes to human-readable format.
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
