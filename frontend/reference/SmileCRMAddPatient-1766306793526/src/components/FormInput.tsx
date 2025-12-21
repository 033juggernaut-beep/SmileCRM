/**
 * Form input field component
 * - Large, accessible input fields
 * - Clear labels above inputs
 * - Calm blue focus state
 * - Support for text, tel, date types
 */

import type { FormInputProps } from '../types';

export function FormInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  isDark,
}: FormInputProps) {
  return (
    <div className="space-y-1.5">
      <label
        className={`block text-sm font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        {label}
        {required && <span className="text-blue-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 rounded-xl text-base transition-all duration-200 outline-none ${
          isDark
            ? 'bg-slate-800/70 border border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            : 'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 shadow-sm'
        }`}
      />
    </div>
  );
}
