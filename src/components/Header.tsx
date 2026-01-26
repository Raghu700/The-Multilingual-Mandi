/**
 * Header Component - Konark Chakra Edition
 * Uses the Chakra (Wheel of Time/Progress) as the primary symbol
 */

import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { Language } from '../types';

const LANGUAGES: { code: Language; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'bn', nativeName: 'বাংলা' },
];

export function Header() {
  const { appLanguage, setAppLanguage } = useLanguage();

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
      {/* Tricolor top border - subtle */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80"></div>

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Ashoka Chakra SVG - Navy Blue */}
            <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:rotate-180">
              <svg viewBox="0 0 24 24" className="w-full h-full text-[#A63A2E]" fill="currentColor">
                {/* Outer Circle */}
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                {/* Inner Hub */}
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                {/* 24 Spokes (Simplified to 12 visible for clean icon, or fully draw lines) */}
                {[...Array(24)].map((_, i) => (
                  <line
                    key={i}
                    x1="12"
                    y1="12"
                    x2={12 + 9 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={12 + 9 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />
                ))}
                {/* Decorative border dots */}
                {[...Array(24)].map((_, i) => (
                  <circle
                    key={`dot-${i}`}
                    cx={12 + 8.5 * Math.cos(((i * 15 + 7.5) * Math.PI) / 180)}
                    cy={12 + 8.5 * Math.sin(((i * 15 + 7.5) * Math.PI) / 180)}
                    r="0.5"
                    fill="currentColor"
                  />
                ))}
              </svg>
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-[#1e2c56] tracking-tight leading-none">
                EktaMandi
              </h1>
              <span className="text-xs font-bold text-orange-600 tracking-wide">
                (एकता मंडी)
              </span>
            </div>
          </div>

          {/* Right: Date & Language */}
          <div className="flex items-center gap-4">
            {/* Date Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50/50 border border-orange-100 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-orange-700">
                {t('header.date', appLanguage)}
              </span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer group">
                <Globe className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value as Language)}
                  className="bg-transparent text-slate-700 font-medium text-sm cursor-pointer outline-none appearance-none pr-6"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
