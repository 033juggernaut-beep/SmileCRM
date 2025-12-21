/**
 * Finance Section - Patient billing and payment tracking
 * - Total treatment cost overview with edit modal
 * - Payments history list with edit/delete actions
 * - Add payment functionality
 * - Balance summary (paid / remaining) - auto-calculated
 * - Clean accounting-style design
 * - No red colors for unpaid amounts
 * - Calm medical blue palette
 */

import { useState } from 'react';
import { Wallet, Calendar, CheckCircle2, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { FinanceSectionProps, Payment, PatientFinance } from '../types';

// Format number with spaces as thousand separators
const formatAmount = (amount: number) => {
  return amount.toLocaleString('ru-RU').replace(/,/g, ' ');
};

// =====================================================
// Edit Total Cost Modal
// =====================================================
interface EditTotalCostModalProps {
  currentTotal: number;
  isDark: boolean;
  onSave: (newTotal: number) => void;
  onClose: () => void;
}

function EditTotalCostModal({ currentTotal, isDark, onSave, onClose }: EditTotalCostModalProps) {
  const [amount, setAmount] = useState<string>(currentTotal.toString());

  const handleSave = () => {
    const numAmount = parseFloat(amount) || 0;
    onSave(numAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Изменить стоимость
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Общая стоимость лечения
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
            placeholder="0"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'
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

// =====================================================
// Edit/Add Payment Modal
// =====================================================
interface PaymentModalProps {
  payment?: Payment;
  isDark: boolean;
  isNew?: boolean;
  onSave: (payment: Payment) => void;
  onClose: () => void;
}

function PaymentModal({ payment, isDark, isNew = false, onSave, onClose }: PaymentModalProps) {
  const [date, setDate] = useState(payment?.date || '');
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [description, setDescription] = useState(payment?.description || '');

  const handleSave = () => {
    const newPayment: Payment = {
      id: payment?.id || `payment-${Date.now()}`,
      date: date || new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount: parseFloat(amount) || 0,
      description: description || undefined,
    };
    onSave(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {isNew ? 'Добавить платёж' : 'Редактировать платёж'}
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Date */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Дата
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Например: 15 янв 2025"
            />
          </div>

          {/* Amount */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Сумма
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="0"
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Комментарий
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              placeholder="Например: Профессиональная чистка"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Check className="w-4 h-4" />
            {isNew ? 'Добавить' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Delete Confirmation Modal
// =====================================================
interface DeleteConfirmModalProps {
  isDark: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteConfirmModal({ isDark, onConfirm, onClose }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-sm rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Удалить платёж?
        </h3>
        <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Это действие нельзя отменить. Платёж будет удалён из истории.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Отмена
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-slate-700 text-white hover:bg-slate-800'
            }`}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Finance Section Component
// =====================================================
export function FinanceSection({
  finance: initialFinance,
  isDark,
  defaultOpen = false,
  onUpdateFinance,
}: FinanceSectionProps) {
  const [finance, setFinance] = useState<PatientFinance>(initialFinance);
  const [editingTotalCost, setEditingTotalCost] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  const totalPaid = finance.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = finance.totalCost - totalPaid;

  // Update total cost
  const handleUpdateTotalCost = (newTotal: number) => {
    const updated = { ...finance, totalCost: newTotal };
    setFinance(updated);
    onUpdateFinance?.(updated);
  };

  // Update existing payment
  const handleUpdatePayment = (updatedPayment: Payment) => {
    const updated = {
      ...finance,
      payments: finance.payments.map((p) => (p.id === updatedPayment.id ? updatedPayment : p)),
    };
    setFinance(updated);
    onUpdateFinance?.(updated);
  };

  // Add new payment
  const handleAddPayment = (newPayment: Payment) => {
    const updated = {
      ...finance,
      payments: [newPayment, ...finance.payments],
    };
    setFinance(updated);
    onUpdateFinance?.(updated);
  };

  // Delete payment
  const handleDeletePayment = (paymentId: string) => {
    const updated = {
      ...finance,
      payments: finance.payments.filter((p) => p.id !== paymentId),
    };
    setFinance(updated);
    onUpdateFinance?.(updated);
  };

  // Add Payment Header Button
  const addButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setAddingPayment(true);
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
        isDark
          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      }`}
    >
      <Plus className="w-3 h-3" />
      <span>Добавить платёж</span>
    </button>
  );

  return (
    <>
      <CollapsibleSection
        title="Финансы"
        isDark={isDark}
        defaultOpen={defaultOpen}
        headerAction={addButton}
      >
        {/* Total Cost Overview - with Edit */}
        <div
          className={`group p-4 rounded-xl mb-4 ${
            isDark
              ? 'bg-slate-700/40 border border-slate-600/50'
              : 'bg-slate-50 border border-slate-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Общая стоимость лечения
              </span>
            </div>
            <button
              onClick={() => setEditingTotalCost(true)}
              className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                isDark
                  ? 'text-slate-400 hover:bg-slate-600 hover:text-blue-400'
                  : 'text-slate-400 hover:bg-slate-200 hover:text-blue-600'
              }`}
              title="Изменить стоимость"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {formatAmount(finance.totalCost)}
          </p>
        </div>

        {/* Payments History */}
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            История платежей
          </h4>

          {finance.payments.length > 0 ? (
            <div className="space-y-2">
              {finance.payments.map((payment) => (
                <div
                  key={payment.id}
                  className={`group flex items-center justify-between py-2.5 px-3 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-slate-700/50' : 'bg-slate-100'
                      }`}
                    >
                      <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {payment.date}
                      </p>
                      {payment.description && (
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {payment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit/Delete actions - visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setEditingPayment(payment)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'text-slate-400 hover:bg-slate-600 hover:text-blue-400'
                            : 'text-slate-400 hover:bg-slate-200 hover:text-blue-600'
                        }`}
                        title="Редактировать"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingPaymentId(payment.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'text-slate-400 hover:bg-slate-600 hover:text-slate-300'
                            : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                        }`}
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Amount */}
                    <span className={`text-sm font-semibold ml-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      +{formatAmount(payment.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-6 rounded-xl ${isDark ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
              <p className={`text-sm mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Нет записей об оплатах
              </p>
              <button
                onClick={() => setAddingPayment(true)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Добавить первый платёж</span>
              </button>
            </div>
          )}
        </div>

        {/* Balance Summary */}
        <div
          className={`p-4 rounded-xl ${
            isDark
              ? 'bg-slate-700/40 border border-slate-600/50'
              : 'bg-slate-50 border border-slate-100'
          }`}
        >
          {/* Paid */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Оплачено
              </span>
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {formatAmount(totalPaid)}
            </span>
          </div>

          {/* Remaining */}
          <div
            className={`flex items-center justify-between pt-3 border-t ${
              isDark ? 'border-slate-600/50' : 'border-slate-200'
            }`}
          >
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Осталось оплатить
            </span>
            <span
              className={`text-base font-bold ${
                remaining > 0
                  ? isDark
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`}
            >
              {formatAmount(remaining)}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Modals */}
      {editingTotalCost && (
        <EditTotalCostModal
          currentTotal={finance.totalCost}
          isDark={isDark}
          onSave={handleUpdateTotalCost}
          onClose={() => setEditingTotalCost(false)}
        />
      )}

      {editingPayment && (
        <PaymentModal
          payment={editingPayment}
          isDark={isDark}
          onSave={handleUpdatePayment}
          onClose={() => setEditingPayment(null)}
        />
      )}

      {addingPayment && (
        <PaymentModal
          isDark={isDark}
          isNew
          onSave={handleAddPayment}
          onClose={() => setAddingPayment(false)}
        />
      )}

      {deletingPaymentId && (
        <DeleteConfirmModal
          isDark={isDark}
          onConfirm={() => handleDeletePayment(deletingPaymentId)}
          onClose={() => setDeletingPaymentId(null)}
        />
      )}
    </>
  );
}
