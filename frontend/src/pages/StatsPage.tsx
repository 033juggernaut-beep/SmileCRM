/**
 * StatsPage - Statistics placeholder
 * Uses DASHBOARD_TOKENS for consistent styling
 */

import { Box, Container, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { DASHBOARD_TOKENS as T } from '../components/dashboard';

export const StatsPage = () => {
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bg={T.pageBg} py={T.paddingPageY}>
      <Container maxW={T.containerMaxW}>
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft size={20} />}
          onClick={() => navigate('/home')}
          mb="24px"
          color={T.textBody}
          _hover={{ color: T.textTitle }}
        >
          Назад
        </Button>

        {/* Placeholder Card */}
        <Box
          bg={T.cardBg}
          border="1px solid"
          borderColor={T.borderLight}
          borderRadius={T.welcomeRadius}
          boxShadow={T.shadowWelcome}
          p={T.welcomePaddingX}
          textAlign="center"
        >
          <Box
            w="64px"
            h="64px"
            bg={T.iconBoxBg}
            borderRadius={T.welcomeRadius}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mx="auto"
            mb="16px"
          >
            <TrendingUp size={32} color={T.iconColor} />
          </Box>

          <Heading
            as="h1"
            fontSize={T.font2xl}
            fontWeight={T.weightSemibold}
            color={T.textTitle}
            mb="8px"
          >
            Статистика
          </Heading>

          <Text color={T.textBody} fontSize={T.fontBase}>
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
