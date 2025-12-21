/**
 * Visits section - displays visit history with edit support
 * - Section title
 * - List of visits (date, summary, next visit)
 * - Edit button on each visit item
 * - Modal editing (date, description, next visit)
 * - Empty state
 * - Add visit button
 * - Collapsible wrapper
 */

import { useState } from 'react';
import { Plus, Calendar, ArrowRight, Pencil, X, Check } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { VisitsSectionProps, Visit } from '../types';

interface EditModalProps {
  visit: Visit;
  isDark: boolean;
  onSave: (visit: Visit) => void;
  onClose: () => void;
}

function EditVisitModal({ visit, isDark, onSave, onClose }: EditModalProps) {
  const [editedVisit, setEditedVisit] = useState<Visit>({ ...visit });

  const handleSave = () => {
    onSave(editedVisit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3
            className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}
          >
            Редактировать визит
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Date Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Дата визита
            </label>
            <input
              type="text"
              value={editedVisit.date}
              onChange={(e) =>
                setEditedVisit({ ...editedVisit, date: e.target.value })
              }
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Например: 15 янв 2025"
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Описание
            </label>
            <textarea
              value={editedVisit.summary}
              onChange={(e) =>
                setEditedVisit({ ...editedVisit, summary: e.target.value })
              }
              rows={3}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors resize-none ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Описание визита..."
            />
          </div>

          {/* Next Visit Date Field */}
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Следующий визит
            </label>
            <input
              type="text"
              value={editedVisit.nextVisitDate || ''}
              onChange={(e) =>
                setEditedVisit({
                  ...editedVisit,
                  nextVisitDate: e.target.value || undefined,
                })
              }
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Оставьте пустым, если не запланирован"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'text-slate-300 hover:bg-slate-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Check className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export function VisitsSection({
  visits,
  isDark,
  onAddVisit,
  onEditVisit,
  defaultOpen = true,
}: VisitsSectionProps) {
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const isEmpty = visits.length === 0;

  const handleEditClick = (e: React.MouseEvent, visit: Visit) => {
    e.stopPropagation();
    setEditingVisit(visit);
  };

  const handleSaveEdit = (updatedVisit: Visit) => {
    if (onEditVisit) {
      onEditVisit(updatedVisit);
    }
    setEditingVisit(null);
  };

  const addButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onAddVisit();
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
        isDark
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
    >
      <Plus className="w-3 h-3" />
      <span>Новый визит</span>
    </button>
  );

  return (
    <>
      <CollapsibleSection
        title="Визиты"
        isDark={isDark}
        defaultOpen={defaultOpen}
        headerAction={addButton}
      >
        {isEmpty ? (
          <div className="py-6 text-center">
            <p
              className={`text-sm mb-4 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Визитов пока нет
            </p>
            <button
              onClick={onAddVisit}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Добавить первый визит</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className={`group p-3 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-slate-700/40 hover:bg-slate-700/60'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Visit Header with Date and Edit Button */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {visit.date}
                    </span>
                  </div>
                  {/* Edit Button */}
                  <button
                    onClick={(e) => handleEditClick(e, visit)}
                    className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                      isDark
                        ? 'text-slate-400 hover:bg-slate-600 hover:text-blue-400'
                        : 'text-slate-400 hover:bg-slate-200 hover:text-blue-600'
                    }`}
                    title="Редактировать визит"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary */}
                <p
                  className={`text-sm mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {visit.summary}
                </p>

                {/* Next Visit */}
                {visit.nextVisitDate && (
                  <div className="flex items-center gap-1.5">
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Следующий визит: {visit.nextVisitDate}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Edit Modal */}
      {editingVisit && (
        <EditVisitModal
          visit={editingVisit}
          isDark={isDark}
          onSave={handleSaveEdit}
          onClose={() => setEditingVisit(null)}
        />
      )}
    </>
  );
}
