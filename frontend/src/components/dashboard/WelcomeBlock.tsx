/**
 * Welcome section - Exact match to Superdesign reference
 * Light: bg-gradient-to-br from-blue-50 to-sky-50, shadow-lg shadow-blue-100/50
 * Dark: bg-slate-800/60, shadow-xl shadow-slate-900/30
 * Spacing: px-8 py-10, max-w-3xl, rounded-2xl
 * Typography: text-3xl md:text-4xl font-semibold tracking-tight
 * 
 * Supports personalized greeting with daily motivation quote (i18n)
 */

import { Box, Text, useColorMode } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

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
  /** Main title text (from i18n) */
  title: string;
  /** Subtitle text (optional, from i18n) */
  subtitle?: string;
  /** Personalized prefix: "Dr. LastName," (from useDailyMotivation) */
  motivationPrefix?: string;
  /** Daily motivation quote (from useDailyMotivation) */
  motivationQuote?: string;
}

export function WelcomeBlock({ 
  title, 
  subtitle,
  motivationPrefix,
  motivationQuote,
}: WelcomeBlockProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Exact colors/gradients from reference
  const bgStyle = isDark 
    ? { bg: 'rgba(30, 41, 59, 0.6)' } // bg-slate-800/60
    : { bgGradient: 'linear(to-br, #EFF6FF, #F0F9FF)' }; // from-blue-50 to-sky-50
  
  const shadow = isDark
    ? '0 20px 25px -5px rgba(15, 23, 42, 0.3), 0 8px 10px -6px rgba(15, 23, 42, 0.3)' // shadow-xl shadow-slate-900/30
    : '0 10px 15px -3px rgba(219, 234, 254, 0.5), 0 4px 6px -4px rgba(219, 234, 254, 0.5)'; // shadow-lg shadow-blue-100/50
  
  const titleColor = isDark ? 'white' : '#1E293B'; // slate-800
  const subtitleColor = isDark ? '#94A3B8' : '#64748B'; // slate-400 / slate-500

  // Show personalized motivation if available
  const showMotivation = motivationPrefix && motivationQuote;

  return (
    <Box
      w="100%"
      maxW="768px" // max-w-3xl = 48rem
      mx="auto"
      px={{ base: '24px', md: '32px' }} // px-6 on mobile, px-8 on desktop
      py={{ base: '28px', md: '36px' }} // slightly reduced padding for compact look
      {...bgStyle}
      borderRadius="2xl" // 16px
      boxShadow={shadow}
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
      transition="background-color 0.3s, box-shadow 0.3s"
    >
      {showMotivation ? (
        // Personalized greeting with daily motivation
        <>
          {/* Doctor greeting - bold */}
          <Text
            fontSize={{ base: '1.375rem', md: '1.625rem' }} // 22px / 26px - compact
            fontWeight="semibold"
            letterSpacing="tight"
            color={titleColor}
            mb="6px"
          >
            {motivationPrefix}
          </Text>
          
          {/* Motivation quote - normal weight, max 2 lines */}
          <Text
            fontSize={{ base: 'sm', md: 'md' }} // 14px / 16px - compact
            fontWeight="normal"
            color={subtitleColor}
            lineHeight="tall"
            noOfLines={2}
          >
            {motivationQuote}
          </Text>
        </>
      ) : (
        // Default welcome block (fallback when no motivation data)
        <>
          <Text
            fontSize={{ base: '1.875rem', md: '2.25rem' }} // 30px / 36px
            fontWeight="semibold"
            letterSpacing="tight"
            color={titleColor}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              mt="12px"
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="normal"
              color={subtitleColor}
            >
              {subtitle}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}

export default WelcomeBlock;
