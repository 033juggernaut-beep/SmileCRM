/**
 * Marketing & Communication section - AI powered
 * Personalized patient communication, NOT advertising
 * 
 * Features:
 * - AI assistant block for message generation
 * - Four message types: birthday, visit reminder, discount, post-treatment
 * - Editable message preview with regenerate/copy actions
 * - Future-ready delivery hint (WhatsApp/Telegram)
 * - Calm, professional medical style
 * - Doctor always controls the final text
 */

import { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Pencil, MessageCircle } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import type { MarketingSectionProps } from '../types';

type MessageType = 'birthday' | 'reminder' | 'discount' | 'recommendation';

interface MessageConfig {
  id: MessageType;
  label: string;
  emoji: string;
}

interface GeneratedMessage {
  type: MessageType;
  title: string;
  content: string;
  isEditing: boolean;
}

const messageTypes: MessageConfig[] = [
  { id: 'birthday', label: 'Поздравление с днём рождения', emoji: '🎉' },
  { id: 'reminder', label: 'Напоминание о визите', emoji: '🦷' },
  { id: 'discount', label: 'Акция / скидка', emoji: '💸' },
  { id: 'recommendation', label: 'Рекомендация после лечения', emoji: '📋' },
];

export function MarketingSection({
  isDark,
  patientName,
  dateOfBirth,
  defaultOpen = false,
}: MarketingSectionProps) {
  const [selectedType, setSelectedType] = useState<MessageType | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editText, setEditText] = useState('');
  const [copied, setCopied] = useState(false);

  const generateMessage = (type: MessageType) => {
    setIsGenerating(true);
    setSelectedType(type);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const messages: Record<MessageType, { title: string; content: string }> = {
        birthday: {
          title: 'Поздравление с днём рождения',
          content: `Уважаемый(ая) ${patientName}!\n\nПоздравляем Вас с Днём рождения!\n\nЖелаем крепкого здоровья, хорошего настроения и красивой улыбки! В честь Вашего праздника мы рады предложить скидку 15% на все услуги клиники в течение месяца.\n\nС теплом и заботой,\nКлиника SmileCRM`,
        },
        reminder: {
          title: 'Напоминание о визите',
          content: `Уважаемый(ая) ${patientName}!\n\nНапоминаем, что подходит время для планового осмотра.\n\nРегулярные визиты к стоматологу помогают сохранить здоровье зубов и предотвратить развитие заболеваний. Рекомендуем записаться на удобное для Вас время.\n\nС заботой о Вашем здоровье,\nКлиника SmileCRM`,
        },
        discount: {
          title: 'Акция / скидка',
          content: `Уважаемый(ая) ${patientName}!\n\nРады сообщить о специальном предложении для наших пациентов!\n\nВ этом месяце действует скидка 20% на профессиональную гигиену полости рта. Это отличная возможность позаботиться о здоровье Ваших зубов.\n\nБудем рады видеть Вас,\nКлиника SmileCRM`,
        },
        recommendation: {
          title: 'Рекомендация после лечения',
          content: `Уважаемый(ая) ${patientName}!\n\nБлагодарим Вас за визит в нашу клинику.\n\nДля закрепления результата лечения рекомендуем:\n• Воздержаться от приёма пищи в течение 2 часов\n• Избегать твёрдой пищи в первые сутки\n• При необходимости принять обезболивающее\n\nПри возникновении вопросов — свяжитесь с нами.\n\nС заботой о Вас,\nКлиника SmileCRM`,
        },
      };

      const msg = messages[type];
      setGeneratedMessage({
        type,
        title: msg.title,
        content: msg.content,
        isEditing: false,
      });
      setEditText(msg.content);
      setIsGenerating(false);
    }, 1200);
  };

  const handleRegenerate = () => {
    if (selectedType) {
      generateMessage(selectedType);
    }
  };

  const handleStartEdit = () => {
    if (generatedMessage) {
      setEditText(generatedMessage.content);
      setGeneratedMessage({ ...generatedMessage, isEditing: true });
    }
  };

  const handleSaveEdit = () => {
    if (generatedMessage) {
      setGeneratedMessage({
        ...generatedMessage,
        content: editText,
        isEditing: false,
      });
    }
  };

  const handleCancelEdit = () => {
    if (generatedMessage) {
      setEditText(generatedMessage.content);
      setGeneratedMessage({ ...generatedMessage, isEditing: false });
    }
  };

  const handleCopy = async () => {
    if (generatedMessage) {
      try {
        await navigator.clipboard.writeText(generatedMessage.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <CollapsibleSection
      title="Маркетинг"
      isDark={isDark}
      defaultOpen={defaultOpen}
    >
      <div className="space-y-4">
        {/* Helper text */}
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Персональные сообщения для пациента
        </p>

        {/* AI Assistant Block */}
        <div
          className={`rounded-xl p-4 border transition-colors ${
            isDark
              ? 'bg-slate-800/40 border-slate-700/50'
              : 'bg-slate-50/80 border-slate-200/80'
          }`}
        >
          {/* AI Header */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-blue-500/20' : 'bg-blue-100'
              }`}
            >
              <Sparkles
                className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
              />
            </div>
            <div>
              <h4
                className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                AI ассистент
              </h4>
              <p
                className={`text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Генерация персональных сообщений для пациента
              </p>
            </div>
          </div>

          {/* Message Type Buttons */}
          <div className="flex flex-wrap gap-2">
            {messageTypes.map(({ id, label, emoji }) => {
              const isSelected = selectedType === id;
              const isActive = isGenerating && isSelected;

              return (
                <button
                  key={id}
                  onClick={() => generateMessage(id)}
                  disabled={isGenerating}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-500/40'
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                      : isDark
                      ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  } ${isActive ? 'opacity-70' : ''}`}
                >
                  <span className="text-base">{emoji}</span>
                  <span>{label}</span>
                  {isActive && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generated Message Preview Card */}
        {generatedMessage && !isGenerating && (
          <div
            className={`rounded-xl border overflow-hidden transition-colors ${
              isDark
                ? 'bg-slate-800/30 border-slate-700/50'
                : 'bg-white border-slate-200'
            }`}
          >
            {/* Message Header */}
            <div
              className={`px-4 py-3 border-b ${
                isDark ? 'border-slate-700/50' : 'border-slate-100'
              }`}
            >
              <h5
                className={`text-sm font-medium ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                {generatedMessage.title}
              </h5>
            </div>

            {/* Message Content */}
            <div className="p-4">
              {generatedMessage.isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={8}
                    className={`w-full p-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
                      isDark
                        ? 'bg-slate-700/50 text-white border border-slate-600 focus:ring-blue-500/40 placeholder-slate-500'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 focus:ring-blue-500/30 placeholder-slate-400'
                    }`}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDark
                          ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDark
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm whitespace-pre-line leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {generatedMessage.content}
                </p>
              )}
            </div>

            {/* Message Actions */}
            {!generatedMessage.isEditing && (
              <div
                className={`px-4 py-3 border-t flex flex-wrap gap-2 ${
                  isDark ? 'border-slate-700/50' : 'border-slate-100'
                }`}
              >
                <button
                  onClick={handleRegenerate}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Сгенерировать заново</span>
                </button>
                <button
                  onClick={handleStartEdit}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Отредактировать</span>
                </button>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied
                      ? isDark
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-green-600 bg-green-50'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать текст</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delivery Info Hint */}
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg ${
            isDark ? 'bg-slate-800/30' : 'bg-slate-50/50'
          }`}
        >
          <MessageCircle
            className={`w-4 h-4 flex-shrink-0 ${
              isDark ? 'text-slate-600' : 'text-slate-300'
            }`}
          />
          <span
            className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
          >
            Сообщение можно отправить через WhatsApp / Telegram
          </span>
        </div>
      </div>
    </CollapsibleSection>
  );
}
