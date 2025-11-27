import { Box, Heading, Stack, Text, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumListItem } from '../components/premium/PremiumListItem'

type MenuItem = {
  icon: string
  label: string
  helper: string
  to?: string
}

const MENU_ITEMS: MenuItem[] = [
  { 
    icon: '📋',
    label: 'Իմ պացիենտները', 
    helper: 'Список ваших пациентов', 
    to: '/patients' 
  },
  {
    icon: '➕',
    label: 'Ավելացնել նոր պացիենտ',
    helper: 'Быстро добавить нового пациента',
    to: '/patients/new',
  },
  {
    icon: '💳',
    label: 'Բաժանորդագրություն',
    helper: 'Управление подпиской',
    to: '/subscription',
  },
  { 
    icon: 'ℹ️',
    label: 'Օգնություն', 
    helper: 'База знаний и поддержка', 
    to: '/help' 
  },
  {
    icon: '🔒',
    label: 'Գաղտնիության քաղաքականություն',
    helper: 'Политика приватности',
    to: '/privacy',
  },
]

export const HomePage = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const handleClick = (item: MenuItem) => {
    if (item.to) {
      navigate(item.to)
    } else {
      toast({
        title: 'Скоро будет доступно',
        description: item.helper,
        status: 'info',
        duration: 2500,
      })
    }
  }

  return (
    <PremiumLayout 
      title="SmileCRM" 
      showBack={false}
      background="gradient"
    >
      <Stack spacing={6}>
        {/* Welcome Section */}
        <PremiumCard variant="elevated" p={5}>
          <Stack spacing={2}>
            <Heading size="lg" color="text.main">
              Главное меню
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Выберите раздел. Полный функционал скоро появится.
            </Text>
          </Stack>
        </PremiumCard>

        {/* Menu Items */}
        <PremiumCard variant="elevated" p={0} overflow="hidden">
          {MENU_ITEMS.map((item, index) => (
            <PremiumListItem
              key={item.label}
              icon={item.icon}
              title={item.label}
              subtitle={item.helper}
              rightElement={
                <Box color="text.muted" fontSize="lg">
                  →
                </Box>
              }
              showBorder={index < MENU_ITEMS.length - 1}
              onClick={() => handleClick(item)}
            />
          ))}
        </PremiumCard>
      </Stack>
    </PremiumLayout>
  )
}

