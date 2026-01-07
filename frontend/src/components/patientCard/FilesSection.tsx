/**
 * Medical files section - X-rays, photos, documents
 * - Grid of file thumbnails with type labels (2 columns on mobile)
 * - Empty state with helpful message
 * - Add file button
 * 
 * Android WebView scroll fix:
 * - No fixed height on files container - let page scroll naturally
 * - Uses -webkit-overflow-scrolling: touch for iOS momentum scroll
 * - overscrollBehavior: contain prevents scroll propagation issues
 */

import { Box, Flex, Text, Button, Grid, useColorMode, Image } from '@chakra-ui/react'
import { Plus, Image as ImageIcon, FileText, Scan, FolderOpen } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { useLanguage } from '../../context/LanguageContext'

interface MedicalFile {
  id: string
  name: string
  type: 'xray' | 'photo' | 'document'
  url?: string
}

interface FilesSectionProps {
  files: MedicalFile[]
  onAddFile: () => void
  onFileClick?: (file: MedicalFile) => void
  defaultOpen?: boolean
}

function FileIcon({ type, isDark }: { type: MedicalFile['type']; isDark: boolean }) {
  const iconProps = {
    w: 6,
    h: 6,
    color: isDark ? 'gray.400' : 'gray.500',
  }

  switch (type) {
    case 'xray':
      return <Box as={Scan} {...iconProps} />
    case 'photo':
      return <Box as={ImageIcon} {...iconProps} />
    default:
      return <Box as={FileText} {...iconProps} />
  }
}

export function FilesSection({
  files,
  onAddFile,
  onFileClick,
  defaultOpen = false,
}: FilesSectionProps) {
  const { t } = useLanguage()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'

  const isEmpty = files.length === 0

  const addButton = (
    <Button
      onClick={(e) => {
        e.stopPropagation()
        onAddFile()
      }}
      size="xs"
      fontWeight="medium"
      leftIcon={<Box as={Plus} w={3} h={3} />}
      bg={isDark ? 'rgba(59, 130, 246, 0.2)' : 'blue.50'}
      color={isDark ? 'blue.400' : 'blue.600'}
      _hover={{
        bg: isDark ? 'rgba(59, 130, 246, 0.3)' : 'blue.100',
      }}
      // Ensure button text doesn't overflow on small screens
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {t('patientCard.addFile')}
    </Button>
  )

  return (
    <CollapsibleSection
      title={t('patientCard.files')}
      defaultOpen={defaultOpen}
      headerAction={addButton}
    >
      {isEmpty ? (
        // Enhanced empty state with icon and clear messaging
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={8}
          gap={3}
        >
          <Box
            as={FolderOpen}
            w={10}
            h={10}
            color={isDark ? 'gray.500' : 'gray.400'}
          />
          <Text
            fontSize="sm"
            color={isDark ? 'gray.400' : 'gray.500'}
            textAlign="center"
          >
            {t('patientCard.noFiles')}
          </Text>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            leftIcon={<Box as={Plus} w={4} h={4} />}
            onClick={onAddFile}
          >
            {t('patientCard.addFile')}
          </Button>
        </Flex>
      ) : (
        // Files grid container - NO fixed height, allows natural page scroll
        // This is critical for Android Telegram WebView which has scroll issues with nested containers
        <Box
          // Android WebView scroll optimization
          sx={{
            WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
            overscrollBehavior: 'contain', // Prevents scroll chaining to parent
          }}
        >
          <Grid
            templateColumns={{
              base: 'repeat(2, 1fr)', // 2 columns on mobile - per requirements
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {files.map((file) => {
              const isImage = file.type === 'photo' || file.type === 'xray'
              
              return (
                <Flex
                  key={file.id}
                  as="button"
                  direction="column"
                  align="center"
                  gap={2}
                  p={3}
                  borderRadius="xl"
                  transition="all 0.2s"
                  bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
                  _hover={{
                    bg: isDark ? 'rgba(51, 65, 85, 0.6)' : 'gray.100',
                    transform: 'scale(1.02)',
                  }}
                  _active={{
                    transform: 'scale(0.98)',
                  }}
                  cursor="pointer"
                  border="none"
                  onClick={() => onFileClick?.(file)}
                  // Touch-friendly sizing for mobile
                  minH="100px"
                >
                  {/* Thumbnail or Icon */}
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg={isDark ? 'gray.600' : 'gray.200'}
                    overflow="hidden"
                    flexShrink={0}
                  >
                    {isImage && file.url ? (
                      <Image
                        src={file.url}
                        alt={file.name}
                        objectFit="cover"
                        w="full"
                        h="full"
                        fallback={<FileIcon type={file.type} isDark={isDark} />}
                      />
                    ) : (
                      <FileIcon type={file.type} isDark={isDark} />
                    )}
                  </Flex>

                  {/* File Name - proper text wrapping for Armenian/Latin */}
                  <Text
                    fontSize="xs"
                    textAlign="center"
                    fontWeight="medium"
                    w="full"
                    color={isDark ? 'gray.200' : 'gray.700'}
                    // Text wrapping fixes for Armenian and mixed content
                    noOfLines={2}
                    wordBreak="break-word"
                    overflowWrap="anywhere"
                    lineHeight="1.3"
                  >
                    {file.name}
                  </Text>
                </Flex>
              )
            })}
          </Grid>
        </Box>
      )}
    </CollapsibleSection>
  )
}

export default FilesSection

