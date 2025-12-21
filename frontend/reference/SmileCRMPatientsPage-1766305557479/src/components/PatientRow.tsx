/**
 * Individual patient row/card in the list
 * - Patient name, VIP badge, status badge, last visit, phone
 * - VIP badge: soft blue pill, subtle and professional
 * - Subtle hover effect with blue outline
 * - Entire row is clickable
 */

import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import type { PatientRowProps } from '../types';

export function PatientRow({ patient, isDark, onClick }: PatientRowProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3');
  };

  const isInProgress = patient.status === 'in_progress';
  const isVIP = patient.segment === 'vip';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
      className={`w-full p-4 rounded-xl text-left transition-all duration-150 flex items-center gap-4 group ${
        isDark
          ? 'bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800'
          : 'bg-white border border-blue-50 hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 shadow-sm'
      }`}
    >
      {/* Avatar Placeholder */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
          isDark
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {patient.firstName[0]}
        {patient.lastName[0]}
      </div>

      {/* Patient Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`font-medium truncate ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            {patient.firstName} {patient.lastName}
          </span>

          {/* VIP Badge - Only shown for VIP patients */}
          {isVIP && (
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                isDark
                  ? 'bg-sky-500/20 text-sky-400'
                  : 'bg-sky-100 text-sky-600'
              }`}
            >
              VIP
            </span>
          )}
          
          {/* Status Badge */}
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              isInProgress
                ? isDark
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
                : isDark
                  ? 'bg-slate-700 text-slate-400'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isInProgress ? 'В процессе' : 'Завершён'}
          </span>
        </div>

        {/* Last Visit */}
        <p
          className={`text-xs mt-0.5 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          Последний визит: {formatDate(patient.lastVisit)}
        </p>
      </div>

      {/* Phone */}
      <div
        className={`hidden sm:flex items-center gap-1.5 text-sm ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        <Phone className="w-3.5 h-3.5" />
        <span>{formatPhone(patient.phone)}</span>
      </div>
    </motion.button>
  );
}
