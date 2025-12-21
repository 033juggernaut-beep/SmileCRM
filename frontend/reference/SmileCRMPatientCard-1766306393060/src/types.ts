/**
 * Type definitions for SmileCRM Patient Card Page
 * - Patient data structures with extended fields
 * - Visit records
 * - File attachments
 * - Medications
 * - Finance (payments, balance)
 * - Floating AI Assistant
 * - Marketing messages
 * - Collapsible section management
 */

export type Language = 'AM' | 'RU' | 'EN';

export type PatientStatus = 'in_progress' | 'completed';

export type PatientSegment = 'vip' | 'regular';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: PatientStatus;
  lastVisitDate?: string;
  notes: string;
  dateOfBirth: string;
  segment: PatientSegment;
  diagnosis: string;
}

export interface Visit {
  id: string;
  date: string;
  summary: string;
  nextVisitDate?: string;
}

export interface MedicalFile {
  id: string;
  name: string;
  type: 'xray' | 'photo' | 'document';
  url: string;
  uploadedAt: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  notes?: string;
}

// Finance types
export interface Payment {
  id: string;
  date: string;
  amount: number;
  description?: string;
}

export interface PatientFinance {
  totalCost: number;
  payments: Payment[];
  currency?: string;
}

export interface MarketingMessage {
  type: 'birthday' | 'discount' | 'reminder';
  content: string;
  isGenerated: boolean;
}

export interface HeaderProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  notificationCount?: number;
}

export interface BackButtonProps {
  label?: string;
  onClick?: () => void;
  isDark: boolean;
}

export interface PatientInfoProps {
  patient: Patient;
  isDark: boolean;
}

export interface CollapsibleSectionProps {
  title: string;
  isDark: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export interface VisitsSectionProps {
  visits: Visit[];
  isDark: boolean;
  onAddVisit: () => void;
  onEditVisit?: (visit: Visit) => void;
  defaultOpen?: boolean;
}

export interface NotesSectionProps {
  notes: string;
  isDark: boolean;
  onSave: (notes: string) => void;
  defaultOpen?: boolean;
}

export interface DiagnosisSectionProps {
  diagnosis: string;
  isDark: boolean;
  onSave: (diagnosis: string) => void;
  defaultOpen?: boolean;
}

export interface MedicationsSectionProps {
  medications: Medication[];
  isDark: boolean;
  onAdd: () => void;
  onSave: (medications: Medication[]) => void;
  defaultOpen?: boolean;
}

export interface FilesSectionProps {
  files: MedicalFile[];
  isDark: boolean;
  onAddFile: () => void;
  defaultOpen?: boolean;
}

// Floating AI Assistant props (replaces old collapsible version)
export interface FloatingAIAssistantProps {
  isDark: boolean;
  onAction: (action: AIAssistantAction) => void;
}

export type AIAssistantAction =
  | { type: 'diagnosis'; text: string }
  | { type: 'visit'; text: string }
  | { type: 'finance'; text: string }
  | { type: 'marketing'; text: string };

export interface FinanceSectionProps {
  finance: PatientFinance;
  isDark: boolean;
  defaultOpen?: boolean;
  onUpdateFinance?: (finance: PatientFinance) => void;
}

export interface MarketingSectionProps {
  isDark: boolean;
  patientName: string;
  dateOfBirth: string;
  defaultOpen?: boolean;
}

export interface PatientCardPageProps {
  initialLang?: Language;
  initialTheme?: 'light' | 'dark';
  notificationCount?: number;
}

// Treatment Plan types
export interface TreatmentStep {
  id: string;
  name: string;
  price: number;
  completed: boolean;
}

export interface TreatmentPlanSectionProps {
  steps: TreatmentStep[];
  isDark: boolean;
  defaultOpen?: boolean;
  onStepsChange?: (steps: TreatmentStep[]) => void;
  onGeneratePDF?: () => void;
}
