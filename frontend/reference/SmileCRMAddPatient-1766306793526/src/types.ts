/**
 * Type definitions for SmileCRM Add Patient Page
 * - Form data structure
 * - Component prop interfaces
 * - Collapsible section types
 */

export type Language = 'AM' | 'RU' | 'EN';
export type Theme = 'light' | 'dark';
export type PatientSegment = 'regular' | 'vip';

export interface FirstVisitData {
  visitDate: string;
  description: string;
  nextVisitDate: string;
}

export interface PatientFormData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  segment: PatientSegment;
  diagnosis: string;
  doctorNotes: string;
  firstVisit?: FirstVisitData;
}

export interface AddPatientPageProps {
  initialLang?: Language;
  initialTheme?: Theme;
  notificationCount?: number;
  onSave?: (data: PatientFormData) => void;
  onCancel?: () => void;
}

export interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  notificationCount: number;
}

export interface CollapsibleSectionProps {
  title: string;
  isDark: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'tel' | 'date';
  isDark: boolean;
}

export interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  isDark: boolean;
}

export interface SegmentSelectorProps {
  value: PatientSegment;
  onChange: (segment: PatientSegment) => void;
  isDark: boolean;
}

export type AIAssistantAction = {
  type: 'fill_form' | 'voice_input';
  text?: string;
};

export interface FloatingAIAssistantProps {
  isDark: boolean;
  onAction: (action: AIAssistantAction) => void;
}
