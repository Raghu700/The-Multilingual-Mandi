/**
 * PriceDiscoveryTab Component
 * Main container for the Price Discovery Module
 * Integrates commodity selector, price cards, and calculator
 */

import { useState, useEffect } from 'react';
import { Commodity } from '../data/commodities';
import { getCommodities, getPriceData, PriceData } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { CommoditySelector } from './CommoditySelector';
import { PriceCard } from './PriceCard';
import { PriceCalculator } from './PriceCalculator';

export function PriceDiscoveryTab() {
  const { appLanguage } = useLanguage();
  
  // State management
  const [commodities] = useState<Commodity[]>(getCommodities());
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [selectedPriceType, setSelectedPriceType] = useState<'min' | 'avg' | 'max'>('avg');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  // Handle commodity selection
  const handleCommoditySelect = (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    const newPriceData = getPriceData(commodity);
    setPriceData(newPriceData);
    // Reset calculator
    setSelectedPriceType('avg');
    setSelectedPrice(newPriceData.avgPrice);
  };

  // Handle price selection from price card
  const handlePriceSelect = (priceType: 'min' | 'avg' | 'max', price: number) => {
    setSelectedPriceType(priceType);
    setSelectedPrice(price);
  };

  // Auto-select first commodity on mount
  useEffect(() => {
    if (commodities.length > 0 && !selectedCommodity) {
      handleCommoditySelect(commodities[0]);
    }
  }, [commodities, selectedCommodity]);

  return (
    <div className="space-y-8">
      {/* Commodity Selector */}
      <CommoditySelector
        commodities={commodities}
        selectedCommodity={selectedCommodity}
        onCommoditySelect={handleCommoditySelect}
        language={appLanguage}
      />

      {/* Price Display and Calculator */}
      {selectedCommodity && priceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Card */}
          <div>
            <PriceCard
              priceData={priceData}
              onPriceSelect={handlePriceSelect}
            />
          </div>

          {/* Price Calculator */}
          <div>
            <PriceCalculator
              commodity={selectedCommodity}
              priceData={priceData}
              initialPriceType={selectedPriceType}
            />
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="glass-card-light p-6 text-center">
        <p className="text-sm text-gray-600">
          💡 {t('price.tip', appLanguage)}
        </p>
      </div>
    </div>
  );
}
