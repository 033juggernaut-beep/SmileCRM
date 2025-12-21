/**
 * NotificationsEmptyState - displayed when no notifications
 * 
 * Matches Superdesign reference exactly:
 * - Container: flex flex-col items-center justify-center py-10
 * - Icon: w-10 h-10 mb-2 opacity-50
 * - Text: text-sm
 */

import { Box, Text, useColorMode } from '@chakra-ui/react'
import { CheckCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export function NotificationsEmptyState() {
  const { colorMode } = useColorMode()
  const { t } = useLanguage()
  const isDark = colorMode === 'dark'

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={10}
      color={isDark ? 'slate.500' : 'slate.400'}
    >
      <Box
        as={CheckCircle}
        w={10}
        h={10}
        mb={2}
        opacity={0.5}
      />
      <Text fontSize="sm">{t('notifications.noNotifications')}</Text>
    </Box>
  )
}

export default NotificationsEmptyState

