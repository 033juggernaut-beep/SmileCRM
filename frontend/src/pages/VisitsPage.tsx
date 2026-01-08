/**
 * VisitsPage - Visits management page
 * Matches PatientsListPage design pattern exactly
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
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  FileText,
} from 'lucide-react'
import { Header, BackgroundPattern, Footer } from '../components/dashboard'
import { BackButton } from '../components/patientCard/BackButton'
import { useTelegramBackButton } from '../hooks/useTelegramBackButton'
import { useTelegramSafeArea } from '../hooks/useTelegramSafeArea'
import { useLanguage } from '../context/LanguageContext'
import { visitsApi, type Visit, type VisitStatus } from '../api/visits'
import { DateInput } from '../components/DateInput'

const MotionBox = motion.create(Box)

// Animation variants (matching PatientsList)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
}

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

// Get status styles - CRM blue/neutral palette
const getStatusStyles = (status: VisitStatus, isDark: boolean) => {
  const styles: Record<VisitStatus, { bg: string; color: string }> = {
    scheduled: {
      bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
      color: isDark ? '#60A5FA' : '#2563EB',
    },
    in_progress: {
      bg: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      color: isDark ? '#FBBF24' : '#D97706',
    },
    completed: {
      bg: isDark ? '#334155' : '#F1F5F9',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    no_show: {
      bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      color: isDark ? '#F87171' : '#DC2626',
    },
    rescheduled: {
      bg: isDark ? '#334155' : '#F1F5F9',
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
  
  // Telegram integration
  const { topInset } = useTelegramSafeArea()
  const { showFallbackButton } = useTelegramBackButton(() => navigate('/home'))
  
  // State
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
  
  // Modals
  const rescheduleModal = useDisclosure()
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleNote, setRescheduleNote] = useState('')
  const [isRescheduling, setIsRescheduling] = useState(false)
  
  const noShowModal = useDisclosure()
  const [noShowNote, setNoShowNote] = useState('')
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)
  
  // Computed
  const dateStr = formatDateApi(currentDate)
  const displayDate = formatDate(dateStr, language)
  const isTodayView = isToday(dateStr)
  
  // Colors (matching PatientsListPage & PatientRowCard)
  const pageBg = isDark
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))'
  
  const titleColor = isDark ? 'white' : '#1E293B'
  const subtitleColor = isDark ? '#94A3B8' : '#64748B'
  const mutedColor = isDark ? '#64748B' : '#94A3B8'
  const accentColor = isDark ? '#60A5FA' : '#2563EB'
  
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'white'
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#EFF6FF'
  const borderHover = isDark ? 'rgba(59, 130, 246, 0.5)' : '#93C5FD'
  const shadow = isDark ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
  
  // Fetch visits
  const fetchVisits = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await visitsApi.getVisitsByDate(dateStr)
      setVisits(response.visits)
    } catch (err) {
      console.error('Failed to fetch visits:', err)
      setError(t('visits.fetchError') || 'Failed to load visits')
    } finally {
      setIsLoading(false)
    }
  }, [dateStr, t])
  
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
  
  // Status handlers
  const updateStatus = async (visit: Visit, status: VisitStatus, note?: string, rescheduledTo?: string, rescheduledTime?: string) => {
    try {
      await visitsApi.updateStatus(visit.id, { status, note, rescheduledTo, rescheduledTime })
      toast({ title: t('visits.statusUpdated') || 'Status updated', status: 'success', duration: 2000 })
      fetchVisits()
    } catch (err) {
      console.error('Failed to update status:', err)
      toast({ title: t('common.error'), status: 'error', duration: 3000 })
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
  
  const handleRetry = () => {
    fetchVisits()
  }
  
  const footerLinks = [
    { label: t('home.subscription'), onClick: () => navigate('/subscription') },
    { label: t('home.help'), onClick: () => navigate('/help') },
    { label: t('home.privacy'), onClick: () => navigate('/privacy') },
  ]
  
  return (
    <Box
      minH="100dvh"
      w="100%"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      overflowY="auto"
      overflowX="hidden"
      position="relative"
      transition="background 0.3s"
      sx={{
        '@supports not (min-height: 100dvh)': {
          minH: 'var(--app-height, 100vh)',
        },
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />

      {/* Main Content */}
      <Box position="relative" zIndex={10} display="flex" flexDir="column" flex="1">
        {/* Header - Same as Dashboard/Patients */}
        <Header notificationCount={3} />

        {/* Page Header (matching PatientsHeader) */}
        <Box w="100%" maxW="896px" mx="auto" px="16px" pt={topInset > 0 ? `${topInset + 16}px` : '16px'} pb="16px">
          {showFallbackButton && (
            <Box mb="12px">
              <BackButton onClick={() => navigate('/home')} />
            </Box>
          )}
          <Text as="h1" fontSize="2xl" fontWeight="semibold" letterSpacing="tight" color={titleColor}>
            {t('visits.pageTitle') || 'Visits'}
          </Text>
          <Text fontSize="sm" color={subtitleColor} mt="4px">
            {t('visits.subtitle') || 'Manage your appointments'}
          </Text>
        </Box>

        {/* Date Navigation Toolbar */}
        <Box w="100%" maxW="896px" mx="auto" px="16px" pb="16px">
          <Flex
            align="center"
            justify="space-between"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            boxShadow={shadow}
            px="12px"
            py="10px"
          >
            <IconButton
              aria-label="Previous day"
              icon={<ChevronLeft size={18} />}
              variant="ghost"
              size="sm"
              onClick={goToPreviousDay}
              color={mutedColor}
              _hover={{ color: accentColor }}
            />
            
            <VStack spacing={0}>
              <Text fontSize="sm" fontWeight="medium" color={titleColor}>
                {displayDate}
              </Text>
              {!isTodayView && (
                <Text
                  as="button"
                  fontSize="xs"
                  color={accentColor}
                  onClick={goToToday}
                  _hover={{ textDecoration: 'underline' }}
                >
                  {t('visits.goToToday') || 'Go to today'}
                </Text>
              )}
            </VStack>
            
            <IconButton
              aria-label="Next day"
              icon={<ChevronRight size={18} />}
              variant="ghost"
              size="sm"
              onClick={goToNextDay}
              color={mutedColor}
              _hover={{ color: accentColor }}
            />
          </Flex>
        </Box>

        {/* Main Content Area */}
        <Box as="main" flex="1" pb="96px">
          {/* Loading State */}
          {isLoading && (
            <Box w="100%" maxW="896px" mx="auto" px="16px">
              <VStack spacing="8px" align="stretch">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height="80px" borderRadius="xl" />
                ))}
              </VStack>
            </Box>
          )}

          {/* Error State (matching PatientsListPage) */}
          {error && !isLoading && (
            <Box w="100%" maxW="896px" mx="auto" px="16px" py="64px" textAlign="center">
              <Text fontSize="4xl" mb="16px">⚠️</Text>
              <Text fontWeight="semibold" fontSize="lg" color={isDark ? '#F87171' : '#DC2626'} mb="8px">
                {t('visits.loadError') || 'Failed to load visits'}
              </Text>
              <Text fontSize="sm" color={mutedColor} mb="24px">
                {error}
              </Text>
              <Box
                as="button"
                onClick={handleRetry}
                px="20px"
                py="10px"
                bg="#3B82F6"
                color="white"
                fontSize="sm"
                fontWeight="medium"
                borderRadius="xl"
                _hover={{ bg: '#2563EB' }}
                sx={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {t('common.tryAgain') || 'Try again'}
              </Box>
            </Box>
          )}

          {/* Empty State (matching CRM style) */}
          {!isLoading && !error && visits.length === 0 && (
            <Box w="100%" maxW="896px" mx="auto" px="16px">
              <Box
                bg={cardBg}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="xl"
                boxShadow={shadow}
                py="48px"
                textAlign="center"
              >
                <Calendar size={32} color={mutedColor} style={{ margin: '0 auto 12px' }} />
                <Text fontSize="sm" color={mutedColor}>
                  {t('visits.noVisitsOnDate') || 'No visits on this date'}
                </Text>
              </Box>
            </Box>
          )}

          {/* Visits List (matching PatientsList) */}
          {!isLoading && !error && visits.length > 0 && (
            <MotionBox
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              w="100%"
              maxW="896px"
              mx="auto"
              px="16px"
            >
              {/* Count */}
              <Text fontSize="xs" color={mutedColor} mb="12px">
                {visits.length} {t('visits.visitsCount') || 'visits'}
              </Text>
              
              <VStack spacing="8px" align="stretch">
                {visits.map((visit) => (
                  <MotionBox key={visit.id} variants={itemVariants}>
                    <VisitRowCard
                      visit={visit}
                      isDark={isDark}
                      isTodayView={isTodayView}
                      t={t}
                      cardBg={cardBg}
                      borderColor={borderColor}
                      borderHover={borderHover}
                      shadow={shadow}
                      titleColor={titleColor}
                      mutedColor={mutedColor}
                      accentColor={accentColor}
                      onMarkInProgress={() => handleMarkInProgress(visit)}
                      onMarkCompleted={() => handleMarkCompleted(visit)}
                      onMarkNoShow={() => handleOpenNoShowModal(visit)}
                      onReschedule={() => handleOpenRescheduleModal(visit)}
                      onOpenPatient={() => navigate(`/patients/${visit.patientId}`)}
                    />
                  </MotionBox>
                ))}
              </VStack>
            </MotionBox>
          )}
        </Box>

        {/* Footer */}
        <Footer links={footerLinks} />
      </Box>
      
      {/* Reschedule Modal */}
      <Modal isOpen={rescheduleModal.isOpen} onClose={rescheduleModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4} bg={isDark ? '#1E293B' : 'white'} borderRadius="xl">
          <ModalHeader fontSize="md" color={titleColor}>{t('visits.reschedule') || 'Reschedule Visit'}</ModalHeader>
          <ModalCloseButton color={mutedColor} />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color={titleColor}>{t('visits.newDate') || 'New Date'}</FormLabel>
                <DateInput
                  value={rescheduleDate}
                  onChange={setRescheduleDate}
                  placeholder={t('visits.newDate')}
                  minDate={new Date()}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={titleColor}>{t('visits.newTime') || 'New Time'}</FormLabel>
                <Input
                  type="time"
                  size="sm"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  borderColor={borderColor}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color={titleColor}>{t('visits.note') || 'Note'}</FormLabel>
                <Textarea
                  size="sm"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder={t('visits.rescheduleNotePlaceholder') || 'Reason for rescheduling...'}
                  rows={2}
                  borderColor={borderColor}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={rescheduleModal.onClose} color={mutedColor}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              bg={accentColor}
              color="white"
              size="sm"
              onClick={handleConfirmReschedule}
              isLoading={isRescheduling}
              isDisabled={!rescheduleDate}
              _hover={{ bg: '#2563EB' }}
            >
              {t('visits.confirmReschedule') || 'Reschedule'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* No-Show Modal */}
      <Modal isOpen={noShowModal.isOpen} onClose={noShowModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4} bg={isDark ? '#1E293B' : 'white'} borderRadius="xl">
          <ModalHeader fontSize="md" color={titleColor}>{t('visits.markNoShow') || 'Mark as No-Show'}</ModalHeader>
          <ModalCloseButton color={mutedColor} />
          <ModalBody>
            <FormControl>
              <FormLabel fontSize="sm" color={titleColor}>{t('visits.note') || 'Note'}</FormLabel>
              <Textarea
                size="sm"
                value={noShowNote}
                onChange={(e) => setNoShowNote(e.target.value)}
                placeholder={t('visits.noShowNotePlaceholder') || 'Reason (optional)...'}
                rows={2}
                borderColor={borderColor}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={2}>
            <Button variant="ghost" size="sm" onClick={noShowModal.onClose} color={mutedColor}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              bg="#DC2626"
              color="white"
              size="sm"
              onClick={handleConfirmNoShow}
              isLoading={isMarkingNoShow}
              _hover={{ bg: '#B91C1C' }}
            >
              {t('visits.confirmNoShow') || 'Confirm No-Show'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// Visit Row Card (matching PatientRowCard style exactly)
interface VisitRowCardProps {
  visit: Visit
  isDark: boolean
  isTodayView: boolean
  t: (key: string) => string
  cardBg: string
  borderColor: string
  borderHover: string
  shadow: string
  titleColor: string
  mutedColor: string
  accentColor: string
  onMarkInProgress: () => void
  onMarkCompleted: () => void
  onMarkNoShow: () => void
  onReschedule: () => void
  onOpenPatient: () => void
}

function VisitRowCard({
  visit,
  isDark,
  isTodayView,
  t,
  cardBg,
  borderColor,
  borderHover,
  shadow,
  titleColor,
  mutedColor,
  accentColor,
  onMarkInProgress,
  onMarkCompleted,
  onMarkNoShow,
  onReschedule,
  onOpenPatient,
}: VisitRowCardProps) {
  const statusStyles = getStatusStyles(visit.status, isDark)
  const shadowHover = isDark ? 'none' : '0 4px 6px -1px rgba(239, 246, 255, 1)'
  
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
    <MotionBox
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow={shadow}
      p="16px"
      w="100%"
      opacity={isInactive ? 0.6 : 1}
      _hover={{
        borderColor: borderHover,
        boxShadow: shadowHover,
        bg: isDark ? 'rgba(30, 41, 59, 0.8)' : 'white',
      }}
      sx={{
        transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
      }}
    >
      <Flex align="center" gap="16px">
        {/* Time Avatar */}
        <Flex
          align="center"
          justify="center"
          w="40px"
          h="40px"
          borderRadius="full"
          bg={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
          color={accentColor}
          fontSize="xs"
          fontWeight="bold"
          flexShrink={0}
        >
          {timeDisplay}
        </Flex>

        {/* Visit Info */}
        <Box flex="1" minW={0}>
          <Flex align="center" gap="8px" flexWrap="wrap">
            {/* Patient Name */}
            <Text
              as="button"
              fontWeight="medium"
              color={titleColor}
              onClick={onOpenPatient}
              textDecoration={isCompleted ? 'line-through' : 'none'}
              _hover={{ color: accentColor }}
              maxW="200px"
              isTruncated
            >
              {patientName}
            </Text>

            {/* Status Badge */}
            <Box
              px="8px"
              py="2px"
              fontSize="xs"
              fontWeight="medium"
              borderRadius="full"
              bg={statusStyles.bg}
              color={statusStyles.color}
            >
              {getStatusLabel(visit.status, t)}
            </Box>
          </Flex>

          {/* Secondary Info */}
          <HStack spacing="12px" mt="4px">
            {visit.patient?.phone && (
              <HStack spacing="4px" fontSize="xs" color={mutedColor}>
                <Phone size={12} />
                <Text display={{ base: 'none', sm: 'block' }}>{visit.patient.phone}</Text>
              </HStack>
            )}
            {visit.notes && (
              <HStack spacing="4px" fontSize="xs" color={mutedColor}>
                <FileText size={12} />
                <Text noOfLines={1} maxW="150px">{visit.notes}</Text>
              </HStack>
            )}
            {isRescheduled && visit.rescheduledTo && (
              <HStack spacing="4px" fontSize="xs" color={mutedColor}>
                <Calendar size={12} />
                <Text>→ {visit.rescheduledTo}</Text>
              </HStack>
            )}
          </HStack>
        </Box>

        {/* Desktop Actions */}
        {!isInactive && (
          <HStack spacing="4px" display={{ base: 'none', md: 'flex' }}>
            {canChangeStatus && (
              <IconButton
                aria-label="Start"
                icon={<Play size={14} />}
                size="xs"
                variant="ghost"
                color={mutedColor}
                onClick={onMarkInProgress}
                _hover={{ color: '#D97706', bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
              />
            )}
            {canMarkComplete && (
              <IconButton
                aria-label="Complete"
                icon={<CheckCircle size={14} />}
                size="xs"
                variant="ghost"
                color={mutedColor}
                onClick={onMarkCompleted}
                _hover={{ color: accentColor, bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
              />
            )}
            {isTodayView && (
              <IconButton
                aria-label="No Show"
                icon={<XCircle size={14} />}
                size="xs"
                variant="ghost"
                color={mutedColor}
                onClick={onMarkNoShow}
                _hover={{ color: '#DC2626', bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
              />
            )}
            <IconButton
              aria-label="Reschedule"
              icon={<RefreshCw size={14} />}
              size="xs"
              variant="ghost"
              color={mutedColor}
              onClick={onReschedule}
              _hover={{ color: accentColor, bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
            />
          </HStack>
        )}
      </Flex>

      {/* Mobile Actions */}
      {!isInactive && (
        <Flex gap="6px" mt="12px" display={{ base: 'flex', md: 'none' }} flexWrap="wrap">
          {canChangeStatus && (
            <Button size="xs" variant="ghost" leftIcon={<Play size={12} />} onClick={onMarkInProgress} color={mutedColor}>
              {t('visits.actions.start') || 'Start'}
            </Button>
          )}
          {canMarkComplete && (
            <Button size="xs" variant="ghost" leftIcon={<CheckCircle size={12} />} onClick={onMarkCompleted} color={mutedColor}>
              {t('visits.actions.complete') || 'Done'}
            </Button>
          )}
          {isTodayView && (
            <Button size="xs" variant="ghost" leftIcon={<XCircle size={12} />} onClick={onMarkNoShow} color={mutedColor}>
              {t('visits.actions.noShow') || 'No Show'}
            </Button>
          )}
          <Button size="xs" variant="ghost" leftIcon={<RefreshCw size={12} />} onClick={onReschedule} color={mutedColor}>
            {t('visits.actions.reschedule') || 'Reschedule'}
          </Button>
        </Flex>
      )}
    </MotionBox>
  )
}

export default VisitsPage
