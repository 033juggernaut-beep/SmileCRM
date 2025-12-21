/**
 * Medications section - list of prescribed medications
 * - Drug name, dosage, optional notes
 * - Add new medication
 * - Save button for changes
 */

import { useState } from 'react'
import { Box, Flex, Text, Button, VStack, IconButton, useColorMode, useToast } from '@chakra-ui/react'
import { Plus, Pill, X, Save } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

interface Medication {
  id: string
  name: string
  dosage: string
  notes?: string
}

interface MedicationsSectionProps {
  medications: Medication[]
  onAdd: () => void
  onSave: (medications: Medication[]) => void | Promise<void>
  defaultOpen?: boolean
}

export function MedicationsSection({
  medications: initialMedications,
  onAdd,
  onSave,
  defaultOpen = false,
}: MedicationsSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [items, setItems] = useState<Medication[]>(initialMedications)
  const [isSaving, setIsSaving] = useState(false)
  const isEmpty = items.length === 0
  const hasChanges = JSON.stringify(items) !== JSON.stringify(initialMedications)

  const handleRemove = (id: string) => {
    setItems(items.filter((m) => m.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(items)
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addButton = (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        onAdd()
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

  return (
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
          {items.map((med) => (
            <Flex
              key={med.id}
              role="group"
              p={3}
              borderRadius="xl"
              transition="colors 0.2s"
              bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
              _hover={{
                bg: isDark ? 'rgba(51, 65, 85, 0.6)' : 'gray.100',
              }}
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
                <Text
                  fontSize="xs"
                  color={isDark ? 'gray.400' : 'gray.600'}
                >
                  {med.dosage}
                </Text>
                {/* Notes */}
                {med.notes && (
                  <Text
                    fontSize="xs"
                    mt={1}
                    color={isDark ? 'gray.500' : 'gray.400'}
                  >
                    {med.notes}
                  </Text>
                )}
              </Box>
              {/* Remove Button */}
              <IconButton
                aria-label={t('common.delete')}
                icon={<Box as={X} w={4} h={4} />}
                size="xs"
                variant="ghost"
                opacity={0}
                _groupHover={{ opacity: 1 }}
                color={isDark ? 'gray.500' : 'gray.400'}
                _hover={{
                  bg: isDark ? 'gray.600' : 'gray.200',
                  color: isDark ? 'gray.300' : 'gray.600',
                }}
                onClick={() => handleRemove(med.id)}
              />
            </Flex>
          ))}

          {/* Save Button */}
          {hasChanges && (
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              size="sm"
              fontWeight="medium"
              leftIcon={<Box as={Save} w={4} h={4} />}
              bg="blue.600"
              color="white"
              _hover={{ bg: isDark ? 'blue.500' : 'blue.700' }}
              mt={2}
            >
              💾 {t('patientCard.saveMedications')}
            </Button>
          )}
        </VStack>
      )}
    </CollapsibleSection>
  )
}

export default MedicationsSection

