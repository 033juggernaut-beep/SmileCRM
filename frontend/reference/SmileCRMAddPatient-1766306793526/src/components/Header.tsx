/**
 * Header component - consistent with dashboard
 * - SmileCRM logo with tooth icon
 * - Language switcher (AM | RU | EN)
 * - Notification bell
 * - Theme toggle
 */

import { Bell, Moon, Sun } from 'lucide-react';
import { ToothLogo } from '../icons/ToothLogo';
import type { HeaderProps, Language } from '../types';

const languages: Language[] = ['AM', 'RU', 'EN'];

export function Header({
  currentLang,
  onLangChange,
  isDark,
  onThemeToggle,
  notificationCount,
}: HeaderProps) {
  return (
    <header
      className={`w-full px-4 py-3 flex items-center justify-between border-b transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-sm'
          : 'bg-white/80 border-blue-100 backdrop-blur-sm'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <ToothLogo
          className={`w-7 h-7 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
        />
        <span
          className={`text-lg font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}
        >
          SmileCRM
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <div
          className={`flex items-center gap-0.5 p-1 rounded-lg ${
            isDark ? 'bg-slate-800' : 'bg-blue-50'
          }`}
        >
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => onLangChange(lang)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                currentLang === lang
                  ? isDark
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Notification Bell */}
        <button
          className={`relative p-2 rounded-lg transition-colors duration-150 ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-blue-50'
          }`}
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-lg transition-colors duration-150 ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-700 hover:bg-blue-50'
          }`}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
