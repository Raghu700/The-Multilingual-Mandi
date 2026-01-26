/**
 * TabNavigation Component - Polished
 * Clean tabs with smooth transitions
 */

import { useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { PriceDiscoveryTab } from './PriceDiscoveryTab';
import { NegotiationTab } from './NegotiationTab';

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState('price-discovery');
  const { appLanguage } = useLanguage();

  const tabs = [
    { id: 'price-discovery', labelKey: 'tab.priceDiscovery', icon: TrendingUp },
    { id: 'negotiation', labelKey: 'tab.negotiation', icon: Users },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Tab Buttons */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {t(tab.labelKey, appLanguage)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-fadeIn">
        {activeTab === 'price-discovery' && <PriceDiscoveryTab />}
        {activeTab === 'negotiation' && <NegotiationTab />}
      </div>
    </div>
  );
}
