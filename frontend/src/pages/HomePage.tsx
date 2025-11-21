import { Button, Heading, Stack, Text, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

type MenuItem = {
  label: string
  helper: string
  to?: string
}

const MENU_ITEMS: MenuItem[] = [
  { label: '📋 Իմ պացիենտները', helper: 'Список ваших пациентов', to: '/patients' },
  {
    label: '➕ Ավելացնել նոր պացիենտ',
    helper: 'Быстро добавить нового пациента',
    to: '/patients/new',
  },
  {
    label: '💳 Բաժանորդագրություն',
    helper: 'Управление подпиской',
    to: '/subscription',
  },
  { label: 'ℹ️ Օգնություն', helper: 'База знаний и поддержка', to: '/help' },
  {
    label: '🔒 Գաղտնիության քաղաքականություն',
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
    <Stack spacing={5}>
      <Stack spacing={1}>
        <Heading size="md">Главное меню</Heading>
        <Text fontSize="sm" color="gray.500">
          Выберите раздел. Полный функционал скоро появится.
        </Text>
      </Stack>

      <Stack spacing={3}>
        {MENU_ITEMS.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            justifyContent="flex-start"
            size="lg"
            py={6}
            px={4}
            borderRadius="lg"
            onClick={() => handleClick(item)}
          >
            <Stack spacing={1} align="flex-start">
              <Text fontWeight="semibold">{item.label}</Text>
              <Text fontSize="xs" color="gray.500">
                {item.helper}
              </Text>
            </Stack>
          </Button>
        ))}
      </Stack>
    </Stack>
  )
}

