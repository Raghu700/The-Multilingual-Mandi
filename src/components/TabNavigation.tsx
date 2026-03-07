/**
 * TabNavigation Component — Clean & Dense
 * Four tabs: Prices, Analysis, Smart Match, Negotiate
 * Lichess-inspired: simple flat tabs, no excessive styling
 */

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PriceDiscoveryTab } from './PriceDiscoveryTab';
import { PriceAnalysisTab } from './PriceAnalysisTab';
import { SmartMatchTab } from './SmartMatchTab';
import { NegotiationTab } from './NegotiationTab';

interface TabNavigationProps {
  externalActiveTab?: string;
  onTabChange?: (tab: string) => void;
}

export function TabNavigation({ externalActiveTab, onTabChange }: TabNavigationProps = {}) {
  const [internalTab, setInternalTab] = useState('smart-match');
  const activeTab = externalActiveTab ?? internalTab;
  const setActiveTab = (tab: string) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };
  const { appLanguage } = useLanguage();

  useEffect(() => {
    if (externalActiveTab) setInternalTab(externalActiveTab);
  }, [externalActiveTab]);

  const tabLabels: Record<string, Record<string, string>> = {
    'price-discovery': { en: 'Prices', hi: 'भाव', te: 'ధరలు', ta: 'விலை', bn: 'দাম' },
    'price-analysis': { en: 'Analysis', hi: 'विश्लेषण', te: 'విశ్లేషణ', ta: 'பகுப்பாய்வு', bn: 'বিশ্লেষণ' },
    'smart-match': { en: 'Smart Match', hi: 'स्मार्ट मैच', te: 'స్మార్ట్ మ్యాచ్', ta: 'ஸ்மார்ட் மேட்ச்', bn: 'স্মার্ট ম্যাচ' },
    'negotiation': { en: 'Negotiate', hi: 'बातचीत', te: 'చర్చ', ta: 'பேச்சு', bn: 'আলোচনা' },
  };

  const tabs = [
    { id: 'price-discovery', icon: TrendingUp },
    { id: 'price-analysis', icon: BarChart3 },
    { id: 'smart-match', icon: Sparkles },
    { id: 'negotiation', icon: Users },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      {/* Tab Bar */}
      <div className="flex mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
        <div
          className="inline-flex w-full sm:w-auto rounded-lg p-0.5 gap-0.5"
          style={{ backgroundColor: 'var(--bg-surface-alt)', border: '1px solid var(--border-light)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-md font-semibold text-sm transition-all min-h-0"
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">
                  {tabLabels[tab.id][appLanguage] || tabLabels[tab.id].en}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-fadeIn">
        {activeTab === 'price-discovery' && <PriceDiscoveryTab />}
        {activeTab === 'price-analysis' && <PriceAnalysisTab />}
        {activeTab === 'smart-match' && <SmartMatchTab />}
        {activeTab === 'negotiation' && <NegotiationTab />}
      </div>
    </div>
  );
}
