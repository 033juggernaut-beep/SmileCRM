/**
 * Floating add patient button - Exact match to Superdesign reference
 * - Fixed position bottom-right
 * - Blue background with shadow
 * - Icon + text (text hidden on mobile)
 */

import { Box, Text, useColorMode } from '@chakra-ui/react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

const MotionBox = motion.create(Box);

interface AddPatientFABProps {
  onClick: () => void;
}

export function AddPatientFAB({ onClick }: AddPatientFABProps) {
  const { t } = useLanguage();
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex={50}
      display="inline-flex"
      alignItems="center"
      gap="8px"
      px="16px"
      py="12px"
      bg="#3B82F6"
      color="white"
      fontSize="sm"
      fontWeight="medium"
      borderRadius="xl"
      boxShadow={isDark 
        ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' 
        : '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -4px rgba(59, 130, 246, 0.3)'
      }
      _hover={{ bg: '#2563EB' }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 2px #60A5FA, 0 0 0 4px rgba(59, 130, 246, 0.3)',
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s',
      }}
    >
      <Plus size={20} />
      <Text display={{ base: 'none', sm: 'inline' }}>
        {t('patients.addPatient')}
      </Text>
    </MotionBox>
  );
}

export default AddPatientFAB;

