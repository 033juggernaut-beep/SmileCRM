import { Box, Flex, Heading, IconButton, Text, useColorMode } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea'
import { LanguageMenu } from '../LanguageMenu'

const BASE_HEADER_HEIGHT = 56
const MIN_ICON_SIZE = 44
const MIN_RIGHT_PADDING = 16

interface PremiumHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightElement?: React.ReactNode
  /** Show language switcher */
  showLanguage?: boolean
  /** Show theme toggle */
  showThemeToggle?: boolean
}

export const PremiumHeader = ({ 
  title, 
  showBack = false, 
  onBack,
  rightElement,
  showLanguage = true,
  showThemeToggle = true,
}: PremiumHeaderProps) => {
  const navigate = useNavigate()
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  // Get safe area insets from Telegram
  const { topInset, rightInset, isInTelegram, headerHeight } = useTelegramSafeArea()
  
  // Calculate paddings
  const rightPadding = Math.max(rightInset + MIN_RIGHT_PADDING, isInTelegram ? 80 : 24)
  const totalHeaderHeight = headerHeight || (BASE_HEADER_HEIGHT + topInset)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  // Colors
  const activeColor = isDark ? '#60A5FA' : '#2563EB'
  const inactiveColor = isDark ? '#64748B' : '#94A3B8'
  const dividerColor = isDark ? '#475569' : '#CBD5E1'
  const iconColor = isDark ? '#94A3B8' : '#64748B'

  return (
    <Box
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.subtle"
      h={`${totalHeaderHeight}px`}
      minH={`${totalHeaderHeight}px`}
      backdropFilter="blur(12px)"
      isolation="isolate"
    >
      {/* Top safe area spacer */}
      {topInset > 0 && <Box h={`${topInset}px`} />}
      
      <Flex
        align="center"
        justify="space-between"
        pl={{ base: 4, md: 6, lg: 8 }}
        pr={`${rightPadding}px`}
        h={`${BASE_HEADER_HEIGHT}px`}
        maxW={{ base: '100%', md: '720px', lg: '960px', xl: '1200px' }}
        mx="auto"
      >
        {/* Left side - Back button or logo */}
        <Flex align="center" gap={2} minW="44px">
          {showBack ? (
            <IconButton
              aria-label="Back"
              icon={<Text fontSize="xl">←</Text>}
              variant="ghost"
              color="text.primary"
              size="sm"
              onClick={handleBack}
              borderRadius="lg"
              _hover={{ bg: 'bg.hover' }}
              minW={`${MIN_ICON_SIZE}px`}
              minH={`${MIN_ICON_SIZE}px`}
            />
          ) : (
            <Text fontSize="2xl" role="img" aria-label="SmileCRM">
              🦷
            </Text>
          )}
        </Flex>

        {/* Center - Title */}
        <Heading
          size="md"
          color="text.primary"
          fontWeight="bold"
          textAlign="center"
          flex={1}
          letterSpacing="-0.01em"
          noOfLines={1}
        >
          {title}
        </Heading>

        {/* Right side - Controls */}
        <Flex align="center" gap={{ base: 2, md: 3 }} minW="44px" justify="flex-end">
          {rightElement ? (
            rightElement
          ) : (
            <>
              {/* Language Menu */}
              {showLanguage && (
                <LanguageMenu
                  forceMobile={true}
                  activeColor={activeColor}
                  inactiveColor={inactiveColor}
                  dividerColor={dividerColor}
                />
              )}

              {/* Theme Toggle */}
              {showThemeToggle && (
                <Box
                  as="button"
                  onClick={toggleColorMode}
                  color={iconColor}
                  _hover={{ color: isDark ? '#F1F5F9' : '#2563EB' }}
                  transition="color 0.2s"
                  sx={{ 
                    WebkitTapHighlightColor: 'transparent',
                    '& svg': { display: 'block' },
                  }}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  minW={`${MIN_ICON_SIZE}px`}
                  minH={`${MIN_ICON_SIZE}px`}
                  w={`${MIN_ICON_SIZE}px`}
                  h={`${MIN_ICON_SIZE}px`}
                  borderRadius="md"
                  _active={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
                  flexShrink={0}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </Box>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
