/**
 * DashboardCard - Superdesign Blue Theme (Light Mode Forced)
 * 
 * Features:
 * - Fixed height 180px
 * - White background, blue-100 border
 * - Blue shadow
 * - Icon box with blue-100 bg, blue-600 icon
 * - Hover: lift, border-blue-400, stronger shadow
 * - Stats variant with label/value rows
 */

import type { ReactElement } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// =============================================
// 🎨 LIGHT THEME COLORS (Superdesign Reference)
// =============================================
const COLORS = {
  cardBg: '#ffffff',
  cardBorder: '#dbeafe',          // blue-100
  cardBorderHover: '#60a5fa',     // blue-400
  cardShadow: 'rgba(239, 246, 255, 1)',     // blue-50
  cardShadowHover: 'rgba(219, 234, 254, 1)', // blue-100
  iconBg: '#dbeafe',              // blue-100
  iconBgHover: '#bfdbfe',         // blue-200
  iconColor: '#2563eb',           // blue-600
  titleColor: '#1e293b',          // slate-800
  descriptionColor: '#64748b',    // slate-500
  statLabelColor: '#94a3b8',      // slate-400
  statValueColor: '#2563eb',      // blue-600
};

// Motion wrapper for hover animation
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
  const hasStats = stats && stats.length > 0;

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      w="100%"
      h="180px"                   // Fixed height
      p={5}                       // p-5 = 20px
      bg={COLORS.cardBg}
      border="1px solid"
      borderColor={COLORS.cardBorder}
      borderRadius="12px"         // rounded-xl
      boxShadow={`0 4px 6px -1px ${COLORS.cardShadow}, 0 2px 4px -2px ${COLORS.cardShadow}`}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      whileHover={{ y: -3 }}
      style={{ transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
      _hover={{
        borderColor: COLORS.cardBorderHover,
        boxShadow: `0 10px 15px -3px ${COLORS.cardShadowHover}, 0 4px 6px -4px ${COLORS.cardShadowHover}`,
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${COLORS.iconColor}40`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:hover .icon-box': {
          bg: COLORS.iconBgHover,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="40px"                  // w-10
        h="40px"                  // h-10
        bg={COLORS.iconBg}
        borderRadius="8px"        // rounded-lg
        flexShrink={0}
        color={COLORS.iconColor}
        transition="background-color 0.2s ease"
        sx={{
          '& svg': {
            width: '24px',        // w-6
            height: '24px',       // h-6
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title */}
      <Text
        fontSize="1rem"           // text-base
        fontWeight="semibold"
        color={COLORS.titleColor}
        mt={3}
        lineHeight="1.4"
      >
        {title}
      </Text>

      {/* Description or Stats */}
      {hasStats ? (
        <Box mt="auto" pt={2}>
          {stats.map((stat, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              mb={index < stats.length - 1 ? 1 : 0}
            >
              <Text fontSize="0.75rem" color={COLORS.statLabelColor}>
                {stat.label}
              </Text>
              <Text
                fontSize="0.875rem"
                fontWeight="semibold"
                color={COLORS.statValueColor}
              >
                {stat.value}
              </Text>
            </Flex>
          ))}
        </Box>
      ) : description ? (
        <Text
          fontSize="0.875rem"     // text-sm
          fontWeight="normal"
          color={COLORS.descriptionColor}
          mt={1}
          lineHeight="1.4"
        >
          {description}
        </Text>
      ) : null}
    </MotionBox>
  );
}

export default DashboardCard;
