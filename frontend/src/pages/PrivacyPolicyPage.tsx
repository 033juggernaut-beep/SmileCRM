import { useNavigate } from 'react-router-dom'
import { Box, Heading, ListItem, Stack, Text, UnorderedList } from '@chakra-ui/react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { PremiumCard } from '../components/premium/PremiumCard'
import { useLanguage } from '../context/LanguageContext'

export const PrivacyPolicyPage = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  
  // Sections with translations
  const sections = [
    {
      icon: '📝',
      title: t('privacy.section1Title'),
      body: t('privacy.section1Body'),
    },
    {
      icon: '🔄',
      title: t('privacy.section2Title'),
      body: t('privacy.section2Body'),
    },
    {
      icon: '🔒',
      title: t('privacy.section3Title'),
      body: t('privacy.section3Body'),
    },
  ]

  // Format date based on language
  const formatDate = () => {
    const localeMap: Record<string, string> = {
      am: 'hy-AM',
      ru: 'ru-RU',
      en: 'en-US',
    }
    return new Date().toLocaleDateString(localeMap[language] || 'en-US')
  }
  
  return (
    <PremiumLayout 
      title={t('privacy.title')} 
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
              {t('privacy.policyTitle')}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              {t('privacy.policyHint')}
            </Text>
          </Stack>
        </PremiumCard>

        {/* Main Content */}
        <PremiumCard variant="elevated">
          <Stack spacing={5}>
            {sections.map((section, index) => (
              <Stack key={index} spacing={2}>
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
                  {t('privacy.contact')}
                </Heading>
              </Stack>
              <Text fontSize="sm" color="text.main" lineHeight="tall" pl={8}>
                {t('privacy.contactBody')}{' '}
                <Text as="span" fontWeight="semibold" color="primary.500">
                  support@smilecrm.app
                </Text>{' '}
                {t('privacy.orViaTelegram')}
              </Text>
            </Stack>

            <Box h="1px" bg="border.light" my={2} />

            <Stack spacing={2}>
              <Stack direction="row" align="center" spacing={2}>
                <Text fontSize="xl">📋</Text>
                <Heading size="sm" color="text.main">
                  {t('privacy.additionalTerms')}
                </Heading>
              </Stack>
              <UnorderedList fontSize="sm" color="text.main" pl={8} spacing={1}>
                <ListItem>{t('privacy.term1')}</ListItem>
                <ListItem>{t('privacy.term2')}</ListItem>
                <ListItem>{t('privacy.term3')}</ListItem>
              </UnorderedList>
            </Stack>
          </Stack>
        </PremiumCard>

        {/* Update Notice */}
        <PremiumCard variant="flat">
          <Text fontSize="xs" color="text.muted" textAlign="center">
            {t('privacy.lastUpdated')}: {formatDate()}
          </Text>
        </PremiumCard>
      </Stack>
    </PremiumLayout>
  )
}
