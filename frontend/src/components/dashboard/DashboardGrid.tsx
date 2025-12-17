import type { ReactNode } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// =============================================
// 🎨 DASHBOARD GRID — LIGHT THEME (Superdesign)
// Responsive 2x2 grid with staggered animation
// =============================================

// Motion wrapper for grid items
const MotionBox = motion.create(Box);

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

// Motion wrapper for SimpleGrid
const MotionSimpleGrid = motion.create(SimpleGrid);

export interface DashboardGridProps {
  /** Dashboard card children */
  children: ReactNode;
  /** Number of columns (default: 2) */
  columns?: number | { base?: number; sm?: number; md?: number };
  /** Grid gap in pixels (default: 16) */
  gap?: number;
  /** Enable stagger animation (default: true) */
  animated?: boolean;
}

/**
 * DashboardGrid - Responsive grid container for Superdesign layout.
 *
 * Features:
 * - 2-column responsive grid
 * - 16px gap between cards
 * - Staggered fade-in animation
 */
export function DashboardGrid({
  children,
  columns = { base: 1, sm: 2 },
  gap = 16,
  animated = true,
}: DashboardGridProps) {
  // Wrap each child in motion div for animation
  const wrappedChildren = animated
    ? Array.isArray(children)
      ? children.map((child, index) => (
          <MotionBox key={index} variants={itemVariants}>
            {child}
          </MotionBox>
        ))
      : (
          <MotionBox variants={itemVariants}>
            {children}
          </MotionBox>
        )
    : children;

  if (animated) {
    return (
      <MotionSimpleGrid
        columns={columns}
        spacing={`${gap}px`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {wrappedChildren}
      </MotionSimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={columns} spacing={`${gap}px`}>
      {children}
    </SimpleGrid>
  );
}

export default DashboardGrid;
