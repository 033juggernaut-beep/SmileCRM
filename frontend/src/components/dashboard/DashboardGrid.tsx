/**
 * DashboardGrid - Superdesign Blue Theme
 * 
 * Features:
 * - 2x2 responsive grid (1 col on mobile)
 * - max-w-3xl (768px)
 * - gap-4 (16px) / gap-5 (20px) on md
 * - Staggered animation on mount
 */

import type { ReactNode } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Motion wrapper
const MotionSimpleGrid = motion.create(SimpleGrid);
const MotionDiv = motion.div;

// Animation variants for staggered entrance
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
  hidden: {
    opacity: 0,
    y: 20,
  },
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
  // Wrap each child in motion div for animation
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
        maxW="768px"                        // max-w-3xl
        mx="auto"
        columns={{ base: 1, sm: 2 }}        // grid-cols-1 sm:grid-cols-2
        spacing={{ base: '16px', md: '20px' }} // gap-4 md:gap-5
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
