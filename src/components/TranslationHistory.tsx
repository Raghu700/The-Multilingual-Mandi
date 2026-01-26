/**
 * TranslationHistory Component
 * Displays translation history in reverse chronological order
 * with copy functionality for each entry
 */

import { useState } from 'react';
import { History, Copy, Check } from 'lucide-react';
import { TranslationEntry } from '../types';
import { copyToClipboard } from '../services/translationService';

interface TranslationHistoryProps {
  history: TranslationEntry[];
}

export function TranslationHistory({ history }: TranslationHistoryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      te: 'Telugu',
      ta: 'Tamil',
      bn: 'Bengali',
    };
    return names[code] || code;
  };

  if (history.length === 0) {
    return (
      <div className="glass-card-light p-8 text-center">
        <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No translation history yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Your translations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-navy-blue" />
          <h3 className="text-lg font-bold text-navy-blue">
            Translation History
          </h3>
        </div>
        <span className="glass-badge text-gray-600 text-xs">
          {history.length} {history.length === 1 ? 'translation' : 'translations'}
        </span>
      </div>

      {/* History List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="glass-card p-4 hover:shadow-glass-lg transition-all duration-300"
          >
            {/* Language Direction and Timestamp */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                <span className="glass-badge-saffron text-saffron px-2 py-1">
                  {getLanguageName(entry.sourceLang)}
                </span>
                <span className="text-saffron">→</span>
                <span className="glass-badge-green text-green px-2 py-1">
                  {getLanguageName(entry.targetLang)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>

            {/* Source Text */}
            <div className="mb-2">
              <p className="text-sm text-gray-600 line-clamp-2">
                {entry.sourceText}
              </p>
            </div>

            {/* Translated Text with Copy Button */}
            <div className="flex items-start justify-between gap-3 bg-glass-green-light rounded-lg p-3">
              <p className="text-base text-navy-blue font-medium flex-1 line-clamp-2">
                {entry.translatedText}
              </p>
              <button
                onClick={() => handleCopy(entry.translatedText, entry.id)}
                className={`
                  p-2 rounded-lg transition-all duration-300 flex-shrink-0
                  ${
                    copiedId === entry.id
                      ? 'bg-green text-white'
                      : 'glass-button hover:bg-glass-white-light'
                  }
                `}
                title="Copy translation"
              >
                {copiedId === entry.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
