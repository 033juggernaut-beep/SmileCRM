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
import { useLanguage } from '../context/LanguageContext'

export const HelpPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [connectionTest, setConnectionTest] = useState<{
    testing: boolean
    result?: 'success' | 'error'
    message?: string
  }>({ testing: false })

  // FAQ items with translations
  const FAQ_ITEMS = [
    {
      icon: '🔐',
      title: t('help.faq1Title'),
      body: t('help.faq1Body'),
    },
    {
      icon: '➕',
      title: t('help.faq2Title'),
      body: t('help.faq2Body'),
    },
    {
      icon: '⏰',
      title: t('help.faq3Title'),
      body: t('help.faq3Body'),
    },
    {
      icon: '📊',
      title: t('help.faq4Title'),
      body: t('help.faq4Body'),
    },
    {
      icon: '💳',
      title: t('help.faq5Title'),
      body: t('help.faq5Body'),
    },
  ]

  const handleTestConnection = async () => {
    setConnectionTest({ testing: true })
    const result = await testBackendConnection()
    setConnectionTest({
      testing: false,
      result: result.success ? 'success' : 'error',
      message: result.success
        ? t('help.connectionSuccess')
        : `${t('help.connectionError')}: ${result.error}`,
    })
  }
  
  return (
    <PremiumLayout 
      title={t('help.title')} 
      showBack={true}
      onBack={() => navigate('/home')}
      background="gradient"
    >
      <Stack spacing={5}>
        {/* Header Card */}
        <PremiumCard variant="elevated">
          <Stack spacing={2} align="center" textAlign="center">
            <Box fontSize="3xl">❓</Box>
            <Heading size="md" color="text.main">
              {t('help.faqTitle')}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t('help.faqHint')}
            </Text>
          </Stack>
        </PremiumCard>

        {/* FAQ Accordion */}
        <PremiumCard variant="elevated" p={0} overflow="hidden">
          <Accordion allowMultiple>
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem 
                key={index} 
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
                {t('help.connectionTest')}
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
              {t('help.testConnection')}
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
              {t('help.contactHint')}{' '}
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
