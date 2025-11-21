import { Heading, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react'

const sections = [
  {
    title: '1. Տեղեկատվության հավաքագրում',
    body:
      'Dental Mini App-ը օգտագործում է Telegram initData-ն՝ հաստատելու համար ձեր ինքնությունը և պահպանելու մուտքը։ Մասնագիտական տվյալները (օր.՝ անուն, կլինիկա, մասնագիտացում) մնում են միայն ձեր վերահսկողության ներքո։',
  },
  {
    title: '2. Տվյալների օգտագործում',
    body:
      'Հավաքագրված տվյալները օգտագործվում են միայն ծառայության ներքին գործառույթների համար՝ պացիենտների հաշվառում, բաժանորդագրության կառավարում և աջակցության տրամադրում։',
  },
  {
    title: '3. Տվյալների անվտանգություն',
    body:
      'Մենք կիրառում ենք արդյունաբերական անվտանգության մեթոդներ և երբեք չենք փոխանցում տվյալները երրորդ անձանց առանց ձեր համաձայնության։',
  },
]

export const PrivacyPolicyPage = () => (
  <Stack spacing={6}>
    <Stack spacing={1}>
      <Heading size="md">Գաղտնիության քաղաքականություն</Heading>
      <Text fontSize="sm" color="gray.500">
        Ստորև ներկայացված տեղեկությունը ժամանակավոր է և կարող է թարմացվել։
      </Text>
    </Stack>

    <Stack spacing={5} bg="white" borderRadius="xl" borderWidth="1px" p={6}>
      {sections.map((section) => (
        <Stack key={section.title} spacing={2}>
          <Heading size="sm">{section.title}</Heading>
          <Text fontSize="sm" color="gray.600">
            {section.body}
          </Text>
        </Stack>
      ))}

      <Stack spacing={1}>
        <Heading size="sm">Կոնտակտ</Heading>
        <Text fontSize="sm" color="gray.600">
          Հարցերի դեպքում գրեք մեզ support@smilecrm.app հասցեին կամ կապվեք Telegram
          միջոցով։
        </Text>
      </Stack>

      <Stack spacing={1}>
        <Heading size="sm">Ավելացվող դրույթներ</Heading>
        <UnorderedList fontSize="sm" color="gray.600">
          <ListItem>Տվյալները պահվում են միայն անհրաժեշտ ժամկետով։</ListItem>
          <ListItem>Դուք կարող եք պահանջել ձեր տվյալների հեռացումը support-ից։</ListItem>
          <ListItem>Քաղաքականությունը կթարմացվի ծառայության զարգացման հետ։</ListItem>
        </UnorderedList>
      </Stack>
    </Stack>
  </Stack>
)

