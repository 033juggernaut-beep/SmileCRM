/**
 * Dashboard cards grid - Exact match to Superdesign reference
 * Layout: max-w-3xl, grid-cols-1 sm:grid-cols-2, gap-4 md:gap-5
 * Staggered animation on load
 */

import type { ReactNode } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

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
      ease: 'easeOut',
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

  // Reference: max-w-3xl = 768px, gap-4 = 16px, md:gap-5 = 20px
  if (animated) {
    return (
      <MotionSimpleGrid
        w="100%"
        maxW="768px"
        mx="auto"
        columns={{ base: 1, sm: 2 }}
        spacing={{ base: '16px', md: '20px' }}
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
      maxW="768px"
      mx="auto"
      columns={{ base: 1, sm: 2 }}
      spacing={{ base: '16px', md: '20px' }}
    >
      {children}
    </SimpleGrid>
  );
}

export default DashboardGrid;
