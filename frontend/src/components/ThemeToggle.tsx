/**
 * ThemeToggle — Working dark/light mode toggle
 * Uses Chakra UI's useColorMode hook
 * Has proper touch target size (44x44) for mobile accessibility
 */

import { Box, useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

// Minimum touch target size for accessibility
const MIN_TOUCH_TARGET = 44;

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 22 }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      as="button"
      onClick={toggleColorMode}
      color={isDark ? '#F1F5F9' : '#64748B'}
      _hover={{ color: isDark ? '#FFFFFF' : '#2563EB' }}
      _active={{ bg: isDark ? 'whiteAlpha.100' : 'blackAlpha.50' }}
      transition="color 0.2s ease"
      sx={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minW={`${MIN_TOUCH_TARGET}px`}
      minH={`${MIN_TOUCH_TARGET}px`}
      borderRadius="md"
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </Box>
  );
}

export default ThemeToggle;

