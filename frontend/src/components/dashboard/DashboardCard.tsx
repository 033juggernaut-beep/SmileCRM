import type { ReactElement } from 'react';
import {
  Box,
  Flex,
  Text,
  useColorModeValue,
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
 * DashboardCard - A square, pressable card component for dashboard grids.
 *
 * Features:
 * - Equal 1:1 aspect ratio
 * - Press/tap feedback with scale and glow
 * - Theme-aware (light/dark mode)
 * - Primary variant for emphasis
 *
 * @example
 * <DashboardCard
 *   title="My Patients"
 *   subtitle="View all patients"
 *   icon={<Users />}
 *   isPrimary
 *   onClick={() => navigate('/patients')}
 * />
 */
export function DashboardCard({
  title,
  subtitle,
  icon,
  isPrimary = false,
  onClick,
}: DashboardCardProps) {
  // Theme colors - Premium Onyx with gold accent
  const surface = useColorModeValue('white', 'bg.surface');
  const surfacePressed = useColorModeValue('#F5F5F7', 'bg.surface2');
  const border = useColorModeValue('#E2E4E8', 'border.subtle');
  const borderLight = useColorModeValue('#D0D2D8', 'border.default');
  const textColor = useColorModeValue('#1A1A1C', 'text.primary');
  const textMuted = useColorModeValue('#8A8A92', 'text.muted');
  // Accent color (gold in dark mode)
  const accent = useColorModeValue('#2D8A7C', 'accent.500');
  const accentAlpha = useColorModeValue('rgba(45, 138, 124, 0.08)', 'rgba(184, 160, 96, 0.1)');
  // Subtle press shadow - soft inner glow effect
  const pressShadow = useColorModeValue(
    'inset 0 1px 3px rgba(0, 0, 0, 0.08)',
    'inset 0 1px 3px rgba(0, 0, 0, 0.2)'
  );

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
      bg={surface}
      border="1px solid"
      borderColor={border}
      borderRadius="2xl"
      textAlign="left"
      display="flex"
      flexDirection="column"
      cursor="pointer"
      transition="transform 120ms ease-out, box-shadow 120ms ease-out, background-color 120ms ease-out"
      _active={{
        transform: 'scale(0.985)',
        boxShadow: pressShadow,
        bg: surfacePressed,
      }}
      _focusVisible={{
        outline: 'none',
        boxShadow: `0 0 0 2px ${accent}`,
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
        bg={isPrimary ? accentAlpha : surfacePressed}
        border="1px solid"
        borderColor={isPrimary ? 'transparent' : borderLight}
        borderRadius="xl"
        mb={3}
        flexShrink={0}
        color={accent}
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
          color={textColor}
          mb={0.5}
          lineHeight="short"
        >
          {title}
        </Text>

        <Text
          fontSize="xs"
          color={textMuted}
          lineHeight="short"
        >
          {subtitle}
        </Text>
      </Box>
    </Box>
  );
}

export default DashboardCard;

