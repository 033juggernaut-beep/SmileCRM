/**
 * ThemeToggle — Working dark/light mode toggle
 * Uses Chakra UI's useColorMode hook
 */

import { Box, useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 20 }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Box
      as="button"
      onClick={toggleColorMode}
      color={isDark ? '#F1F5F9' : '#64748B'}
      _hover={{ color: isDark ? '#FFFFFF' : '#2563EB' }}
      transition="color 0.2s ease"
      sx={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={size} /> : <Moon size={size} />}
    </Box>
  );
}

export default ThemeToggle;

