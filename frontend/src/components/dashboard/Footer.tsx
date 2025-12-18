/**
 * Footer - Superdesign exact copy
 * Minimal links with hover underline
 * Using exact tokens from designTokens.ts
 */

import { Box, Flex, Text } from '@chakra-ui/react';
import { DASHBOARD_TOKENS as T } from './designTokens';

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
      py={T.footerPaddingY}
      mt="auto"
      borderTop="1px solid"
      borderColor={T.borderLightAlpha}
    >
      <Flex
        as="nav"
        align="center"
        justify="center"
        gap={T.gapFooterLinks}
        flexWrap="wrap"
        px={T.paddingPageX}
      >
        {links.map((link, index) => (
          <Box
            key={index}
            as="button"
            onClick={link.onClick}
            fontSize={T.fontXs}
            fontWeight={T.weightNormal}
            color={T.textMuted}
            style={{ transition: 'color 0.2s ease' }}
            _hover={{ 
              color: T.textBody,
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
