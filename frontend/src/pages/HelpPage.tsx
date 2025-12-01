import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { PremiumButton } from '../components/premium/PremiumButton'
import { API_URL, testBackendConnection } from '../api/client'

const FAQ_ITEMS = [
  {
    icon: '🔐',
    title: 'Ինչպես գրանցվել',
    body:
      'Բացեք Dental Mini App-ը Telegram-ում, մուտք գործեք ձեր պրոֆիլով և հետևեք ավտոմատացված քայլերին՝ հաստատելու համար initData-ն։',
  },
  {
    icon: '➕',
    title: 'Ինչպես ավելացնել պացիենտ',
    body:
      'Սեղմեք "Ավելացնել նոր պացիենտ" գլխավոր էջից, լրացրեք հիմնական տվյալները և պահպանեք. նոր գրառումը կհայտնվի ցուցակում։',
  },
  {
    icon: '⏰',
    title: 'Ի՞նչ է trial-ը',
    body:
      'Trial-ը 7-օրյա անվճար փորձաշրջան է. դուք լիարժեք օգտագործում եք Dental Mini App-ը, հետո որոշում՝ շարունակել վճարովի բաժանորդագրությամբ թե ոչ։',
  },
  {
    icon: '📊',
    title: 'Ինչպես կառավարել վիզիտները',
    body:
      'Բացեք պացիենտի էջը, ավելացրեք նոր վիզիտ՝ նշելով ամսաթիվը, նշումները և հաջորդ հանդիպման ժամը։',
  },
  {
    icon: '💳',
    title: 'Ինչպես վճարել բաժանորդագրությունը',
    body:
      'Անցեք "Բաժանորդագրություն" բաժին և ընտրեք Idram կամ IDBank Pay վճարման համակարգերից մեկը։',
  },
]

export const HelpPage = () => {
  const navigate = useNavigate()
  const [connectionTest, setConnectionTest] = useState<{
    testing: boolean
    result?: 'success' | 'error'
    message?: string
  }>({ testing: false })

  const handleTestConnection = async () => {
    setConnectionTest({ testing: true })
    const result = await testBackendConnection()
    setConnectionTest({
      testing: false,
      result: result.success ? 'success' : 'error',
      message: result.success
        ? 'Կապը հաջող է! Սերվերը հասանելի է։'
        : `Սխալ: ${result.error}`,
    })
  }
  
  return (
    <PremiumLayout 
      title="Օգնություն" 
      showBack={true}
      onBack={() => navigate('/home')}
      background="light"
    >
      <Stack spacing={5}>
        {/* Header Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={2} align="center" textAlign="center">
            <Box fontSize="3xl">❓</Box>
            <Heading size="md" color="text.main">
              Օգնություն և FAQ
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Ամենատարածված հարցերի պատասխանները։
            </Text>
          </Stack>
        </PremiumCard>

        {/* FAQ Accordion */}
        <PremiumCard variant="elevated" p={0} overflow="hidden">
          <Accordion allowMultiple>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem 
                key={item.title} 
                border="none"
                borderBottomWidth={index < FAQ_ITEMS.length - 1 ? '1px' : '0'}
                borderColor="border.light"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _hover={{ bg: 'bg.gray' }}
                  _expanded={{ bg: 'bg.gray' }}
                >
                  <Box flex="1" textAlign="left">
                    <Stack direction="row" align="center" spacing={2}>
                      <Text fontSize="xl">{item.icon}</Text>
                      <Heading size="sm" color="text.main">
                        {item.title}
                      </Heading>
                    </Stack>
                  </Box>
                  <AccordionIcon color="text.muted" />
                </AccordionButton>
                <AccordionPanel px={4} py={4} bg="white">
                  <Text fontSize="sm" color="text.main" lineHeight="tall">
                    {item.body}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </PremiumCard>

        {/* Connection Test Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            <Stack spacing={1} align="center" textAlign="center">
              <Text fontSize="2xl">🔌</Text>
              <Heading size="sm" color="text.main">
                Ստուգել կապը սերվերի հետ
              </Heading>
              <Text fontSize="xs" color="text.muted">
                API URL: {API_URL}
              </Text>
            </Stack>
            
            <PremiumButton
              onClick={handleTestConnection}
              isLoading={connectionTest.testing}
              size="sm"
            >
              Թեստավորել կապը
            </PremiumButton>

            {connectionTest.result && (
              <Alert
                status={connectionTest.result}
                borderRadius="md"
                fontSize="sm"
              >
                <AlertIcon />
                {connectionTest.message}
              </Alert>
            )}
          </Stack>
        </PremiumCard>

        {/* Contact Card */}
        <PremiumCard variant="flat">
          <Stack spacing={2} align="center" textAlign="center">
            <Text fontSize="2xl">💬</Text>
            <Text fontSize="sm" color="text.muted">
              Հարցեր ունե՞ք։ Գրեք մեզ{' '}
              <Text as="span" fontWeight="semibold" color="primary.500">
                support@smilecrm.app
              </Text>
            </Text>
          </Stack>
        </PremiumCard>
      </Stack>
    </PremiumLayout>
  )
}

