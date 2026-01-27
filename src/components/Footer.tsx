/**
 * Footer Component - Final Polish
 * Clean, professional, culturally respectful
 */

import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

export function Footer() {
  const { appLanguage } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-[#000080]/95 via-[#000080]/90 to-[#1e3a8a]/95 text-white mt-auto relative overflow-hidden">
      {/* Tricolor Top Border - Bold */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Jai Hind */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF9933] via-orange-300 to-[#FF9933] mb-1">
              जय हिंद!
            </h2>
            <p className="text-sm text-orange-100 font-medium">
              {t('footer.celebrating', appLanguage)}
            </p>
          </div>

          {/* Right: Credits */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-sm text-white/90">
              <span>Made with</span>
              <span className="text-[#FF9933] animate-pulse">❤️</span>
              <span>for</span>
              <span className="font-semibold text-white">Bharat</span>
            </div>
            <p className="text-xs text-white/70 max-w-[250px] text-center md:text-right">
              {t('footer.empowering', appLanguage)}
            </p>
          </div>
        </div>
      </div>

      {/* Patriotic Background decorations */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-60 h-60 bg-[#FF9933]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-[#138808]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
    </footer>
  );
}
