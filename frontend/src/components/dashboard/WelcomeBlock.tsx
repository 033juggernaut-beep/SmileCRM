/**
 * WelcomeBlock - Superdesign Blue Theme (Light Mode Forced)
 * 
 * Features:
 * - Gradient background: blue-50 to sky-50
 * - Rounded 2xl (16px)
 * - Soft blue shadow
 * - Large centered title, gray subtitle
 * - Fade-in animation
 */

import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// =============================================
// 🎨 LIGHT THEME COLORS (Superdesign Reference)
// =============================================
const COLORS = {
  // Gradient: from-blue-50 to-sky-50
  gradientFrom: '#eff6ff',        // blue-50
  gradientTo: '#f0f9ff',          // sky-50
  shadow: 'rgba(219, 234, 254, 0.5)', // blue-100/50
  titleColor: '#1e293b',          // slate-800
  subtitleColor: '#64748b',       // slate-500
};

// Fade-in animation
const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export interface WelcomeBlockProps {
  title: string;
  subtitle?: string;
}

export function WelcomeBlock({ title, subtitle }: WelcomeBlockProps) {
  return (
    <Box
      w="100%"
      maxW="768px"              // max-w-3xl = 48rem
      mx="auto"
      px={8}                    // px-8 = 32px
      py={10}                   // py-10 = 40px
      borderRadius="16px"       // rounded-2xl
      bg={`linear-gradient(135deg, ${COLORS.gradientFrom} 0%, ${COLORS.gradientTo} 100%)`}
      boxShadow={`0 10px 15px -3px ${COLORS.shadow}, 0 4px 6px -4px ${COLORS.shadow}`}
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
    >
      <Text
        fontSize={{ base: '1.875rem', md: '2.25rem' }}  // text-3xl / text-4xl
        fontWeight="semibold"
        letterSpacing="-0.025em"                         // tracking-tight
        color={COLORS.titleColor}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          mt={3}
          fontSize={{ base: '1rem', md: '1.125rem' }}   // text-base / text-lg
          fontWeight="normal"
          color={COLORS.subtitleColor}
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

export default WelcomeBlock;
