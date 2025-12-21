/**
 * Dashboard action card - Exact match to Superdesign reference
 * - Fixed height 180px for uniform 2x2 grid
 * - Light: bg-white, border-blue-100, shadow-md shadow-blue-50
 * - Dark: bg-slate-800/70, border-slate-700/50
 * - Hover: border-blue-400 (light) / border-blue-500/50 (dark), lift -3px
 */

import type { ReactElement } from 'react';
import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

export interface StatItem {
  label: string;
  value: string | number;
}

export interface DashboardCardProps {
  icon: ReactElement;
  title: string;
  description?: string;
  stats?: StatItem[];
  onClick?: () => void;
}

export function DashboardCard({
  icon,
  title,
  description,
  stats,
  onClick,
}: DashboardCardProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const hasStats = stats && stats.length > 0;

  // Exact colors from reference
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white';
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE'; // blue-100
  const borderHoverColor = isDark ? 'rgba(59, 130, 246, 0.5)' : '#60A5FA'; // blue-400
  const shadow = isDark 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)'
    : '0 4px 6px -1px rgba(239, 246, 255, 1), 0 2px 4px -2px rgba(239, 246, 255, 1)';
  const shadowHover = isDark 
    ? '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -4px rgba(59, 130, 246, 0.1)'
    : '0 10px 15px -3px rgba(219, 234, 254, 1), 0 4px 6px -4px rgba(219, 234, 254, 1)';
  
  const iconBoxBg = isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE'; // blue-100
  const iconBoxHover = isDark ? 'rgba(59, 130, 246, 0.25)' : '#BFDBFE'; // blue-200
  const iconColor = isDark ? '#60A5FA' : '#2563EB'; // blue-400 / blue-600
  
  const titleColor = isDark ? 'white' : '#1E293B'; // slate-800
  const bodyColor = isDark ? '#94A3B8' : '#64748B'; // slate-400 / slate-500
  const mutedColor = isDark ? '#64748B' : '#94A3B8'; // slate-500 / slate-400
  const accentColor = isDark ? '#60A5FA' : '#2563EB'; // blue-400 / blue-600

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      w="100%"
      h="180px"
      p="20px"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl" // 12px
      boxShadow={shadow}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      _hover={{
        borderColor: borderHoverColor,
        boxShadow: shadowHover,
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.4)`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover .icon-box': {
          bg: iconBoxHover,
        },
      }}
    >
      {/* Icon Container - w-10 h-10 rounded-lg */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="40px"
        h="40px"
        bg={iconBoxBg}
        borderRadius="lg" // 8px
        flexShrink={0}
        color={iconColor}
        transition="background-color 0.2s"
        sx={{
          '& svg': {
            width: '24px',
            height: '24px',
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title - text-base font-semibold mt-3 */}
      <Text
        fontSize="md" // 16px
        fontWeight="semibold"
        color={titleColor}
        mt="12px"
        lineHeight="1.4"
      >
        {title}
      </Text>

      {/* Description or Stats */}
      {hasStats ? (
        <Box mt="auto" pt="8px">
          {stats.map((stat, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              mb={index < stats.length - 1 ? '4px' : '0'}
            >
              {/* text-xs for label */}
              <Text fontSize="xs" color={mutedColor}>
                {stat.label}
              </Text>
              {/* text-sm font-semibold for value */}
              <Text fontSize="sm" fontWeight="semibold" color={accentColor}>
                {stat.value}
              </Text>
            </Flex>
          ))}
        </Box>
      ) : description ? (
        // text-sm font-normal mt-1
        <Text
          fontSize="sm"
          fontWeight="normal"
          color={bodyColor}
          mt="4px"
          lineHeight="1.4"
        >
          {description}
        </Text>
      ) : null}
    </MotionBox>
  );
}

export default DashboardCard;
