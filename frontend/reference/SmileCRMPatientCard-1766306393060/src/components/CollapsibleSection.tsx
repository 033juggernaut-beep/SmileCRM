/**
 * Collapsible section wrapper - accordion-style component
 * - Smooth open/close animation
 * - Header with title and optional action
 * - Consistent card styling
 * - Reusable across all sections
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CollapsibleSectionProps } from '../types';

export function CollapsibleSection({
  title,
  isDark,
  defaultOpen = false,
  children,
  headerAction,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden transition-colors ${
        isDark
          ? 'bg-slate-800/60 border border-slate-700/50'
          : 'bg-white border border-slate-200'
      }`}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
          isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <h3
            className={`text-base font-semibold ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {headerAction && (
            <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>
          )}
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-200 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}
