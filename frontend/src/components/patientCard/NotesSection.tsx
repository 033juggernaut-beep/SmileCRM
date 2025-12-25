/**
 * Doctor notes section - free-form text area for patient notes
 * - Text area for notes
 * - Edit/Save button
 * - Collapsible wrapper
 */

import { useState } from 'react'
import { Box, Flex, Text, Textarea, Button, useColorMode, useToast } from '@chakra-ui/react'
import { Edit2 } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

interface NotesSectionProps {
  notes: string
  onSave: (notes: string) => void | Promise<void>
  defaultOpen?: boolean
}

export function NotesSection({
  notes,
  onSave,
  defaultOpen = false,
}: NotesSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const [currentNotes, setCurrentNotes] = useState(notes)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const hasChanges = currentNotes !== notes

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(currentNotes)
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
      setIsEditing(false)
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

  const handleCancel = () => {
    setCurrentNotes(notes)
    setIsEditing(false)
  }

  return (
    <CollapsibleSection
      title={t('patientCard.doctorNotes')}
      defaultOpen={defaultOpen}
    >
      {isEditing ? (
        <>
          <Textarea
            value={currentNotes}
            onChange={(e) => setCurrentNotes(e.target.value)}
            placeholder={t('patientCard.notesPlaceholder')}
            rows={4}
            resize="none"
            fontSize="sm"
            p={3}
            borderRadius="xl"
            transition="colors 0.2s"
            bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.50'}
            color={isDark ? 'white' : 'gray.800'}
            border="1px solid"
            borderColor={isDark ? 'gray.600' : 'gray.200'}
            _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: isDark ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : '0 0 0 2px rgba(59, 130, 246, 0.3)',
              outline: 'none',
            }}
          />
          <Flex mt={3} align="center" justify="space-between">
            {hasChanges && (
              <Text fontSize="xs" color={isDark ? 'yellow.400' : 'yellow.600'}>
                {t('patientCard.hasChanges')}
              </Text>
            )}
            <Flex align="center" gap={2} ml="auto">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                fontWeight="medium"
                color={isDark ? 'gray.400' : 'gray.500'}
                _hover={{
                  color: isDark ? 'gray.300' : 'gray.700',
                  bg: isDark ? 'whiteAlpha.100' : 'gray.100',
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                isDisabled={!hasChanges}
                size="sm"
                fontWeight="medium"
                bg={hasChanges ? 'blue.600' : (isDark ? 'gray.700' : 'gray.200')}
                color={hasChanges ? 'white' : (isDark ? 'gray.500' : 'gray.400')}
                borderRadius="lg"
                _hover={hasChanges ? {
                  bg: isDark ? 'blue.500' : 'blue.700',
                } : {}}
                _disabled={{
                  cursor: 'not-allowed',
                  opacity: 1,
                }}
              >
                {t('patientCard.saveNotes')}
              </Button>
            </Flex>
          </Flex>
        </>
      ) : (
        <>
          <Box
            p={3}
            borderRadius="xl"
            fontSize="sm"
            lineHeight="relaxed"
            bg={isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50'}
            color={isDark ? 'gray.300' : 'gray.700'}
          >
            {currentNotes || (
              <Text as="span" color={isDark ? 'gray.500' : 'gray.400'}>
                {t('patientCard.notesEmpty')}
              </Text>
            )}
          </Box>
          <Flex mt={3} justify="flex-end">
            <Button
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              fontWeight="medium"
              leftIcon={<Box as={Edit2} w={4} h={4} />}
              color={isDark ? 'gray.400' : 'gray.500'}
              _hover={{
                color: isDark ? 'blue.400' : 'blue.600',
                bg: isDark ? 'whiteAlpha.100' : 'gray.100',
              }}
            >
              {t('common.edit')}
            </Button>
          </Flex>
        </>
      )}
    </CollapsibleSection>
  )
}

export default NotesSection

