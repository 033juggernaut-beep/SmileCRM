/**
 * Form action buttons - Save and Cancel
 * - Clear visual hierarchy
 * - Primary: Save button
 * - Secondary: Cancel button
 * - Responsive layout
 */

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isDark: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ActionButtons({
  onSave,
  onCancel,
  isDark,
  saveLabel = 'Сохранить пациента',
  cancelLabel = 'Отмена',
  isLoading = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
          isDark
            ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
            : 'text-slate-600 hover:text-slate-700 hover:bg-slate-100'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {cancelLabel}
      </button>

      {/* Save Button */}
      <button
        type="submit"
        onClick={onSave}
        disabled={isLoading}
        className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm hover:shadow-md ${
          isDark
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Сохранение...
          </span>
        ) : (
          saveLabel
        )}
      </button>
    </div>
  );
}
