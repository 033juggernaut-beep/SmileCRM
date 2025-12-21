/**
 * NotificationBell - Bell icon with badge for notification count
 * 
 * Matches Superdesign reference exactly:
 * - Bell button: p-2 rounded-lg with hover states
 * - Badge: absolute positioned, gradient blue bg, min-w-[18px]
 * - Animation: scale-in for badge
 */

import { Box, IconButton, useColorMode } from '@chakra-ui/react'
import { Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'

const MotionBox = motion.create(Box)

export interface NotificationBellProps {
  unreadCount: number
  isOpen?: boolean
  onClick?: () => void
}

export function NotificationBell({
  unreadCount,
  isOpen = false,
  onClick,
}: NotificationBellProps) {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  return (
    <Box position="relative">
      {/* Bell Button */}
      <IconButton
        aria-label={t('notifications.title')}
        icon={<Bell />}
        onClick={onClick}
        variant="ghost"
        p={2}
        borderRadius="lg"
        transition="all 0.2s"
        bg={
          isOpen
            ? isDark
              ? 'rgba(51, 65, 85, 1)' // slate-700
              : 'rgba(239, 246, 255, 1)' // blue-50
            : 'transparent'
        }
        color={
          isOpen
            ? isDark
              ? '#60A5FA' // blue-400
              : '#2563EB' // blue-600
            : isDark
              ? '#94A3B8' // slate-400
              : '#64748B' // slate-500
        }
        _hover={{
          bg: isOpen
            ? undefined
            : isDark
              ? 'rgba(30, 41, 59, 1)' // slate-800
              : 'rgba(241, 245, 249, 1)', // slate-100
          color: isDark ? '#E2E8F0' : '#334155', // slate-200 / slate-700
        }}
        sx={{
          '& svg': {
            width: '20px',
            height: '20px',
          },
        }}
      />

      {/* Badge */}
      {unreadCount > 0 && (
        <MotionBox
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          position="absolute"
          top="-2px"
          right="-2px"
          minW="18px"
          h="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="10px"
          fontWeight="bold"
          color="white"
          borderRadius="full"
          px="4px"
          bgGradient="linear(to-br, #3B82F6, #2563EB)" // blue.500 to blue.600
          boxShadow="0 2px 4px rgba(59, 130, 246, 0.3)"
          pointerEvents="none"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </MotionBox>
      )}
    </Box>
  )
}

export default NotificationBell

