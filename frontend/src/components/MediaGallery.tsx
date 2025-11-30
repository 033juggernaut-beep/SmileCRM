import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { type MediaFile, mediaApi } from '../api/media'
import { PremiumCard } from './premium/PremiumCard'
import { PremiumButton } from './premium/PremiumButton'

type MediaGalleryProps = {
  patientId: string
}

export const MediaGallery = ({ patientId }: MediaGalleryProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const loadMediaFiles = async () => {
    console.log('[MediaGallery] Loading media files for patient:', patientId)
    setIsLoading(true)
    setError(null)
    try {
      const files = await mediaApi.getPatientMedia(patientId)
      console.log('[MediaGallery] Loaded files:', files)
      setMediaFiles(files)
    } catch (err) {
      console.error('[MediaGallery] Error loading files:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Ошибка загрузки медиафайлов',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('[MediaGallery] Component mounted, patientId:', patientId)
    void loadMediaFiles()
  }, [patientId])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение (JPEG, PNG, WebP)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast({
        title: 'Ошибка',
        description: 'Файл слишком большой. Максимум 10MB',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      await mediaApi.uploadPatientMedia(patientId, selectedFile)

      toast({
        title: 'Файл загружен',
        description: selectedFile.name,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Reload media files
      await loadMediaFiles()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить файл',
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteMedia = async (mediaId: string, fileName: string) => {
    // Ask for confirmation
    if (!window.confirm(`Удалить файл "${fileName}"?`)) {
      return
    }

    setDeletingId(mediaId)
    try {
      await mediaApi.deletePatientMedia(patientId, mediaId)
      
      toast({
        title: 'Файл удален',
        description: fileName,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      // Remove from list
      setMediaFiles((prev) => prev.filter((media) => media.id !== mediaId))
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось удалить файл',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Stack spacing={5}>
      {/* Upload Section */}
      <PremiumCard variant="elevated">
        <Stack spacing={4}>
          <Heading size="md" color="text.main">
            📷 Ավելացնել նկարը
          </Heading>

          <FormControl>
            <FormLabel fontWeight="semibold" color="text.main">
              Выберите изображение
            </FormLabel>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              size="lg"
            />
            <Text fontSize="xs" color="text.muted" mt={1}>
              Поддерживаются: JPEG, PNG, WebP (макс. 10MB)
            </Text>
          </FormControl>

          {previewUrl && selectedFile && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="text.main" mb={2}>
                Превью:
              </Text>
              <Box
                borderWidth="1px"
                borderColor="border.light"
                borderRadius="md"
                overflow="hidden"
                bg="white"
                p={2}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  maxH="200px"
                  objectFit="contain"
                  mx="auto"
                />
                <Text
                  fontSize="xs"
                  color="text.muted"
                  textAlign="center"
                  mt={2}
                >
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </Text>
              </Box>
            </Box>
          )}

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            <Button
              variant="outline"
              onClick={handleClearSelection}
              isDisabled={!selectedFile || isUploading}
              size="lg"
            >
              Отмена
            </Button>
            <PremiumButton
              onClick={handleUpload}
              isLoading={isUploading}
              isDisabled={!selectedFile}
              w="full"
            >
              Загрузить
            </PremiumButton>
          </SimpleGrid>
        </Stack>
      </PremiumCard>

      {/* Gallery Section */}
      <PremiumCard variant="elevated">
        <Stack spacing={4}>
          <Heading size="md" color="text.main">
            Медиафайлы пациента
          </Heading>

          {isLoading ? (
            <Box textAlign="center" py={6}>
              <Spinner size="lg" color="primary.500" />
              <Text color="text.muted" mt={3}>
                Загрузка...
              </Text>
            </Box>
          ) : mediaFiles.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Text fontSize="3xl" mb={2}>
                📷
              </Text>
              <Text color="text.muted">
                Для этого пациента еще нет медиафайлов.
              </Text>
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
              {mediaFiles.map((media) => (
                <MediaFileCard
                  key={media.id}
                  media={media}
                  onDelete={handleDeleteMedia}
                  isDeleting={deletingId === media.id}
                />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </PremiumCard>
    </Stack>
  )
}

type MediaFileCardProps = {
  media: MediaFile
  onDelete: (mediaId: string, fileName: string) => void
  isDeleting: boolean
}

const MediaFileCard = ({ media, onDelete, isDeleting }: MediaFileCardProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(media.id, media.fileName)
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="border.light"
      borderRadius="md"
      overflow="hidden"
      bg="white"
      transition="all 0.2s"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      position="relative"
    >
      <Box
        cursor="pointer"
        onClick={() => window.open(media.publicUrl, '_blank')}
      >
        <Box position="relative" h="150px" bg="bg.gray">
          <Image
            src={media.publicUrl}
            alt={media.fileName}
            objectFit="cover"
            w="full"
            h="full"
          />
        </Box>
        <Box p={3}>
          <Text
            fontSize="sm"
            fontWeight="semibold"
            color="text.main"
            noOfLines={1}
            title={media.fileName}
          >
            {media.fileName}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {formatFileSize(media.fileSize)}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {formatDate(media.createdAt)}
          </Text>
        </Box>
      </Box>
      
      <IconButton
        aria-label="Удалить файл"
        icon={<Text>🗑️</Text>}
        size="sm"
        colorScheme="red"
        position="absolute"
        top={2}
        right={2}
        onClick={handleDelete}
        isLoading={isDeleting}
        isDisabled={isDeleting}
      />
    </Box>
  )
}

