/**
 * Type definitions for SmileCRM Blue Dashboard
 * - Language options
 * - Dashboard card interfaces
 * - Component props
 */

export type Language = 'AM' | 'RU' | 'EN';

export interface StatItem {
  label: string;
  value: string | number;
}

export interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stats?: StatItem[];
  onClick?: () => void;
}

export interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  notificationCount?: number;
}

export interface WelcomeBlockProps {
  title: string;
  subtitle: string;
}

export interface DashboardProps {
  initialLang?: Language;
  initialTheme?: 'light' | 'dark';
  totalPatients?: number;
  todayVisits?: number;
  notificationCount?: number;
}
