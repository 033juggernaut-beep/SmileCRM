/**
 * Back navigation button - reusable across inner pages
 * - Minimal, calm, medical SaaS style
 * - Left arrow icon with text label
 * - Subtle hover effect
 */

import { ChevronLeft } from 'lucide-react';
import type { BackButtonProps } from '../types';

export function BackButton({
  label = 'Назад',
  onClick,
  isDark,
}: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 
        text-sm font-medium 
        transition-colors duration-150
        group
        ${
          isDark
            ? 'text-slate-400 hover:text-blue-400'
            : 'text-slate-500 hover:text-blue-600'
        }
      `}
    >
      <ChevronLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
      <span className="group-hover:underline underline-offset-2">{label}</span>
    </button>
  );
}
