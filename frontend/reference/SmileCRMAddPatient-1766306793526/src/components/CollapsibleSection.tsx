/**
 * Collapsible section for optional form fields
 * - Clean expand/collapse toggle
 * - Smooth animation
 * - Collapsed by default
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CollapsibleSectionProps } from '../types';

export function CollapsibleSection({
  title,
  isDark,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`rounded-xl overflow-hidden transition-colors ${
        isDark
          ? 'bg-slate-800/40 border border-slate-700/50'
          : 'bg-white border border-slate-200/80 shadow-sm'
      }`}
    >
      {/* Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <span
          className={`text-sm font-medium ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
        />
      </button>

      {/* Content */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className={`px-4 pb-4 pt-1 ${
            isDark ? 'border-t border-slate-700/50' : 'border-t border-slate-100'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
