/**
 * TabNavigation Component - With Smart Match
 * Three tabs: Price Discovery, Smart Match (NEW), and Negotiation
 */

import { useState } from 'react';
import { TrendingUp, Sparkles, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PriceDiscoveryTab } from './PriceDiscoveryTab';
import { SmartMatchTab } from './SmartMatchTab';
import { NegotiationTab } from './NegotiationTab';

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState('smart-match'); // Default to new feature
  const { appLanguage } = useLanguage();

  const tabLabels: Record<string, Record<string, string>> = {
    'price-discovery': {
      en: 'Prices',
      hi: 'भाव',
      te: 'ధరలు',
      ta: 'விலை',
      bn: 'দাম'
    },
    'smart-match': {
      en: 'Smart Match',
      hi: 'स्मार्ट मैच',
      te: 'స్మార్ట్ మ్యాచ్',
      ta: 'ஸ்மார்ட் மேட்ச்',
      bn: 'স্মার্ট ম্যাচ'
    },
    'negotiation': {
      en: 'Negotiate',
      hi: 'बातचीत',
      te: 'చర్చ',
      ta: 'பேச்சு',
      bn: 'আলোচনা'
    }
  };

  const tabs = [
    { id: 'price-discovery', icon: TrendingUp },
    { id: 'smart-match', icon: Sparkles },
    { id: 'negotiation', icon: Users },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Tab Buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isSmartMatch = tab.id === 'smart-match';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                    ? isSmartMatch
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200'
                      : 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tabLabels[tab.id][appLanguage] || tabLabels[tab.id].en}

                {/* NEW badge for Smart Match */}
                {isSmartMatch && !isActive && (
                  <span className="absolute -top-1 -right-1 bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-fadeIn">
        {activeTab === 'price-discovery' && <PriceDiscoveryTab />}
        {activeTab === 'smart-match' && <SmartMatchTab />}
        {activeTab === 'negotiation' && <NegotiationTab />}
      </div>
    </div>
  );
}
