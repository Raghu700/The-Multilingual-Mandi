/**
 * Header Component — Clean & Dense
 * Lichess-inspired: compact, clear, no wasted space
 * Includes theme toggle (light / dark / read)
 */

import { Globe, ChevronDown, LogOut, User, Sun, Moon, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';

const LANGUAGES: { code: Language; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'bn', nativeName: 'বাংলা' },
];

const THEME_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  read: BookOpen,
};

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  read: 'Read',
};

export function Header() {
  const { appLanguage, setAppLanguage } = useLanguage();
  const { theme, cycleTheme } = useTheme();
  const { user, logout } = useAuth();
  const ThemeIcon = THEME_ICONS[theme];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Tricolor top accent */}
      <div
        className="h-[3px]"
        style={{
          background: `linear-gradient(to right, #FF9933, ${theme === 'dark' ? '#444' : '#fff'}, #138808)`,
        }}
      ></div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer select-none">
            {/* Ashoka Chakra */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-transform duration-700 ease-in-out group-hover:rotate-180">
              <svg viewBox="0 0 24 24" className="w-full h-full" style={{ color: theme === 'dark' ? '#e87461' : '#A63A2E' }} fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                {[...Array(24)].map((_, i) => (
                  <line
                    key={i}
                    x1="12" y1="12"
                    x2={12 + 9 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={12 + 9 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="currentColor" strokeWidth="0.8" strokeLinecap="round"
                  />
                ))}
                {[...Array(24)].map((_, i) => (
                  <circle
                    key={`dot-${i}`}
                    cx={12 + 8.5 * Math.cos(((i * 15 + 7.5) * Math.PI) / 180)}
                    cy={12 + 8.5 * Math.sin(((i * 15 + 7.5) * Math.PI) / 180)}
                    r="0.5" fill="currentColor"
                  />
                ))}
              </svg>
            </div>

            <div>
              <h1
                className="text-base sm:text-lg font-extrabold leading-none tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                EktaMandi
              </h1>
              <span
                className="text-[10px] sm:text-xs font-semibold hidden sm:block"
                style={{ color: 'var(--primary)' }}
              >
                एकता मंडी
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* User badge */}
            {user && (
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(16,185,129,0.08)',
                  color: '#059669',
                  border: '1px solid rgba(16,185,129,0.15)',
                }}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.name}</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className="theme-toggle"
              title={`Switch to ${THEME_LABELS[theme === 'light' ? 'dark' : theme === 'dark' ? 'read' : 'light']} mode`}
            >
              <ThemeIcon className="w-4 h-4" />
            </button>

            {/* Language Selector */}
            <div className="relative">
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value as Language)}
                  className="bg-transparent font-medium text-xs sm:text-sm cursor-pointer outline-none appearance-none pr-4 min-h-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center px-2 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                color: '#dc2626',
              }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
