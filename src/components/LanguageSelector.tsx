/**
 * Language Selector Component
 * Allows users to switch between English, Hindi, Bengali, and Marathi
 */

import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ 
  className = ''
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'hi' as Language, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn' as Language, name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te' as Language, name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
  };

  return (
    <div className={`language-selector ${className}`}>
      <label htmlFor="language-select" className="sr-only">
        {t('select_language')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        aria-label={t('select_language')}
        className="min-h-[44px] min-w-[44px] text-base px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white cursor-pointer"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            🌐 {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}
