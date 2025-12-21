/**
 * Patient basic info block - top section of patient card
 * Extended with:
 * - Full name (large, prominent)
 * - Status badge (in_progress / completed)
 * - Phone number
 * - Last visit date
 * - Date of birth
 * - Patient segment (VIP / Regular)
 */

import { Phone, Calendar, User, Star } from 'lucide-react';
import type { PatientInfoProps } from '../types';

export function PatientInfo({ patient, isDark }: PatientInfoProps) {
  const statusConfig = {
    in_progress: {
      label: 'В процессе',
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      text: isDark ? 'text-blue-400' : 'text-blue-700',
    },
    completed: {
      label: 'Завершён',
      bg: isDark ? 'bg-slate-600/30' : 'bg-slate-200',
      text: isDark ? 'text-slate-400' : 'text-slate-600',
    },
  };

  const segmentConfig = {
    vip: {
      label: 'VIP',
      bg: isDark ? 'bg-blue-600/30' : 'bg-blue-500/10',
      text: isDark ? 'text-blue-300' : 'text-blue-600',
      border: isDark ? 'border-blue-500/30' : 'border-blue-300',
      icon: true,
    },
    regular: {
      label: 'Обычный',
      bg: isDark ? 'bg-slate-700/50' : 'bg-slate-100',
      text: isDark ? 'text-slate-400' : 'text-slate-500',
      border: 'border-transparent',
      icon: false,
    },
  };

  const status = statusConfig[patient.status];
  const segment = segmentConfig[patient.segment];

  return (
    <div
      className={`w-full rounded-2xl p-5 transition-colors ${
        isDark
          ? 'bg-slate-800/60 border border-slate-700/50'
          : 'bg-white border border-slate-200'
      }`}
    >
      {/* Name and Status Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h2
          className={`text-xl font-semibold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}
        >
          {patient.firstName} {patient.lastName}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Segment Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${segment.bg} ${segment.text} ${segment.border}`}
          >
            {segment.icon && <Star className="w-3 h-3" />}
            {segment.label}
          </span>
          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status.bg} ${status.text}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Info Grid - Compact 2x2 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {/* Phone */}
        <div className="flex items-center gap-2">
          <Phone
            className={`w-4 h-4 flex-shrink-0 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-sm truncate ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {patient.phone}
          </span>
        </div>

        {/* Date of Birth */}
        <div className="flex items-center gap-2">
          <User
            className={`w-4 h-4 flex-shrink-0 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
          <span
            className={`text-sm ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
              Дата рождения:{' '}
            </span>
            {patient.dateOfBirth}
          </span>
        </div>

        {/* Last Visit */}
        {patient.lastVisitDate && (
          <div className="flex items-center gap-2 col-span-2">
            <Calendar
              className={`w-4 h-4 flex-shrink-0 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
            <span
              className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Последний визит: {patient.lastVisitDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
