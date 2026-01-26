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
    <header className="glass-header-tricolor sticky top-0 z-50 shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4 py-3">
        {/* Single Row Layout */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Decorative Tricolor Bar */}
            <div className="hidden md:flex flex-col gap-0.5">
              <div className="w-1 h-2 bg-saffron rounded-full"></div>
              <div className="w-1 h-2 bg-white rounded-full"></div>
              <div className="w-1 h-2 bg-green rounded-full"></div>
            </div>
            
            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-navy-blue">
                  {t('app.title', appLanguage)}
                </h1>
                <span className="text-lg md:text-xl font-bold text-saffron whitespace-nowrap">
                  (एकता मंडी)
                </span>
              </div>
              <p className="text-xs md:text-sm text-navy-blue/80 font-medium italic truncate">
                "{t('app.tagline', appLanguage)}"
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Date Badge - Compact */}
            <div className="glass-badge-saffron px-2 py-1 md:px-3 md:py-1.5">
              <span className="font-bold text-navy-blue text-xs md:text-sm whitespace-nowrap">
                {t('header.date', appLanguage)}
              </span>
            </div>

            {/* Language Selector - Compact */}
            <div className="glass-card px-2 py-1.5 md:px-3 md:py-2 hover:scale-105 transition-transform">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-navy-blue flex-shrink-0" />
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value as Language)}
                  className="bg-transparent text-navy-blue font-semibold text-xs md:text-sm cursor-pointer outline-none pr-1"
                  title={t('header.selectLanguage', appLanguage)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
