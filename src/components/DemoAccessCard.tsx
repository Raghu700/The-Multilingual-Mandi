/**
 * Demo Access Card Component
 * Prominent demo access with pre-filled credentials
 */

import { useLanguage } from '../contexts/LanguageContext';

interface DemoAccessCardProps {
  onDemoLogin: (credentials: { mobile: string; otp: string }) => void;
}

export function DemoAccessCard({ onDemoLogin }: DemoAccessCardProps) {
  const { t } = useLanguage();

  const demoCredentials = {
    mobile: '9876543210',
    otp: '123456'
  };

  const handleDemoLogin = () => {
    onDemoLogin(demoCredentials);
  };

  return (
    <div className="demo-access-card bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 mb-3 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-green-800 mb-1 flex items-center gap-1">
            <span>👨‍🌾</span>
            {t('new_to_ektamandi')}
          </h3>
          <p className="text-green-700 text-xs mb-3 font-medium">
            {t('try_demo_description')}
          </p>

          <button
            onClick={handleDemoLogin}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] text-sm shadow-lg hover:shadow-xl"
            aria-label={t('try_demo_button')}
          >
            <span className="text-lg">⚡</span>
            {t('try_demo_button')}
          </button>

          <div className="mt-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base">📱</span>
              <p className="text-green-800 font-bold">{t('demo_mobile')}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🔒</span>
              <p className="text-green-800 font-bold">{t('demo_otp')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
