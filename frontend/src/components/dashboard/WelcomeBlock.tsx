/**
 * Welcome section - Exact match to Superdesign reference
 * Light: bg-gradient-to-br from-blue-50 to-sky-50, shadow-lg shadow-blue-100/50
 * Dark: bg-slate-800/60, shadow-xl shadow-slate-900/30
 * Spacing: px-8 py-10, max-w-3xl, rounded-2xl
 * Typography: text-3xl md:text-4xl font-semibold tracking-tight
 * 
 * Supports personalized greeting with daily motivation quote
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
  /** Main title text */
  title: string;
  /** Subtitle text (optional) */
  subtitle?: string;
  /** Doctor's last name for personalized greeting */
  doctorName?: string;
  /** Daily motivation quote */
  motivationText?: string;
}

export function WelcomeBlock({ 
  title, 
  subtitle,
  doctorName,
  motivationText,
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

  // Check if we should show personalized greeting with motivation
  const showPersonalized = doctorName && motivationText;

  return (
    <Box
      w="100%"
      maxW="768px" // max-w-3xl = 48rem
      mx="auto"
      px={{ base: '24px', md: '32px' }} // px-6 on mobile, px-8 on desktop
      py={{ base: '32px', md: '40px' }} // py-8 on mobile, py-10 on desktop
      {...bgStyle}
      borderRadius="2xl" // 16px
      boxShadow={shadow}
      textAlign="center"
      animation={`${fadeSlideIn} 0.5s ease-out`}
      transition="background-color 0.3s, box-shadow 0.3s"
    >
      {showPersonalized ? (
        // Personalized greeting with daily motivation
        <>
          {/* Doctor greeting - bold */}
          <Text
            fontSize={{ base: '1.5rem', md: '1.875rem' }} // 24px / 30px
            fontWeight="semibold"
            letterSpacing="tight"
            color={titleColor}
            mb="8px"
          >
            Доктор {doctorName},
          </Text>
          
          {/* Motivation quote - normal weight */}
          <Text
            fontSize={{ base: 'md', md: 'lg' }} // 16px / 18px
            fontWeight="normal"
            color={subtitleColor}
            lineHeight="tall"
          >
            {motivationText}
          </Text>
        </>
      ) : (
        // Default welcome block (fallback)
        <>
          {/* text-3xl md:text-4xl font-semibold tracking-tight */}
          <Text
            fontSize={{ base: '1.875rem', md: '2.25rem' }} // 30px / 36px
            fontWeight="semibold"
            letterSpacing="tight" // -0.025em
            color={titleColor}
          >
            {title}
          </Text>

          {subtitle && (
            // mt-3 text-base md:text-lg font-normal
            <Text
              mt="12px"
              fontSize={{ base: 'md', md: 'lg' }} // 16px / 18px
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
