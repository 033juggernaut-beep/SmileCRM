import type { ReactNode } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Container,
} from '@chakra-ui/react';

export interface DashboardHeaderProps {
  /** Main greeting/title */
  title: string;
  /** Subtitle text */
  subtitle?: string;
  /** Optional motivational quote or additional text */
  quote?: string;
}

export interface DashboardProps {
  /** Header configuration */
  header?: DashboardHeaderProps;
  /** Dashboard card children */
  children: ReactNode;
  /** Number of columns (default: 2) */
  columns?: number;
  /** Grid gap in Chakra spacing units (default: 3) */
  gap?: number;
  /** Max width of the dashboard container */
  maxW?: string;
}

/**
 * DashboardHeader - Centered header card with greeting and optional quote.
 */
function DashboardHeader({ title, subtitle, quote }: DashboardHeaderProps) {
  return (
    <Box
      bg="bg.surface"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="2xl"
      px={4}
      py={4}
      mb={4}
      textAlign="center"
    >
      <Text
        fontSize="lg"
        fontWeight="bold"
        color="text.primary"
        mb={subtitle ? 0.5 : 0}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          fontSize="xs"
          color="text.secondary"
          mb={quote ? 2 : 0}
        >
          {subtitle}
        </Text>
      )}

      {quote && (
        <Text
          fontSize="11px"
          fontStyle="italic"
          color="text.muted"
        >
          "{quote}"
        </Text>
      )}
    </Box>
  );
}

/**
 * Dashboard - A responsive grid container for dashboard cards.
 *
 * Features:
 * - Centered container with max-width
 * - Optional header with greeting/quote
 * - Responsive 2-column grid (configurable)
 * - Theme-aware background
 *
 * @example
 * <Dashboard
 *   header={{
 *     title: "Welcome",
 *     subtitle: "Dental Practice Management",
 *     quote: "Every smile is your success"
 *   }}
 * >
 *   <DashboardCard title="Patients" subtitle="View all" icon={<Users />} isPrimary />
 *   <DashboardCard title="Add Patient" subtitle="New patient" icon={<UserPlus />} />
 *   <DashboardCard title="Marketing" subtitle="Campaigns" icon={<Megaphone />} />
 *   <DashboardCard title="Statistics" subtitle="Analytics" icon={<TrendingUp />} />
 * </Dashboard>
 */
export function Dashboard({
  header,
  children,
  columns = 2,
  gap = 3,
  maxW = 'md',
}: DashboardProps) {
  return (
    <Box w="100%" py={4}>
      <Container maxW={maxW} px={4}>
        {/* Optional Header */}
        {header && (
          <DashboardHeader
            title={header.title}
            subtitle={header.subtitle}
            quote={header.quote}
          />
        )}

        {/* Card Grid */}
        <SimpleGrid columns={columns} spacing={gap}>
          {children}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export { DashboardHeader };
export default Dashboard;

