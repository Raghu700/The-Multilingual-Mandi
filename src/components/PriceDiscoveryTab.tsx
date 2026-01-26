/**
 * PriceDiscoveryTab Component
 * Main container for the Price Discovery Module
 * Integrates commodity selector, price cards, calculator, and AI-powered insights
 */

import { useState, useEffect } from 'react';
import { Commodity } from '../data/commodities';
import { getCommodities, getPriceData, getEnhancedPriceData, PriceData } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { CommoditySelector } from './CommoditySelector';
import { PriceCard } from './PriceCard';
import { PriceCalculator } from './PriceCalculator';
import { MarketInsights } from './MarketInsights';
import { PricePredictionComponent } from './PricePrediction';
import { SmartPriceRecommendationComponent } from './SmartPriceRecommendation';
import { Brain, Zap } from 'lucide-react';

export function PriceDiscoveryTab() {
  const { appLanguage } = useLanguage();
  
  // State management
  const [commodities] = useState<Commodity[]>(getCommodities());
  const [selectedCommodity, setSelectedCommodity] = useState<Commodity | null>(null);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [selectedPriceType, setSelectedPriceType] = useState<'min' | 'avg' | 'max'>('avg');
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);

  // Handle commodity selection with AI enhancement
  const handleCommoditySelect = async (commodity: Commodity) => {
    setSelectedCommodity(commodity);
    setLoadingAI(true);
    
    try {
      // Get enhanced price data with AI features
      const newPriceData = await getEnhancedPriceData(commodity, aiEnabled);
      setPriceData(newPriceData);
      
      // Reset calculator
      setSelectedPriceType('avg');
      setSelectedPrice(newPriceData.avgPrice);
    } catch (error) {
      console.error('Failed to load enhanced price data:', error);
      // Fallback to basic price data
      const basicPriceData = getPriceData(commodity);
      setPriceData(basicPriceData);
      setSelectedPriceType('avg');
      setSelectedPrice(basicPriceData.avgPrice);
    } finally {
      setLoadingAI(false);
    }
  };

  // Handle price selection from price card
  const handlePriceSelect = (priceType: 'min' | 'avg' | 'max', price: number) => {
    setSelectedPriceType(priceType);
    setSelectedPrice(price);
  };

  // Toggle AI features
  const toggleAI = async () => {
    setAiEnabled(!aiEnabled);
    
    if (selectedCommodity) {
      setLoadingAI(true);
      try {
        const newPriceData = await getEnhancedPriceData(selectedCommodity, !aiEnabled);
        setPriceData(newPriceData);
      } catch (error) {
        console.error('Failed to toggle AI features:', error);
      } finally {
        setLoadingAI(false);
      }
    }
  };

  // Auto-select first commodity on mount
  useEffect(() => {
    if (commodities.length > 0 && !selectedCommodity) {
      handleCommoditySelect(commodities[0]);
    }
  }, [commodities, selectedCommodity]);

  return (
    <div className="space-y-6">
      {/* AI Toggle Header */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-saffron" />
          <h2 className="text-lg font-semibold text-gray-800">Price Discovery</h2>
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

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Commodity List */}
        <div className="w-full lg:w-1/3 lg:max-h-[calc(100vh-300px)] lg:overflow-y-auto">
          <CommoditySelector
            commodities={commodities}
            selectedCommodity={selectedCommodity}
            onCommoditySelect={handleCommoditySelect}
            language={appLanguage}
          />
        </div>

        {/* Right Column: Price Information */}
        <div className="w-full lg:w-2/3 space-y-6">
          {selectedCommodity && priceData ? (
            <>
              {/* Price Card */}
              <PriceCard
                priceData={priceData}
                onPriceSelect={handlePriceSelect}
              />

              {/* AI-Powered Components */}
              {aiEnabled && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Price Prediction */}
                  {priceData.prediction && (
                    <PricePredictionComponent
                      prediction={priceData.prediction}
                      loading={loadingAI}
                    />
                  )}

                  {/* Market Insights */}
                  {priceData.insights && (
                    <MarketInsights
                      insights={priceData.insights}
                      loading={loadingAI}
                    />
                  )}

                  {/* Smart Price Recommendation */}
                  {priceData.recommendation && (
                    <div className="xl:col-span-2">
                      <SmartPriceRecommendationComponent
                        recommendation={priceData.recommendation}
                        currentPrice={priceData.avgPrice}
                        loading={loadingAI}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Price Calculator */}
              <PriceCalculator
                commodity={selectedCommodity}
                priceData={priceData}
                initialPriceType={selectedPriceType}
              />

              {/* Info Section */}
              <div className="glass-card-light p-4 text-center">
                <p className="text-sm text-gray-600">
                  💡 {aiEnabled 
                    ? 'AI-powered insights help you make informed pricing decisions'
                    : t('price.tip', appLanguage)
                  }
                </p>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {t('price.selectCommodity', appLanguage)}
              </p>
              <p className="text-sm text-gray-400">
                {aiEnabled 
                  ? 'Select a commodity to see AI-powered price insights and predictions'
                  : 'Select a commodity to see current market prices'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
