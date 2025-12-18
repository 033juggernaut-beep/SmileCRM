/**
 * DashboardGrid - Superdesign exact copy
 * 2x2 grid with stagger animation
 * Using exact tokens from designTokens.ts
 */

import type { ReactNode } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { DASHBOARD_TOKENS as T } from './designTokens';

const MotionSimpleGrid = motion.create(SimpleGrid);
const MotionDiv = motion.div;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export interface DashboardGridProps {
  children: ReactNode;
  animated?: boolean;
}

export function DashboardGrid({ children, animated = true }: DashboardGridProps) {
  const wrappedChildren = animated && Array.isArray(children)
    ? children.map((child, index) => (
        <MotionDiv key={index} variants={itemVariants}>
          {child}
        </MotionDiv>
      ))
    : children;

  if (animated) {
    return (
      <MotionSimpleGrid
        w="100%"
        maxW={T.containerMaxW}
        mx="auto"
        columns={{ base: 1, sm: 2 }}
        spacing={{ base: T.gapGrid, md: T.gapGridMd }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {wrappedChildren}
      </MotionSimpleGrid>
    );
  }

  return (
    <SimpleGrid
      w="100%"
      maxW={T.containerMaxW}
      mx="auto"
      columns={{ base: 1, sm: 2 }}
      spacing={{ base: T.gapGrid, md: T.gapGridMd }}
    >
      {children}
    </SimpleGrid>
  );
}

export default DashboardGrid;
