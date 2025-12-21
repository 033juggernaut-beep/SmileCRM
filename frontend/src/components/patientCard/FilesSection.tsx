/**
 * Medical files section - X-rays, photos, documents
 * - Grid of file thumbnails with type labels
 * - Empty state
 * - Add file button
 */

import { Box, Flex, Text, Button, Grid, useColorMode } from '@chakra-ui/react'
import { Plus, Image, FileText, Scan } from 'lucide-react'
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
      return <Box as={Image} {...iconProps} />
    default:
      return <Box as={FileText} {...iconProps} />
  }
}

export function FilesSection({
  files,
  onAddFile,
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
        <Box py={6} textAlign="center">
          <Text
            fontSize="sm"
            color={isDark ? 'gray.400' : 'gray.500'}
          >
            {t('patientCard.noFiles')}
          </Text>
        </Box>
      ) : (
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          }}
          gap={3}
        >
          {files.map((file) => (
            <Flex
              key={file.id}
              as="button"
              direction="column"
              align="center"
              gap={2}
              p={3}
              borderRadius="xl"
              transition="colors 0.2s"
              bg={isDark ? 'rgba(51, 65, 85, 0.4)' : 'gray.50'}
              _hover={{
                bg: isDark ? 'rgba(51, 65, 85, 0.6)' : 'gray.100',
              }}
              cursor="pointer"
              border="none"
            >
              {/* Icon */}
              <Flex
                w={12}
                h={12}
                borderRadius="lg"
                align="center"
                justify="center"
                bg={isDark ? 'gray.600' : 'gray.200'}
              >
                <FileIcon type={file.type} isDark={isDark} />
              </Flex>

              {/* File Name */}
              <Text
                fontSize="xs"
                textAlign="center"
                fontWeight="medium"
                isTruncated
                w="full"
                color={isDark ? 'gray.200' : 'gray.700'}
              >
                {file.name}
              </Text>
            </Flex>
          ))}
        </Grid>
      )}
    </CollapsibleSection>
  )
}

export default FilesSection

