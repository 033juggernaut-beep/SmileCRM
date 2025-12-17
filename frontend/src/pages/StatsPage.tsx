/**
 * StatsPage - Statistics placeholder
 * Will be implemented with actual analytics
 */

import { Box, Container, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

// Light theme colors (consistent with HomePage)
const COLORS = {
  pageBg: '#f8fafc',
  cardBg: '#ffffff',
  cardBorder: '#dbeafe',
  titleColor: '#1e293b',
  textColor: '#64748b',
  iconColor: '#2563eb',
};

export const StatsPage = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg={COLORS.pageBg} py={8}>
      <Container maxW="768px">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/home')}
          mb={6}
          color={COLORS.textColor}
          _hover={{ color: COLORS.titleColor }}
        >
          Назад
        </Button>

        {/* Placeholder Card */}
        <Box
          bg={COLORS.cardBg}
          border="1px solid"
          borderColor={COLORS.cardBorder}
          borderRadius="16px"
          p={8}
          textAlign="center"
        >
          <Box
            w="64px"
            h="64px"
            bg="#dbeafe"
            borderRadius="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb={4}
          >
            <TrendingUp size={32} color={COLORS.iconColor} />
          </Box>

          <Heading
            as="h1"
            size="lg"
            color={COLORS.titleColor}
            mb={2}
          >
            Статистика
          </Heading>

          <Text color={COLORS.textColor}>
            Раздел аналитики находится в разработке.
            <br />
            Здесь будет отображаться статистика вашей практики.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default StatsPage;
