/**
 * Header Component - Konark Chakra Edition
 * Uses the Chakra (Wheel of Time/Progress) as the primary symbol
 */

import { Globe, ChevronDown, LogOut, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
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
  const { user, logout } = useAuth();

  // Get current date dynamically
  const getCurrentDate = () => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleString(appLanguage === 'en' ? 'en-US' : 'default', { month: 'long' });
    const year = now.getFullYear();
    
    // Format based on language
    if (appLanguage === 'hi') {
      return `${day} ${month} ${year}`;
    } else if (appLanguage === 'te') {
      return `${day} ${month} ${year}`;
    } else if (appLanguage === 'ta') {
      return `${day} ${month} ${year}`;
    } else if (appLanguage === 'bn') {
      return `${day} ${month} ${year}`;
    }
    return `${day} ${month} ${year}`;
  };

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
      {/* Tricolor top border - subtle */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80"></div>

      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-1.5 sm:gap-3 group cursor-pointer">
            {/* Ashoka Chakra SVG - Navy Blue */}
            <div className="relative w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:rotate-180">
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
              <h1 className="text-sm sm:text-xl font-extrabold text-[#1e2c56] tracking-tight leading-none">
                EktaMandi
              </h1>
              <span className="text-[9px] sm:text-xs font-bold text-orange-600 tracking-wide hidden sm:block">
                (एकता मंडी)
              </span>
            </div>
          </div>

          {/* Right: User Info, Date & Language */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-2 bg-emerald-50 border border-emerald-100 rounded-lg sm:rounded-xl">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 hidden sm:inline">{user.name}</span>
              </div>
            )}

            {/* Date Badge */}
            <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-0.5 sm:py-1.5 bg-orange-50/50 border border-orange-100 rounded-full">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[9px] sm:text-xs font-semibold text-orange-700 whitespace-nowrap">
                {getCurrentDate()}
              </span>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <div className="flex items-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg sm:rounded-xl transition-all cursor-pointer group">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500 group-hover:text-slate-700" />
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value as Language)}
                  className="bg-transparent text-slate-700 font-medium text-[10px] sm:text-sm cursor-pointer outline-none appearance-none pr-3 sm:pr-6 max-w-[55px] sm:max-w-none"
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

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center px-1.5 sm:px-3 py-1 sm:py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg sm:rounded-xl transition-all text-rose-700 hover:text-rose-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
