/**
 * Subtle dental background pattern
 * Exact match to reference: monochrome blue tone, very low opacity (4-6%)
 */

import { Box, useColorMode } from '@chakra-ui/react';

export function BackgroundPattern() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  
  // Light: #1e40af (blue-800), Dark: #60a5fa (blue-400)
  const strokeColor = isDark ? '#60a5fa' : '#1e40af';
  
  return (
    <Box
      position="fixed"
      inset={0}
      pointerEvents="none"
      overflow="hidden"
      zIndex={0}
    >
      {/* Top left tooth */}
      <Box
        as="svg"
        position="absolute"
        left="-64px"
        top="80px"
        w="256px"
        h="256px"
        opacity={0.04}
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
      >
        <path d="M50 10C40 10 32 15 28 22C24 29 22 38 22 48C22 58 24 68 28 78C32 88 36 95 42 98C44 99 46 98 48 95C52 88 54 78 54 68C54 63 56 58 50 58C44 58 46 63 46 68C46 78 48 88 52 95C54 98 56 99 58 98C64 95 68 88 72 78C76 68 78 58 78 48C78 38 76 29 72 22C68 15 60 10 50 10Z" />
      </Box>

      {/* Right side tooth */}
      <Box
        as="svg"
        position="absolute"
        right="-48px"
        top="33%"
        w="224px"
        h="224px"
        opacity={0.05}
        transform="rotate(12deg)"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.8"
      >
        <path d="M50 10C40 10 32 15 28 22C24 29 22 38 22 48C22 58 24 68 28 78C32 88 36 95 42 98C44 99 46 98 48 95C52 88 54 78 54 68C54 63 56 58 50 58C44 58 46 63 46 68C46 78 48 88 52 95C54 98 56 99 58 98C64 95 68 88 72 78C76 68 78 58 78 48C78 38 76 29 72 22C68 15 60 10 50 10Z" />
      </Box>

      {/* Bottom left curve */}
      <Box
        as="svg"
        position="absolute"
        left="40px"
        bottom="25%"
        w="192px"
        h="192px"
        opacity={0.04}
        transform="rotate(-6deg)"
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.6"
      >
        <path d="M20 60 Q50 30 80 60" />
        <circle cx="50" cy="50" r="25" />
      </Box>

      {/* Bottom right accent */}
      <Box
        as="svg"
        position="absolute"
        right="80px"
        bottom="80px"
        w="128px"
        h="128px"
        opacity={0.05}
        viewBox="0 0 100 100"
        fill="none"
        stroke={strokeColor}
        strokeWidth="0.6"
      >
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="15" />
      </Box>

      {/* Small cross elements */}
      <Box
        as="svg"
        position="absolute"
        left="25%"
        top="64px"
        w="32px"
        h="32px"
        opacity={0.06}
        viewBox="0 0 24 24"
      >
        <path d="M12 4v16M4 12h16" stroke={strokeColor} strokeWidth="2" fill="none" />
      </Box>

      <Box
        as="svg"
        position="absolute"
        right="33%"
        bottom="128px"
        w="24px"
        h="24px"
        opacity={0.05}
        viewBox="0 0 24 24"
      >
        <path d="M12 4v16M4 12h16" stroke={strokeColor} strokeWidth="2" fill="none" />
      </Box>
    </Box>
  );
}

export default BackgroundPattern;

