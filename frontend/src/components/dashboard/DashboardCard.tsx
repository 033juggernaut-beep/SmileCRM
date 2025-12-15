import type { ReactElement } from 'react';
import {
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';

export interface DashboardCardProps {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  subtitle: string;
  /** Lucide or Chakra icon element */
  icon: ReactElement;
  /** Emphasize card with larger icon and bolder title */
  isPrimary?: boolean;
  /** Click/tap handler */
  onClick?: () => void;
}

/**
 * DashboardCard - A square, pressable card for Premium Onyx dark theme.
 *
 * Features:
 * - Equal 1:1 aspect ratio
 * - Subtle press feedback (scale + inner shadow)
 * - Dark theme only (Telegram Mini App)
 * - Primary variant for emphasis
 */
export function DashboardCard({
  title,
  subtitle,
  icon,
  isPrimary = false,
  onClick,
}: DashboardCardProps) {
  // Icon sizing based on variant
  const iconBoxSize = isPrimary ? '48px' : '40px';
  const iconFontSize = isPrimary ? '24px' : '20px';

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
        boxShadow: 'inset 0 1px 4px rgba(0, 0, 0, 0.25)',
        bg: 'bg.surface2',
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: '0 0 0 2px var(--chakra-colors-accent-500)',
      }}
      sx={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {/* Icon Container */}
      <Flex
        align="center"
        justify="center"
        w={iconBoxSize}
        h={iconBoxSize}
        bg={isPrimary ? 'rgba(184, 160, 96, 0.12)' : 'bg.surface2'}
        border="1px solid"
        borderColor={isPrimary ? 'transparent' : 'border.default'}
        borderRadius="xl"
        mb={3}
        flexShrink={0}
        color="accent.500"
        fontSize={iconFontSize}
        sx={{
          '& svg': {
            width: iconFontSize,
            height: iconFontSize,
            strokeWidth: isPrimary ? 2.2 : 2,
          },
        }}
      >
        {icon}
      </Flex>

      {/* Text Content - pushed to bottom */}
      <Box mt="auto">
        <Text
          fontSize={isPrimary ? 'md' : 'sm'}
          fontWeight={isPrimary ? 'bold' : 'semibold'}
          color="text.primary"
          mb={0.5}
          lineHeight="short"
        >
          {title}
        </Text>

        <Text
          fontSize="xs"
          color="text.muted"
          lineHeight="short"
        >
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
}

export default DashboardCard;

