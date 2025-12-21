/**
 * Type definitions for SmileCRM Patients Page
 * - Patient data structure
 * - Filter/search state types
 * - Component prop interfaces
 */

export type Language = 'AM' | 'RU' | 'EN';
export type Theme = 'light' | 'dark';
export type PatientStatus = 'in_progress' | 'completed';
export type PatientSegment = 'vip' | 'regular';
export type SegmentFilter = 'all' | 'vip';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: PatientStatus;
  lastVisit: Date;
  segment: PatientSegment;
}

export interface PatientsPageProps {
  initialLang?: Language;
  initialTheme?: Theme;
  notificationCount?: number;
}

export interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  notificationCount: number;
}

export interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | PatientStatus;
  onStatusFilterChange: (status: 'all' | PatientStatus) => void;
  segmentFilter: SegmentFilter;
  onSegmentFilterChange: (segment: SegmentFilter) => void;
  isDark: boolean;
}

export interface PatientRowProps {
  patient: Patient;
  isDark: boolean;
  onClick: () => void;
}

export interface EmptyStateProps {
  isDark: boolean;
  onAddPatient: () => void;
}
