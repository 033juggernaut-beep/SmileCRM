import { Box, Heading, Stack, Text, Tag, Flex } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'

type MenuItem = {
  icon: string
  label: string
  helper: string
  to: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

const MENU_ITEMS: MenuItem[] = [
  { 
    icon: '\u{1F4CB}',
    label: '\u0053\u006D\u0079 \u0070\u0061\u0074\u0069\u0065\u006E\u0074\u0073',
    helper: '\u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435\u0445 \u043F\u0430\u0446\u0438\u0435\u043D\u0442\u043E\u0432', 
    to: '/patients',
    variant: 'primary',
  },
  {
    icon: '\u2795',
    label: '\u0041\u0064\u0064 \u0070\u0061\u0074\u0069\u0065\u006E\u0074',
    helper: '\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u043E\u0432\u043E\u0433\u043E \u043F\u0430\u0446\u0438\u0435\u043D\u0442\u0430',
    to: '/patients/new',
    variant: 'secondary',
  },
  {
    icon: '\u{1F4B3}',
    label: '\u0053\u0075\u0062\u0073\u0063\u0072\u0069\u0070\u0074\u0069\u006F\u006E',
    helper: '\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0434\u043F\u0438\u0441\u043A\u043E\u0439',
    to: '/subscription',
    variant: 'secondary',
  },
  { 
    icon: '\u2139\uFE0F',
    label: '\u0048\u0065\u006C\u0070', 
    helper: '\u0427\u0430\u0441\u0442\u043E \u0437\u0430\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0435 \u0432\u043E\u043F\u0440\u043E\u0441\u044B', 
    to: '/help',
    variant: 'ghost',
  },
  {
    icon: '\u{1F512}',
    label: '\u0050\u0072\u0069\u0076\u0061\u0063\u0079 \u0050\u006F\u006C\u0069\u0063\u0079',
    helper: '\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438',
    to: '/privacy',
    variant: 'ghost',
  },
]

export const HomePage = () => {
  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    console.log('[HomePage] Navigating to:', path)
    navigate(path)
  }

  return (
    <PremiumLayout 
      title="SmileCRM" 
      showBack={false}
      background="gradient"
      safeAreaBottom
    >
      <Stack spacing={6}>
        {/* Hero Section */}
        <Box textAlign="center" py={4}>
          <Text fontSize="4xl" mb={2}>{'\u{1F9B7}'}</Text>
          <Heading 
            size="xl" 
            color="text.primary"
            fontWeight="bold"
            letterSpacing="-0.02em"
          >
            {'\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C'}
          </Heading>
          <Text 
            fontSize="lg" 
            color="text.secondary"
            mt={2}
          >
            SmileCRM — dental practice management
          </Text>
        </Box>

        {/* Status Chip */}
        <Flex justify="center">
          <Tag 
            size="lg" 
            bg="success.500" 
            color="white"
            borderRadius="full"
            px={4}
            py={2}
            fontWeight="semibold"
          >
            {'\u2713'} Trial {'\u0430\u043A\u0442\u0438\u0432\u0435\u043D'}
          </Tag>
        </Flex>

        {/* Quick Actions */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            {MENU_ITEMS.slice(0, 2).map((item) => (
              <PremiumButton
                key={item.to}
                variant={item.variant}
                onClick={() => handleNavigate(item.to)}
                leftIcon={<Text fontSize="xl">{item.icon}</Text>}
                fullWidth
                justifyContent="flex-start"
                h="60px"
                px={5}
              >
                <Box textAlign="left" flex={1}>
                  <Text fontWeight="semibold">{item.label}</Text>
                  <Text fontSize="xs" color="whiteAlpha.700" fontWeight="normal">
                    {item.helper}
                  </Text>
                </Box>
              </PremiumButton>
            ))}
          </Stack>
        </PremiumCard>

        {/* Other Actions */}
        <PremiumCard variant="flat">
          <Text 
            fontSize="xs" 
            color="text.muted" 
            textTransform="uppercase" 
            letterSpacing="0.05em"
            mb={3}
            fontWeight="semibold"
          >
            {'\u0414\u0440\u0443\u0433\u0438\u0435 \u0440\u0430\u0437\u0434\u0435\u043B\u044B'}
          </Text>
          <Stack spacing={2}>
            {MENU_ITEMS.slice(2).map((item) => (
              <PremiumButton
                key={item.to}
                variant="ghost"
                onClick={() => handleNavigate(item.to)}
                leftIcon={<Text fontSize="lg">{item.icon}</Text>}
                fullWidth
                justifyContent="flex-start"
                h="48px"
                px={4}
                fontWeight="medium"
                color="text.secondary"
                _hover={{
                  color: 'text.primary',
                  bg: 'bg.hover',
                }}
              >
                {item.label}
              </PremiumButton>
            ))}
          </Stack>
        </PremiumCard>

        {/* Footer */}
        <Text 
          textAlign="center" 
          fontSize="xs" 
          color="text.muted"
          mt={4}
        >
          SmileCRM v1.0 {'\u2022'} Dental Practice Management
        </Text>
      </Stack>
    </PremiumLayout>
  )
}
