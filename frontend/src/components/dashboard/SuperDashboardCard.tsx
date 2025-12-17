import type { ReactElement, ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

// =============================================
// 🎨 SUPER DASHBOARD CARD — LIGHT THEME (Superdesign)
// White cards with blue accent icons
// =============================================

// Light theme colors (forced, no theme tokens)
const LIGHT = {
  cardBg: '#FFFFFF',
  cardBorder: '#E6EEFF',
  cardShadow: '0 2px 12px rgba(47, 107, 255, 0.06)',
  cardHoverShadow: '0 8px 24px rgba(47, 107, 255, 0.12)',
  cardHoverBorder: '#C7D9FF',
  iconBg: '#EAF2FF',
  iconBgHover: '#DCE8FF',
  iconColor: '#2F6BFF',
  titleColor: '#0F172A',
  descriptionColor: '#64748B',
  statValueColor: '#2F6BFF',
  statLabelColor: '#94A3B8',
};

export interface SuperDashboardCardProps {
  /** Card title */
  title: string;
  /** Card description (shown if no stats) */
  description?: string;
  /** Lucide or Chakra icon element */
  icon: ReactElement;
  /** Click/tap handler */
  onClick?: () => void;
  /** Stats to display instead of description */
  stats?: Array<{ label: string; value: string | number }>;
  /** Custom content */
  children?: ReactNode;
}

/**
 * SuperDashboardCard - White card matching Superdesign light theme.
 *
 * Features:
 * - White background #FFFFFF
 * - Border #E6EEFF, radius 18px
 * - Icon box with #EAF2FF background, #2F6BFF icon
 * - Title #0F172A, description #64748B
 * - Soft hover effect with blue shadow
 */
export function SuperDashboardCard({
  title,
  description,
  icon,
  onClick,
  stats,
  children,
}: SuperDashboardCardProps) {
  const hasStats = stats && stats.length > 0;

  return (
    <Box
      as="button"
      onClick={onClick}
      w="100%"
      minH="150px"
      p={6}
      bg={LIGHT.cardBg}
      border="1px solid"
      borderColor={LIGHT.cardBorder}
      borderRadius="18px"
      boxShadow={LIGHT.cardShadow}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: LIGHT.cardHoverBorder,
        boxShadow: LIGHT.cardHoverShadow,
        transform: 'translateY(-2px)',
      }}
      _active={{
        transform: 'scale(0.98)',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${LIGHT.iconColor}40`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:hover .icon-box': {
          bg: LIGHT.iconBgHover,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="44px"
        h="44px"
        bg={LIGHT.iconBg}
        borderRadius="12px"
        flexShrink={0}
        color={LIGHT.iconColor}
        transition="background-color 0.2s ease"
        sx={{
          '& svg': {
            width: '22px',
            height: '22px',
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title */}
      <Text
        fontSize="md"
        fontWeight="semibold"
        color={LIGHT.titleColor}
        mt={4}
        lineHeight="1.3"
      >
        {title}
      </Text>

      {/* Description or Stats */}
      {hasStats ? (
        <Box mt="auto" pt={3}>
          {stats.map((stat, index) => (
            <Flex
              key={index}
              justify="space-between"
              align="center"
              mb={index < stats.length - 1 ? 1 : 0}
            >
              <Text fontSize="xs" color={LIGHT.statLabelColor}>
                {stat.label}
              </Text>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={LIGHT.statValueColor}
              >
                {stat.value}
              </Text>
            </Flex>
          ))}
        </Box>
      ) : description ? (
        <Text
          fontSize="sm"
          fontWeight="normal"
          color={LIGHT.descriptionColor}
          mt={1}
          lineHeight="1.4"
        >
          {description}
        </Text>
      ) : null}

      {children}
    </Box>
  );
}

/**
 * SuperStatisticsCard - Card variant for displaying statistics with large numbers.
 */
export interface SuperStatisticsCardProps {
  title: string;
  icon: ReactElement;
  stats: Array<{ value: string | number; label: string }>;
  onClick?: () => void;
}

export function SuperStatisticsCard({
  title,
  icon,
  stats,
  onClick,
}: SuperStatisticsCardProps) {
  return (
    <Box
      as="button"
      onClick={onClick}
      w="100%"
      minH="150px"
      p={6}
      bg={LIGHT.cardBg}
      border="1px solid"
      borderColor={LIGHT.cardBorder}
      borderRadius="18px"
      boxShadow={LIGHT.cardShadow}
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: LIGHT.cardHoverBorder,
        boxShadow: LIGHT.cardHoverShadow,
        transform: 'translateY(-2px)',
      }}
      _active={{
        transform: 'scale(0.98)',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${LIGHT.iconColor}40`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:hover .icon-box': {
          bg: LIGHT.iconBgHover,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="44px"
        h="44px"
        bg={LIGHT.iconBg}
        borderRadius="12px"
        flexShrink={0}
        color={LIGHT.iconColor}
        transition="background-color 0.2s ease"
        sx={{
          '& svg': {
            width: '22px',
            height: '22px',
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title + Stats at bottom */}
      <Box mt="auto">
        <Text
          fontSize="md"
          fontWeight="semibold"
          color={LIGHT.titleColor}
          mb={2}
          lineHeight="1.3"
        >
          {title}
        </Text>

        {/* Stats row with large numbers */}
        <Flex gap={5}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={index === 0 ? LIGHT.titleColor : LIGHT.statValueColor}
                lineHeight="1"
              >
                {stat.value}
              </Text>
              <Text
                fontSize="xs"
                color={LIGHT.statLabelColor}
                lineHeight="1.3"
                mt={0.5}
              >
                {stat.label}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

export default SuperDashboardCard;
