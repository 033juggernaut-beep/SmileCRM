// =============================================
// 🎨 DASHBOARD COMPONENTS (Superdesign Blue Theme)
// All components use forced LIGHT mode styles
// No theme tokens, no useColorModeValue
// =============================================

// Icons
export { ToothLogo } from './ToothLogo';

// Layout Components
export { Header } from './Header';
export { Footer } from './Footer';
export type { FooterProps } from './Footer';

// Content Components
export { WelcomeBlock } from './WelcomeBlock';
export type { WelcomeBlockProps } from './WelcomeBlock';

export { DashboardCard } from './DashboardCard';
export type { DashboardCardProps, StatItem } from './DashboardCard';

export { DashboardGrid } from './DashboardGrid';
export type { DashboardGridProps } from './DashboardGrid';

// =============================================
// LEGACY EXPORTS (for backward compatibility)
// These can be removed after migration
// =============================================
export { Dashboard, DashboardHeader } from './Dashboard';
export type { DashboardProps, DashboardHeaderProps } from './Dashboard';

export { SuperDashboardCard, SuperStatisticsCard } from './SuperDashboardCard';
export type { SuperDashboardCardProps, SuperStatisticsCardProps } from './SuperDashboardCard';
