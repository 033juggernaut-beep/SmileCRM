/**
 * Loading skeleton for patients list
 * Matches the PatientRowCard dimensions
 */

import { Box, Flex, Skeleton, VStack, useColorMode } from '@chakra-ui/react';

interface PatientsListSkeletonProps {
  count?: number;
}

export function PatientsListSkeleton({ count = 5 }: PatientsListSkeletonProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const cardBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'white';
  const borderColor = isDark ? 'rgba(51, 65, 85, 0.5)' : '#EFF6FF';
  const skeletonStart = isDark ? 'rgba(51, 65, 85, 0.5)' : '#F1F5F9';
  const skeletonEnd = isDark ? 'rgba(71, 85, 105, 0.5)' : '#E2E8F0';

  return (
    <Box w="100%" maxW="896px" mx="auto" px="16px">
      <VStack spacing="8px" align="stretch">
        {Array.from({ length: count }).map((_, index) => (
          <Flex
            key={index}
            align="center"
            gap="16px"
            p="16px"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
          >
            {/* Avatar skeleton */}
            <Skeleton
              w="40px"
              h="40px"
              borderRadius="full"
              startColor={skeletonStart}
              endColor={skeletonEnd}
            />

            {/* Content skeleton */}
            <Box flex="1">
              <Skeleton
                h="16px"
                w="60%"
                mb="8px"
                borderRadius="md"
                startColor={skeletonStart}
                endColor={skeletonEnd}
              />
              <Skeleton
                h="12px"
                w="40%"
                borderRadius="md"
                startColor={skeletonStart}
                endColor={skeletonEnd}
              />
            </Box>

            {/* Phone skeleton (hidden on mobile) */}
            <Skeleton
              h="14px"
              w="100px"
              borderRadius="md"
              display={{ base: 'none', sm: 'block' }}
              startColor={skeletonStart}
              endColor={skeletonEnd}
            />
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default PatientsListSkeleton;

