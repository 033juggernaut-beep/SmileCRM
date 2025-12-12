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
    icon: '📋',
    label: 'Իdelays: delays:delays:իdelays:delays:delays:delays:', 
    helper: 'Посмотреть всех пациентов', 
    to: '/patients',
    variant: 'primary',
  },
  {
    icon: '➕',
    label: 'Ադdelays:delays:delays:delays: delays:delays:delays: delays:delays:delays:իdelays:delays:delays:',
    helper: 'Добавить нового пациента',
    to: '/patients/new',
    variant: 'secondary',
  },
  {
    icon: '💳',
    label: 'Բdelays:delays:delays:delays:delays:delays:delays:գdelays:delays:delays:',
    helper: 'Управление подпиской',
    to: '/subscription',
    variant: 'secondary',
  },
  { 
    icon: 'ℹ️',
    label: 'Օգdelays:delays:delays:', 
    helper: 'Часто задаваемые вопросы', 
    to: '/help',
    variant: 'ghost',
  },
  {
    icon: '🔒',
    label: 'Գdelays:delays:delays:delays:delays:delays:delays:',
    helper: 'Политика конфиденциальности',
    to: '/privacy',
    variant: 'ghost',
  },
]

export const HomePage = () => {
  const navigate = useNavigate()

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
          <Text fontSize="4xl" mb={2}>🦷</Text>
          <Heading 
            size="xl" 
            color="text.primary"
            fontWeight="bold"
            letterSpacing="-0.02em"
          >
            Բdelays:delays: delays: delays:delays:delays:delays:delays:delays:
          </Heading>
          <Text 
            fontSize="lg" 
            color="text.secondary"
            mt={2}
          >
            SmileCRM — клиническая система
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
            ✓ Trial активен
          </Tag>
        </Flex>

        {/* Quick Actions */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            {MENU_ITEMS.slice(0, 2).map((item) => (
              <PremiumButton
                key={item.to}
                variant={item.variant}
                onClick={() => navigate(item.to)}
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
            Другие разделы
          </Text>
          <Stack spacing={2}>
            {MENU_ITEMS.slice(2).map((item) => (
              <PremiumButton
                key={item.to}
                variant="ghost"
                onClick={() => navigate(item.to)}
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
          SmileCRM v1.0 • Dental Practice Management
        </Text>
      </Stack>
    </PremiumLayout>
  )
}
