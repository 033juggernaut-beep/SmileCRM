/**
 * Footer - Exact match to Superdesign reference
 * Layout: py-6, gap-6, text-xs font-normal
 * Light: border-blue-100/50, text-slate-400 → hover:text-slate-500
 * Dark: border-slate-800, text-slate-500 → hover:text-slate-400
 */

import { Box, Flex, Text, useColorMode } from '@chakra-ui/react';

interface FooterLink {
  label: string;
  onClick: () => void;
}

export interface FooterProps {
  links: FooterLink[];
}

export function Footer({ links }: FooterProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Exact colors from reference
  const borderColor = isDark ? '#1E293B' : 'rgba(219, 234, 254, 0.5)'; // slate-800 / blue-100/50
  const textColor = isDark ? '#64748B' : '#94A3B8'; // slate-500 / slate-400
  const hoverColor = isDark ? '#94A3B8' : '#64748B'; // slate-400 / slate-500

  return (
    <Box
      as="footer"
      w="100%"
      py="24px" // py-6
      mt="auto"
      borderTop="1px solid"
      borderColor={borderColor}
      transition="border-color 0.3s"
    >
      <Flex
        as="nav"
        align="center"
        justify="center"
        gap="24px" // gap-6
        flexWrap="wrap"
        px="16px" // px-4
      >
        {links.map((link, index) => (
          <Box
            key={index}
            as="button"
            onClick={link.onClick}
            fontSize="xs" // 12px
            fontWeight="normal"
            color={textColor}
            transition="color 0.2s"
            _hover={{ 
              color: hoverColor,
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
            sx={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Text>{link.label}</Text>
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

export default Footer;
