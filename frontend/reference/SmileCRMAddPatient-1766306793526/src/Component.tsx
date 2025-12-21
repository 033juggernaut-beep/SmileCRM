/**
 * SmileCRM Add Patient Page - Main Component
 * Professional dental CRM add patient form
 * 
 * Features:
 * - Medical blue color palette (matches dashboard)
 * - Fast data entry optimized for doctors
 * - Required fields: Name, Phone
 * - Optional fields: Birth date, Segment
 * - Collapsible optional sections: Diagnosis, Notes, First Visit
 * - Floating AI assistant for voice/text input
 * - Light and dark theme support
 * - Designed for completion in under 10 seconds (without visit)
 * - Or add patient + first visit in one step
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { PageTitle } from './components/PageTitle';
import { Footer } from './components/Footer';
import { FormInput } from './components/FormInput';
import { FormTextarea } from './components/FormTextarea';

import { SegmentSelector } from './components/SegmentSelector';
import { CollapsibleSection } from './components/CollapsibleSection';
import { ActionButtons } from './components/ActionButtons';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
import { BackgroundPattern } from './icons/BackgroundPattern';
import type { AddPatientPageProps, Language, PatientFormData, PatientSegment, AIAssistantAction, FirstVisitData } from './types';

export function SmileCRMAddPatient({
  initialLang = 'RU',
  initialTheme = 'light',
  notificationCount = 3,
  onSave,
  onCancel,
}: AddPatientPageProps) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [isDark, setIsDark] = useState(initialTheme === 'dark');
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [segment, setSegment] = useState<PatientSegment>('regular');
  const [diagnosis, setDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  
  // First visit state
  const [visitDate, setVisitDate] = useState('');
  const [visitDescription, setVisitDescription] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      return;
    }

    setIsLoading(true);

    // Build first visit data only if visit date is provided
    let firstVisit: FirstVisitData | undefined = undefined;
    if (visitDate) {
      firstVisit = {
        visitDate,
        description: visitDescription.trim(),
        nextVisitDate,
      };
    }

    const formData: PatientFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      birthDate,
      segment,
      diagnosis: diagnosis.trim(),
      doctorNotes: doctorNotes.trim(),
      firstVisit,
    };

    // Simulate save delay
    setTimeout(() => {
      setIsLoading(false);
      if (onSave) {
        onSave(formData);
      }
      console.log('Patient saved:', formData);
    }, 800);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    console.log('Add patient cancelled');
  };

  const handleAIAction = (action: AIAssistantAction) => {
    console.log('AI Action:', action);
    // Example: auto-fill from AI input
    if (action.type === 'fill_form' && action.text) {
      // Parse AI input and fill fields (simplified demo)
      const text = action.text;
      if (text.toLowerCase().includes('vip')) {
        setSegment('vip');
      }
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
      {/* Background Pattern */}
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

        {/* Page Title */}
        <PageTitle
          title="Добавить пациента"
          subtitle="Основная информация о пациенте"
          isDark={isDark}
          showBackButton={true}
          backLabel="Назад"
          onBack={handleCancel}
        />

        {/* Form Content */}
        <main className="flex-1 pb-24">
          <div className="w-full max-w-2xl mx-auto px-4 space-y-6">
            {/* Main Form Card */}
            <div
              className={`rounded-2xl p-6 transition-colors ${
                isDark
                  ? 'bg-slate-800/50 border border-slate-700/50'
                  : 'bg-white border border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="space-y-5">
                {/* Required Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Имя"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Введите имя"
                    required={true}
                    isDark={isDark}
                  />
                  <FormInput
                    label="Фамилия"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Введите фамилию"
                    required={true}
                    isDark={isDark}
                  />
                </div>

                <FormInput
                  label="Телефон"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+7 (___) ___-__-__"
                  required={true}
                  type="tel"
                  isDark={isDark}
                />

                {/* Optional Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Дата рождения"
                    value={birthDate}
                    onChange={setBirthDate}
                    type="date"
                    isDark={isDark}
                  />
                  <SegmentSelector
                    value={segment}
                    onChange={setSegment}
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>

            {/* Optional Collapsible Sections */}
            <div className="space-y-3">
              {/* Diagnosis */}
              <CollapsibleSection title="Диагноз (опционально)" isDark={isDark}>
                <FormTextarea
                  label="Описание диагноза"
                  value={diagnosis}
                  onChange={setDiagnosis}
                  placeholder="Можно заполнить позже..."
                  rows={3}
                  isDark={isDark}
                />
              </CollapsibleSection>

              {/* Doctor Notes */}
              <CollapsibleSection title="Заметки врача (опционально)" isDark={isDark}>
                <FormTextarea
                  label="Личные заметки"
                  value={doctorNotes}
                  onChange={setDoctorNotes}
                  placeholder="Дополнительная информация..."
                  rows={3}
                  isDark={isDark}
                />
              </CollapsibleSection>

              {/* First Visit */}
              <CollapsibleSection title="Первый визит (опционально)" isDark={isDark}>
                <div className="space-y-4">
                  <FormInput
                    label="Дата визита"
                    value={visitDate}
                    onChange={setVisitDate}
                    type="date"
                    isDark={isDark}
                  />
                  <FormTextarea
                    label="Описание / заметки"
                    value={visitDescription}
                    onChange={setVisitDescription}
                    placeholder="Причина визита, жалобы, план лечения..."
                    rows={3}
                    isDark={isDark}
                  />
                  <FormInput
                    label="Следующий визит"
                    value={nextVisitDate}
                    onChange={setNextVisitDate}
                    type="date"
                    isDark={isDark}
                  />
                </div>
              </CollapsibleSection>
            </div>

            {/* Action Buttons */}
            <ActionButtons
              onSave={handleSave}
              onCancel={handleCancel}
              isDark={isDark}
              isLoading={isLoading}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer isDark={isDark} />

        {/* Floating AI Assistant */}
        <FloatingAIAssistant isDark={isDark} onAction={handleAIAction} />
      </div>
    </div>
  );
}

export default SmileCRMAddPatient;
