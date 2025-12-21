/**
 * StatsPage - Statistics placeholder
 * Uses Chakra UI colorMode for dark/light theme
 */

import { Box, Container, Heading, Text, Button, useColorMode } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const StatsPage = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { t } = useLanguage();
  const isDark = colorMode === 'dark';

  // Colors based on colorMode
  const pageBg = isDark 
    ? '#0F172A'
    : 'linear-gradient(to bottom right, #F8FAFC, rgba(239, 246, 255, 0.3), rgba(240, 249, 255, 0.5))';
  const cardBg = isDark ? 'rgba(30, 41, 59, 0.7)' : 'white';
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#DBEAFE';
  const iconBoxBg = isDark ? 'rgba(59, 130, 246, 0.15)' : '#DBEAFE';
  const iconColor = isDark ? '#60A5FA' : '#2563EB';
  const titleColor = isDark ? 'white' : '#1E293B';
  const bodyColor = isDark ? '#94A3B8' : '#64748B';
  const shadow = isDark
    ? '0 10px 15px -3px rgba(15, 23, 42, 0.3), 0 4px 6px -4px rgba(15, 23, 42, 0.3)'
    : '0 10px 15px -3px rgba(219, 234, 254, 0.5), 0 4px 6px -4px rgba(219, 234, 254, 0.5)';

  return (
    <Box minH="100vh" bg={pageBg} py="32px">
      <Container maxW="768px">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/home')}
          mb="24px"
          color={bodyColor}
          _hover={{ color: titleColor }}
        >
          {t('common.back')}
        </Button>

        {/* Placeholder Card */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="2xl"
          boxShadow={shadow}
          p="32px"
          textAlign="center"
        >
          <Box
            w="64px"
            h="64px"
            bg={iconBoxBg}
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb="16px"
          >
            <TrendingUp size={32} color={iconColor} />
          </Box>

          <Heading
            as="h1"
            fontSize="1.5rem"
            fontWeight="semibold"
            color={titleColor}
            mb="8px"
          >
            {t('home.statistics')}
          </Heading>

          <Text color={bodyColor} fontSize="md">
            {t('stats.placeholder')}
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsPage;
