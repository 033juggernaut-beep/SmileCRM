import { Box, Text, keyframes } from '@chakra-ui/react';

// =============================================
// 🎨 WELCOME BLOCK
// Medical blue theme welcome header with gradient background
// Based on superdesign-dashboard reference
// =============================================

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
  /** Main greeting title */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Maximum width of the block */
  maxW?: string;
}

/**
 * WelcomeBlock - Centered welcome header with medical blue gradient.
 *
 * Features:
 * - Soft blue gradient background (light mode feel on dark theme)
 * - Rounded container with shadow
 * - Fade-in animation on mount
 * - Calm medical typography
 *
 * @example
 * <WelcomeBlock
 *   title="Добро пожаловать, Доктор!"
 *   subtitle="Управление вашей практикой"
 * />
 */
export function WelcomeBlock({
  title,
  subtitle,
  maxW = '3xl',
}: WelcomeBlockProps) {
  return (
    <Box
      w="100%"
      maxW={maxW}
      mx="auto"
      px={8}
      py={10}
      borderRadius="2xl"
      // Medical blue gradient - works on dark theme
      bg="linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)"
      boxShadow="0 8px 32px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
      border="1px solid"
      borderColor="rgba(59, 130, 246, 0.2)"
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
      transition="all 0.3s ease"
    >
      <Text
        fontSize={{ base: '2xl', md: '3xl' }}
        fontWeight="semibold"
        letterSpacing="tight"
        color="text.primary"
        mb={subtitle ? 3 : 0}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          fontSize={{ base: 'md', md: 'lg' }}
          fontWeight="normal"
          color="text.secondary"
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

export default WelcomeBlock;
