/**
 * NotificationDropdown - main dropdown container with bell icon
 * 
 * Matches Superdesign reference exactly:
 * - Bell button: p-2 rounded-lg with hover states
 * - Badge: absolute positioned, gradient blue bg, min-w-[18px]
 * - Dropdown: w-[340px] rounded-xl shadow-xl border
 * - Header: px-4 py-3 border-b with title + actions
 * - List: max-h-[380px] overflow-y-auto
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  IconButton,
  useColorMode,
  Portal,
} from '@chakra-ui/react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { NotificationBell } from './NotificationBell'
import { NotificationList } from './NotificationList'
import type { Notification } from './types'

const MotionBox = motion.create(Box)

export interface NotificationDropdownProps {
  notifications: Notification[]
  onNotificationClick?: (notification: Notification) => void
  onMarkAllRead?: () => void
}

export function NotificationDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleClose = useCallback(() => setIsOpen(false), [])
  const handleToggle = () => setIsOpen(!isOpen)

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification)
    handleClose()
  }

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClose])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleClose])

  return (
    <Box ref={containerRef} position="relative">
      {/* Bell Button with Badge */}
      <NotificationBell
        unreadCount={unreadCount}
        isOpen={isOpen}
        onClick={handleToggle}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <Portal>
            {/* Backdrop */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              position="fixed"
              inset={0}
              zIndex={1400}
              onClick={handleClose}
            />

            {/* Panel */}
            <MotionBox
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              position="fixed"
              top="60px"
              right="16px"
              w="340px"
              borderRadius="xl"
              overflow="hidden"
              zIndex={1500}
              bg={isDark ? '#0F172A' : 'white'} // slate-900 / white
              border="1px solid"
              borderColor={isDark ? 'rgba(51, 65, 85, 0.7)' : '#E2E8F0'} // slate-700/70 / slate-200
              boxShadow={
                isDark
                  ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                  : '0 20px 25px -5px rgba(148, 163, 184, 0.25), 0 8px 10px -6px rgba(148, 163, 184, 0.25)'
              }
            >
              {/* Header */}
              <Flex
                align="center"
                justify="space-between"
                px={4}
                py={3}
                borderBottom="1px solid"
                borderColor={isDark ? 'rgba(51, 65, 85, 0.7)' : '#F1F5F9'} // slate-700/70 / slate-100
              >
                <Flex align="center" gap={2}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={isDark ? '#F1F5F9' : '#1E293B'} // slate-100 / slate-800
                  >
                    {t('notifications.title')}
                  </Text>
                  {unreadCount > 0 && (
                    <Box
                      px={1.5}
                      py={0.5}
                      fontSize="xs"
                      fontWeight="medium"
                      borderRadius="full"
                      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'} // blue-500/20 / blue-100
                      color={isDark ? '#60A5FA' : '#2563EB'} // blue-400 / blue-600
                    >
                      {unreadCount}
                    </Box>
                  )}
                </Flex>
                <Flex align="center" gap={2}>
                  {unreadCount > 0 && (
                    <Box
                      as="button"
                      onClick={onMarkAllRead}
                      fontSize="xs"
                      fontWeight="medium"
                      color={isDark ? '#60A5FA' : '#2563EB'} // blue-400 / blue-600
                      _hover={{
                        color: isDark ? '#93C5FD' : '#1D4ED8', // blue-300 / blue-700
                      }}
                      transition="color 0.2s"
                      cursor="pointer"
                      bg="transparent"
                      border="none"
                    >
                      {t('notifications.markAllRead')}
                    </Box>
                  )}
                  <IconButton
                    aria-label={t('common.close')}
                    icon={<X />}
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    p={1}
                    borderRadius="md"
                    color={isDark ? '#64748B' : '#94A3B8'} // slate-500 / slate-400
                    _hover={{
                      color: isDark ? '#CBD5E1' : '#475569', // slate-300 / slate-600
                      bg: isDark ? '#1E293B' : '#F1F5F9', // slate-800 / slate-100
                    }}
                    sx={{
                      '& svg': {
                        width: '16px',
                        height: '16px',
                      },
                    }}
                  />
                </Flex>
              </Flex>

              {/* Notifications List */}
              <Box maxH="380px" overflowY="auto">
                <NotificationList
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                />
              </Box>
            </MotionBox>
          </Portal>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default NotificationDropdown
