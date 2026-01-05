/**
 * RegisterDoctorPage - Doctor registration form
 * UI/UX styled like main dashboard
 */

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Stack,
  Text,
  Textarea,
  chakra,
  useColorMode,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { UserPlus, User, Stethoscope, Phone, Building2 } from 'lucide-react'

import { apiClient, buildAuthHeaders } from '../api/client'
import {
  TELEGRAM_INIT_DATA_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
} from '../constants/storage'
import { BackgroundPattern } from '../components/dashboard'
import { PremiumButton } from '../components/premium/PremiumButton'
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

type RegisterResponse = {
  token?: string
}

type FormFields = {
  firstName: string
  lastName: string
  specialization: string
  phone: string
  clinicName: string
}

const initialForm: FormFields = {
  firstName: '',
  lastName: '',
  specialization: '',
  phone: '',
  clinicName: '',
}

export const RegisterDoctorPage = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  const [form, setForm] = useState<FormFields>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof FormFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const validateForm = () =>
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.specialization.trim() &&
    form.phone.trim() &&
    form.clinicName.trim()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      setError(t('register.fillAllFields'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      
      // Try to get initData from sessionStorage first, then from Telegram WebApp directly
      let initDataRaw = sessionStorage.getItem(TELEGRAM_INIT_DATA_STORAGE_KEY)
      
      // Fallback: try to get fresh initData from Telegram WebApp (iOS fix)
      if (!initDataRaw && window.Telegram?.WebApp?.initData) {
        initDataRaw = window.Telegram.WebApp.initData
        // Save for future use
        if (initDataRaw) {
          sessionStorage.setItem(TELEGRAM_INIT_DATA_STORAGE_KEY, initDataRaw)
        }
      }
      
      // Check if we have initData
      if (!initDataRaw) {
        setError('Telegram initData not found. Please reopen the app from Telegram.')
        console.error('[REGISTER] No initData available')
        return
      }

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        specialization: form.specialization.trim(),
        phone: form.phone.trim(),
        clinicName: form.clinicName.trim(),
        initData: initDataRaw,
      }

      console.log('[REGISTER] Sending registration request...')
      
      const { data } = await apiClient.post<RegisterResponse>(
        '/doctors/register',
        payload,
        { headers: buildAuthHeaders(token) },
      )

      if (data?.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      }

      navigate('/home', { replace: true })
    } catch (err: unknown) {
      console.error('[REGISTER] Registration failed:', err)
      
      // Extract detailed error message
      let errorMessage = t('register.submitError')
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string | object }; status?: number } }
        const detail = axiosErr.response?.data?.detail
        const status = axiosErr.response?.status
        
        if (status === 400) {
          if (typeof detail === 'string') {
            errorMessage = detail
          } else if (detail && typeof detail === 'object') {
            errorMessage = JSON.stringify(detail)
          } else {
            errorMessage = 'Invalid request. Please check all fields and try again.'
          }
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
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

  // Input styles
  const inputBg = isDark ? 'rgba(51, 65, 85, 0.5)' : 'white'
  const inputBorder = isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'
  const inputFocusBorder = 'blue.500'

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
        <Flex
          as="main"
          direction="column"
          align="center"
          justify="flex-start"
          flex="1"
          px="16px"
          py={{ base: '32px', md: '48px' }}
          gap={{ base: '24px', md: '32px' }}
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
                bg="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                borderRadius="2xl"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
                boxShadow="0 20px 40px -12px rgba(59, 130, 246, 0.25)"
              >
                {/* Decorative circles */}
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
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="-20px"
                  w="100px"
                  h="100px"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  filter="blur(30px)"
                />
                
                <Flex direction="column" align="center" gap={4} position="relative">
                  {/* Icon */}
                  <Flex
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    align="center"
                    justify="center"
                  >
                    <UserPlus size={32} color="white" />
                  </Flex>
                  
                  <Heading 
                    size="lg" 
                    color="white" 
                    textAlign="center"
                    fontWeight="bold"
                  >
                    {t('register.title')}
                  </Heading>
                  
                  <Text 
                    fontSize="sm" 
                    color="whiteAlpha.900" 
                    textAlign="center"
                    maxW="300px"
                  >
                    {t('register.subtitle')}
                  </Text>
                </Flex>
              </Box>
            </MotionDiv>
          </MotionDiv>

          {/* Form */}
          <chakra.form onSubmit={handleSubmit} w="full" maxW="480px">
            <Grid
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              w="100%"
              gap={{ base: '16px', md: '20px' }}
            >
              {/* Form Card */}
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
                  <Stack spacing={5}>
                    {/* First Name */}
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="medium" 
                        color={isDark ? 'gray.200' : 'gray.700'}
                        fontSize="sm"
                      >
                        <Flex align="center" gap={2}>
                          <User size={16} />
                          {t('register.firstName')}
                        </Flex>
                      </FormLabel>
                      <Input
                        value={form.firstName}
                        onChange={handleChange('firstName')}
                        placeholder={t('register.firstNamePlaceholder')}
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorder}
                        borderRadius="xl"
                        _focus={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                        color={isDark ? 'white' : 'gray.800'}
                      />
                    </FormControl>

                    {/* Last Name */}
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="medium" 
                        color={isDark ? 'gray.200' : 'gray.700'}
                        fontSize="sm"
                      >
                        <Flex align="center" gap={2}>
                          <User size={16} />
                          {t('register.lastName')}
                        </Flex>
                      </FormLabel>
                      <Input
                        value={form.lastName}
                        onChange={handleChange('lastName')}
                        placeholder={t('register.lastNamePlaceholder')}
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorder}
                        borderRadius="xl"
                        _focus={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                        color={isDark ? 'white' : 'gray.800'}
                      />
                    </FormControl>

                    {/* Specialization */}
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="medium" 
                        color={isDark ? 'gray.200' : 'gray.700'}
                        fontSize="sm"
                      >
                        <Flex align="center" gap={2}>
                          <Stethoscope size={16} />
                          {t('register.specialization')}
                        </Flex>
                      </FormLabel>
                      <Input
                        value={form.specialization}
                        onChange={handleChange('specialization')}
                        placeholder={t('register.specializationPlaceholder')}
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorder}
                        borderRadius="xl"
                        _focus={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                        color={isDark ? 'white' : 'gray.800'}
                      />
                    </FormControl>

                    {/* Phone */}
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="medium" 
                        color={isDark ? 'gray.200' : 'gray.700'}
                        fontSize="sm"
                      >
                        <Flex align="center" gap={2}>
                          <Phone size={16} />
                          {t('register.phone')}
                        </Flex>
                      </FormLabel>
                      <Input
                        value={form.phone}
                        onChange={handleChange('phone')}
                        placeholder="+374 XX XX XX XX"
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorder}
                        borderRadius="xl"
                        _focus={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                        color={isDark ? 'white' : 'gray.800'}
                      />
                    </FormControl>

                    {/* Clinic Name */}
                    <FormControl isRequired>
                      <FormLabel 
                        fontWeight="medium" 
                        color={isDark ? 'gray.200' : 'gray.700'}
                        fontSize="sm"
                      >
                        <Flex align="center" gap={2}>
                          <Building2 size={16} />
                          {t('register.clinicName')}
                        </Flex>
                      </FormLabel>
                      <Textarea
                        value={form.clinicName}
                        onChange={handleChange('clinicName')}
                        placeholder={t('register.clinicNamePlaceholder')}
                        rows={2}
                        size="lg"
                        bg={inputBg}
                        borderColor={inputBorder}
                        borderRadius="xl"
                        _focus={{ borderColor: inputFocusBorder, boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                        _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                        color={isDark ? 'white' : 'gray.800'}
                        resize="none"
                      />
                    </FormControl>
                  </Stack>
                </Box>
              </MotionDiv>

              {/* Error Alert */}
              {error && (
                <MotionDiv variants={itemVariants}>
                  <Alert 
                    status="error" 
                    borderRadius="xl"
                    bg={isDark ? 'rgba(239, 68, 68, 0.1)' : 'red.50'}
                    border="1px solid"
                    borderColor={isDark ? 'rgba(239, 68, 68, 0.2)' : 'red.100'}
                  >
                    <AlertIcon color={isDark ? 'red.400' : 'red.500'} />
                    <Text color={isDark ? 'red.200' : 'red.700'} fontSize="sm">
                      {error}
                    </Text>
                  </Alert>
                </MotionDiv>
              )}

              {/* Submit Button */}
              <MotionDiv variants={itemVariants}>
                <PremiumButton
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  loadingText={t('register.submitting')}
                  w="full"
                >
                  {t('register.submit')}
                </PremiumButton>
              </MotionDiv>

              {/* Footer hint */}
              <MotionDiv variants={itemVariants}>
                <Text 
                  fontSize="xs" 
                  color={isDark ? 'gray.500' : 'gray.400'}
                  textAlign="center"
                  px={4}
                >
                  {t('register.hint')}
                </Text>
              </MotionDiv>
            </Grid>
          </chakra.form>
        </Flex>
      </Box>
    </Box>
  )
}
