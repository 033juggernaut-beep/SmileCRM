/**
 * Shared authentication utilities for API calls.
 * Centralized token management to avoid duplication.
 */

import { TOKEN_STORAGE_KEY } from '../constants/storage'

/**
 * Get the auth token from localStorage or throw an error.
 * Used by API modules that require authentication.
 */
export const getAuthToken = (): string => {
  if (typeof window === 'undefined') {
    throw new Error('Browser environment not available')
  }
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token) {
    throw new Error('Authentication required. Please re-open the Mini App.')
  }
  return token
}

/**
 * Check if user has a valid auth token stored.
 * Does not throw - useful for conditional logic.
 */
export const hasAuthToken = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  return Boolean(token)
}

/**
 * Clear the stored auth token.
 * Used during logout or token invalidation.
 */
export const clearAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}
