/**
 * Footer Component — Compact & Theme-aware
 */

import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

export function Footer() {
  const { appLanguage } = useLanguage();

  return (
    <footer
      className="mt-auto relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #000080 0%, #1e3a8a 100%)',
        color: '#fff',
      }}
    >
      {/* Tricolor top border */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left */}
          <div className="text-center sm:text-left">
            <h2
              className="text-lg sm:text-xl font-bold mb-0.5"
              style={{
                background: 'linear-gradient(90deg, #FF9933, #ffcc80, #FF9933)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              जय हिंद!
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {t('footer.celebrating', appLanguage)}
            </p>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center sm:items-end gap-1">
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              <span>Made with</span>
              <span style={{ color: '#FF9933' }}>❤️</span>
              <span>for</span>
              <span className="font-semibold text-white">Bharat</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {t('footer.empowering', appLanguage)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
