/**
 * Dashboard header component with medical blue theme
 * - Logo and branding
 * - Language switch (AM | RU | EN)
 * - Notification bell
 * - Theme toggle
 * - Clean, calm, static design
 */

import { Bell, Sun, Moon } from 'lucide-react';
import { ToothLogo } from '../icons/ToothLogo';
import type { HeaderProps, Language } from '../types';

const languages: Language[] = ['AM', 'RU', 'EN'];

export function Header({
  currentLang,
  onLangChange,
  isDark,
  onThemeToggle,
  notificationCount = 0,
}: HeaderProps) {
  return (
    <header
      className={`w-full px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900/80 border-slate-700/50'
          : 'bg-white/90 border-blue-100'
      }`}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <ToothLogo
          className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
        />
        <span
          className={`text-lg font-semibold tracking-wide ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}
        >
          SmileCRM
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-5">
        {/* Language Switch */}
        <div className="flex items-center gap-1 text-sm">
          {languages.map((lang, index) => (
            <span key={lang} className="flex items-center">
              <button
                onClick={() => onLangChange(lang)}
                className={`px-1.5 py-0.5 transition-colors duration-200 font-medium ${
                  currentLang === lang
                    ? isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {lang}
              </button>
              {index < languages.length - 1 && (
                <span
                  className={`mx-1 ${isDark ? 'text-slate-600' : 'text-slate-300'}`}
                >
                  |
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <Bell
            className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center text-white font-semibold">
              {notificationCount}
            </span>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
