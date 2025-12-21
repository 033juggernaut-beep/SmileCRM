/**
 * Diagnosis section - medical diagnosis display and edit
 * - Section title with collapsible behavior
 * - Multiline text field for full diagnosis
 * - Edit/Save functionality
 * - Same card style as notes section
 */

import { useState } from 'react';
import { Save, Edit2 } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { DiagnosisSectionProps } from '../types';

export function DiagnosisSection({
  diagnosis,
  isDark,
  onSave,
  defaultOpen = true,
}: DiagnosisSectionProps) {
  const [currentDiagnosis, setCurrentDiagnosis] = useState(diagnosis);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const hasChanges = currentDiagnosis !== diagnosis;

  const handleSave = () => {
    setIsSaving(true);
    onSave(currentDiagnosis);
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
    }, 500);
  };

  const handleCancel = () => {
    setCurrentDiagnosis(diagnosis);
    setIsEditing(false);
  };

  return (
    <CollapsibleSection title="Диагноз" isDark={isDark} defaultOpen={defaultOpen}>
      {isEditing ? (
        <>
          <textarea
            value={currentDiagnosis}
            onChange={(e) => setCurrentDiagnosis(e.target.value)}
            placeholder="Введите диагноз пациента..."
            rows={4}
            className={`w-full p-3 rounded-xl text-sm resize-none transition-colors focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-slate-700/50 text-white placeholder-slate-500 border border-slate-600 focus:ring-blue-500/50 focus:border-blue-500'
                : 'bg-slate-50 text-slate-800 placeholder-slate-400 border border-slate-200 focus:ring-blue-500/30 focus:border-blue-400'
            }`}
          />
          <div className="mt-3 flex items-center justify-between">
            {hasChanges && (
              <span
                className={`text-xs ${
                  isDark ? 'text-amber-400' : 'text-amber-600'
                }`}
              >
                Есть изменения
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCancel}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  hasChanges
                    ? isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : isDark
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className={`p-3 rounded-xl text-sm leading-relaxed ${
              isDark
                ? 'bg-slate-700/30 text-slate-300'
                : 'bg-slate-50 text-slate-700'
            }`}
          >
            {currentDiagnosis || (
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                Диагноз не указан
              </span>
            )}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span>Редактировать</span>
            </button>
          </div>
        </>
      )}
    </CollapsibleSection>
  );
}
