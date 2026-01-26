/**
 * QuickTips Component
 * Displays hardcoded negotiation tips as fallback
 */

import { Lightbulb } from 'lucide-react';
import { NegotiationTip } from '../data/negotiationTips';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

interface QuickTipsProps {
  tips: NegotiationTip[];
}

export function QuickTips({ tips }: QuickTipsProps) {
  const { appLanguage } = useLanguage();

  if (tips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-glass-green mb-4">
          <Lightbulb className="w-8 h-8 text-green" />
        </div>
        <h3 className="text-2xl font-bold text-navy-blue mb-2">
          💡 {t('negotiation.quickTips', appLanguage)}
        </h3>
        <p className="text-sm text-gray-600">
          {tips.length} {t('negotiation.provenStrategies', appLanguage)}
        </p>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div key={tip.id} className="glass-card p-6 space-y-3">
            {/* Tip Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <h4 className="text-lg font-bold text-navy-blue flex-1">
                {tip.title}
              </h4>
            </div>

            {/* Tip Description */}
            <p className="text-sm text-gray-700 leading-relaxed">
              {tip.description}
            </p>
          </div>
        ))}
      </div>

      {/* Info Message */}
      <div className="glass-card-light p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 {t('negotiation.tipMessage', appLanguage)}
        </p>
      </div>
    </div>
  );
}
