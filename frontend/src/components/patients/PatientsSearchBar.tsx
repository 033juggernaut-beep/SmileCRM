/**
 * Search and filter bar - Exact match to Superdesign reference
 * - Search input with icon
 * - Segment filter (All / VIP only)
 * - Status filter (All / In progress / Completed)
 */

import { Box, Flex, Input, Select, useColorMode } from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

type PatientStatus = 'in_progress' | 'completed';
type SegmentFilter = 'all' | 'vip';

interface PatientsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | PatientStatus;
  onStatusFilterChange: (status: 'all' | PatientStatus) => void;
  segmentFilter: SegmentFilter;
  onSegmentFilterChange: (segment: SegmentFilter) => void;
}

export function PatientsSearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  segmentFilter,
  onSegmentFilterChange,
}: PatientsSearchBarProps) {
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const isDark = colorMode === 'dark';

  // Colors from reference
  const inputBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white';
  const borderColor = isDark ? '#334155' : '#DBEAFE'; // blue-100
  const focusBorder = isDark ? '#3B82F6' : '#60A5FA'; // blue-500/400
  const textColor = isDark ? 'white' : '#1E293B';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const iconColor = isDark ? '#64748B' : '#94A3B8';

  const inputStyles = {
    bg: inputBg,
    border: '1px solid',
    borderColor: borderColor,
    color: textColor,
    borderRadius: 'xl',
    fontSize: 'sm',
    transition: 'all 0.2s',
    _placeholder: { color: placeholderColor },
    _hover: { borderColor: focusBorder },
    _focus: {
      borderColor: focusBorder,
      boxShadow: isDark 
        ? '0 0 0 1px rgba(59, 130, 246, 0.3)' 
        : '0 0 0 1px rgba(191, 219, 254, 1)',
      outline: 'none',
    },
    ...(isDark ? {} : { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }),
  };

  return (
    <Box w="100%" maxW="896px" mx="auto" px="16px" pb="16px">
      <Flex 
        direction={{ base: 'column', sm: 'row' }} 
        gap="12px"
      >
        {/* Search Input */}
        <Box position="relative" flex="1">
          <Box
            position="absolute"
            left="12px"
            top="50%"
            transform="translateY(-50%)"
            color={iconColor}
            zIndex={1}
          >
            <Search size={16} />
          </Box>
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('patients.searchPlaceholder')}
            pl="40px"
            pr="16px"
            py="10px"
            h="auto"
            {...inputStyles}
          />
        </Box>

        {/* Segment Filter */}
        <Select
          value={segmentFilter}
          onChange={(e) => onSegmentFilterChange(e.target.value as SegmentFilter)}
          w={{ base: '100%', sm: 'auto' }}
          minW="120px"
          py="10px"
          h="auto"
          cursor="pointer"
          {...inputStyles}
        >
          <option value="all">{t('patients.segmentAll')}</option>
          <option value="vip">{t('patients.segmentVip')}</option>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as 'all' | PatientStatus)}
          w={{ base: '100%', sm: 'auto' }}
          minW="140px"
          py="10px"
          h="auto"
          cursor="pointer"
          {...inputStyles}
        >
          <option value="all">{t('patients.allStatuses')}</option>
          <option value="in_progress">{t('patients.statusInProgress')}</option>
          <option value="completed">{t('patients.statusCompleted')}</option>
        </Select>
      </Flex>
    </Box>
  );
}

export default PatientsSearchBar;

