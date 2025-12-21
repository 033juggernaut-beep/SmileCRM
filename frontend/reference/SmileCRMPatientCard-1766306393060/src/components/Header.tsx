/**
 * Header component - consistent with dashboard and patients list
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
  notificationCount = 0,
}: HeaderProps) {
  return (
    <header
      className={`w-full px-4 py-3 flex items-center justify-between border-b transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/80 border-slate-800 backdrop-blur-sm'
          : 'bg-white/80 border-slate-200 backdrop-blur-sm'
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
      <div className="flex items-center gap-4">
        {/* Language Switch */}
        <div className="flex items-center gap-1">
          {languages.map((lang, index) => (
            <span key={lang} className="flex items-center">
              <button
                onClick={() => onLangChange(lang)}
                className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                  currentLang === lang
                    ? isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                    : isDark
                    ? 'text-slate-500 hover:text-slate-300'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang}
              </button>
              {index < languages.length - 1 && (
                <span
                  className={`text-xs ${
                    isDark ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  |
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Notification Bell */}
        <button
          className={`relative p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <Bell
            className={`w-5 h-5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-slate-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-500" />
          )}
        </button>
      </div>
    </header>
  );
}
