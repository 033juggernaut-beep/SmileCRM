/**
 * Debug utilities for development
 */

export const isDebugMode = (): boolean => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('debug') === 'true'
}

export const getDebugQueryParam = (): string => {
  if (typeof window === 'undefined') return ''
  return window.location.search
}

export const getCurrentHref = (): string => {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

