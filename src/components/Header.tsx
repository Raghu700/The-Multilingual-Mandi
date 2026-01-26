/**
 * Header Component
 * EktaMandi - India's 77th Republic Day Special
 * 
 * Displays the main header with Republic Day branding,
 * tricolor gradient background, and glassmorphism effects.
 */

import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { Language } from '../types';

const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export function Header() {
  const { appLanguage, setAppLanguage } = useLanguage();

  return (
    <header className="glass-header-tricolor">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Main Title */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-navy-blue text-center md:text-left">
              {t('app.title', appLanguage)} <span className="text-saffron">(एकता मंडी)</span>
            </h1>
            <p className="text-sm md:text-base text-green font-semibold italic">
              "{t('app.subtitle', appLanguage)}"
            </p>
          </div>

          {/* Language Selector & Date Badge */}
          <div className="flex items-center gap-3">
            {/* Language Dropdown */}
            <div className="relative">
              <div className="flex items-center gap-2 glass-card px-3 py-2">
                <Globe className="w-4 h-4 text-navy-blue" />
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value as Language)}
                  className="bg-transparent text-navy-blue font-semibold text-sm cursor-pointer outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Badge */}
            <div className="glass-badge-saffron">
              <span className="font-semibold text-navy-blue">
                {t('header.date', appLanguage)}
              </span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-4 text-center md:text-left">
          <p className="text-navy-blue font-semibold text-base md:text-lg">
            {t('app.tagline', appLanguage)}
          </p>
          <p className="text-navy-blue/70 text-sm md:text-base mt-1">
            {t('app.description', appLanguage)}
          </p>
        </div>
      </div>
    </header>
  );
}
