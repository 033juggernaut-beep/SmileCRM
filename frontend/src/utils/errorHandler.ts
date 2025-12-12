import { AxiosError } from 'axios'

/**
 * Extract user-friendly error message from axios error
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Check if it's a 402 Payment Required error
    if (error.response?.status === 402) {
      const detail = error.response.data?.detail
      if (detail && typeof detail === 'string') {
        return detail
      }
      return 'Требуется подписка. Пожалуйста, оформите подписку для продолжения использования приложения.'
    }

    // Check if server provided a detail message
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      // Handle FastAPI validation errors (array of objects)
      if (Array.isArray(detail)) {
        return detail.map((e: { msg?: string }) => e.msg || 'Validation error').join(', ')
      }
      if (typeof detail === 'string') {
        return detail
      }
    }

    // Check if server provided a message
    if (error.response?.data?.message) {
      return error.response.data.message
    }

    // Generic status code messages
    if (error.response?.status === 401) {
      return 'Требуется авторизация. Пожалуйста, войдите в систему.'
    }

    if (error.response?.status === 403) {
      return 'Доступ запрещен. У вас нет прав для выполнения этого действия.'
    }

    if (error.response?.status === 404) {
      return 'Ресурс не найден.'
    }

    if (error.response?.status === 500) {
      return 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.'
    }

    // Generic axios error message
    if (error.message) {
      return error.message
    }
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message
  }

  // Fallback
  return 'Произошла неизвестная ошибка. Пожалуйста, попробуйте позже.'
}

/**
 * Check if error is a 402 Payment Required error
 */
export const isPaymentRequiredError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 402
  }
  return false
}

