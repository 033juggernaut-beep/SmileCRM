import { Box, Flex, Text, type FlexProps } from '@chakra-ui/react'
import { type ReactNode } from 'react'

interface PremiumListItemProps extends FlexProps {
  icon?: ReactNode | string
  title: string
  subtitle?: string
  rightElement?: ReactNode
  showBorder?: boolean
}

export const PremiumListItem = ({
  icon,
  title,
  subtitle,
  rightElement,
  showBorder = true,
  ...props
}: PremiumListItemProps) => {
  return (
    <Flex
      align="center"
      gap={3}
      py={3}
      px={4}
      bg="white"
      borderBottomWidth={showBorder ? '1px' : '0'}
      borderColor="border.light"
      transition="all 0.2s"
      cursor={props.onClick ? 'pointer' : 'default'}
      _hover={
        props.onClick
          ? {
              bg: 'bg.gray',
            }
          : undefined
      }
      {...props}
    >
      {/* Left Icon */}
      {icon && (
        <Box flexShrink={0}>
          {typeof icon === 'string' ? (
            <Text fontSize="2xl" lineHeight="1">
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
          color="text.main"
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
        <Box flexShrink={0}>
          {rightElement}
        </Box>
      )}
    </Flex>
  )
}

