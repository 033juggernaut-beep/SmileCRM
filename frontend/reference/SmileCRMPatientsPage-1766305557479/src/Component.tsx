/**
 * SmileCRM Patients Page - Main Component
 * Professional dental CRM patient list screen
 * 
 * Features:
 * - Medical blue color palette (matches dashboard)
 * - Search and filter functionality
 * - Segment filter (All / VIP only)
 * - Patient list with status and VIP indicators
 * - Empty state for new users
 * - Floating add patient button
 * - Light and dark theme support
 * - Responsive design for desktop and mobile
 */

import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { PageTitle } from './components/PageTitle';
import { SearchFilter } from './components/SearchFilter';
import { PatientsList } from './components/PatientsList';
import { EmptyState } from './components/EmptyState';
import { AddPatientButton } from './components/AddPatientButton';
import { Footer } from './components/Footer';
import { BackgroundPattern } from './icons/BackgroundPattern';
import { mockPatients } from './data/mockPatients';
import type { PatientsPageProps, Language, Patient, PatientStatus, SegmentFilter } from './types';

export function SmileCRMPatientsPage({
  initialLang = 'RU',
  initialTheme = 'light',
  notificationCount = 3,
}: PatientsPageProps) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [isDark, setIsDark] = useState(initialTheme === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PatientStatus>('all');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [patients] = useState<Patient[]>(mockPatients);

  // Filter patients based on search, status, and segment
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const nameMatch =
        `${patient.firstName} ${patient.lastName}`
          .toLowerCase()
          .includes(searchLower) ||
        patient.phone.includes(searchQuery);

      // Status filter
      const statusMatch =
        statusFilter === 'all' || patient.status === statusFilter;

      // Segment filter
      const segmentMatch =
        segmentFilter === 'all' || patient.segment === 'vip';

      return nameMatch && statusMatch && segmentMatch;
    });
  }, [patients, searchQuery, statusFilter, segmentFilter]);

  const handlePatientClick = (patient: Patient) => {
    console.log('Patient clicked:', patient);
  };

  const handleAddPatient = () => {
    console.log('Add patient clicked');
  };

  const showEmptyState = patients.length === 0;
  const showNoResults = patients.length > 0 && filteredPatients.length === 0;

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

        {/* Page Title with Back Button */}
        <PageTitle
          title="Мои пациенты"
          subtitle="Список всех пациентов"
          isDark={isDark}
          showBackButton={true}
          backLabel="Назад"
          onBack={() => console.log('Navigate to dashboard')}
        />

        {/* Search & Filter */}
        {!showEmptyState && (
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            segmentFilter={segmentFilter}
            onSegmentFilterChange={setSegmentFilter}
            isDark={isDark}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 pb-24">
          {showEmptyState ? (
            <EmptyState isDark={isDark} onAddPatient={handleAddPatient} />
          ) : showNoResults ? (
            <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
              <p
                className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Пациенты не найдены
              </p>
            </div>
          ) : (
            <PatientsList
              patients={filteredPatients}
              isDark={isDark}
              onPatientClick={handlePatientClick}
            />
          )}
        </main>

        {/* Footer */}
        <Footer isDark={isDark} />

        {/* Floating Add Button */}
        {!showEmptyState && <AddPatientButton onClick={handleAddPatient} />}
      </div>
    </div>
  );
}

export default SmileCRMPatientsPage;
