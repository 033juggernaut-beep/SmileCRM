import type { ReactElement } from 'react';
import {
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';

// Teal accent color (default icon color from design)
const TEAL_ACCENT = '#3B9B8C';
const TEAL_ALPHA = 'rgba(59, 155, 140, 0.12)';
// Gold accent (press/focus only)
const GOLD_ACCENT = '#B8A060';

export interface DashboardCardProps {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  subtitle?: string;
  /** Lucide or Chakra icon element */
  icon: ReactElement;
  /** Click/tap handler */
  onClick?: () => void;
  /** Custom content instead of subtitle (for stats card) */
  children?: React.ReactNode;
}

/**
 * DashboardCard - A square, pressable card for Premium Onyx dark theme.
 *
 * Features:
 * - Equal 1:1 aspect ratio
 * - Teal icon by default, gold only on press
 * - Dark theme only (Telegram Mini App)
 */
export function DashboardCard({
  title,
  subtitle,
  icon,
  onClick,
  children,
}: DashboardCardProps) {
  const iconBoxSize = '44px';
  const iconFontSize = '22px';

  return (
    <Box
      as="button"
      onClick={onClick}
      position="relative"
      w="100%"
      aspectRatio="1 / 1"
      p={4}
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="transform 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out, color 120ms ease-out"
      _active={{
        transform: 'scale(0.985)',
        boxShadow: `inset 0 1px 4px rgba(0, 0, 0, 0.25), 0 0 0 2px ${GOLD_ACCENT}`,
        bg: 'bg.surface2',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 2px ${GOLD_ACCENT}`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        // Gold icon color on active state
        '&:active .icon-container': {
          color: GOLD_ACCENT,
          bg: 'rgba(184, 160, 96, 0.15)',
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-container"
        align="center"
        justify="center"
        w={iconBoxSize}
        h={iconBoxSize}
        bg={TEAL_ALPHA}
        borderRadius="xl"
        mb="auto"
        flexShrink={0}
        color={TEAL_ACCENT}
        fontSize={iconFontSize}
        transition="background-color 120ms ease-out, color 120ms ease-out"
        sx={{
          '& svg': {
            width: iconFontSize,
            height: iconFontSize,
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Text Content - pushed to bottom */}
      <Box mt="auto">
        <Text
          fontSize="md"
          fontWeight="semibold"
          color="text.primary"
          mb={subtitle || children ? 1 : 0}
          lineHeight="short"
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            fontSize="xs"
            color="text.muted"
            lineHeight="short"
          >
            {subtitle}
          </Text>
        )}

        {children}
      </Box>
    </Box>
  );
}

/**
 * StatisticsCard - A card variant showing stats with numbers
 */
export interface StatisticsCardProps {
  title: string;
  icon: ReactElement;
  stats: Array<{ value: string | number; label: string }>;
  onClick?: () => void;
}

export function StatisticsCard({
  title,
  icon,
  stats,
  onClick,
}: StatisticsCardProps) {
  const iconBoxSize = '44px';
  const iconFontSize = '22px';

  return (
    <Box
      as="button"
      onClick={onClick}
      position="relative"
      w="100%"
      aspectRatio="1 / 1"
      p={4}
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="transform 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out"
      _active={{
        transform: 'scale(0.985)',
        boxShadow: `inset 0 1px 4px rgba(0, 0, 0, 0.25), 0 0 0 2px ${GOLD_ACCENT}`,
        bg: 'bg.surface2',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 2px ${GOLD_ACCENT}`,
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        '&:active .icon-container': {
          color: GOLD_ACCENT,
          bg: 'rgba(184, 160, 96, 0.15)',
        },
      }}
    >
      {/* Icon Container */}
      <Flex
        className="icon-container"
        align="center"
        justify="center"
        w={iconBoxSize}
        h={iconBoxSize}
        bg={TEAL_ALPHA}
        borderRadius="xl"
        flexShrink={0}
        color={TEAL_ACCENT}
        fontSize={iconFontSize}
        transition="background-color 120ms ease-out, color 120ms ease-out"
        sx={{
          '& svg': {
            width: iconFontSize,
            height: iconFontSize,
            strokeWidth: 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Title + Stats - pushed to bottom */}
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

        {/* Stats row */}
        <Flex gap={4}>
          {stats.map((stat, index) => (
            <Box key={index}>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={index === 0 ? 'text.primary' : TEAL_ACCENT}
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

export default DashboardCard;

