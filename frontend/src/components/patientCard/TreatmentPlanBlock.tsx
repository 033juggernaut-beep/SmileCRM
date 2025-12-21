/**
 * TreatmentPlanBlock - Treatment plan section with step list
 * 
 * Features:
 * - Collapsible section with list of treatment steps
 * - Checkbox for marking steps as done/not done
 * - Add step modal
 * - PDF export stub (ready for API)
 * - Total price calculation
 */

import { useState } from 'react'
import {
  Box,
  Flex,
  Text,
  Checkbox,
  Button,
  IconButton,
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
  useDisclosure,
  useColorMode,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { Plus, FileText, Trash2 } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

// Type definition for treatment step
export interface TreatmentStep {
  id: string
  title: string
  priceAmd: number
  done: boolean
}

export interface TreatmentPlanBlockProps {
  steps: TreatmentStep[]
  onStepsChange: (steps: TreatmentStep[]) => void
  /** Called when PDF export is requested - stub for now, ready for API */
  onExportPdf?: () => void | Promise<void>
  defaultOpen?: boolean
}

export function TreatmentPlanBlock({
  steps,
  onStepsChange,
  onExportPdf,
  defaultOpen = true,
}: TreatmentPlanBlockProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Form state for add modal
  const [newTitle, setNewTitle] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [isAddingStep, setIsAddingStep] = useState(false)

  // Calculate total
  const total = steps.reduce((sum, step) => sum + step.priceAmd, 0)
  const totalDone = steps.filter((s) => s.done).reduce((sum, step) => sum + step.priceAmd, 0)

  // Toggle step done status
  const handleToggleStep = (stepId: string) => {
    const updated = steps.map((step) =>
      step.id === stepId ? { ...step, done: !step.done } : step
    )
    onStepsChange(updated)
  }

  // Delete step
  const handleDeleteStep = (stepId: string) => {
    const updated = steps.filter((step) => step.id !== stepId)
    onStepsChange(updated)
  }

  // Add new step
  const handleAddStep = () => {
    if (!newTitle.trim() || !newPrice.trim()) {
      toast({
        title: t('treatmentPlan.fillRequired'),
        status: 'warning',
        duration: 2000,
      })
      return
    }

    const price = parseInt(newPrice, 10)
    if (isNaN(price) || price < 0) {
      toast({
        title: t('treatmentPlan.invalidPrice'),
        status: 'warning',
        duration: 2000,
      })
      return
    }

    setIsAddingStep(true)
    
    const newStep: TreatmentStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTitle.trim(),
      priceAmd: price,
      done: false,
    }

    onStepsChange([...steps, newStep])
    
    // Reset form and close
    setNewTitle('')
    setNewPrice('')
    setIsAddingStep(false)
    onClose()

    toast({
      title: t('treatmentPlan.stepAdded'),
      status: 'success',
      duration: 2000,
    })
  }

  // PDF export stub
  const handleExportPdf = async () => {
    if (onExportPdf) {
      await onExportPdf()
    } else {
      // Stub - will be replaced with API call
      toast({
        title: t('treatmentPlan.pdfComingSoon'),
        status: 'info',
        duration: 3000,
      })
    }
  }

  // Format price in AMD
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' AMD'
  }

  // Header actions (Add + PDF buttons)
  const headerActions = (
    <Flex gap={2}>
      <Button
        size="xs"
        variant="ghost"
        leftIcon={<Plus size={14} />}
        color={isDark ? 'blue.400' : 'blue.600'}
        fontWeight="medium"
        _hover={{
          bg: isDark ? 'whiteAlpha.100' : 'blue.50',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
        }}
      >
        {t('treatmentPlan.addStep')}
      </Button>
      <Button
        size="xs"
        variant="ghost"
        leftIcon={<FileText size={14} />}
        color={isDark ? 'gray.400' : 'gray.500'}
        fontWeight="medium"
        _hover={{
          bg: isDark ? 'whiteAlpha.100' : 'gray.100',
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleExportPdf()
        }}
      >
        PDF
      </Button>
    </Flex>
  )

  return (
    <>
      <CollapsibleSection
        title={t('treatmentPlan.title')}
        defaultOpen={defaultOpen}
        headerAction={headerActions}
      >
        {/* Steps List */}
        {steps.length === 0 ? (
          <Box
            p={4}
            borderRadius="xl"
            bg={isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50'}
            textAlign="center"
          >
            <Text fontSize="sm" color={isDark ? 'gray.500' : 'gray.400'}>
              {t('treatmentPlan.noSteps')}
            </Text>
          </Box>
        ) : (
          <VStack spacing={2} align="stretch">
            {steps.map((step) => (
              <Flex
                key={step.id}
                align="center"
                justify="space-between"
                p={3}
                borderRadius="xl"
                bg={isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50'}
                transition="all 0.2s"
                opacity={step.done ? 0.6 : 1}
                _hover={{
                  bg: isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.100',
                }}
              >
                <Flex align="center" gap={3} flex={1}>
                  <Checkbox
                    isChecked={step.done}
                    onChange={() => handleToggleStep(step.id)}
                    colorScheme="blue"
                    size="lg"
                    borderColor={isDark ? 'gray.500' : 'gray.300'}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? 'white' : 'gray.800'}
                    textDecoration={step.done ? 'line-through' : 'none'}
                    opacity={step.done ? 0.7 : 1}
                  >
                    {step.title}
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={step.done ? (isDark ? 'gray.500' : 'gray.400') : (isDark ? 'blue.400' : 'blue.600')}
                    whiteSpace="nowrap"
                  >
                    {formatPrice(step.priceAmd)}
                  </Text>
                  <IconButton
                    aria-label={t('common.delete')}
                    icon={<Trash2 size={14} />}
                    size="xs"
                    variant="ghost"
                    color={isDark ? 'gray.500' : 'gray.400'}
                    _hover={{
                      color: isDark ? 'red.400' : 'red.500',
                      bg: isDark ? 'whiteAlpha.100' : 'red.50',
                    }}
                    onClick={() => handleDeleteStep(step.id)}
                  />
                </Flex>
              </Flex>
            ))}

            {/* Total */}
            <Box
              mt={2}
              pt={3}
              borderTop="1px solid"
              borderColor={isDark ? 'gray.600' : 'gray.200'}
            >
              <Flex justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.400' : 'gray.600'}
                >
                  {t('treatmentPlan.total')}:
                </Text>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={isDark ? 'white' : 'gray.800'}
                >
                  {formatPrice(total)}
                </Text>
              </Flex>
              {totalDone > 0 && (
                <Flex justify="space-between" align="center" mt={1}>
                  <Text
                    fontSize="xs"
                    color={isDark ? 'gray.500' : 'gray.400'}
                  >
                    {t('treatmentPlan.completed')}:
                  </Text>
                  <Text
                    fontSize="sm"
                    color={isDark ? 'green.400' : 'green.600'}
                  >
                    {formatPrice(totalDone)}
                  </Text>
                </Flex>
              )}
            </Box>
          </VStack>
        )}
      </CollapsibleSection>

      {/* Add Step Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          bg={isDark ? 'gray.800' : 'white'}
          borderRadius="2xl"
          mx={4}
        >
          <ModalHeader
            fontSize="lg"
            fontWeight="semibold"
            color={isDark ? 'white' : 'gray.800'}
            pb={2}
          >
            {t('treatmentPlan.addStepTitle')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.300' : 'gray.600'}
                >
                  {t('treatmentPlan.stepName')}
                </FormLabel>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t('treatmentPlan.stepNamePlaceholder')}
                  fontSize="sm"
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'gray.50'}
                  color={isDark ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? 'gray.300' : 'gray.600'}
                >
                  {t('treatmentPlan.price')} (AMD)
                </FormLabel>
                <Input
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0"
                  type="number"
                  min={0}
                  fontSize="sm"
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'gray.50'}
                  color={isDark ? 'white' : 'gray.800'}
                  border="1px solid"
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  _placeholder={{ color: isDark ? 'gray.500' : 'gray.400' }}
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                  }}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter pt={4}>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
              color={isDark ? 'gray.400' : 'gray.500'}
              _hover={{
                bg: isDark ? 'whiteAlpha.100' : 'gray.100',
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddStep}
              isLoading={isAddingStep}
              bg="blue.600"
              color="white"
              _hover={{ bg: 'blue.700' }}
              leftIcon={<Plus size={16} />}
            >
              {t('treatmentPlan.add')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TreatmentPlanBlock

