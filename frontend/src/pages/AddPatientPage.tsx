/**
 * AddPatientPage - Add new patient form page
 * Matches Superdesign reference 1:1
 * 
 * Features:
 * - Required fields: First Name, Last Name, Phone
 * - Optional fields: Birth date, Segment
 * - Collapsible sections: Diagnosis, Doctor Notes, First Visit
 * - Voice assistant integration
 * - Form validation and error display
 * - Loading state with spinner
 */

import { useState, useCallback } from 'react'
import { Box, SimpleGrid, VStack, Alert, AlertIcon, useToast, useColorMode } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { patientsApi } from '../api/patients'
import type { PatientStatus } from '../api/patients'
import { type VoiceParseStructured, isPatientStructured } from '../api/ai'
import { VoiceAssistantButton } from '../components/VoiceAssistantButton'
import { BackgroundPattern } from '../components/dashboard/BackgroundPattern'
import { Header } from '../components/dashboard/Header'
import { Footer } from '../components/dashboard/Footer'
import { useLanguage } from '../context/LanguageContext'
import {
  FormField,
  FormTextarea,
  SegmentSelector,
  AddPatientCollapsibleSection,
  AddPatientHeader,
  ActionButtons,
} from '../components/addPatient'
import type { PatientSegment } from '../components/addPatient'

type FormFields = {
  firstName: string
  lastName: string
  phone: string
  birthDate: string
  segment: PatientSegment
  diagnosis: string
  doctorNotes: string
  // First visit
  visitDate: string
  visitDescription: string
  nextVisitDate: string
}

type FormErrors = {
  firstName?: string
  lastName?: string
  phone?: string
}

const initialFormState: FormFields = {
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  segment: 'regular',
  diagnosis: '',
  doctorNotes: '',
  visitDate: '',
  visitDescription: '',
  nextVisitDate: '',
}

export const AddPatientPage = () => {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const [form, setForm] = useState<FormFields>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Handle individual field change
  const handleFieldChange = (field: keyof FormFields) => (value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  // Handle segment change
  const handleSegmentChange = (segment: PatientSegment) => {
    setForm((prev) => ({
      ...prev,
      segment,
    }))
  }

  // Handle voice assistant result
  const handleVoiceApply = useCallback((structured: VoiceParseStructured, transcript: string) => {
    console.log('[AddPatientPage] Voice apply:', { structured, transcript })
    
    if (isPatientStructured(structured)) {
      const { patient } = structured
      
      setForm((prev) => ({
        ...prev,
        firstName: patient.first_name || prev.firstName,
        lastName: patient.last_name || prev.lastName,
        phone: patient.phone || prev.phone,
        diagnosis: patient.diagnosis || prev.diagnosis,
        // Keep other fields
      }))
      setErrors({})
    }
  }, [])

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.firstName.trim()) {
      newErrors.firstName = t('addPatient.validationError')
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = t('addPatient.validationError')
    }
    if (!form.phone.trim()) {
      newErrors.phone = t('addPatient.validationError')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSave = async () => {
    setGlobalError(null)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Map segment to status for API compatibility
      const status: PatientStatus = form.segment === 'vip' ? 'completed' : 'in_progress'

      const newPatient = await patientsApi.create({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        diagnosis: form.diagnosis.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status,
        birthDate: form.birthDate || undefined,
      })

      toast({
        title: t('addPatient.successTitle'),
        description: `${newPatient.firstName} ${newPatient.lastName} ${t('addPatient.successDescription')}`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      })

      navigate(`/patients/${newPatient.id}`, { replace: true })
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : t('addPatient.errorCreate'),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    navigate('/patients')
  }

  // Footer links
  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ]

  // Page background
  const pageBg = isDark
    ? 'slate.900'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'

  return (
    <Box
      minH="100dvh"
      w="full"
      position="relative"
      transition="colors 0.3s"
      bg={pageBg}
      overflowY="auto"
      overflowX="hidden"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDirection="column" flex="1">
        {/* Header */}
        <Header />

        {/* Page Title */}
        <AddPatientHeader
          onBack={handleCancel}
        />

        {/* Form Content */}
        <Box as="main" flex={1} pb={24}>
          <VStack
            w="full"
            maxW="2xl"
            mx="auto"
            px={4}
            spacing={6}
          >
            {/* Voice Assistant - floating */}
            <Box position="fixed" bottom={24} right={4} zIndex={20}>
              <VoiceAssistantButton
                mode="patient"
                onApply={handleVoiceApply}
                buttonLabel="🎤"
              />
            </Box>

            {/* Main Form Card */}
            <Box
              w="full"
              borderRadius="2xl"
              p={6}
              transition="colors 0.2s"
              bg={isDark ? 'rgba(30, 41, 59, 0.5)' : 'white'}
              border="1px solid"
              borderColor={isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)'}
              boxShadow={isDark ? 'none' : 'sm'}
            >
              <VStack spacing={5} align="stretch">
                {/* Required Fields - Name Row */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormField
                    label={t('addPatient.firstName')}
                    value={form.firstName}
                    onChange={handleFieldChange('firstName')}
                    placeholder={t('addPatient.firstNamePlaceholder')}
                    required
                    error={errors.firstName}
                  />
                  <FormField
                    label={t('addPatient.lastName')}
                    value={form.lastName}
                    onChange={handleFieldChange('lastName')}
                    placeholder={t('addPatient.lastNamePlaceholder')}
                    required
                    error={errors.lastName}
                  />
                </SimpleGrid>

                {/* Phone - Required */}
                <FormField
                  label={t('addPatient.phone')}
                  value={form.phone}
                  onChange={handleFieldChange('phone')}
                  placeholder={t('addPatient.phonePlaceholder')}
                  required
                  type="tel"
                  error={errors.phone}
                />

                {/* Optional Fields - Birth Date & Segment */}
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormField
                    label={t('addPatient.birthDate')}
                    value={form.birthDate}
                    onChange={handleFieldChange('birthDate')}
                    type="date"
                  />
                  <SegmentSelector
                    value={form.segment}
                    onChange={handleSegmentChange}
                  />
                </SimpleGrid>
              </VStack>
            </Box>

            {/* Optional Collapsible Sections */}
            <VStack spacing={3} align="stretch" w="full">
              {/* Diagnosis */}
              <AddPatientCollapsibleSection title={t('addPatient.diagnosisSection')}>
                <FormTextarea
                  label={t('addPatient.diagnosisLabel')}
                  value={form.diagnosis}
                  onChange={handleFieldChange('diagnosis')}
                  placeholder={t('addPatient.diagnosisPlaceholderShort')}
                  rows={3}
                />
              </AddPatientCollapsibleSection>

              {/* Doctor Notes */}
              <AddPatientCollapsibleSection title={t('addPatient.notesSection')}>
                <FormTextarea
                  label={t('addPatient.doctorNotes')}
                  value={form.doctorNotes}
                  onChange={handleFieldChange('doctorNotes')}
                  placeholder={t('addPatient.doctorNotesPlaceholder')}
                  rows={3}
                />
              </AddPatientCollapsibleSection>

              {/* First Visit */}
              <AddPatientCollapsibleSection title={t('addPatient.firstVisitSection')}>
                <VStack spacing={4} align="stretch">
                  <FormField
                    label={t('addPatient.visitDate')}
                    value={form.visitDate}
                    onChange={handleFieldChange('visitDate')}
                    type="date"
                  />
                  <FormTextarea
                    label={t('addPatient.visitDescription')}
                    value={form.visitDescription}
                    onChange={handleFieldChange('visitDescription')}
                    placeholder={t('addPatient.visitDescPlaceholder')}
                    rows={3}
                  />
                  <FormField
                    label={t('addPatient.nextVisit')}
                    value={form.nextVisitDate}
                    onChange={handleFieldChange('nextVisitDate')}
                    type="date"
                  />
                </VStack>
              </AddPatientCollapsibleSection>
            </VStack>

            {/* Error Alert */}
            {globalError && (
              <Alert
                status="error"
                borderRadius="xl"
                bg="error.500"
                color="white"
              >
                <AlertIcon color="white" />
                {globalError}
              </Alert>
            )}

            {/* Action Buttons */}
            <ActionButtons
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          </VStack>
        </Box>

        {/* Footer */}
        <Footer links={footerLinks} />
      </Box>
    </Box>
  )
}
