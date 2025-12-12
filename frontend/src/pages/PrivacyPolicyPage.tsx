import { useNavigate } from 'react-router-dom'
import { Box, Heading, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'

const sections = [
  {
    icon: '📝',
    title: '1. Տեղեկատվության հավաքագրում',
    body:
      'Dental Mini App-ը օգտագործում է Telegram initData-ն՝ հաստատելու համար ձեր ինքնությունը և պահպանելու մուտքը։ Մասնագիտական տվյալները (օր.՝ անուն, կլինիկա, մասնագիտացում) մնում են միայն ձեր վերահսկողության ներքո։',
  },
  {
    icon: '🔄',
    title: '2. Տվյալների օգտագործում',
    body:
      'Հավաքագրված տվյալները օգտագործվում են միայն ծառայության ներքին գործառույթների համար՝ պացիենտների հաշվառում, բաժանորդագրության կառավարում և աջակցության տրամադրում։',
  },
  {
    icon: '🔒',
    title: '3. Տվյալների անվտանգություն',
    body:
      'Մենք կիրառում ենք արդյունաբերական անվտանգության մեթոդներ և երբեք չենք փոխանցում տվյալները երրորդ անձանց առանց ձեր համաձայնության։',
  },
]

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate()
  
  return (
    <PremiumLayout 
      title="Գաղտնիություն" 
      showBack={true}
      onBack={() => navigate('/home')}
      background="gradient"
    >
      <Stack spacing={5}>
        {/* Header Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={2} align="center" textAlign="center">
            <Box fontSize="3xl">🛡️</Box>
            <Heading size="md" color="text.main">
              Գաղտնիության քաղաքականություն
            </Heading>
            <Text fontSize="sm" color="text.muted">
              Ստորև ներկայացված տեղեկությունը ժամանակավոր է և կարող է թարմացվել։
            </Text>
          </Stack>
        </PremiumCard>

        {/* Main Content */}
        <PremiumCard variant="elevated">
          <Stack spacing={5}>
            {sections.map((section) => (
              <Stack key={section.title} spacing={2}>
                <Stack direction="row" align="center" spacing={2}>
                  <Text fontSize="xl">{section.icon}</Text>
                  <Heading size="sm" color="text.main">
                    {section.title}
                  </Heading>
                </Stack>
                <Text fontSize="sm" color="text.main" lineHeight="tall" pl={8}>
                  {section.body}
                </Text>
              </Stack>
            ))}

            <Box h="1px" bg="border.light" my={2} />

            <Stack spacing={2}>
              <Stack direction="row" align="center" spacing={2}>
                <Text fontSize="xl">📧</Text>
                <Heading size="sm" color="text.main">
                  Կոնտակտ
                </Heading>
              </Stack>
              <Text fontSize="sm" color="text.main" lineHeight="tall" pl={8}>
                Հարցերի դեպքում գրեք մեզ{' '}
                <Text as="span" fontWeight="semibold" color="primary.500">
                  support@smilecrm.app
                </Text>{' '}
                հասցեին կամ կապվեք Telegram միջոցով։
              </Text>
            </Stack>

            <Box h="1px" bg="border.light" my={2} />

            <Stack spacing={2}>
              <Stack direction="row" align="center" spacing={2}>
                <Text fontSize="xl">📋</Text>
                <Heading size="sm" color="text.main">
                  Ավելացվող դրույթներ
                </Heading>
              </Stack>
              <UnorderedList fontSize="sm" color="text.main" pl={8} spacing={1}>
                <ListItem>Տվյալները պահվում են միայն անհրաժեշտ ժամկետով։</ListItem>
                <ListItem>
                  Դուք կարող եք պահանջել ձեր տվյալների հեռացումը support-ից։
                </ListItem>
                <ListItem>
                  Քաղաքականությունը կթարմացվի ծառայության զարգացման հետ։
                </ListItem>
              </UnorderedList>
            </Stack>
          </Stack>
        </PremiumCard>

        {/* Update Notice */}
        <PremiumCard variant="flat">
          <Text fontSize="xs" color="text.muted" textAlign="center">
            Վերջին թարմացում: {new Date().toLocaleDateString('hy-AM')}
          </Text>
        </PremiumCard>
      </Stack>
    </PremiumLayout>
  )
}

