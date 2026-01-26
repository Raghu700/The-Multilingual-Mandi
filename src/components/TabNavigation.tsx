/**
 * TabNavigation Component
 * India's 77th Republic Day Special - 26 January 2026
 * 
 * Provides tab-based navigation for the three main modules:
 * - Translation (Unity in Diversity 🇮🇳)
 * - Price Discovery (Digital India 🚀)
 * - Negotiation (Atmanirbhar Bharat 💪)
 */

import { useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { PriceDiscoveryTab } from './PriceDiscoveryTab';
import { NegotiationTab } from './NegotiationTab';

interface Tab {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  badgeKey: string;
  content: React.ReactNode;
}

interface TabNavigationProps {
  children?: React.ReactNode;
}

export function TabNavigation({ children }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('price-discovery');
  const { appLanguage } = useLanguage();

  const tabs: Tab[] = [
    {
      id: 'price-discovery',
      labelKey: 'tab.priceDiscovery',
      icon: <TrendingUp className="w-5 h-5" />,
      badgeKey: 'badge.priceDiscovery',
      content: <PriceDiscoveryTab />,
    },
    {
      id: 'negotiation',
      labelKey: 'tab.negotiation',
      icon: <Users className="w-5 h-5" />,
      badgeKey: 'badge.negotiation',
      content: <NegotiationTab />,
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
      {/* Tab Navigation Bar */}
      <div className="glass-card mb-6 p-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                transition-all duration-300 font-semibold
                ${
                  activeTab === tab.id
                    ? 'bg-saffron text-white shadow-lg scale-105'
                    : 'glass-button text-navy-blue hover:bg-glass-white-light'
                }
              `}
            >
              {tab.icon}
              <span className="hidden sm:inline">{t(tab.labelKey, appLanguage)}</span>
              <span className="sm:hidden text-sm">{t(tab.labelKey, appLanguage).split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Badge */}
      {activeTabData && (
        <div className="flex justify-center mb-6">
          <div className="glass-badge-saffron text-saffron font-semibold px-4 py-2">
            {t(activeTabData.badgeKey, appLanguage)}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="glass-card p-6 min-h-[500px] animate-fadeIn">
        {activeTabData?.content}
      </div>

      {/* Optional children (for future extensions) */}
      {children}
    </div>
  );
}

