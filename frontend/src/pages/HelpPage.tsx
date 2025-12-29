/**
 * HelpPage - FAQ and support
 * UI/UX styled like main dashboard
 */

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
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { HelpCircle, Plug, MessageCircle } from 'lucide-react'

import { API_URL, testBackendConnection } from '../api/client'
import { BackgroundPattern } from '../components/dashboard'
import { BackButton } from '../components/patientCard/BackButton'
import { PremiumButton } from '../components/premium/PremiumButton'
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

export const HelpPage = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const handleBack = () => navigate('/home')
  const { showFallbackButton } = useTelegramBackButton(handleBack)
  
  const [connectionTest, setConnectionTest] = useState<{
    testing: boolean
    result?: 'success' | 'error'
    message?: string
  }>({ testing: false })

  // FAQ items with translations
  const FAQ_ITEMS = [
    { icon: '🔐', title: t('help.faq1Title'), body: t('help.faq1Body') },
    { icon: '➕', title: t('help.faq2Title'), body: t('help.faq2Body') },
    { icon: '⏰', title: t('help.faq3Title'), body: t('help.faq3Body') },
    { icon: '📊', title: t('help.faq4Title'), body: t('help.faq4Body') },
    { icon: '💳', title: t('help.faq5Title'), body: t('help.faq5Body') },
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
                bg="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
                boxShadow="0 20px 40px -12px rgba(139, 92, 246, 0.25)"
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
                    <HelpCircle size={32} color="white" />
                  </Flex>
                  
                  <Heading size="lg" color="white" textAlign="center" fontWeight="bold">
                    {t('help.faqTitle')}
                  </Heading>
                  
                  <Text fontSize="sm" color="whiteAlpha.900" textAlign="center" maxW="280px">
                    {t('help.faqHint')}
                  </Text>
                </Flex>
              </Box>
            </MotionDiv>
          </MotionDiv>

          {/* FAQ Accordion */}
          <Grid
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            w="100%"
            maxW="480px"
            gap={{ base: '16px', md: '20px' }}
          >
            <MotionDiv variants={itemVariants}>
              <Box
                bg={cardBg}
                border={cardBorder}
                borderRadius="2xl"
                overflow="hidden"
                backdropFilter="blur(20px)"
                boxShadow={isDark 
                  ? '0 4px 24px -4px rgba(0, 0, 0, 0.3)'
                  : '0 4px 24px -4px rgba(0, 0, 0, 0.08)'
                }
              >
                <Accordion allowMultiple>
                  {FAQ_ITEMS.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      border="none"
                      borderBottomWidth={index < FAQ_ITEMS.length - 1 ? '1px' : '0'}
                      borderColor={isDark ? 'rgba(71, 85, 105, 0.3)' : 'gray.100'}
                    >
                      <AccordionButton
                        px={5}
                        py={4}
                        _hover={{ bg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50' }}
                        _expanded={{ bg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50' }}
                      >
                        <Flex flex="1" align="center" gap={3} textAlign="left">
                          <Text fontSize="xl">{item.icon}</Text>
                          <Heading size="sm" color={isDark ? 'white' : 'gray.800'}>
                            {item.title}
                          </Heading>
                        </Flex>
                        <AccordionIcon color={isDark ? 'gray.400' : 'gray.500'} />
                      </AccordionButton>
                      <AccordionPanel 
                        px={5} 
                        py={4} 
                        bg={isDark ? 'rgba(30, 41, 59, 0.5)' : 'gray.50'}
                      >
                        <Text 
                          fontSize="sm" 
                          color={isDark ? 'gray.300' : 'gray.600'} 
                          lineHeight="tall"
                        >
                          {item.body}
                        </Text>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </MotionDiv>

            {/* Connection Test */}
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
                <Stack spacing={4}>
                  <Flex align="center" gap={3}>
                    <Flex
                      w="40px"
                      h="40px"
                      borderRadius="xl"
                      bg={isDark ? 'rgba(59, 130, 246, 0.15)' : 'blue.50'}
                      align="center"
                      justify="center"
                    >
                      <Plug size={20} style={{ color: isDark ? '#60A5FA' : '#2563EB' }} />
                    </Flex>
                    <Stack spacing={0}>
                      <Heading size="sm" color={isDark ? 'white' : 'gray.800'}>
                        {t('help.connectionTest')}
                      </Heading>
                      <Text fontSize="xs" color={isDark ? 'gray.400' : 'gray.500'}>
                        API: {API_URL}
                      </Text>
                    </Stack>
                  </Flex>
                  
                  <PremiumButton
                    onClick={handleTestConnection}
                    isLoading={connectionTest.testing}
                    size="md"
                    w="full"
                  >
                    {t('help.testConnection')}
                  </PremiumButton>

                  {connectionTest.result && (
                    <Alert
                      status={connectionTest.result}
                      borderRadius="xl"
                      fontSize="sm"
                      bg={connectionTest.result === 'success' 
                        ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'green.50')
                        : (isDark ? 'rgba(239, 68, 68, 0.1)' : 'red.50')
                      }
                    >
                      <AlertIcon />
                      {connectionTest.message}
                    </Alert>
                  )}
                </Stack>
              </Box>
            </MotionDiv>

            {/* Contact Card */}
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
                    bg={isDark ? 'rgba(34, 197, 94, 0.15)' : 'green.50'}
                    align="center"
                    justify="center"
                  >
                    <MessageCircle size={20} style={{ color: isDark ? '#4ADE80' : '#16A34A' }} />
                  </Flex>
                  <Stack spacing={0} flex="1">
                    <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.600'}>
                      {t('help.contactHint')}
                    </Text>
                    <Text fontWeight="semibold" color="blue.500" fontSize="sm">
                      support@smilecrm.app
                    </Text>
                  </Stack>
                </Flex>
              </Box>
            </MotionDiv>
          </Grid>
        </Flex>
      </Box>
    </Box>
  )
}
