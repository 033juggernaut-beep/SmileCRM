import type { ReactElement, ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

// =============================================
// 🎨 SUPER DASHBOARD CARD
// Medical blue theme action card with hover effects
// Based on superdesign-dashboard reference
// =============================================

// Blue accent colors (medical theme)
const BLUE_400 = '#60A5FA';
const BLUE_100 = 'rgba(59, 130, 246, 0.15)';
const BLUE_200 = 'rgba(59, 130, 246, 0.25)';

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
 * SuperDashboardCard - A modern card with medical blue theme.
 *
 * Features:
 * - Fixed height (180px) for uniform grid alignment
 * - Blue accent icons with subtle background
 * - Hover effect: slight lift, blue border glow
 * - Active/press state with scale effect
 * - Theme-aware (works on dark background)
 *
 * @example
 * <SuperDashboardCard
 *   icon={<Users />}
 *   title="Мои пациенты"
 *   description="Список всех пациентов"
 *   onClick={() => navigate('/patients')}
 * />
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
      h="180px"
      p={5}
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: 'rgba(59, 130, 246, 0.5)',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
        transform: 'translateY(-3px)',
      }}
      _active={{
        transform: 'scale(0.98)',
        bg: 'bg.surface2',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${BLUE_400}`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        // Blue icon hover state
        '&:hover .icon-box': {
          bg: BLUE_200,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="40px"
        h="40px"
        bg={BLUE_100}
        borderRadius="lg"
        flexShrink={0}
        color={BLUE_400}
        transition="background-color 0.2s ease"
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

      {/* Title */}
      <Text
        fontSize="md"
        fontWeight="semibold"
        color="text.primary"
        mt={3}
        lineHeight="short"
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
              <Text
                fontSize="xs"
                color="text.muted"
              >
                {stat.label}
              </Text>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={BLUE_400}
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
          color="text.secondary"
          mt={1}
          lineHeight="short"
        >
          {description}
        </Text>
      ) : null}

      {/* Custom children */}
      {children}
    </Box>
  );
}

/**
 * SuperStatisticsCard - A card variant for displaying statistics.
 *
 * Similar to SuperDashboardCard but with larger stat numbers.
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
      h="180px"
      p={5}
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        borderColor: 'rgba(59, 130, 246, 0.5)',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
        transform: 'translateY(-3px)',
      }}
      _active={{
        transform: 'scale(0.98)',
        bg: 'bg.surface2',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 3px ${BLUE_400}`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:hover .icon-box': {
          bg: BLUE_200,
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-box"
        align="center"
        justify="center"
        w="40px"
        h="40px"
        bg={BLUE_100}
        borderRadius="lg"
        flexShrink={0}
        color={BLUE_400}
        transition="background-color 0.2s ease"
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

      {/* Title + Stats at bottom */}
      <Box mt="auto">
        <Text
          fontSize="md"
          fontWeight="semibold"
          color="text.primary"
          mb={2}
          lineHeight="short"
        >
          {title}
        </Text>

        {/* Stats row with large numbers */}
        <Flex gap={4}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={index === 0 ? 'text.primary' : BLUE_400}
                lineHeight="1"
              >
                {stat.value}
              </Text>
              <Text
                fontSize="xs"
                color="text.muted"
                lineHeight="short"
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
