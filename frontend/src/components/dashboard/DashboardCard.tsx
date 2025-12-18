/**
 * DashboardCard - Superdesign exact copy
 * White bg, blue-100 border, blue icons
 * Using exact tokens from designTokens.ts
 */

import type { ReactElement } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { DASHBOARD_TOKENS as T } from './designTokens';

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
    <Box
      as="button"
      onClick={onClick}
      w="100%"
      h={T.cardHeight}
      p={T.cardPadding}
      bg={T.cardBg}
      border="1px solid"
      borderColor={T.borderLight}
      borderRadius={T.cardRadius}
      boxShadow={T.shadowCard}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      style={{ transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' }}
      _hover={{
        transform: 'translateY(-3px)',
        borderColor: T.borderHover,
        boxShadow: T.shadowCardHover,
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${T.iconColor}40`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:hover .icon-box': {
          bg: T.iconBoxBgHover,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w={T.iconBoxSize}
        h={T.iconBoxSize}
        bg={T.iconBoxBg}
        borderRadius={T.iconBoxRadius}
        flexShrink={0}
        color={T.iconColor}
        style={{ transition: 'background-color 0.2s ease' }}
        sx={{
          '& svg': {
            width: T.iconSize,
            height: T.iconSize,
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title */}
      <Text
        fontSize={T.fontBase}
        fontWeight={T.weightSemibold}
        color={T.textTitle}
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
              <Text fontSize={T.fontXs} color={T.textMuted}>
                {stat.label}
              </Text>
              <Text fontSize={T.fontSm} fontWeight={T.weightSemibold} color={T.textAccent}>
                {stat.value}
              </Text>
            </Flex>
          ))}
        </Box>
      ) : description ? (
        <Text
          fontSize={T.fontSm}
          fontWeight={T.weightNormal}
          color={T.textBody}
          mt="4px"
          lineHeight="1.4"
        >
          {description}
        </Text>
      ) : null}
    </Box>
  );
}

export default DashboardCard;
