/**
 * Medications section - list of prescribed medications
 * - Drug name, dosage, optional notes
 * - Add new medication via modal
 */

import { useState, useCallback } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  useColorMode,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react'
import { Plus, Pill } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'
import type { Medication } from '../../api/medications'

interface MedicationsSectionProps {
  patientId: string
  medications: Medication[]
  onMedicationAdded: (medication: Medication) => void
  onCreateMedication: (data: { name: string; dosage?: string; comment?: string }) => Promise<Medication>
  defaultOpen?: boolean
}

export function MedicationsSection({
  patientId,
  medications,
  onMedicationAdded,
  onCreateMedication,
  defaultOpen = false,
}: MedicationsSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Form state
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [comment, setComment] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const isEmpty = medications.length === 0

  const handleOpenModal = useCallback(() => {
    setName('')
    setDosage('')
    setComment('')
    onOpen()
  }, [onOpen])

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast({
        title: t('patientCard.medicationNameRequired'),
        status: 'warning',
        duration: 2000,
      })
      return
    }

    setIsSaving(true)
    try {
      const newMedication = await onCreateMedication({
        name: name.trim(),
        dosage: dosage.trim() || undefined,
        comment: comment.trim() || undefined,
      })
      
      onMedicationAdded(newMedication)
      
      toast({
        title: t('patientCard.medicationAdded'),
        status: 'success',
        duration: 2000,
      })
      
      onClose()
    } catch (err) {
      console.error('Failed to add medication:', err)
      
      let errorMessage = t('patientCard.medicationAddError')
      if (err && typeof err === 'object') {
        const axiosError = err as { response?: { data?: { detail?: string } }; message?: string }
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail
        }
      }
      
      toast({
        title: t('common.error'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }, [name, dosage, comment, onCreateMedication, onMedicationAdded, onClose, toast, t])

  const addButton = (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        handleOpenModal()
      }}
      size="xs"
      fontWeight="medium"
      leftIcon={<Box as={Plus} w={3} h={3} />}
      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50'}
      color={isDark ? 'blue.400' : 'blue.600'}
      _hover={{
        bg: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.100',
      }}
    >
      {t('patientCard.addMedication')}
    </Button>
  )

  // Theme colors for modal
  const modalBg = isDark ? 'gray.800' : 'white'
  const inputBg = isDark ? 'gray.700' : 'gray.50'
  const inputBorder = isDark ? 'gray.600' : 'gray.200'
  const labelColor = isDark ? 'gray.300' : 'gray.600'

  return (
    <>
      <CollapsibleSection
        title={t('patientCard.medications')}
        defaultOpen={defaultOpen}
        headerAction={addButton}
      >
        {isEmpty ? (
          <Box py={6} textAlign="center">
            <Box
              as={Pill}
              w={8}
              h={8}
              mx="auto"
              mb={2}
              color={isDark ? 'gray.600' : 'gray.300'}
            />
            <Text
              fontSize="sm"
              color={isDark ? 'gray.400' : 'gray.500'}
            >
              {t('patientCard.noMedications')}
            </Text>
          </Box>
        ) : (
          <VStack spacing={2} align="stretch">
            {medications.map((med) => (
              <Flex
                key={med.id}
                p={3}
                borderRadius="xl"
                transition="colors 0.2s"
                bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
              >
                <Box flex={1} minW={0}>
                  {/* Drug Name */}
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    mb={0.5}
                    color={isDark ? 'white' : 'gray.800'}
                  >
                    {med.name}
                  </Text>
                  {/* Dosage */}
                  {med.dosage && (
                    <Text
                      fontSize="xs"
                      color={isDark ? 'gray.400' : 'gray.600'}
                    >
                      {med.dosage}
                    </Text>
                  )}
                  {/* Comment */}
                  {med.comment && (
                    <Text
                      fontSize="xs"
                      mt={1}
                      color={isDark ? 'gray.500' : 'gray.400'}
                      fontStyle="italic"
                    >
                      {med.comment}
                    </Text>
                  )}
                </Box>
              </Flex>
            ))}
          </VStack>
        )}
      </CollapsibleSection>

      {/* Add Medication Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg={modalBg}
          borderRadius="2xl"
          mx={4}
          border="1px solid"
          borderColor={inputBorder}
        >
          <ModalHeader
            color={isDark ? 'white' : 'gray.800'}
            fontSize="lg"
            fontWeight="semibold"
            pb={2}
          >
            {t('patientCard.addMedicationTitle')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          
          <ModalBody>
            <VStack spacing={4}>
              {/* Medication Name */}
              <FormControl isRequired>
                <FormLabel fontSize="sm" color={labelColor} mb={1}>
                  {t('patientCard.medicationName')}
                </FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('patientCard.medicationNamePlaceholder')}
                  size="md"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                  borderRadius="lg"
                  color={isDark ? 'white' : 'gray.800'}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </FormControl>

              {/* Dosage */}
              <FormControl>
                <FormLabel fontSize="sm" color={labelColor} mb={1}>
                  {t('patientCard.medicationDosage')}
                </FormLabel>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder={t('patientCard.medicationDosagePlaceholder')}
                  size="md"
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                  borderRadius="lg"
                  color={isDark ? 'white' : 'gray.800'}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </FormControl>

              {/* Comment */}
              <FormControl>
                <FormLabel fontSize="sm" color={labelColor} mb={1}>
                  {t('patientCard.medicationComment')}
                </FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t('patientCard.medicationCommentPlaceholder')}
                  size="md"
                  rows={3}
                  bg={inputBg}
                  border="1px solid"
                  borderColor={inputBorder}
                  borderRadius="lg"
                  color={isDark ? 'white' : 'gray.800'}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                  resize="none"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={2} pt={4}>
            <Button
              variant="ghost"
              onClick={onClose}
              size="md"
              color={isDark ? 'gray.400' : 'gray.500'}
              _hover={{ bg: isDark ? 'gray.700' : 'gray.100' }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={isSaving}
              size="md"
            >
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MedicationsSection
