/**
 * Finance Section - Patient billing and payment tracking
 * - Total treatment cost overview with edit modal
 * - Payments history list with edit/delete actions
 * - Add payment functionality
 * - Balance summary (paid / remaining)
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Input,
  VStack,
  HStack,
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
  IconButton,
} from '@chakra-ui/react'
import { Wallet, Calendar, CheckCircle2, Pencil, Trash2, Plus, Check } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'
import { patientFinanceApi } from '../../api/patientFinance'

interface Payment {
  id: string
  date: string
  amount: number
  description?: string
}

interface PatientFinance {
  totalCost: number
  payments: Payment[]
  currency?: string
}

interface FinanceSectionProps {
  finance: PatientFinance
  patientId: string
  defaultOpen?: boolean
  onUpdateFinance?: (finance: PatientFinance) => void | Promise<void>
  onDataChange?: () => void | Promise<void>
}

// Format number with thousand separators (e.g., 1,200,000 AMD)
const formatAmount = (amount: number, showCurrency = false, currency = 'AMD') => {
  const formatted = Math.round(amount).toLocaleString('en-US')
  return showCurrency ? `${formatted} ${currency}` : formatted
}

export function FinanceSection({
  finance: initialFinance,
  patientId,
  defaultOpen = false,
  onUpdateFinance,
  onDataChange,
}: FinanceSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const toast = useToast()

  const editTotalModal = useDisclosure()
  const editPaymentModal = useDisclosure()
  const addPaymentModal = useDisclosure()
  const deleteConfirmModal = useDisclosure()

  const [finance, setFinance] = useState<PatientFinance>(initialFinance)
  const [editTotalAmount, setEditTotalAmount] = useState(initialFinance.totalCost.toString())
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [newPayment, setNewPayment] = useState({ date: '', amount: '', description: '' })
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state with prop changes (e.g., after treatment plan is modified)
  useEffect(() => {
    setFinance(initialFinance)
    setEditTotalAmount(initialFinance.totalCost.toString())
  }, [initialFinance])

  const totalPaid = finance.payments.reduce((sum, p) => sum + p.amount, 0)
  const remaining = finance.totalCost - totalPaid

  const handleUpdateTotalCost = async () => {
    const newTotal = parseFloat(editTotalAmount) || 0
    const updated = { ...finance, totalCost: newTotal }
    setFinance(updated)
    
    setIsSaving(true)
    try {
      await onUpdateFinance?.(updated)
      toast({ title: t('common.saved'), status: 'success', duration: 2000 })
      editTotalModal.onClose()
    } catch (err) {
      toast({ title: t('common.error'), status: 'error', duration: 3000 })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddPayment = async () => {
    const amount = parseFloat(newPayment.amount)
    if (!amount || amount <= 0) {
      toast({ title: t('patientDetails.invalidAmount'), status: 'error', duration: 3000 })
      return
    }

    setIsSaving(true)
    try {
      // Call the API to create the payment
      const createdPayment = await patientFinanceApi.createPayment(patientId, {
        amount,
        comment: newPayment.description || undefined,
      })

      // Add the new payment to local state
      const newPaymentLocal: Payment = {
        id: createdPayment.id,
        date: createdPayment.paidAt ? new Date(createdPayment.paidAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) : new Date().toLocaleDateString('ru-RU'),
        amount: createdPayment.amount,
        description: createdPayment.comment ?? undefined,
      }
      
      setFinance((prev) => ({
        ...prev,
        payments: [newPaymentLocal, ...prev.payments],
      }))

      toast({ title: t('patientCard.finance.paymentAdded'), status: 'success', duration: 2000 })
      setNewPayment({ date: '', amount: '', description: '' })
      addPaymentModal.onClose()

      // Notify parent to refetch data (updates finance summary)
      await onDataChange?.()
    } catch (err) {
      console.error('Failed to create payment:', err)
      const errorMessage = err instanceof Error ? err.message : t('common.error')
      toast({ title: t('common.error'), description: errorMessage, status: 'error', duration: 3000 })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePayment = async () => {
    if (!editingPayment) return
    
    setIsSaving(true)
    try {
      // Call API to update the payment
      await patientFinanceApi.updatePayment(patientId, editingPayment.id, {
        amount: editingPayment.amount,
        comment: editingPayment.description,
      })

      // Update local state
      setFinance((prev) => ({
        ...prev,
        payments: prev.payments.map((p) =>
          p.id === editingPayment.id ? editingPayment : p
        ),
      }))

      toast({ title: t('common.saved'), status: 'success', duration: 2000 })
      editPaymentModal.onClose()

      // Notify parent to refetch data
      await onDataChange?.()
    } catch (err) {
      console.error('Failed to update payment:', err)
      toast({ title: t('common.error'), status: 'error', duration: 3000 })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePayment = async () => {
    if (!deletingPaymentId) return
    
    try {
      // Call API to delete the payment
      await patientFinanceApi.deletePayment(patientId, deletingPaymentId)

      // Update local state
      setFinance((prev) => ({
        ...prev,
        payments: prev.payments.filter((p) => p.id !== deletingPaymentId),
      }))

      toast({ title: t('patientCard.finance.paymentDeleted'), status: 'success', duration: 2000 })

      // Notify parent to refetch data
      await onDataChange?.()
    } catch (err) {
      console.error('Failed to delete payment:', err)
      toast({ title: t('common.error'), status: 'error', duration: 3000 })
    }
    deleteConfirmModal.onClose()
    setDeletingPaymentId(null)
  }

  const addButton = (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        addPaymentModal.onOpen()
      }}
      size="xs"
      fontWeight="medium"
      leftIcon={<Box as={Plus} w={3} h={3} />}
      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50'}
      color={isDark ? 'blue.400' : 'blue.600'}
      _hover={{ bg: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.100' }}
    >
      {t('patientCard.finance.addPayment')}
    </Button>
  )

  return (
    <>
      <CollapsibleSection
        title={t('patientCard.finance.title')}
        defaultOpen={defaultOpen}
        headerAction={addButton}
      >
        <VStack spacing={4} align="stretch">
          {/* Total Cost Overview */}
          <Box
            role="group"
            p={4}
            borderRadius="xl"
            bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
            border="1px solid"
            borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100'}
          >
            <Flex align="center" justify="space-between" mb={2}>
              <Flex align="center" gap={2}>
                <Box as={Wallet} w={4} h={4} color={isDark ? 'blue.400' : 'blue.600'} />
                <Text fontSize="xs" fontWeight="medium" color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('patientCard.finance.totalCost')}
                </Text>
              </Flex>
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
                onClick={() => {
                  setEditTotalAmount(finance.totalCost.toString())
                  editTotalModal.onOpen()
                }}
              />
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={isDark ? 'white' : 'gray.800'}>
              {formatAmount(finance.totalCost, true, finance.currency || 'AMD')}
            </Text>
          </Box>

          {/* Payments History */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={3} color={isDark ? 'gray.300' : 'gray.600'}>
              {t('patientCard.finance.history')}
            </Text>

            {finance.payments.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {finance.payments.map((payment) => (
                  <Flex
                    key={payment.id}
                    role="group"
                    align="center"
                    justify="space-between"
                    py={2.5}
                    px={3}
                    borderRadius="lg"
                    transition="colors 0.2s"
                    _hover={{ bg: isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50' }}
                  >
                    <Flex align="center" gap={3}>
                      <Flex
                        w={8}
                        h={8}
                        borderRadius="full"
                        align="center"
                        justify="center"
                        bg={isDark ? 'rgba(51, 65, 85, 0.5)' : 'gray.100'}
                      >
                        <Box as={Calendar} w={3.5} h={3.5} color={isDark ? 'gray.400' : 'gray.500'} />
                      </Flex>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={isDark ? 'gray.200' : 'gray.700'}>
                          {payment.date}
                        </Text>
                        {payment.description && (
                          <Text fontSize="xs" color={isDark ? 'gray.500' : 'gray.400'}>
                            {payment.description}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    <Flex align="center" gap={2}>
                      {/* Edit/Delete actions */}
                      <HStack spacing={1} opacity={0} _groupHover={{ opacity: 1 }} transition="all 0.2s">
                        <IconButton
                          aria-label={t('common.edit')}
                          icon={<Box as={Pencil} w={3.5} h={3.5} />}
                          size="xs"
                          variant="ghost"
                          color={isDark ? 'gray.400' : 'gray.400'}
                          _hover={{
                            bg: isDark ? 'gray.600' : 'gray.200',
                            color: isDark ? 'blue.400' : 'blue.600',
                          }}
                          onClick={() => {
                            setEditingPayment(payment)
                            editPaymentModal.onOpen()
                          }}
                        />
                        <IconButton
                          aria-label={t('common.delete')}
                          icon={<Box as={Trash2} w={3.5} h={3.5} />}
                          size="xs"
                          variant="ghost"
                          color={isDark ? 'gray.400' : 'gray.400'}
                          _hover={{
                            bg: isDark ? 'gray.600' : 'gray.200',
                            color: isDark ? 'gray.300' : 'gray.600',
                          }}
                          onClick={() => {
                            setDeletingPaymentId(payment.id)
                            deleteConfirmModal.onOpen()
                          }}
                        />
                      </HStack>

                      <Text fontSize="sm" fontWeight="semibold" ml={2} color={isDark ? 'gray.200' : 'gray.700'}>
                        +{formatAmount(payment.amount)}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <Flex
                direction="column"
                align="center"
                py={6}
                borderRadius="xl"
                bg={isDark ? 'rgba(51, 65, 85, 0.3)' : 'gray.50'}
              >
                <Text fontSize="sm" mb={3} color={isDark ? 'gray.500' : 'gray.400'}>
                  {t('patientCard.finance.noPayments')}
                </Text>
                <Button
                  onClick={() => addPaymentModal.onOpen()}
                  size="sm"
                  fontWeight="medium"
                  leftIcon={<Box as={Plus} w={4} h={4} />}
                  bg="blue.600"
                  color="white"
                  _hover={{ bg: isDark ? 'blue.500' : 'blue.700' }}
                >
                  {t('patientCard.finance.addFirstPayment')}
                </Button>
              </Flex>
            )}
          </Box>

          {/* Balance Summary */}
          <Box
            p={4}
            borderRadius="xl"
            bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
            border="1px solid"
            borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.100'}
          >
            {/* Paid */}
            <Flex align="center" justify="space-between" mb={3}>
              <Flex align="center" gap={2}>
                <Box as={CheckCircle2} w={4} h={4} color={isDark ? 'green.400' : 'green.600'} />
                <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
                  {t('patientCard.finance.paid')}
                </Text>
              </Flex>
              <Text fontSize="sm" fontWeight="semibold" color={isDark ? 'green.400' : 'green.600'}>
                {formatAmount(totalPaid)}
              </Text>
            </Flex>

            {/* Remaining */}
            <Flex
              align="center"
              justify="space-between"
              pt={3}
              borderTop="1px solid"
              borderColor={isDark ? 'rgba(71, 85, 105, 0.5)' : 'gray.200'}
            >
              <Text fontSize="sm" fontWeight="medium" color={isDark ? 'gray.300' : 'gray.600'}>
                {t('patientCard.finance.remaining')}
              </Text>
              <Text
                fontSize="md"
                fontWeight="bold"
                color={
                  remaining > 0
                    ? isDark
                      ? 'blue.400'
                      : 'blue.600'
                    : isDark
                    ? 'gray.400'
                    : 'gray.500'
                }
              >
                {formatAmount(remaining)}
              </Text>
            </Flex>
          </Box>
        </VStack>
      </CollapsibleSection>

      {/* Edit Total Cost Modal */}
      <Modal isOpen={editTotalModal.isOpen} onClose={editTotalModal.onClose} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={isDark ? 'gray.800' : 'white'} mx={4}>
          <ModalHeader color={isDark ? 'white' : 'gray.800'}>
            {t('patientCard.finance.editCost')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                {t('patientCard.finance.totalCost')}
              </FormLabel>
              <Input
                type="number"
                value={editTotalAmount}
                onChange={(e) => setEditTotalAmount(e.target.value)}
                borderRadius="xl"
                bg={isDark ? 'gray.700' : 'white'}
                borderColor={isDark ? 'gray.600' : 'gray.200'}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={editTotalModal.onClose} color={isDark ? 'gray.300' : 'gray.600'}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdateTotalCost}
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

      {/* Add Payment Modal */}
      <Modal isOpen={addPaymentModal.isOpen} onClose={addPaymentModal.onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={isDark ? 'gray.800' : 'white'} mx={4}>
          <ModalHeader color={isDark ? 'white' : 'gray.800'}>
            {t('patientCard.finance.addPayment')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('patientCard.finance.date')}
                </FormLabel>
                <Input
                  type="date"
                  value={newPayment.date}
                  onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'white'}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('patientCard.finance.amount')}
                </FormLabel>
                <Input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'white'}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                  {t('patientCard.finance.comment')}
                </FormLabel>
                <Input
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  borderRadius="xl"
                  bg={isDark ? 'gray.700' : 'white'}
                  borderColor={isDark ? 'gray.600' : 'gray.200'}
                  placeholder={t('patientCard.finance.commentPlaceholder')}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={addPaymentModal.onClose} color={isDark ? 'gray.300' : 'gray.600'}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddPayment}
              isLoading={isSaving}
              leftIcon={<Box as={Check} w={4} h={4} />}
              bg="blue.600"
              color="white"
              _hover={{ bg: isDark ? 'blue.500' : 'blue.700' }}
            >
              {t('patientCard.finance.add')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal isOpen={editPaymentModal.isOpen} onClose={editPaymentModal.onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={isDark ? 'gray.800' : 'white'} mx={4}>
          <ModalHeader color={isDark ? 'white' : 'gray.800'}>
            {t('patientCard.finance.editPayment')}
          </ModalHeader>
          <ModalCloseButton color={isDark ? 'gray.400' : 'gray.500'} />
          <ModalBody>
            {editingPayment && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                    {t('patientCard.finance.date')}
                  </FormLabel>
                  <Input
                    value={editingPayment.date}
                    onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                    borderRadius="xl"
                    bg={isDark ? 'gray.700' : 'white'}
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                    {t('patientCard.finance.amount')}
                  </FormLabel>
                  <Input
                    type="number"
                    value={editingPayment.amount}
                    onChange={(e) => setEditingPayment({ ...editingPayment, amount: parseFloat(e.target.value) || 0 })}
                    borderRadius="xl"
                    bg={isDark ? 'gray.700' : 'white'}
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color={isDark ? 'gray.300' : 'gray.700'}>
                    {t('patientCard.finance.comment')}
                  </FormLabel>
                  <Input
                    value={editingPayment.description || ''}
                    onChange={(e) => setEditingPayment({ ...editingPayment, description: e.target.value })}
                    borderRadius="xl"
                    bg={isDark ? 'gray.700' : 'white'}
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={editPaymentModal.onClose} color={isDark ? 'gray.300' : 'gray.600'}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleUpdatePayment}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmModal.isOpen} onClose={deleteConfirmModal.onClose} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={isDark ? 'gray.800' : 'white'} mx={4}>
          <ModalHeader color={isDark ? 'white' : 'gray.800'}>
            {t('patientCard.finance.deleteConfirm')}
          </ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color={isDark ? 'gray.400' : 'gray.500'}>
              {t('patientCard.finance.deleteWarning')}
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={deleteConfirmModal.onClose} color={isDark ? 'gray.300' : 'gray.600'}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDeletePayment}
              bg={isDark ? 'gray.600' : 'gray.700'}
              color="white"
              _hover={{ bg: isDark ? 'gray.500' : 'gray.800' }}
            >
              {t('common.delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default FinanceSection

