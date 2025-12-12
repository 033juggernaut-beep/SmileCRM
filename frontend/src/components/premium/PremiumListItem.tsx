import { Box, Flex, Text, type FlexProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumListItemProps extends FlexProps {
  icon?: ReactNode | string
  title: string
  subtitle?: string
  rightElement?: ReactNode
  showBorder?: boolean
  isActive?: boolean
}

export const PremiumListItem = ({
  icon,
  title,
  subtitle,
  rightElement,
  showBorder = true,
  isActive = false,
  ...props
}: PremiumListItemProps) => {
  return (
    <Flex
      align="center"
      gap={4}
      py={4}
      px={4}
      bg={isActive ? 'bg.hover' : 'transparent'}
      borderBottomWidth={showBorder ? '1px' : '0'}
      borderColor="border.subtle"
      transition="all 0.15s ease"
      cursor={props.onClick ? 'pointer' : 'default'}
      _hover={
        props.onClick
          ? {
              bg: 'bg.hover',
            }
          : undefined
      }
      _active={
        props.onClick
          ? {
              bg: 'bg.active',
            }
          : undefined
      }
      {...props}
    >
      {/* Left Icon */}
      {icon && (
        <Box 
          flexShrink={0}
          w="44px"
          h="44px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.tertiary"
          borderRadius="lg"
        >
          {typeof icon === 'string' ? (
            <Text fontSize="xl" lineHeight="1">
              {icon}
            </Text>
          ) : (
            icon
          )}
        </Box>
      )}

      {/* Content */}
      <Box flex={1} minW={0}>
        <Text
          fontWeight="semibold"
          fontSize="md"
          color="text.primary"
          noOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            fontSize="sm"
            color="text.muted"
            noOfLines={1}
            mt={0.5}
          >
            {subtitle}
          </Text>
        )}
      </Box>

      {/* Right Element */}
      {rightElement && (
        <Box flexShrink={0} color="text.muted">
          {rightElement}
        </Box>
      )}
    </Flex>
  )
}
