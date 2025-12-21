/**
 * Empty state when no patients exist
 * - Minimal abstract medical illustration
 * - Informational text
 * - Primary action button
 * - Calm, non-marketing tone
 */

import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import type { EmptyStateProps } from '../types';

export function EmptyState({ isDark, onAddPatient }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center"
    >
      {/* Abstract Medical Illustration */}
      <div
        className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 ${
          isDark ? 'bg-slate-800' : 'bg-blue-50'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          className="w-14 h-14"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract clipboard/document shape */}
          <rect
            x="16"
            y="8"
            width="32"
            height="48"
            rx="4"
            className={isDark ? 'fill-slate-700' : 'fill-blue-100'}
          />
          <rect
            x="24"
            y="4"
            width="16"
            height="8"
            rx="2"
            className={isDark ? 'fill-blue-500' : 'fill-blue-400'}
          />
          {/* Lines representing content */}
          <rect
            x="22"
            y="20"
            width="20"
            height="3"
            rx="1.5"
            className={isDark ? 'fill-slate-600' : 'fill-blue-200'}
          />
          <rect
            x="22"
            y="28"
            width="16"
            height="3"
            rx="1.5"
            className={isDark ? 'fill-slate-600' : 'fill-blue-200'}
          />
          <rect
            x="22"
            y="36"
            width="18"
            height="3"
            rx="1.5"
            className={isDark ? 'fill-slate-600' : 'fill-blue-200'}
          />
          {/* Plus symbol */}
          <circle
            cx="42"
            cy="46"
            r="10"
            className={isDark ? 'fill-blue-500' : 'fill-blue-500'}
          />
          <rect
            x="40"
            y="41"
            width="4"
            height="10"
            rx="1"
            fill="white"
          />
          <rect
            x="37"
            y="44"
            width="10"
            height="4"
            rx="1"
            fill="white"
          />
        </svg>
      </div>

      {/* Text */}
      <h3
        className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}
      >
        Пациентов пока нет
      </h3>
      <p
        className={`text-sm mb-6 max-w-xs ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        Добавьте первого пациента, чтобы начать работу
      </p>

      {/* Primary Action Button */}
      <button
        onClick={onAddPatient}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        <UserPlus className="w-4 h-4" />
        Добавить пациента
      </button>
    </motion.div>
  );
}
