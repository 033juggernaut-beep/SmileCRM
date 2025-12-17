import type { ReactNode } from 'react';
import { Box, Container, SimpleGrid } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// =============================================
// 🎨 DASHBOARD GRID
// Responsive 2x2 grid with staggered animation
// Based on superdesign-dashboard reference
// =============================================

// Motion wrapper for SimpleGrid
const MotionSimpleGrid = motion.create(SimpleGrid);

// Motion wrapper for grid items
const MotionBox = motion.create(Box);

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      ease: [0.25, 0.1, 0.25, 1] as const, // easeOut cubic-bezier
    },
  },
};

export interface DashboardGridProps {
  /** Dashboard card children */
  children: ReactNode;
  /** Number of columns (default: 2) */
  columns?: number | { base?: number; sm?: number; md?: number };
  /** Grid gap in Chakra spacing units (default: 4) */
  gap?: number | { base?: number; md?: number };
  /** Max width of the grid container */
  maxW?: string;
  /** Enable stagger animation (default: true) */
  animated?: boolean;
}

/**
 * DashboardGrid - A responsive grid container with staggered animation.
 *
 * Features:
 * - Responsive 2-column grid (configurable)
 * - Staggered fade-in animation for cards
 * - Centered container with max-width
 * - Works with SuperDashboardCard components
 *
 * @example
 * <DashboardGrid columns={2} gap={4}>
 *   <SuperDashboardCard title="Patients" ... />
 *   <SuperDashboardCard title="Add Patient" ... />
 *   <SuperDashboardCard title="Marketing" ... />
 *   <SuperStatisticsCard title="Statistics" ... />
 * </DashboardGrid>
 */
export function DashboardGrid({
  children,
  columns = { base: 1, sm: 2 },
  gap = { base: 3, md: 4 },
  maxW = '3xl',
  animated = true,
}: DashboardGridProps) {
  // Wrap each child in a motion div for animation
  const animatedChildren = animated
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
      <Box w="100%" py={4}>
        <Container maxW={maxW} px={4}>
          <MotionSimpleGrid
            columns={columns}
            spacing={gap}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {animatedChildren}
          </MotionSimpleGrid>
        </Container>
      </Box>
    );
  }

  return (
    <Box w="100%" py={4}>
      <Container maxW={maxW} px={4}>
        <SimpleGrid columns={columns} spacing={gap}>
          {children}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default DashboardGrid;
