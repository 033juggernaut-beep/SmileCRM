/**
 * Visits section - displays visit history with edit support
 * - List of visits (date, summary, next visit)
 * - Edit button on each visit item
 * - Modal editing (date, description, next visit)
 * - Empty state
 * - Add visit button
 */

import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
  IconButton,
} from '@chakra-ui/react'
import { Plus, Calendar, ArrowRight, Pencil, Check } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'
import { DateInput } from '../DateInput'
import type { Visit } from '../../api/patients'

interface VisitsSectionProps {
  visits: Visit[]
  onAddVisit: () => void
  onEditVisit?: (visit: Visit) => void | Promise<void>
  defaultOpen?: boolean
}

export function VisitsSection({
  visits,
  onAddVisit,
  onEditVisit,
  defaultOpen = true,
}: VisitsSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)
  const [editForm, setEditForm] = useState({
    visitDate: '',
    notes: '',
    nextVisitDate: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  const isEmpty = visits.length === 0

  const handleEditClick = (visit: Visit) => {
    setEditingVisit(visit)
    setEditForm({
      visitDate: visit.visitDate ?? '',
      notes: visit.notes ?? '',
      nextVisitDate: visit.nextVisitDate ?? '',
    })
    onOpen()
  }

  const handleSaveEdit = async () => {
    if (!editingVisit || !onEditVisit) return
    
    setIsSaving(true)
    try {
      await onEditVisit({
        ...editingVisit,
        visitDate: editForm.visitDate,
        notes: editForm.notes,
        nextVisitDate: editForm.nextVisitDate || undefined,
      })
      toast({
        title: t('common.saved'),
        status: 'success',
        duration: 2000,
      })
      onClose()
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

  const formatDate = (input?: string | null) => {
    if (!input) return '—'
    try {
      return new Date(input).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return input
    }
  }

  const addButton = (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        onAddVisit()
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
      {t('patientCard.newVisit')}
    </Button>
  )

  return (
    <>
      <CollapsibleSection
        title={t('patientCard.visits')}
        defaultOpen={defaultOpen}
        headerAction={addButton}
      >
        {isEmpty ? (
          <Box py={6} textAlign="center">
            <Text
              fontSize="sm"
              mb={4}
              color={isDark ? 'gray.400' : 'gray.500'}
            >
              {t('patientCard.noVisits')}
            </Text>
            <Button
              onClick={onAddVisit}
              size="sm"
              fontWeight="medium"
              leftIcon={<Box as={Plus} w={4} h={4} />}
              bg="blue.600"
              color="white"
              _hover={{ bg: isDark ? 'blue.500' : 'blue.700' }}
            >
              {t('patientCard.addFirstVisit')}
            </Button>
          </Box>
        ) : (
          <VStack spacing={2} align="stretch">
            {visits.map((visit) => (
              <Box
                key={visit.id}
                role="group"
                p={3}
                borderRadius="xl"
                transition="colors 0.2s"
                bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
                _hover={{
                  bg: isDark ? 'rgba(51, 65, 85, 0.6)' : 'gray.100',
                }}
              >
                {/* Visit Header with Date and Edit Button */}
                <Flex align="center" justify="space-between" mb={2}>
                  <Flex align="center" gap={2}>
                    <Box
                      as={Calendar}
                      w={4}
                      h={4}
                      color={isDark ? 'blue.400' : 'blue.600'}
                    />
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={isDark ? 'white' : 'gray.800'}
                    >
                      {formatDate(visit.visitDate)}
                    </Text>
                  </Flex>
                  {/* Edit Button */}
                  <IconButton
                    aria-label={t('common.edit')}
                    icon={<Box as={Pencil} w={3.5} h={3.5} />}
                    size="xs"
                    variant="ghost"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    color={isDark ? 'gray.400' : 'gray.400'}
                    _hover={{
                      bg: isDark ? 'gray.600' : 'gray.200',
                      color: isDark ? 'blue.400' : 'blue.600',
                    }}
                    onClick={() => handleEditClick(visit)}
                  />
                </Flex>

                {/* Summary/Notes */}
                {visit.notes && (
                  <Text
                    fontSize="sm"
                    mb={2}
                    color={isDark ? 'gray.300' : 'gray.600'}
                  >
                    {visit.notes}
                  </Text>
                )}

                {/* Next Visit */}
                {visit.nextVisitDate && (
                  <Flex align="center" gap={1.5}>
                    <Box
                      as={ArrowRight}
                      w={3.5}
                      h={3.5}
                      color={isDark ? 'gray.500' : 'gray.400'}
                    />
                    <Text
                      fontSize="xs"
                      color={isDark ? 'gray.400' : 'gray.500'}
                    >
                      {t('patientCard.nextVisit')}: {formatDate(visit.nextVisitDate)}
                    </Text>
                  </Flex>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </CollapsibleSection>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent
          borderRadius="2xl"
          bg={isDark ? 'gray.800' : 'white'}
          mx={4}
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="semibold"
            color={isDark ? 'white' : 'gray.800'}
          >
            {t('patientCard.editVisit')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.300' : 'gray.700'}
                >
                  {t('patientCard.visitDate')}
                </FormLabel>
                <DateInput
                  value={editForm.visitDate}
                  onChange={(date) => setEditForm({ ...editForm, visitDate: date })}
                  placeholder={t('patientCard.visitDate')}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.300' : 'gray.700'}
                >
                  {t('patientCard.description')}
                </FormLabel>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'white'}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  _focus={{ borderColor: 'blue.500' }}
                  placeholder={t('patientCard.visitNotesPlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.300' : 'gray.700'}
                >
                  {t('patientCard.nextVisitDate')}
                </FormLabel>
                <DateInput
                  value={editForm.nextVisitDate}
                  onChange={(date) => setEditForm({ ...editForm, nextVisitDate: date })}
                  placeholder={t('patientCard.nextVisitDate')}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={onClose}
              color={isDark ? 'gray.300' : 'gray.600'}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveEdit}
              isLoading={isSaving}
              leftIcon={<Box as={Check} w={4} h={4} />}
              bg="blue.600"
              color="white"
              _hover={{ bg: isDark ? 'blue.500' : 'blue.700' }}
            >
              {t('common.save')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default VisitsSection

