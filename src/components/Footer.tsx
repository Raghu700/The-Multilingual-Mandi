/**
 * Footer Component - Final Polish
 * Clean, professional, culturally respectful
 */

import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

export function Footer() {
  const { appLanguage } = useLanguage();

  return (
    <footer className="bg-slate-900 text-white mt-auto relative overflow-hidden">
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Jai Hind */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200 mb-1">
              जय हिंद!
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              {t('footer.celebrating', appLanguage)}
            </p>
          </div>

          {/* Right: Credits */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-sm text-slate-300">
              <span>Made with</span>
              <span className="text-rose-500 animate-pulse">❤️</span>
              <span>for</span>
              <span className="font-semibold text-white">Bharat</span>
            </div>
            <p className="text-xs text-slate-500 max-w-[250px] text-center md:text-right">
              {t('footer.empowering', appLanguage)}
            </p>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </footer>
  );
}
