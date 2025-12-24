/**
 * Patients page header - Exact match to Superdesign reference
 * - Unified BackButton with consistent hover animation (uses Telegram native when available)
 * - Page title and subtitle
 * - max-w-4xl, px-4, pt-4, pb-4
 */

import { Box, Text, useColorMode } from '@chakra-ui/react';
import { useLanguage } from '../../context/LanguageContext';
import { BackButton } from '../patientCard/BackButton';
import { useTelegramBackButton } from '../../hooks/useTelegramBackButton';
import { useTelegramSafeArea } from '../../hooks/useTelegramSafeArea';

interface PatientsHeaderProps {
  onBack?: () => void;
}

export function PatientsHeader({ onBack }: PatientsHeaderProps) {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const isDark = colorMode === 'dark';

  // Telegram integration
  const { topInset } = useTelegramSafeArea();
  const { showFallbackButton } = useTelegramBackButton(onBack ?? (() => {}));

  const titleColor = isDark ? 'white' : '#1E293B';
  const subtitleColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Box w="100%" maxW="896px" mx="auto" px="16px" pt={topInset > 0 ? `${topInset + 16}px` : '16px'} pb="16px">
      {/* Back Button - only show if not in Telegram */}
      {showFallbackButton && (
        <Box mb="12px">
          <BackButton onClick={onBack} />
        </Box>
      )}

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
