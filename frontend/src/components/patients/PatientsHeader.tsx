/**
 * Patients page header - Exact match to Superdesign reference
 * - Back button with hover animation
 * - Page title and subtitle
 * - max-w-4xl, px-4, pt-4, pb-4
 */

import { Box, Text, useColorMode } from '@chakra-ui/react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PatientsHeaderProps {
  onBack?: () => void;
}

export function PatientsHeader({ onBack }: PatientsHeaderProps) {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const isDark = colorMode === 'dark';

  const backColor = isDark ? '#94A3B8' : '#64748B';
  const backHoverColor = isDark ? '#60A5FA' : '#2563EB';
  const titleColor = isDark ? 'white' : '#1E293B';
  const subtitleColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Box w="100%" maxW="896px" mx="auto" px="16px" pt="16px" pb="16px">
      {/* Back Button */}
      <Box
        as="button"
        onClick={onBack}
        display="inline-flex"
        alignItems="center"
        gap="4px"
        fontSize="sm"
        fontWeight="medium"
        color={backColor}
        mb="12px"
        transition="color 0.15s"
        _hover={{
          color: backHoverColor,
          '& .back-text': { textDecoration: 'underline' },
          '& .back-icon': { transform: 'translateX(-2px)' },
        }}
        sx={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <Box
          as={ChevronLeft}
          className="back-icon"
          size={16}
          transition="transform 0.15s"
        />
        <Text as="span" className="back-text" textUnderlineOffset="2px">
          {t('common.back')}
        </Text>
      </Box>

      {/* Title */}
      <Text
        as="h1"
        fontSize="2xl" // 24px
        fontWeight="semibold"
        letterSpacing="tight"
        color={titleColor}
      >
        {t('patients.title')}
      </Text>

      {/* Subtitle */}
      <Text
        fontSize="sm"
        color={subtitleColor}
        mt="4px"
      >
        {t('patients.subtitle')}
      </Text>
    </Box>
  );
}

export default PatientsHeader;

