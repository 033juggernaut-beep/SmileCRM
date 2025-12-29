/**
 * PrivacyPolicyPage - Privacy policy information
 * UI/UX styled like main dashboard
 */

import { useNavigate } from 'react-router-dom'
import {
  Box,
  Flex,
  Grid,
  Heading,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  useColorMode,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Shield, FileText, Mail, ClipboardList } from 'lucide-react'

import { BackgroundPattern } from '../components/dashboard'
import { BackButton } from '../components/patientCard/BackButton'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { useLanguage } from '../context/LanguageContext'

const MotionDiv = motion.div

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
}

export const PrivacyPolicyPage = () => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const handleBack = () => navigate('/home')
  const { showFallbackButton } = useTelegramBackButton(handleBack)
  
  // Sections with icons
  const sections = [
    { icon: FileText, title: t('privacy.section1Title'), body: t('privacy.section1Body') },
    { icon: Shield, title: t('privacy.section2Title'), body: t('privacy.section2Body') },
    { icon: Shield, title: t('privacy.section3Title'), body: t('privacy.section3Body') },
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

  // Background gradient matching HomePage
  const pageBg = isDark 
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  // Card styles
  const cardBg = isDark 
    ? 'rgba(30, 41, 59, 0.8)'
    : 'rgba(255, 255, 255, 0.9)'
  
  const cardBorder = isDark 
    ? '1px solid rgba(71, 85, 105, 0.3)'
    : '1px solid rgba(226, 232, 240, 0.8)'
  
  return (
    <Box
      minH="100dvh"
      w="100%"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      position="relative"
      transition="background 0.3s"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        {/* Back Button - only show if not in Telegram */}
        {showFallbackButton && (
          <Box px="16px" pt={topInset > 0 ? `${topInset + 16}px` : '16px'}>
            <BackButton onClick={handleBack} />
          </Box>
        )}

        <Flex
          as="main"
          direction="column"
          align="center"
          justify="flex-start"
          flex="1"
          px="16px"
          py={{ base: '16px', md: '32px' }}
          gap={{ base: '20px', md: '24px' }}
        >
          {/* Header Card */}
          <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <MotionDiv variants={itemVariants}>
              <Box
                bg="linear-gradient(135deg, #22C55E 0%, #16A34A 100%)"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
                boxShadow="0 20px 40px -12px rgba(34, 197, 94, 0.25)"
              >
                {/* Decorative */}
                <Box
                  position="absolute"
                  top="-40px"
                  right="-40px"
                  w="160px"
                  h="160px"
                  borderRadius="full"
                  bg="whiteAlpha.200"
                  filter="blur(40px)"
                />
                
                <Flex direction="column" align="center" gap={4} position="relative">
                  <Flex
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    align="center"
                    justify="center"
                  >
                    <Shield size={32} color="white" />
                  </Flex>
                  
                  <Heading size="lg" color="white" textAlign="center" fontWeight="bold">
                    {t('privacy.policyTitle')}
                  </Heading>
                  
                  <Text fontSize="sm" color="whiteAlpha.900" textAlign="center" maxW="280px">
                    {t('privacy.policyHint')}
                  </Text>
                </Flex>
              </Box>
            </MotionDiv>
          </MotionDiv>

          {/* Content Cards */}
          <Grid
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            w="100%"
            maxW="480px"
            gap={{ base: '16px', md: '20px' }}
          >
            {/* Main Policy Sections */}
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Stack spacing={6}>
                  {sections.map((section, index) => {
                    const Icon = section.icon
                    return (
                      <Stack key={index} spacing={3}>
                        <Flex align="center" gap={3}>
                          <Flex
                            w="36px"
                            h="36px"
                            borderRadius="lg"
                            bg={isDark ? 'rgba(34, 197, 94, 0.15)' : 'green.50'}
                            align="center"
                            justify="center"
                            flexShrink={0}
                          >
                            <Icon size={18} style={{ color: isDark ? '#4ADE80' : '#16A34A' }} />
                          </Flex>
                          <Heading size="sm" color={isDark ? 'white' : 'gray.800'}>
                            {section.title}
                          </Heading>
                        </Flex>
                        <Text 
                          fontSize="sm" 
                          color={isDark ? 'gray.300' : 'gray.600'} 
                          lineHeight="tall"
                          pl="48px"
                        >
                          {section.body}
                        </Text>
                        {index < sections.length - 1 && (
                          <Box 
                            h="1px" 
                            bg={isDark ? 'rgba(71, 85, 105, 0.3)' : 'gray.100'} 
                            mt={2}
                          />
                        )}
                      </Stack>
                    )
                  })}
                </Stack>
              </Box>
            </MotionDiv>

            {/* Contact */}
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Flex align="center" gap={3}>
                  <Flex
                    w="40px"
                    h="40px"
                    borderRadius="xl"
                    bg={isDark ? 'rgba(59, 130, 246, 0.15)' : 'blue.50'}
                    align="center"
                    justify="center"
                  >
                    <Mail size={20} style={{ color: isDark ? '#60A5FA' : '#2563EB' }} />
                  </Flex>
                  <Stack spacing={0} flex="1">
                    <Heading size="sm" color={isDark ? 'white' : 'gray.800'}>
                      {t('privacy.contact')}
                    </Heading>
                    <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                      {t('privacy.contactBody')}{' '}
                      <Text as="span" fontWeight="semibold" color="blue.500">
                        support@smilecrm.app
                      </Text>
                    </Text>
                  </Stack>
                </Flex>
              </Box>
            </MotionDiv>

            {/* Additional Terms */}
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                p={{ base: 5, md: 6 }}
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Stack spacing={3}>
                  <Flex align="center" gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={isDark ? 'rgba(139, 92, 246, 0.15)' : 'purple.50'}
                      align="center"
                      justify="center"
                    >
                      <ClipboardList size={20} style={{ color: isDark ? '#A78BFA' : '#7C3AED' }} />
                    </Flex>
                    <Heading size="sm" color={isDark ? 'white' : 'gray.800'}>
                      {t('privacy.additionalTerms')}
                    </Heading>
                  </Flex>
                  <UnorderedList 
                    fontSize="sm" 
                    color={isDark ? 'gray.300' : 'gray.600'} 
                    pl="52px" 
                    spacing={2}
                  >
                    <ListItem>{t('privacy.term1')}</ListItem>
                    <ListItem>{t('privacy.term2')}</ListItem>
                    <ListItem>{t('privacy.term3')}</ListItem>
                  </UnorderedList>
                </Stack>
              </Box>
            </MotionDiv>

            {/* Last Updated */}
            <MotionDiv variants={itemVariants}>
              <Text 
                fontSize="xs" 
                color={isDark ? 'gray.500' : 'gray.400'}
                textAlign="center"
                px={4}
              >
                {t('privacy.lastUpdated')}: {formatDate()}
              </Text>
            </MotionDiv>
          </Grid>
        </Flex>
      </Box>
    </Box>
  )
}
