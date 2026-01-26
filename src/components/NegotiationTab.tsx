/**
 * NegotiationTab Component
 * Main container for the AI-Powered Negotiation Assistant Module
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
import { Brain, Zap, AlertCircle } from 'lucide-react';

export function NegotiationTab() {
  const { appLanguage } = useLanguage();
  const [strategies, setStrategies] = useState<NegotiationStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showTips, setShowTips] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

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
      setError('AI strategy generation temporarily unavailable. Showing quick tips instead.');
      setShowTips(true);
      console.error('Strategy generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle AI features
  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
    if (!aiEnabled) {
      setShowTips(true);
      setStrategies([]);
    }
  };

  // Get quick tips in current language
  const quickTips = getQuickTips(appLanguage);

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-saffron" />
          <h2 className="text-lg font-semibold text-gray-800">AI Negotiation Assistant</h2>
        </div>
        <button
          onClick={toggleAI}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            aiEnabled
              ? 'bg-saffron text-white shadow-lg'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <Zap className="w-4 h-4" />
          AI {aiEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {/* AI Status Banner */}
      {aiEnabled && (
        <div className="bg-gradient-to-r from-saffron/10 to-green/10 border border-saffron/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-saffron" />
            <div>
              <h3 className="font-medium text-gray-800">AI-Powered Negotiation Strategies</h3>
              <p className="text-sm text-gray-600">
                Get contextual negotiation advice based on your specific situation
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Context Form */}
      <ContextForm
        onSubmit={aiEnabled ? handleSubmit : () => setShowTips(true)}
        loading={loading}
        disabled={!aiEnabled}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* AI Strategies */}
      {aiEnabled && strategies.length > 0 && !showTips && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-saffron" />
            <h3 className="text-lg font-semibold text-gray-800">AI-Generated Strategies</h3>
            <span className="text-xs bg-saffron text-white px-2 py-1 rounded-full">
              Personalized
            </span>
          </div>
          <StrategyList strategies={strategies} />
        </div>
      )}

      {/* Quick Tips (shown by default, when AI disabled, or on error) */}
      {(showTips || !aiEnabled) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green" />
            <h3 className="text-lg font-semibold text-gray-800">
              {aiEnabled ? 'Quick Tips' : 'General Negotiation Tips'}
            </h3>
          </div>
          <QuickTips tips={quickTips} />
        </div>
      )}

      {/* How It Works Section */}
      <div className="glass-card-light p-6 text-center space-y-4">
        <h4 className="text-lg font-bold text-navy-blue flex items-center justify-center gap-2">
          <Brain className="w-5 h-5" />
          {aiEnabled ? 'How AI Negotiation Works' : t('howItWorks.title', appLanguage)}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              1
            </div>
            <p className="text-sm text-gray-700">
              {aiEnabled ? 'Enter negotiation details' : t('howItWorks.step1', appLanguage)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              2
            </div>
            <p className="text-sm text-gray-700">
              {aiEnabled ? 'AI analyzes context' : t('howItWorks.step2', appLanguage)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              3
            </div>
            <p className="text-sm text-gray-700">
              {aiEnabled ? 'Get personalized strategies' : t('howItWorks.step3', appLanguage)}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center mx-auto mb-2 font-bold">
              4
            </div>
            <p className="text-sm text-gray-700">
              {aiEnabled ? 'Apply winning tactics' : t('howItWorks.step4', appLanguage)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
