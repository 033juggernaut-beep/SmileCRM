/**
 * VisitsPage - Full page view for managing visits
 * 
 * Features:
 * - Date navigation (today, previous/next day)
 * - List of visits with patient info
 * - Quick status update buttons
 * - Reschedule modal
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
  Badge,
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

// Get status color scheme
const getStatusColorScheme = (status: VisitStatus): string => {
  const map: Record<VisitStatus, string> = {
    scheduled: 'blue',
    in_progress: 'yellow',
    completed: 'green',
    no_show: 'red',
    rescheduled: 'gray',
  }
  return map[status] || 'gray'
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
      
      // Refresh visits
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
  
  const handleMarkInProgress = (visit: Visit) => {
    updateStatus(visit, 'in_progress')
  }
  
  const handleMarkCompleted = (visit: Visit) => {
    updateStatus(visit, 'completed')
  }
  
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
      await updateStatus(
        selectedVisit,
        'rescheduled',
        rescheduleNote || undefined,
        rescheduleDate,
        rescheduleTime || undefined
      )
      rescheduleModal.onClose()
    } finally {
      setIsRescheduling(false)
    }
  }
  
  // Colors
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#E2E8F0'
  const textColor = isDark ? '#E2E8F0' : '#334155'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'
  const accentColor = isDark ? '#60A5FA' : '#2563EB'
  
  return (
    <PremiumLayout
      title={t('visits.pageTitle') || 'Visits'}
      showBack
      onBack={() => navigate('/home')}
      background="gradient"
      safeAreaBottom
    >
      <VStack spacing={4} align="stretch" pb={4}>
        {/* Date Navigation */}
        <Flex
          align="center"
          justify="space-between"
          bg={cardBg}
          p={3}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
        >
          <IconButton
            aria-label="Previous day"
            icon={<ChevronLeft size={20} />}
            variant="ghost"
            size="sm"
            onClick={goToPreviousDay}
          />
          
          <VStack spacing={0}>
            <Text fontSize="md" fontWeight="semibold" color={textColor}>
              {displayDate}
            </Text>
            {!isTodayView && (
              <Button
                size="xs"
                variant="ghost"
                color={accentColor}
                onClick={goToToday}
                leftIcon={<Calendar size={12} />}
              >
                {t('visits.goToToday') || 'Go to today'}
              </Button>
            )}
          </VStack>
          
          <IconButton
            aria-label="Next day"
            icon={<ChevronRight size={20} />}
            variant="ghost"
            size="sm"
            onClick={goToNextDay}
          />
        </Flex>
        
        {/* Visits Count */}
        <Text fontSize="sm" color={mutedColor} textAlign="center">
          {isLoading ? (
            <Skeleton height="16px" width="100px" mx="auto" />
          ) : (
            `${visits.length} ${t('visits.visitsCount') || 'visits'}`
          )}
        </Text>
        
        {/* Visits List */}
        {isLoading ? (
          <VStack spacing={3}>
            <Skeleton height="100px" borderRadius="xl" />
            <Skeleton height="100px" borderRadius="xl" />
            <Skeleton height="100px" borderRadius="xl" />
          </VStack>
        ) : visits.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={12}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
          >
            <Text fontSize="3xl" mb={2}>📅</Text>
            <Text color={mutedColor}>
              ✅ {t('visits.noVisitsOnDate') || 'No visits on this date'}
            </Text>
          </Flex>
        ) : (
          <VStack spacing={3}>
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                isDark={isDark}
                isTodayView={isTodayView}
                t={t}
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
        <ModalOverlay />
        <ModalContent mx={4} bg={isDark ? 'gray.800' : 'white'}>
          <ModalHeader>{t('visits.reschedule') || 'Reschedule Visit'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('visits.newDate') || 'New Date'}</FormLabel>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('visits.newTime') || 'New Time'}</FormLabel>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('visits.note') || 'Note'}</FormLabel>
                <Textarea
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder={t('visits.rescheduleNotePlaceholder') || 'Reason for rescheduling...'}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={rescheduleModal.onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              colorScheme="blue"
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
        <ModalOverlay />
        <ModalContent mx={4} bg={isDark ? 'gray.800' : 'white'}>
          <ModalHeader>{t('visits.markNoShow') || 'Mark as No-Show'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>{t('visits.note') || 'Note'}</FormLabel>
              <Textarea
                value={noShowNote}
                onChange={(e) => setNoShowNote(e.target.value)}
                placeholder={t('visits.noShowNotePlaceholder') || 'Reason (optional)...'}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={noShowModal.onClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              colorScheme="red"
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

// Individual Visit Card
interface VisitCardProps {
  visit: Visit
  isDark: boolean
  isTodayView: boolean
  t: (key: string) => string
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
  onMarkInProgress,
  onMarkCompleted,
  onMarkNoShow,
  onReschedule,
  onOpenPatient,
}: VisitCardProps) {
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#E2E8F0'
  const textColor = isDark ? '#E2E8F0' : '#334155'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'
  
  const patientName = visit.patient
    ? `${visit.patient.firstName} ${visit.patient.lastName}`.trim()
    : 'Unknown Patient'
  
  const timeDisplay = visit.visitTime ? visit.visitTime.slice(0, 5) : '—'
  
  const isCompleted = visit.status === 'completed'
  const isNoShow = visit.status === 'no_show'
  const isRescheduled = visit.status === 'rescheduled'
  const canChangeStatus = isTodayView && visit.status === 'scheduled'
  const canMarkComplete = isTodayView && (visit.status === 'scheduled' || visit.status === 'in_progress')
  
  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      w="100%"
      opacity={isCompleted || isNoShow || isRescheduled ? 0.7 : 1}
    >
      {/* Header: Time + Status */}
      <Flex justify="space-between" align="center" mb={3}>
        <HStack spacing={2}>
          <Clock size={16} color={mutedColor} />
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            {timeDisplay}
          </Text>
        </HStack>
        <Badge colorScheme={getStatusColorScheme(visit.status)}>
          {getStatusLabel(visit.status, t)}
        </Badge>
      </Flex>
      
      {/* Patient Info */}
      <VStack align="stretch" spacing={2} mb={3}>
        <HStack spacing={2} onClick={onOpenPatient} cursor="pointer" _hover={{ opacity: 0.8 }}>
          <User size={14} color={mutedColor} />
          <Text
            fontSize="md"
            fontWeight="medium"
            color={textColor}
            textDecoration={isCompleted ? 'line-through' : 'none'}
          >
            {patientName}
          </Text>
        </HStack>
        
        {visit.patient?.phone && (
          <HStack spacing={2}>
            <Phone size={14} color={mutedColor} />
            <Text fontSize="sm" color={mutedColor}>
              {visit.patient.phone}
            </Text>
          </HStack>
        )}
        
        {visit.notes && (
          <HStack spacing={2} align="flex-start">
            <FileText size={14} color={mutedColor} style={{ marginTop: 2 }} />
            <Text fontSize="sm" color={mutedColor} noOfLines={2}>
              {visit.notes}
            </Text>
          </HStack>
        )}
        
        {isRescheduled && visit.rescheduledTo && (
          <HStack spacing={2}>
            <Calendar size={14} color={mutedColor} />
            <Text fontSize="sm" color={mutedColor}>
              → {visit.rescheduledTo} {visit.rescheduledTime ? `at ${visit.rescheduledTime.slice(0, 5)}` : ''}
            </Text>
          </HStack>
        )}
      </VStack>
      
      {/* Action Buttons */}
      {!isCompleted && !isNoShow && !isRescheduled && (
        <Flex gap={2} flexWrap="wrap">
          {canChangeStatus && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="yellow"
              leftIcon={<Play size={14} />}
              onClick={onMarkInProgress}
            >
              {t('visits.actions.start') || 'Start'}
            </Button>
          )}
          
          {canMarkComplete && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="green"
              leftIcon={<CheckCircle size={14} />}
              onClick={onMarkCompleted}
            >
              {t('visits.actions.complete') || 'Complete'}
            </Button>
          )}
          
          {isTodayView && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              leftIcon={<XCircle size={14} />}
              onClick={onMarkNoShow}
            >
              {t('visits.actions.noShow') || 'No Show'}
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
            leftIcon={<RefreshCw size={14} />}
            onClick={onReschedule}
          >
            {t('visits.actions.reschedule') || 'Reschedule'}
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export default VisitsPage

