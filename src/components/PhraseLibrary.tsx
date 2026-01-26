/**
 * PhraseLibrary Component
 * Displays pre-translated mandi phrases that users can click to auto-translate
 */

import { BookOpen } from 'lucide-react';
import { Language, MandiPhrase } from '../types';
import { getAllMandiPhrases } from '../services/translationService';

interface PhraseLibraryProps {
  selectedLanguage: Language;
  onPhraseSelect: (phrase: MandiPhrase) => void;
}

export function PhraseLibrary({ selectedLanguage, onPhraseSelect }: PhraseLibraryProps) {
  const phrases = getAllMandiPhrases();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-navy-blue" />
        <h3 className="text-lg font-bold text-navy-blue">
          Common Mandi Phrases
        </h3>
      </div>

      {/* Phrase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {phrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => onPhraseSelect(phrase)}
            className="glass-card-light p-4 text-left transition-all duration-300 hover:scale-105 hover:shadow-glass hover:bg-glass-white group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  {phrase.en}
                </p>
                <p className="text-base text-navy-blue font-semibold group-hover:text-saffron transition-colors">
                  {phrase[selectedLanguage]}
                </p>
              </div>
              <div className="text-saffron opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Message */}
      <div className="glass-badge text-gray-600 text-xs text-center py-2">
        💡 Click any phrase to use it in translation
      </div>
    </div>
  );
}
