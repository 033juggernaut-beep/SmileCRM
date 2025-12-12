import { Box, Button, Heading, Stack, Text, Tag, Flex } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../context/LanguageContext'

type MenuItem = {
  icon: string
  labelKey: string
  helperKey: string
  to: string
}

const MENU_ITEMS: MenuItem[] = [
  { 
    icon: '📋',
    labelKey: 'home.patients', 
    helperKey: 'home.patientsHelper', 
    to: '/patients',
  },
  {
    icon: '➕',
    labelKey: 'home.addPatient',
    helperKey: 'home.addPatientHelper',
    to: '/patients/new',
  },
  {
    icon: '💳',
    labelKey: 'home.subscription',
    helperKey: 'home.subscriptionHelper',
    to: '/subscription',
  },
  { 
    icon: 'ℹ️',
    labelKey: 'home.help', 
    helperKey: 'home.helpHelper', 
    to: '/help',
  },
  {
    icon: '🔒',
    labelKey: 'home.privacy',
    helperKey: 'home.privacyHelper',
    to: '/privacy',
  },
]

export const HomePage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()

  return (
    <PremiumLayout 
      title="SmileCRM" 
      showBack={false}
      background="gradient"
      safeAreaBottom
      headerRightElement={<LanguageSwitcher />}
    >
      <Stack spacing={6}>
        {/* Hero Section */}
        <Box textAlign="center" py={4}>
          <Text fontSize="4xl" mb={2}>🦷</Text>
          <Heading 
            size="xl" 
            color="text.primary"
            fontWeight="bold"
          >
            {t('home.welcome')}
          </Heading>
          <Text 
            fontSize="lg" 
            color="text.secondary"
            mt={2}
          >
            {t('home.subtitle')}
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
            {t('home.trialActive')}
          </Tag>
        </Flex>

        {/* Quick Actions - Using simple Button */}
        <PremiumCard variant="elevated">
          <Stack spacing={3}>
            {MENU_ITEMS.slice(0, 2).map((item) => (
              <Button
                key={item.to}
                onClick={() => {
                  console.log('Navigating to:', item.to)
                  navigate(item.to)
                }}
                bg="primary.500"
                color="white"
                size="lg"
                h="60px"
                borderRadius="xl"
                justifyContent="flex-start"
                px={5}
                _hover={{ bg: 'primary.400' }}
                _active={{ bg: 'primary.600' }}
              >
                <Text fontSize="xl" mr={3}>{item.icon}</Text>
                <Box textAlign="left">
                  <Text fontWeight="semibold">{t(item.labelKey)}</Text>
                  <Text fontSize="xs" opacity={0.8}>{t(item.helperKey)}</Text>
                </Box>
              </Button>
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
            {t('home.otherSections')}
          </Text>
          <Stack spacing={2}>
            {MENU_ITEMS.slice(2).map((item) => (
              <Button
                key={item.to}
                onClick={() => {
                  console.log('Navigating to:', item.to)
                  navigate(item.to)
                }}
                variant="ghost"
                size="lg"
                h="48px"
                borderRadius="xl"
                justifyContent="flex-start"
                px={4}
                color="text.secondary"
                _hover={{ bg: 'bg.hover', color: 'text.primary' }}
              >
                <Text fontSize="lg" mr={3}>{item.icon}</Text>
                <Text fontWeight="medium">{t(item.labelKey)}</Text>
              </Button>
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
          {t('home.version')}
        </Text>
      </Stack>
    </PremiumLayout>
  )
}
