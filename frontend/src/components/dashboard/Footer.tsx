/**
 * Footer - Superdesign Blue Theme (Light Mode Forced)
 * 
 * Features:
 * - py-6 (24px)
 * - Top border blue-100/50
 * - Text xs, slate-400 with hover to slate-500
 * - Centered links with gap-6
 */

import { Box, Flex, Text } from '@chakra-ui/react';

// =============================================
// 🎨 LIGHT THEME COLORS (Superdesign Reference)
// =============================================
const COLORS = {
  borderColor: 'rgba(219, 234, 254, 0.5)', // blue-100/50
  linkColor: '#94a3b8',                     // slate-400
  linkHoverColor: '#64748b',                // slate-500
};

interface FooterLink {
  label: string;
  onClick: () => void;
}

export interface FooterProps {
  links: FooterLink[];
}

export function Footer({ links }: FooterProps) {
  return (
    <Box
      as="footer"
      w="100%"
      py={6}
      mt="auto"
      borderTop="1px solid"
      borderColor={COLORS.borderColor}
    >
      <Flex
        align="center"
        justify="center"
        gap={6}
        flexWrap="wrap"
        px={4}
      >
        {links.map((link, index) => (
          <Box
            key={index}
            as="button"
            onClick={link.onClick}
            fontSize="0.75rem"     // text-xs = 12px
            fontWeight="normal"
            color={COLORS.linkColor}
            transition="color 0.2s ease"
            _hover={{ 
              color: COLORS.linkHoverColor,
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
