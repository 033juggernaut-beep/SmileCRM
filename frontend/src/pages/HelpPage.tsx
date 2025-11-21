import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'

const FAQ_ITEMS = [
  {
    title: 'Ինչպես գրանցվել',
    body:
      'Բացեք Dental Mini App-ը Telegram-ում, մուտք գործեք ձեր պրոֆիլով և հետևեք ավտոմատացված քայլերին՝ հաստատելու համար initData-ն։',
  },
  {
    title: 'Ինչպես ավելացնել պացիենտ',
    body:
      'Սեղմեք "Ավելացնել նոր պացիենտ" գլխավոր էջից, լրացրեք հիմնական տվյալները և պահպանեք. նոր գրառումը կհայտնվի ցուցակում։',
  },
  {
    title: 'Ի՞նչ է trial-ը',
    body:
      'Trial-ը 7-օրյա անվճար փորձաշրջան է. դուք լիարժեք օգտագործում եք Dental Mini App-ը, հետո որոշում՝ շարունակել վճարովի բաժանորդագրությամբ թե ոչ։',
  },
]

export const HelpPage = () => (
  <Stack spacing={5}>
    <Stack spacing={1}>
      <Heading size="md">Օգնություն և FAQ</Heading>
      <Text fontSize="sm" color="gray.500">
        Ամենատարածված հարցերի պատասխանները։
      </Text>
    </Stack>

    <Accordion allowMultiple borderRadius="lg" overflow="hidden">
      {FAQ_ITEMS.map((item) => (
        <AccordionItem key={item.title} border="none">
          <AccordionButton
            bg="white"
            borderTopWidth="1px"
            borderColor="gray.100"
            _expanded={{ bg: 'teal.50' }}
            px={4}
            py={4}
          >
            <Heading size="sm" flex="1" textAlign="left">
              {item.title}
            </Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel bg="white" borderBottomWidth="1px" borderColor="gray.100">
            <Text fontSize="sm" color="gray.600">
              {item.body}
            </Text>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  </Stack>
)

