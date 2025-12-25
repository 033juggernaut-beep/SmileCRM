/**
 * VisitsPage - Full page view for managing visits
 * Matches CRM style with blue accent colors
 */

import { useState, useCallback, useEffect } from 'react'
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
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
  Skeleton,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  FileText,
} from 'lucide-react'
import { PremiumLayout } from '../components/layout/PremiumLayout'
import { useLanguage } from '../context/LanguageContext'
import { visitsApi, type Visit, type VisitStatus } from '../api/visits'

// Format date for display
const formatDate = (dateStr: string, language: string): string => {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }
  
  const locale = language === 'ru' ? 'ru-RU' : language === 'am' ? 'hy-AM' : 'en-US'
  return date.toLocaleDateString(locale, options)
}

// Format date for API
const formatDateApi = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Check if date is today
const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

// Get status styles - using CRM blue/neutral palette
const getStatusStyles = (status: VisitStatus, isDark: boolean) => {
  const styles: Record<VisitStatus, { bg: string; color: string }> = {
    scheduled: {
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE',
      color: isDark ? '#60A5FA' : '#2563EB',
    },
    in_progress: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
      color: isDark ? '#FBBF24' : '#D97706',
    },
    completed: {
      bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    no_show: {
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
      color: isDark ? '#F87171' : '#DC2626',
    },
    rescheduled: {
      bg: isDark ? 'rgba(100, 116, 139, 0.15)' : '#F1F5F9',
      color: isDark ? '#94A3B8' : '#64748B',
    },
  }
  return styles[status] || styles.scheduled
}

// Get status label
const getStatusLabel = (status: VisitStatus, t: (key: string) => string): string => {
  const labels: Record<VisitStatus, string> = {
    scheduled: t('visits.status.scheduled') || 'Scheduled',
    in_progress: t('visits.status.inProgress') || 'In Progress',
    completed: t('visits.status.completed') || 'Completed',
    no_show: t('visits.status.noShow') || 'No Show',
    rescheduled: t('visits.status.rescheduled') || 'Rescheduled',
  }
  return labels[status] || status
}

export function VisitsPage() {
  const { t, language } = useLanguage()
  const { colorMode } = useColorMode()
  const navigate = useNavigate()
  const toast = useToast()
  const isDark = colorMode === 'dark'
  
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  
  // Reschedule modal
  const rescheduleModal = useDisclosure()
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleNote, setRescheduleNote] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)
  
  // No-show modal
  const noShowModal = useDisclosure()
  const [noShowNote, setNoShowNote] = useState('')
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)
  
  // Formatted date string
  const dateStr = formatDateApi(currentDate)
  const displayDate = formatDate(dateStr, language)
  const isTodayView = isToday(dateStr)
  
  // CRM Colors
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'
  const textColor = isDark ? '#E2E8F0' : '#334155'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'
  const accentColor = isDark ? '#60A5FA' : '#2563EB'
  
  // Fetch visits for current date
  const fetchVisits = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await visitsApi.getVisitsByDate(dateStr)
      setVisits(response.visits)
    } catch (err) {
      console.error('Failed to fetch visits:', err)
      toast({
        title: t('common.error'),
        description: t('visits.fetchError') || 'Failed to load visits',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [dateStr, toast, t])
  
  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])
  
  // Navigation handlers
  const goToPreviousDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }
  
  const goToNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }
  
  const goToToday = () => {
    setCurrentDate(new Date())
  }
  
  // Status update handlers
  const updateStatus = async (visit: Visit, status: VisitStatus, note?: string, rescheduledTo?: string, rescheduledTime?: string) => {
    try {
      await visitsApi.updateStatus(visit.id, {
        status,
        note,
        rescheduledTo,
        rescheduledTime,
      })
      
      toast({
        title: t('visits.statusUpdated') || 'Status updated',
        status: 'success',
        duration: 2000,
      })
      
      fetchVisits()
    } catch (err) {
      console.error('Failed to update status:', err)
      toast({
        title: t('common.error'),
        status: 'error',
        duration: 3000,
      })
    }
  }
  
  const handleMarkInProgress = (visit: Visit) => updateStatus(visit, 'in_progress')
  const handleMarkCompleted = (visit: Visit) => updateStatus(visit, 'completed')
  
  const handleOpenNoShowModal = (visit: Visit) => {
    setSelectedVisit(visit)
    setNoShowNote('')
    noShowModal.onOpen()
  }
  
  const handleConfirmNoShow = async () => {
    if (!selectedVisit) return
    setIsMarkingNoShow(true)
    try {
      await updateStatus(selectedVisit, 'no_show', noShowNote || undefined)
      noShowModal.onClose()
    } finally {
      setIsMarkingNoShow(false)
    }
  }
  
  const handleOpenRescheduleModal = (visit: Visit) => {
    setSelectedVisit(visit)
    setRescheduleDate('')
    setRescheduleTime(visit.visitTime || '')
    setRescheduleNote('')
    rescheduleModal.onOpen()
  }
  
  const handleConfirmReschedule = async () => {
    if (!selectedVisit || !rescheduleDate) return
    setIsRescheduling(true)
    try {
      await updateStatus(selectedVisit, 'rescheduled', rescheduleNote || undefined, rescheduleDate, rescheduleTime || undefined)
      rescheduleModal.onClose()
    } finally {
      setIsRescheduling(false)
    }
  }
  
  return (
    <PremiumLayout
      title={t('visits.pageTitle') || 'Visits'}
      showBack
      onBack={() => navigate('/home')}
      background="gradient"
      safeAreaBottom
    >
      <VStack spacing={4} align="stretch" pb={4} maxW="768px" mx="auto" w="100%">
        {/* Date Navigation - Compact toolbar style */}
        <HStack
          justify="space-between"
          align="center"
          bg={cardBg}
          px={3}
          py={2}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <IconButton
            aria-label="Previous day"
            icon={<ChevronLeft size={18} />}
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
            color={mutedColor}
          />
          
          <VStack spacing={0}>
            <Text fontSize="sm" fontWeight="semibold" color={textColor}>
              {displayDate}
            </Text>
            {!isTodayView && (
              <Button
                size="xs"
                variant="link"
                color={accentColor}
                onClick={goToToday}
                fontWeight="normal"
                h="auto"
                py={0}
              >
                {t('visits.goToToday') || 'Go to today'}
              </Button>
            )}
          </VStack>
          
          <IconButton
            aria-label="Next day"
            icon={<ChevronRight size={18} />}
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
            color={mutedColor}
          />
        </HStack>
        
        {/* Visits Count */}
        <Text fontSize="xs" color={mutedColor} textAlign="center">
          {isLoading ? (
            <Skeleton height="14px" width="80px" mx="auto" />
          ) : (
            `${visits.length} ${t('visits.visitsCount') || 'visits'}`
          )}
        </Text>
        
        {/* Visits List */}
        {isLoading ? (
          <VStack spacing={3}>
            <Skeleton height="80px" borderRadius="lg" w="100%" />
            <Skeleton height="80px" borderRadius="lg" w="100%" />
            <Skeleton height="80px" borderRadius="lg" w="100%" />
          </VStack>
        ) : visits.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={10}
            bg={cardBg}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
          >
            <Calendar size={32} color={mutedColor} style={{ marginBottom: 8 }} />
            <Text fontSize="sm" color={mutedColor}>
              {t('visits.noVisitsOnDate') || 'No visits on this date'}
            </Text>
          </Flex>
        ) : (
          <VStack spacing={2}>
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                isDark={isDark}
                isTodayView={isTodayView}
                t={t}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                mutedColor={mutedColor}
                accentColor={accentColor}
                onMarkInProgress={() => handleMarkInProgress(visit)}
                onMarkCompleted={() => handleMarkCompleted(visit)}
                onMarkNoShow={() => handleOpenNoShowModal(visit)}
                onReschedule={() => handleOpenRescheduleModal(visit)}
                onOpenPatient={() => navigate(`/patients/${visit.patientId}`)}
              />
            ))}
          </VStack>
        )}
      </VStack>
      
      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModal.isOpen} onClose={rescheduleModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4} bg={isDark ? 'gray.800' : 'white'} borderRadius="xl">
          <ModalHeader fontSize="md">{t('visits.reschedule') || 'Reschedule Visit'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">{t('visits.newDate') || 'New Date'}</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('visits.newTime') || 'New Time'}</FormLabel>
                <Input
                  type="time"
                  size="sm"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">{t('visits.note') || 'Note'}</FormLabel>
                <Textarea
                  size="sm"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder={t('visits.rescheduleNotePlaceholder') || 'Reason for rescheduling...'}
                  rows={2}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={rescheduleModal.onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleConfirmReschedule}
              isLoading={isRescheduling}
              isDisabled={!rescheduleDate}
            >
              {t('visits.confirmReschedule') || 'Reschedule'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* No-Show Modal */}
      <Modal isOpen={noShowModal.isOpen} onClose={noShowModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4} bg={isDark ? 'gray.800' : 'white'} borderRadius="xl">
          <ModalHeader fontSize="md">{t('visits.markNoShow') || 'Mark as No-Show'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm">{t('visits.note') || 'Note'}</FormLabel>
              <Textarea
                size="sm"
                value={noShowNote}
                onChange={(e) => setNoShowNote(e.target.value)}
                placeholder={t('visits.noShowNotePlaceholder') || 'Reason (optional)...'}
                rows={2}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={noShowModal.onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              onClick={handleConfirmNoShow}
              isLoading={isMarkingNoShow}
            >
              {t('visits.confirmNoShow') || 'Confirm No-Show'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PremiumLayout>
  )
}

// Visit Card Component
interface VisitCardProps {
  visit: Visit
  isDark: boolean
  isTodayView: boolean
  t: (key: string) => string
  cardBg: string
  borderColor: string
  textColor: string
  mutedColor: string
  accentColor: string
  onMarkInProgress: () => void
  onMarkCompleted: () => void
  onMarkNoShow: () => void
  onReschedule: () => void
  onOpenPatient: () => void
}

function VisitCard({
  visit,
  isDark,
  isTodayView,
  t,
  cardBg,
  borderColor,
  textColor,
  mutedColor,
  accentColor,
  onMarkInProgress,
  onMarkCompleted,
  onMarkNoShow,
  onReschedule,
  onOpenPatient,
}: VisitCardProps) {
  const statusStyles = getStatusStyles(visit.status, isDark)
  
  const patientName = visit.patient
    ? `${visit.patient.firstName} ${visit.patient.lastName}`.trim()
    : 'Unknown Patient'
  
  const timeDisplay = visit.visitTime ? visit.visitTime.slice(0, 5) : '—'
  
  const isCompleted = visit.status === 'completed'
  const isNoShow = visit.status === 'no_show'
  const isRescheduled = visit.status === 'rescheduled'
  const isInactive = isCompleted || isNoShow || isRescheduled
  const canChangeStatus = isTodayView && visit.status === 'scheduled'
  const canMarkComplete = isTodayView && (visit.status === 'scheduled' || visit.status === 'in_progress')
  
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={3}
      w="100%"
      opacity={isInactive ? 0.6 : 1}
    >
      {/* Header: Time + Status */}
      <Flex justify="space-between" align="center" mb={2}>
        <HStack spacing={2}>
          <Clock size={14} color={mutedColor} />
          <Text fontSize="md" fontWeight="bold" color={textColor}>
            {timeDisplay}
          </Text>
        </HStack>
        <Text
          fontSize="xs"
          fontWeight="medium"
          px={2}
          py={0.5}
          borderRadius="full"
          bg={statusStyles.bg}
          color={statusStyles.color}
        >
          {getStatusLabel(visit.status, t)}
        </Text>
      </Flex>
      
      {/* Patient Info */}
      <VStack align="stretch" spacing={1} mb={2}>
        <HStack spacing={2} onClick={onOpenPatient} cursor="pointer" _hover={{ color: accentColor }}>
          <User size={12} color={mutedColor} />
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={textColor}
            textDecoration={isCompleted ? 'line-through' : 'none'}
          >
            {patientName}
          </Text>
        </HStack>
        
        {visit.patient?.phone && (
          <HStack spacing={2}>
            <Phone size={12} color={mutedColor} />
            <Text fontSize="xs" color={mutedColor}>
              {visit.patient.phone}
            </Text>
          </HStack>
        )}
        
        {visit.notes && (
          <HStack spacing={2} align="flex-start">
            <FileText size={12} color={mutedColor} style={{ marginTop: 2 }} />
            <Text fontSize="xs" color={mutedColor} noOfLines={1}>
              {visit.notes}
            </Text>
          </HStack>
        )}
        
        {isRescheduled && visit.rescheduledTo && (
          <HStack spacing={2}>
            <Calendar size={12} color={mutedColor} />
            <Text fontSize="xs" color={mutedColor}>
              → {visit.rescheduledTo} {visit.rescheduledTime ? visit.rescheduledTime.slice(0, 5) : ''}
            </Text>
          </HStack>
        )}
      </VStack>
      
      {/* Action Buttons - compact */}
      {!isInactive && (
        <Flex gap={1.5} flexWrap="wrap">
          {canChangeStatus && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<Play size={12} />}
              onClick={onMarkInProgress}
              color={mutedColor}
              _hover={{ color: accentColor, bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
            >
              {t('visits.actions.start') || 'Start'}
            </Button>
          )}
          
          {canMarkComplete && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<CheckCircle size={12} />}
              onClick={onMarkCompleted}
              color={mutedColor}
              _hover={{ color: accentColor, bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
            >
              {t('visits.actions.complete') || 'Done'}
            </Button>
          )}
          
          {isTodayView && (
            <Button
              size="xs"
              variant="ghost"
              leftIcon={<XCircle size={12} />}
              onClick={onMarkNoShow}
              color={mutedColor}
              _hover={{ color: '#DC2626', bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
            >
              {t('visits.actions.noShow') || 'No Show'}
            </Button>
          )}
          
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<RefreshCw size={12} />}
            onClick={onReschedule}
            color={mutedColor}
            _hover={{ color: accentColor, bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
          >
            {t('visits.actions.reschedule') || 'Reschedule'}
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export default VisitsPage
