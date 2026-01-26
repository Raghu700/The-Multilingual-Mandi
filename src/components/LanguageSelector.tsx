/**
 * LanguageSelector Component
 * Allows users to select target language for translation
 * Displays languages in both English and native script
 */

import { Language } from '../types';
import { REPUBLIC_DAY_BADGES } from '../utils/theme';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

interface LanguageOption {
  code: Language;
  englishName: string;
  nativeName: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', englishName: 'English', nativeName: 'English' },
  { code: 'hi', englishName: 'Hindi', nativeName: 'हिंदी' },
  { code: 'te', englishName: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', englishName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', englishName: 'Bengali', nativeName: 'বাংলা' },
];

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Unity in Diversity Badge */}
      <div className="flex justify-center">
        <div className="glass-badge-saffron text-saffron font-semibold px-4 py-2">
          {REPUBLIC_DAY_BADGES.translation}
        </div>
      </div>

      {/* Language Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {LANGUAGE_OPTIONS.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`
              glass-card p-4 text-center transition-all duration-300
              hover:scale-105 hover:shadow-glass-lg
              ${
                selectedLanguage === lang.code
                  ? 'bg-saffron text-white border-saffron shadow-glass-saffron'
                  : 'hover:bg-glass-white-light'
              }
            `}
          >
            <div className="font-bold text-sm mb-1">{lang.englishName}</div>
            <div className={`text-lg ${selectedLanguage === lang.code ? 'text-white' : 'text-navy-blue'}`}>
              {lang.nativeName}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
