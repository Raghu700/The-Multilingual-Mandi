/**
 * NegotiationTab Component
 * Main container for the Negotiation Assistant Module
 * Integrates context form, AI strategies, and quick tips
 */

import { useState } from 'react';
import {
  NegotiationContext,
  NegotiationStrategy,
  generateStrategies,
  getQuickTips,
} from '../services/negotiationService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { ContextForm } from './ContextForm';
import { StrategyList } from './StrategyList';
import { QuickTips } from './QuickTips';

export function NegotiationTab() {
  const { appLanguage } = useLanguage();
  const [strategies, setStrategies] = useState<NegotiationStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showTips, setShowTips] = useState(true);

  // Handle form submission
  const handleSubmit = async (context: NegotiationContext) => {
    setError('');
    setLoading(true);
    setShowTips(false);

    try {
      // Generate AI strategies
      const generatedStrategies = await generateStrategies(context);
      setStrategies(generatedStrategies);
    } catch (err) {
      setError('Failed to generate strategies. Showing quick tips instead.');
      setShowTips(true);
      console.error('Strategy generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get quick tips in current language
  const quickTips = getQuickTips(appLanguage);

  return (
    <div className="space-y-8">
      {/* Context Form */}
      <ContextForm
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="glass-card-light p-4 border-2 border-red-500 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {/* AI Strategies */}
      {strategies.length > 0 && !showTips && (
        <StrategyList strategies={strategies} />
      )}

      {/* Quick Tips (shown by default or on error) */}
      {showTips && <QuickTips tips={quickTips} />}

      {/* Info Section */}
      <div className="glass-card-light p-6 text-center space-y-3">
        <h4 className="text-lg font-bold text-navy-blue">
          {t('howItWorks.title', appLanguage)}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              1
            </div>
            <p className="text-sm text-gray-700">{t('howItWorks.step1', appLanguage)}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              2
            </div>
            <p className="text-sm text-gray-700">{t('howItWorks.step2', appLanguage)}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              3
            </div>
            <p className="text-sm text-gray-700">{t('howItWorks.step3', appLanguage)}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              4
            </div>
            <p className="text-sm text-gray-700">{t('howItWorks.step4', appLanguage)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
