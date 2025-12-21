/**
 * Patient segment selector (VIP / Regular)
 * - Toggle-style selection
 * - Subtle, professional design
 * - VIP has soft blue highlight
 */

import type { SegmentSelectorProps, PatientSegment } from '../types';

const segments: { value: PatientSegment; label: string }[] = [
  { value: 'regular', label: 'Обычный' },
  { value: 'vip', label: 'VIP' },
];

export function SegmentSelector({
  value,
  onChange,
  isDark,
}: SegmentSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label
        className={`block text-sm font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        Сегмент
      </label>
      <div
        className={`inline-flex p-1 rounded-xl ${
          isDark ? 'bg-slate-800' : 'bg-slate-100'
        }`}
      >
        {segments.map((segment) => (
          <button
            key={segment.value}
            type="button"
            onClick={() => onChange(segment.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
              value === segment.value
                ? segment.value === 'vip'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white text-slate-800 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-300'
                  : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {segment.label}
          </button>
        ))}
      </div>
    </div>
  );
}
