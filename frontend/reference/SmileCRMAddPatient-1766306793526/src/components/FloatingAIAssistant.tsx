/**
 * Floating AI Assistant Widget - Discreet bottom-right helper
 * - Minimal robot/assistant icon
 * - Voice and text input options
 * - Can help fill form fields automatically
 * - Calm, tool-like appearance
 */

import { useState } from 'react';
import { Mic, MessageSquare, X } from 'lucide-react';
import type { FloatingAIAssistantProps } from '../types';

// Minimal assistant icon
function AssistantIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="5" y="4" width="14" height="12" rx="2" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <line x1="12" y1="4" x2="12" y2="2" />
      <circle cx="12" cy="1.5" r="1" fill="currentColor" stroke="none" />
      <path d="M8 16v2a2 2 0 002 2h4a2 2 0 002-2v-2" />
    </svg>
  );
}

export function FloatingAIAssistant({
  isDark,
  onAction,
}: FloatingAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'voice' | 'text' | null>(null);
  const [inputText, setInputText] = useState('');

  const handleVoiceStart = () => {
    setActiveMode('voice');
    onAction({ type: 'voice_input' });
    setTimeout(() => {
      setActiveMode(null);
    }, 3000);
  };

  const handleTextSubmit = () => {
    if (inputText.trim()) {
      onAction({ type: 'fill_form', text: inputText });
      setInputText('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Panel */}
      {isOpen && (
        <div
          className={`absolute bottom-16 right-0 w-72 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
            isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-slate-200'
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              isDark ? 'border-slate-700' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <AssistantIcon
                className={`w-5 h-5 ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <span
                className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`}
              >
                AI Ассистент
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-slate-700 text-slate-400'
                  : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Description */}
            <p
              className={`text-xs mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Помогу заполнить форму голосом или текстом
            </p>

            {/* Input Methods */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={handleVoiceStart}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeMode === 'voice'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Mic className="w-4 h-4" />
                Голос
              </button>

              <button
                onClick={() => setActiveMode(activeMode === 'text' ? null : 'text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  activeMode === 'text'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Текст
              </button>
            </div>

            {/* Text Input */}
            {activeMode === 'text' && (
              <div className="space-y-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Например: Анна Петрова, +7 900 123 4567, VIP..."
                  rows={2}
                  className={`w-full px-3 py-2 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 transition-colors ${
                    isDark
                      ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 focus:ring-blue-500/50'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-blue-500/30'
                  }`}
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputText.trim()}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                    inputText.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDark
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Заполнить
                </button>
              </div>
            )}

            {/* Voice Recording Indicator */}
            {activeMode === 'voice' && (
              <div
                className={`p-3 rounded-xl text-center ${
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span
                    className={`text-sm ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Слушаю...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          isOpen
            ? 'bg-blue-600 text-white'
            : isDark
            ? 'bg-slate-700 text-blue-400 hover:bg-slate-600 border border-slate-600'
            : 'bg-white text-blue-600 hover:bg-slate-50 border border-slate-200'
        }`}
        aria-label="AI Assistant"
      >
        <AssistantIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
