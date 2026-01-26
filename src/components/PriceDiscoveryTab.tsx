/**
 * PriceDiscoveryTab Component - Polished
 * Compact layout, better scrolling, cleaner design
 */

import { useState, useEffect } from 'react';
import { Commodity, COMMODITIES } from '../data/commodities';
import { getPriceData, PriceData, formatCurrency } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

export function PriceDiscoveryTab() {
  const { appLanguage } = useLanguage();

  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITIES[0]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);

  useEffect(() => {
    if (selectedCommodity) {
      setPriceData(getPriceData(selectedCommodity));
    }
  }, [selectedCommodity]);

  const getTrendInfo = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', text: t('price.trendingUp', appLanguage) };
      case 'down': return { icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-50', text: t('price.trendingDown', appLanguage) };
      default: return { icon: Minus, color: 'text-slate-500', bg: 'bg-slate-50', text: t('price.stable', appLanguage) };
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return t('ai.high', appLanguage);
    if (confidence >= 60) return t('ai.medium', appLanguage);
    return t('ai.low', appLanguage);
  };

  // Simulated AI prediction
  const prediction = priceData ? {
    current: priceData.avgPrice,
    predicted: Math.round(priceData.avgPrice * (priceData.trend === 'up' ? 1.05 : priceData.trend === 'down' ? 0.95 : 1)),
    confidence: 75 + Math.floor(Math.random() * 20)
  } : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Commodity Selector - Horizontal */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {COMMODITIES.slice(0, 8).map((commodity) => (
          <button
            key={commodity.id}
            onClick={() => setSelectedCommodity(commodity)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${selectedCommodity.id === commodity.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-100 hover:border-orange-200'
              }`}
          >
            <span className="text-xl">{commodity.emoji}</span>
            <span className="font-medium text-sm whitespace-nowrap">{commodity.names[appLanguage]}</span>
          </button>
        ))}
      </div>

      {priceData && (
        <>
          {/* Main Price Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-3xl">
                  {selectedCommodity.emoji}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedCommodity.names[appLanguage]}</h2>
                  <p className="text-sm text-slate-500">{t('price.per', appLanguage)} {selectedCommodity.unit}</p>
                </div>
              </div>

              {(() => {
                const trendInfo = getTrendInfo(priceData.trend);
                const TrendIcon = trendInfo.icon;
                return (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${trendInfo.bg}`}>
                    <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
                    <span className={`font-medium ${trendInfo.color}`}>{trendInfo.text}</span>
                  </div>
                );
              })()}
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">{t('price.min', appLanguage)}</p>
                <p className="text-2xl font-bold text-slate-700">{formatCurrency(priceData.minPrice)}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-50 border-2 border-orange-200">
                <p className="text-xs text-orange-600 mb-1">{t('price.avg', appLanguage)}</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(priceData.avgPrice)}</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-xs text-slate-500 mb-1">{t('price.max', appLanguage)}</p>
                <p className="text-2xl font-bold text-slate-700">{formatCurrency(priceData.maxPrice)}</p>
              </div>
            </div>
          </div>

          {/* AI Prediction - Compact */}
          {prediction && (
            <div className="bg-violet-50 rounded-2xl p-5 border border-violet-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <span className="font-semibold text-slate-800">{t('ai.prediction', appLanguage)}</span>
                  <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">{t('ai.nextWeek', appLanguage)}</span>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${prediction.confidence >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {getConfidenceLabel(prediction.confidence)} ({prediction.confidence}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t('ai.currentPrice', appLanguage)}</p>
                  <p className="text-xl font-bold text-slate-700">{formatCurrency(prediction.current)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t('ai.predictedPrice', appLanguage)}</p>
                  <p className={`text-xl font-bold ${prediction.predicted > prediction.current ? 'text-emerald-600' :
                      prediction.predicted < prediction.current ? 'text-rose-600' : 'text-slate-700'
                    }`}>{formatCurrency(prediction.predicted)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t('ai.expectedChange', appLanguage)}</p>
                  <p className={`text-xl font-bold ${prediction.predicted > prediction.current ? 'text-emerald-600' :
                      prediction.predicted < prediction.current ? 'text-rose-600' : 'text-slate-700'
                    }`}>
                    {prediction.predicted >= prediction.current ? '+' : ''}
                    {formatCurrency(prediction.predicted - prediction.current)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Calculator */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="text-sm font-medium text-slate-600 mb-3">{t('calculator.title', appLanguage)}</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                defaultValue={100}
                className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none text-center"
              />
              <span className="text-slate-500">{selectedCommodity.unit}</span>
              <span className="text-slate-400">×</span>
              <span className="font-semibold text-orange-600">{formatCurrency(priceData.avgPrice)}</span>
              <span className="text-slate-400">=</span>
              <span className="text-xl font-bold text-slate-800">{formatCurrency(priceData.avgPrice * 100)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
