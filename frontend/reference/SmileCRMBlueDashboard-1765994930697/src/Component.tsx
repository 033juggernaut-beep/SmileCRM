/**
 * SmileCRM Blue Dashboard - Main Component
 * Professional dental CRM with medical blue color palette
 * 
 * Features:
 * - Medical blue / soft cyan / calm navy palette
 * - Light and dark theme support
 * - Header with logo, language switch, notifications, theme toggle
 * - Welcome section with rounded container
 * - 4 primary action cards in 2x2 grid
 * - Subtle dental background pattern
 * - Responsive design for Telegram Mini App
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { WelcomeBlock } from './components/WelcomeBlock';
import { DashboardGrid } from './components/DashboardGrid';
import { Footer } from './components/Footer';
import { BackgroundPattern } from './icons/BackgroundPattern';
import type { DashboardProps, Language } from './types';

export function SmileCRMBlueDashboard({
  initialLang = 'RU',
  initialTheme = 'light',
  totalPatients = 1247,
  todayVisits = 12,
  notificationCount = 3,
}: DashboardProps) {
  const [currentLang, setCurrentLang] = useState<Language>(initialLang);
  const [isDark, setIsDark] = useState(initialTheme === 'dark');

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

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-start px-4 py-8 md:py-12 gap-8 md:gap-10">
          {/* Welcome Section */}
          <WelcomeBlock
            title="Добро пожаловать"
            subtitle="Управление стоматологической практикой"
            isDark={isDark}
          />

          {/* Dashboard Cards Grid */}
          <DashboardGrid
            totalPatients={totalPatients}
            todayVisits={todayVisits}
            isDark={isDark}
          />
        </main>

        {/* Footer */}
        <Footer isDark={isDark} />
      </div>
    </div>
  );
}

export default SmileCRMBlueDashboard;
