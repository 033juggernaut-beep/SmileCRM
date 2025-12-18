/**
 * WelcomeBlock - Superdesign exact copy
 * Flat blue-50 background (no gradient)
 * Using exact tokens from designTokens.ts
 */

import { Box, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { DASHBOARD_TOKENS as T } from './designTokens';

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
      maxW={T.welcomeMaxW}
      mx="auto"
      px={T.welcomePaddingX}
      py={T.welcomePaddingY}
      bg={T.welcomeBg}
      borderRadius={T.welcomeRadius}
      boxShadow={T.shadowWelcome}
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
    >
      <Text
        fontSize={{ base: T.font3xl, md: T.font4xl }}
        fontWeight={T.weightSemibold}
        letterSpacing={T.trackingTight}
        color={T.textTitle}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          mt="12px"
          fontSize={{ base: T.fontBase, md: T.fontLg }}
          fontWeight={T.weightNormal}
          color={T.textBody}
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

export default WelcomeBlock;
