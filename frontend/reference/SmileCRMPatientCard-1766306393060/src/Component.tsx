/**
 * SmileCRM Patient Card Page - Main Component (Extended)
 * The most important screen in the CRM - detailed patient view
 * 
 * Features:
 * - Patient basic info with DOB and segment (VIP/Regular)
 * - Diagnosis section with edit/save
 * - Visit history with next appointments
 * - Medications list with add/remove
 * - Doctor notes with auto-save indication
 * - Medical files (X-ray, photos, documents)
 * - Finance section (treatment cost, payments, balance)
 * - Floating AI Assistant widget (bottom-right)
 * - Marketing section with AI-generated messages
 * - All sections are collapsible (accordion style)
 * - Back navigation to patients list
 * - Light and dark theme support
 * - Responsive design for desktop and mobile
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { BackButton } from './components/BackButton';
import { PatientInfo } from './components/PatientInfo';
import { DiagnosisSection } from './components/DiagnosisSection';
import { VisitsSection } from './components/VisitsSection';
import { MedicationsSection } from './components/MedicationsSection';
import { NotesSection } from './components/NotesSection';
import { FilesSection } from './components/FilesSection';
import { FinanceSection } from './components/FinanceSection';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { MarketingSection } from './components/MarketingSection';
import { TreatmentPlanSection } from './components/TreatmentPlanSection';
import { Footer } from './components/Footer';
import { BackgroundPattern } from './icons/BackgroundPattern';
import { mockPatient, mockVisits, mockFiles, mockMedications, mockFinance, mockTreatmentSteps } from './data/mockData';
import type { PatientCardPageProps, Language, Visit, MedicalFile, Medication, PatientFinance, AIAssistantAction, TreatmentStep } from './types';

export function SmileCRMPatientCard({
  initialLang = 'RU',
  initialTheme = 'light',
  notificationCount = 3,
}: PatientCardPageProps) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [isDark, setIsDark] = useState(initialTheme === 'dark');
  const [patient, setPatient] = useState(mockPatient);
  const [visits, setVisits] = useState<Visit[]>(mockVisits);
  const [files] = useState<MedicalFile[]>(mockFiles);
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [finance, setFinance] = useState<PatientFinance>(mockFinance);
  const [treatmentSteps, setTreatmentSteps] = useState<TreatmentStep[]>(mockTreatmentSteps);

  const handleBack = () => {
    console.log('Navigate back to patients list');
  };

  const handleAddVisit = () => {
    console.log('Add new visit');
  };

  const handleEditVisit = (updatedVisit: Visit) => {
    setVisits(visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v)));
    console.log('Visit updated:', updatedVisit);
  };

  const handleSaveNotes = (notes: string) => {
    setPatient({ ...patient, notes });
    console.log('Notes saved:', notes);
  };

  const handleSaveDiagnosis = (diagnosis: string) => {
    setPatient({ ...patient, diagnosis });
    console.log('Diagnosis saved:', diagnosis);
  };

  const handleAddMedication = () => {
    console.log('Add new medication');
  };

  const handleSaveMedications = (meds: Medication[]) => {
    setMedications(meds);
    console.log('Medications saved:', meds);
  };

  const handleAddFile = () => {
    console.log('Add new file');
  };

  const handleUpdateFinance = (updatedFinance: PatientFinance) => {
    setFinance(updatedFinance);
    console.log('Finance updated:', updatedFinance);
  };

  const handleTreatmentStepsChange = (steps: TreatmentStep[]) => {
    setTreatmentSteps(steps);
    // Update patient status based on treatment plan completion
    const allCompleted = steps.length > 0 && steps.every(s => s.completed);
    const hasSteps = steps.length > 0;
    if (allCompleted) {
      setPatient(prev => ({ ...prev, status: 'completed' }));
    } else if (hasSteps) {
      setPatient(prev => ({ ...prev, status: 'in_progress' }));
    }
    console.log('Treatment steps updated:', steps);
  };

  const handleGeneratePDF = () => {
    console.log('Generating PDF for treatment plan...');
    // In real app, this would generate and download a PDF
  };

  const handleAIAction = (action: AIAssistantAction) => {
    console.log(`AI Assistant action:`, action);
    // Handle different AI actions based on type
    switch (action.type) {
      case 'diagnosis':
        setPatient({ ...patient, diagnosis: patient.diagnosis + '\n' + action.text });
        break;
      case 'visit':
        console.log('Add visit from AI:', action.text);
        break;
      case 'finance':
        console.log('Update finance from AI:', action.text);
        break;
      case 'marketing':
        console.log('Generate marketing from AI:', action.text);
        break;
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-sky-50/50'
      }`}
    >
      {/* Subtle Background Pattern */}
      <BackgroundPattern isDark={isDark} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          currentLang={currentLang}
          onLangChange={setCurrentLang}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
          notificationCount={notificationCount}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-4">
          {/* Back Button */}
          <div className="mb-4">
            <BackButton label="Назад" onClick={handleBack} isDark={isDark} />
          </div>

          {/* Content Sections - Ordered per requirements */}
          <div className="flex flex-col gap-4 pb-8">
            {/* 1. Patient Information - Always visible */}
            <PatientInfo patient={patient} isDark={isDark} />

            {/* 2. Diagnosis - Expandable, default open */}
            <DiagnosisSection
              diagnosis={patient.diagnosis}
              isDark={isDark}
              onSave={handleSaveDiagnosis}
              defaultOpen={true}
            />

            {/* 3. Visits - Chronological list (latest first) */}
            <VisitsSection
              visits={visits}
              isDark={isDark}
              onAddVisit={handleAddVisit}
              onEditVisit={handleEditVisit}
              defaultOpen={true}
            />

            {/* 4. Files - X-rays, photos, documents */}
            <FilesSection
              files={files}
              isDark={isDark}
              onAddFile={handleAddFile}
              defaultOpen={false}
            />

            {/* 5. Prescribed Medications */}
            <MedicationsSection
              medications={medications}
              isDark={isDark}
              onAdd={handleAddMedication}
              onSave={handleSaveMedications}
              defaultOpen={false}
            />

            {/* 6. Doctor Notes - Free text notes */}
            <NotesSection
              notes={patient.notes}
              isDark={isDark}
              onSave={handleSaveNotes}
              defaultOpen={false}
            />

            {/* 7. Marketing - AI-generated content */}
            <MarketingSection
              isDark={isDark}
              patientName={`${patient.firstName} ${patient.lastName}`}
              dateOfBirth={patient.dateOfBirth}
              defaultOpen={false}
            />

            {/* 8. Finance - Last section */}
            <FinanceSection
              finance={finance}
              isDark={isDark}
              defaultOpen={false}
              onUpdateFinance={handleUpdateFinance}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer isDark={isDark} />
      </div>

      {/* Floating AI Assistant Widget - Bottom Right */}
      <FloatingAIAssistant
        isDark={isDark}
        onAction={handleAIAction}
      />
    </div>
  );
}

export default SmileCRMPatientCard;
