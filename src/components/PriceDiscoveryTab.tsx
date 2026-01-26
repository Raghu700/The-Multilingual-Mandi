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
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column: Commodity List */}
      <div className="w-full lg:w-1/3 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
        <CommoditySelector
          commodities={commodities}
          selectedCommodity={selectedCommodity}
          onCommoditySelect={handleCommoditySelect}
          language={appLanguage}
        />
      </div>

      {/* Right Column: Price Card + Calculator */}
      <div className="w-full lg:w-2/3 space-y-6">
        {selectedCommodity && priceData ? (
          <>
            {/* Price Card */}
            <PriceCard
              priceData={priceData}
              onPriceSelect={handlePriceSelect}
            />

            {/* Price Calculator */}
            <PriceCalculator
              commodity={selectedCommodity}
              priceData={priceData}
              initialPriceType={selectedPriceType}
            />

            {/* Info Section */}
            <div className="glass-card-light p-4 text-center">
              <p className="text-sm text-gray-600">
                💡 {t('price.tip', appLanguage)}
              </p>
            </div>
          </>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-500">
              {t('price.selectCommodity', appLanguage)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
