/**
 * Footer Component
 * India's 77th Republic Day Special
 * 
 * Displays the footer with "Jai Hind" message,
 * patriotic styling, and glassmorphism effects.
 */

import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

export function Footer() {
  const { appLanguage } = useLanguage();

  return (
    <footer className="glass-card-green mt-8">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Jai Hind Message */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-navy-blue">
              {t('footer.message', appLanguage)}
            </h2>
          </div>

          {/* Additional Info */}
          <div className="text-center md:text-right">
            <p className="text-navy-blue/80 text-sm md:text-base">
              {t('footer.celebrating', appLanguage)}
            </p>
            <p className="text-navy-blue/60 text-xs md:text-sm mt-1">
              {t('footer.empowering', appLanguage)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
