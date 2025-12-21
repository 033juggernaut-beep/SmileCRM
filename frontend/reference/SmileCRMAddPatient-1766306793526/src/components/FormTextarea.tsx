/**
 * Form textarea field component
 * - Multiline text input
 * - Clear label
 * - Calm blue focus state
 * - Resizable
 */

import type { FormTextareaProps } from '../types';

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  isDark,
}: FormTextareaProps) {
  return (
    <div className="space-y-1.5">
      <label
        className={`block text-sm font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 rounded-xl text-base transition-all duration-200 outline-none resize-y min-h-[80px] ${
          isDark
            ? 'bg-slate-800/70 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 shadow-sm'
        }`}
      />
    </div>
  );
}
