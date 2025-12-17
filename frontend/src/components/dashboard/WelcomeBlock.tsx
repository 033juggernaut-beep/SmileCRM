import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// =============================================
// 🎨 WELCOME BLOCK — LIGHT THEME (Superdesign)
// White card with soft shadow, centered layout
// =============================================

// Light theme colors (forced, no theme tokens)
const LIGHT = {
  cardBg: '#FFFFFF',
  cardBorder: '#E6EEFF',
  cardShadow: '0 4px 20px rgba(47, 107, 255, 0.08)',
  titleColor: '#0F172A',
  subtitleColor: '#64748B',
};

// Fade-in animation
const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export interface WelcomeBlockProps {
  /** Main greeting title */
  title: string;
  /** Subtitle text */
  subtitle?: string;
}

/**
 * WelcomeBlock - White welcome card matching Superdesign reference.
 *
 * Features:
 * - Pure white background #FFFFFF
 * - Soft blue shadow
 * - Border radius 20px
 * - Large centered title, gray subtitle
 * - Fade-in animation
 */
export function WelcomeBlock({ title, subtitle }: WelcomeBlockProps) {
  return (
    <Box
      w="100%"
      bg={LIGHT.cardBg}
      border="1px solid"
      borderColor={LIGHT.cardBorder}
      borderRadius="20px"
      boxShadow={LIGHT.cardShadow}
      px={{ base: 6, md: 10 }}
      py={{ base: 8, md: 10 }}
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
    >
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="bold"
        letterSpacing="-0.02em"
        color={LIGHT.titleColor}
        mb={subtitle ? 2 : 0}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight="normal"
          color={LIGHT.subtitleColor}
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

export default WelcomeBlock;
