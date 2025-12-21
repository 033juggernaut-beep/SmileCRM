/**
 * Treatment Plan Section - Live treatment plan management
 * 
 * Features:
 * - List of treatment steps with status checkboxes
 * - Each step shows: treatment name, price (AMD), completion status
 * - Add new step button
 * - Generate PDF button
 * - Automatic total calculation
 * - Completed steps are visually muted
 * - Plan status affects patient status (in_progress/completed)
 * 
 * This is a practical clinical tool for fast daily use by dentists.
 */

import { useState } from 'react';
import { Plus, FileText, Check } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { TreatmentStep, TreatmentPlanSectionProps } from '../types';

export function TreatmentPlanSection({
  steps: initialSteps,
  isDark,
  defaultOpen = false,
  onStepsChange,
  onGeneratePDF,
}: TreatmentPlanSectionProps) {
  const [steps, setSteps] = useState<TreatmentStep[]>(initialSteps);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepPrice, setNewStepPrice] = useState('');

  const totalPrice = steps.reduce((sum, step) => sum + step.price, 0);
  const completedCount = steps.filter(s => s.completed).length;
  const allCompleted = steps.length > 0 && completedCount === steps.length;

  const handleToggleStep = (stepId: string) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    setSteps(updatedSteps);
    onStepsChange?.(updatedSteps);
  };

  const handleAddStep = () => {
    if (!newStepName.trim() || !newStepPrice.trim()) return;
    
    const price = parseInt(newStepPrice.replace(/\D/g, ''), 10);
    if (isNaN(price)) return;

    const newStep: TreatmentStep = {
      id: `step-${Date.now()}`,
      name: newStepName.trim(),
      price,
      completed: false,
    };

    const updatedSteps = [...steps, newStep];
    setSteps(updatedSteps);
    onStepsChange?.(updatedSteps);
    
    setNewStepName('');
    setNewStepPrice('');
    setIsAddingStep(false);
  };

  const handleGeneratePDF = () => {
    onGeneratePDF?.();
    console.log('Generate PDF for treatment plan:', steps);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU') + ' AMD';
  };

  // Status badge for header
  const statusBadge = (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        allCompleted
          ? isDark
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-emerald-100 text-emerald-700'
          : steps.length > 0
          ? isDark
            ? 'bg-blue-500/20 text-blue-400'
            : 'bg-blue-100 text-blue-700'
          : isDark
          ? 'bg-slate-600/50 text-slate-400'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {allCompleted ? 'Завершён' : steps.length > 0 ? `${completedCount}/${steps.length}` : 'Пусто'}
    </span>
  );

  return (
    <CollapsibleSection
      title="План лечения"
      isDark={isDark}
      defaultOpen={defaultOpen}
      headerAction={statusBadge}
    >
      <div className="space-y-3">
        {/* Treatment Steps List */}
        {steps.length > 0 ? (
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                  step.completed
                    ? isDark
                      ? 'bg-slate-700/30 opacity-60'
                      : 'bg-slate-50 opacity-70'
                    : isDark
                    ? 'bg-slate-700/50 hover:bg-slate-700/70'
                    : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleStep(step.id)}
                  className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    step.completed
                      ? isDark
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-emerald-500 text-white'
                      : isDark
                      ? 'border-2 border-slate-500 hover:border-blue-400'
                      : 'border-2 border-slate-300 hover:border-blue-500'
                  }`}
                >
                  {step.completed && <Check className="w-4 h-4" strokeWidth={3} />}
                </button>

                {/* Treatment Name */}
                <span
                  className={`flex-1 text-sm font-medium ${
                    step.completed
                      ? isDark
                        ? 'text-slate-400 line-through'
                        : 'text-slate-400 line-through'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-800'
                  }`}
                >
                  {step.name}
                </span>

                {/* Price */}
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    step.completed
                      ? isDark
                        ? 'text-slate-500'
                        : 'text-slate-400'
                      : isDark
                      ? 'text-blue-400'
                      : 'text-blue-600'
                  }`}
                >
                  {formatPrice(step.price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-6 rounded-xl ${
              isDark ? 'bg-slate-700/30' : 'bg-slate-50'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              План лечения пуст
            </p>
          </div>
        )}

        {/* Total */}
        {steps.length > 0 && (
          <div
            className={`flex items-center justify-between p-3 rounded-xl ${
              isDark ? 'bg-slate-700/70' : 'bg-blue-50'
            }`}
          >
            <span
              className={`text-sm font-semibold ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              Итого:
            </span>
            <span
              className={`text-base font-bold tabular-nums ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {formatPrice(totalPrice)}
            </span>
          </div>
        )}

        {/* Add Step Form */}
        {isAddingStep && (
          <div
            className={`p-3 rounded-xl space-y-3 ${
              isDark ? 'bg-slate-700/50' : 'bg-slate-50'
            }`}
          >
            <input
              type="text"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              placeholder="Название процедуры"
              className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors ${
                isDark
                  ? 'bg-slate-800 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500'
                  : 'bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500'
              }`}
              autoFocus
            />
            <input
              type="text"
              value={newStepPrice}
              onChange={(e) => setNewStepPrice(e.target.value)}
              placeholder="Стоимость (AMD)"
              className={`w-full px-3 py-2 text-sm rounded-lg outline-none transition-colors ${
                isDark
                  ? 'bg-slate-800 text-white placeholder-slate-400 border border-slate-600 focus:border-blue-500'
                  : 'bg-white text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-blue-500'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddStep}
                disabled={!newStepName.trim() || !newStepPrice.trim()}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                  !newStepName.trim() || !newStepPrice.trim()
                    ? isDark
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setIsAddingStep(false);
                  setNewStepName('');
                  setNewStepPrice('');
                }}
                className={`py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                  isDark
                    ? 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {!isAddingStep && (
            <button
              onClick={() => setIsAddingStep(true)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                isDark
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Добавить этап</span>
            </button>
          )}
          
          {steps.length > 0 && (
            <button
              onClick={handleGeneratePDF}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                isDark
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Сформировать PDF</span>
            </button>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
