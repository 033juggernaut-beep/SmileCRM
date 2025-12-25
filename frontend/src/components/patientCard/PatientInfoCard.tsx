/**
 * Patient basic info block - top section of patient card
 * Extended with:
 * - Full name (large, prominent)
 * - Status badge (in_progress / completed)
 * - Phone number
 * - Date of birth (editable)
 * - Patient segment (VIP / Regular)
 */

import { useState, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Grid,
  useColorMode,
  IconButton,
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  useToast,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { Phone, User, Star, Pencil, X, Check, UserCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { apiClient } from '../../api/client'
import { TOKEN_STORAGE_KEY } from '../../constants/storage'
import type { Patient, PatientStatus, PatientSegment } from '../../api/patients'

interface PatientInfoCardProps {
  patient: Patient
  onPatientUpdate?: (updatedPatient: Patient) => void
}

export function PatientInfoCard({ patient, onPatientUpdate }: PatientInfoCardProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // DOB editing state
  const [dobValue, setDobValue] = useState(patient.birthDate || '')
  const [isSaving, setIsSaving] = useState(false)

  // Segment editing state
  const segmentPopover = useDisclosure()
  const [isSavingSegment, setIsSavingSegment] = useState(false)

  const statusConfig: Record<PatientStatus, { label: string; bg: string; text: string }> = {
    in_progress: {
      label: t('patients.statusInProgress'),
      bg: isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.100',
      text: isDark ? 'blue.300' : 'blue.700',
    },
    completed: {
      label: t('patients.statusCompleted'),
      bg: isDark ? 'rgba(71, 85, 105, 0.3)' : 'gray.200',
      text: isDark ? 'gray.400' : 'gray.600',
    },
  }

  const segmentConfig: Record<PatientSegment, { label: string; bg: string; text: string; border: string; icon: boolean }> = {
    vip: {
      label: 'VIP',
      bg: isDark ? 'rgba(37, 99, 235, 0.3)' : 'rgba(59, 130, 246, 0.1)',
      text: isDark ? 'blue.300' : 'blue.600',
      border: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.300',
      icon: true,
    },
    regular: {
      label: t('segment.regular'),
      bg: isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100',
      text: isDark ? 'gray.400' : 'gray.500',
      border: 'transparent',
      icon: false,
    },
  }

  const status = patient.status ? statusConfig[patient.status] : null
  const segment = patient.segment ? segmentConfig[patient.segment] : segmentConfig.regular

  const formatDate = (input?: string | null) => {
    if (!input) return '—'
    try {
      return new Date(input).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return input
    }
  }

  // Handle DOB save
  const handleSaveDob = useCallback(async () => {
    setIsSaving(true)
    try {
      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) {
        throw new Error(t('patientDetails.authRequired'))
      }

      // Validate date format - must be YYYY-MM-DD or empty
      const trimmedValue = dobValue.trim()
      if (trimmedValue && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
        throw new Error(t('patientDetails.invalidDateFormat'))
      }

      // Send null if cleared, otherwise the ISO date (YYYY-MM-DD)
      const birthDateValue = trimmedValue || null

      await apiClient.patch(
        `/patients/${patient.id}`,
        { birth_date: birthDateValue },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      // Update local state
      const updatedPatient = { ...patient, birthDate: birthDateValue || undefined }
      onPatientUpdate?.(updatedPatient)

      toast({
        title: t('patientDetails.birthDateSaved'),
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      onClose()
    } catch (error: unknown) {
      console.error('Failed to save DOB:', error)
      
      // Extract error message from response or use generic message
      let errorMessage = t('patientDetails.saveError')
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string }
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail
        } else if (axiosError.message) {
          errorMessage = axiosError.message
        }
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSaving(false)
    }
  }, [dobValue, patient, onPatientUpdate, onClose, toast, t])

  // Handle cancel
  const handleCancel = useCallback(() => {
    setDobValue(patient.birthDate || '')
    onClose()
  }, [patient.birthDate, onClose])

  // Handle segment change
  const handleSegmentChange = useCallback(async (newSegment: PatientSegment) => {
    if (newSegment === patient.segment) {
      segmentPopover.onClose()
      return
    }

    setIsSavingSegment(true)
    try {
      const authToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!authToken) {
        throw new Error(t('patientDetails.authRequired'))
      }

      await apiClient.patch(
        `/patients/${patient.id}`,
        { segment: newSegment },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )

      // Update local state
      const updatedPatient = { ...patient, segment: newSegment }
      onPatientUpdate?.(updatedPatient)

      toast({
        title: newSegment === 'vip' 
          ? t('patientDetails.segmentVipSet') || 'Patient marked as VIP'
          : t('patientDetails.segmentRegularSet') || 'Patient marked as Regular',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      segmentPopover.onClose()
    } catch (error: unknown) {
      console.error('Failed to save segment:', error)
      
      let errorMessage = t('patientDetails.saveError')
      if (error && typeof error === 'object') {
        const axiosError = error as { response?: { data?: { detail?: string } }; message?: string }
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail
        } else if (axiosError.message) {
          errorMessage = axiosError.message
        }
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setIsSavingSegment(false)
    }
  }, [patient, onPatientUpdate, segmentPopover, toast, t])

  // Theme colors for popover
  const popoverBg = isDark ? 'gray.800' : 'white'
  const inputBg = isDark ? 'gray.700' : 'gray.50'
  const inputBorder = isDark ? 'gray.600' : 'gray.200'

  return (
    <Box
      w="full"
      borderRadius="2xl"
      p={5}
      transition="colors 0.2s"
      bg={isDark ? 'rgba(30, 41, 59, 0.6)' : 'white'}
      border="1px solid"
      borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
    >
      {/* Name and Status Row */}
      <Flex align="flex-start" justify="space-between" gap={3} mb={3} flexWrap="wrap">
        <Text
          as="h2"
          fontSize="xl"
          fontWeight="semibold"
          letterSpacing="tight"
          color={isDark ? 'white' : 'gray.800'}
        >
          {patient.firstName} {patient.lastName}
        </Text>
        <Flex align="center" gap={2} flexShrink={0}>
          {/* Segment Badge - Clickable */}
          <Popover
            isOpen={segmentPopover.isOpen}
            onOpen={segmentPopover.onOpen}
            onClose={segmentPopover.onClose}
            placement="bottom-start"
            closeOnBlur={true}
          >
            <PopoverTrigger>
              <Flex
                as="button"
                align="center"
                gap={1}
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
                border="1px solid"
                bg={segment.bg}
                color={segment.text}
                borderColor={segment.border}
                cursor="pointer"
                transition="all 0.15s"
                _hover={{
                  opacity: 0.8,
                  transform: 'scale(1.02)',
                }}
              >
                {segment.icon && <Box as={Star} w={3} h={3} />}
                {segment.label}
                <Box as={Pencil} w={2.5} h={2.5} ml={0.5} opacity={0.6} />
              </Flex>
            </PopoverTrigger>
            <PopoverContent
              bg={popoverBg}
              borderColor={inputBorder}
              borderRadius="xl"
              boxShadow="lg"
              w="auto"
              minW="140px"
            >
              <PopoverArrow bg={popoverBg} />
              <PopoverBody p={2}>
                <Text fontSize="xs" fontWeight="medium" mb={2} color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('patientDetails.selectSegment') || 'Select segment'}
                </Text>
                <VStack spacing={1} align="stretch">
                  {/* VIP Option */}
                  <Button
                    size="sm"
                    variant={patient.segment === 'vip' ? 'solid' : 'ghost'}
                    colorScheme={patient.segment === 'vip' ? 'blue' : 'gray'}
                    leftIcon={<Star size={14} />}
                    justifyContent="flex-start"
                    onClick={() => handleSegmentChange('vip')}
                    isLoading={isSavingSegment}
                    isDisabled={isSavingSegment}
                  >
                    VIP
                  </Button>
                  {/* Regular Option */}
                  <Button
                    size="sm"
                    variant={patient.segment === 'regular' || !patient.segment ? 'solid' : 'ghost'}
                    colorScheme={patient.segment === 'regular' || !patient.segment ? 'gray' : 'gray'}
                    leftIcon={<UserCircle size={14} />}
                    justifyContent="flex-start"
                    onClick={() => handleSegmentChange('regular')}
                    isLoading={isSavingSegment}
                    isDisabled={isSavingSegment}
                  >
                    {t('segment.regular') || 'Regular'}
                  </Button>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          {/* Status Badge */}
          {status && (
            <Flex
              as="span"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="medium"
              whiteSpace="nowrap"
              bg={status.bg}
              color={status.text}
            >
              {status.label}
            </Flex>
          )}
        </Flex>
      </Flex>

      {/* Info Grid - Compact 2x2 */}
      <Grid templateColumns="repeat(2, 1fr)" gap={2} columnGap={4}>
        {/* Phone */}
        <Flex align="center" gap={2}>
          <Box
            as={Phone}
            w={4}
            h={4}
            flexShrink={0}
            color={isDark ? 'gray.500' : 'gray.400'}
          />
          <Text
            fontSize="sm"
            isTruncated
            color={isDark ? 'gray.300' : 'gray.600'}
          >
            {patient.phone ?? '—'}
          </Text>
        </Flex>

        {/* Date of Birth with Edit */}
        <Flex align="center" gap={2}>
          <Box
            as={User}
            w={4}
            h={4}
            flexShrink={0}
            color={isDark ? 'gray.500' : 'gray.400'}
          />
          <Text fontSize="sm" color={isDark ? 'gray.300' : 'gray.600'} flex={1}>
            <Text as="span" color={isDark ? 'gray.500' : 'gray.400'}>
              {t('patientDetails.birthDate')}:{' '}
            </Text>
            {formatDate(patient.birthDate)}
          </Text>

          {/* Edit DOB Button */}
          <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={handleCancel}
            placement="bottom-end"
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <IconButton
                aria-label={t('common.edit')}
                icon={<Pencil size={14} />}
                size="xs"
                variant="ghost"
                color={isDark ? 'gray.500' : 'gray.400'}
                _hover={{
                  color: isDark ? 'blue.400' : 'blue.600',
                  bg: isDark ? 'gray.700' : 'gray.100',
                }}
              />
            </PopoverTrigger>
            <PopoverContent
              bg={popoverBg}
              borderColor={inputBorder}
              borderRadius="xl"
              boxShadow="lg"
              w="auto"
              minW="200px"
            >
              <PopoverArrow bg={popoverBg} />
              <PopoverBody p={3}>
                <Text fontSize="xs" fontWeight="medium" mb={2} color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('patientDetails.birthDate')}
                </Text>
                <Input
                  type="date"
                  value={dobValue}
                  onChange={(e) => setDobValue(e.target.value)}
                  size="sm"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                  borderRadius="lg"
                  color={isDark ? 'white' : 'gray.800'}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                  mb={3}
                />
                <HStack justify="flex-end" spacing={2}>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleCancel}
                    leftIcon={<X size={12} />}
                    color={isDark ? 'gray.400' : 'gray.500'}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="blue"
                    onClick={handleSaveDob}
                    isLoading={isSaving}
                    leftIcon={<Check size={12} />}
                  >
                    {t('common.save')}
                  </Button>
                </HStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
      </Grid>
    </Box>
  )
}

export default PatientInfoCard
