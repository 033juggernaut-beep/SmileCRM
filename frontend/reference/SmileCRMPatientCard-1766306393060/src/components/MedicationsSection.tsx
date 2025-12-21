/**
 * Medications section - list of prescribed medications
 * - Drug name, dosage, optional notes
 * - Add new medication
 * - Clean list-based design
 */

import { useState } from 'react';
import { Plus, Pill, X } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { MedicationsSectionProps, Medication } from '../types';

export function MedicationsSection({
  medications,
  isDark,
  onAdd,
  onSave,
  defaultOpen = false,
}: MedicationsSectionProps) {
  const [items, setItems] = useState<Medication[]>(medications);
  const isEmpty = items.length === 0;

  const handleRemove = (id: string) => {
    const updated = items.filter((m) => m.id !== id);
    setItems(updated);
    onSave(updated);
  };

  const addButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
        isDark
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
    >
      <Plus className="w-3 h-3" />
      <span>Добавить</span>
    </button>
  );

  return (
    <CollapsibleSection
      title="Назначенные препараты"
      isDark={isDark}
      defaultOpen={defaultOpen}
      headerAction={addButton}
    >
      {isEmpty ? (
        <div className="py-6 text-center">
          <Pill
            className={`w-8 h-8 mx-auto mb-2 ${
              isDark ? 'text-slate-600' : 'text-slate-300'
            }`}
          />
          <p
            className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Препараты не назначены
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((med) => (
            <div
              key={med.id}
              className={`p-3 rounded-xl transition-colors group ${
                isDark
                  ? 'bg-slate-700/40 hover:bg-slate-700/60'
                  : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Drug Name */}
                  <h4
                    className={`text-sm font-medium mb-0.5 ${
                      isDark ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {med.name}
                  </h4>
                  {/* Dosage */}
                  <p
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {med.dosage}
                  </p>
                  {/* Notes */}
                  {med.notes && (
                    <p
                      className={`text-xs mt-1 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {med.notes}
                    </p>
                  )}
                </div>
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(med.id)}
                  className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark
                      ? 'hover:bg-slate-600 text-slate-500 hover:text-slate-300'
                      : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
}
