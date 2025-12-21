/**
 * Form checkbox component
 * - Clean, minimal design
 * - Blue accent when checked
 * - Optional description text
 */

interface FormCheckboxProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isDark: boolean;
}

export function FormCheckbox({
  label,
  description,
  checked,
  onChange,
  isDark,
}: FormCheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="pt-0.5">
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 ${
            checked
              ? 'bg-blue-500 border-blue-500'
              : isDark
                ? 'border-slate-600 group-hover:border-slate-500'
                : 'border-slate-300 group-hover:border-slate-400'
          }`}
        >
          {checked && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
      <div>
        <span
          className={`text-sm font-medium ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label}
        </span>
        {description && (
          <p
            className={`text-xs mt-0.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            {description}
          </p>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}
