/**
 * PriceDiscoveryTab — Clean & Dense layout
 * Compact cards, clearer prices, theme-aware
 */

import { useState, useEffect } from 'react';
import { COMMODITIES, Commodity } from '../data/commodities';
import { getPriceData, PriceData, formatCurrency } from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

export function PriceDiscoveryTab() {
  const { appLanguage } = useLanguage();

  const [selectedCommodity, setSelectedCommodity] = useState<Commodity>(COMMODITIES[0]);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [calculatorQuantity, setCalculatorQuantity] = useState<number>(100);

  useEffect(() => {
    if (selectedCommodity) {
      setPriceData(getPriceData(selectedCommodity));
    }
  }, [selectedCommodity]);

  const getTrendInfo = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return { icon: TrendingUp, color: '#10b981', text: t('price.trendingUp', appLanguage) };
      case 'down': return { icon: TrendingDown, color: '#ef4444', text: t('price.trendingDown', appLanguage) };
      default: return { icon: Minus, color: 'var(--text-muted)', text: t('price.stable', appLanguage) };
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return t('ai.high', appLanguage);
    if (confidence >= 60) return t('ai.medium', appLanguage);
    return t('ai.low', appLanguage);
  };

  const prediction = priceData ? {
    current: priceData.avgPrice,
    predicted: Math.round(priceData.avgPrice * (priceData.trend === 'up' ? 1.05 : priceData.trend === 'down' ? 0.95 : 1)),
    confidence: 75 + Math.floor(Math.random() * 20)
  } : null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 px-1 sm:px-0">
      {/* Commodity Selector — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {COMMODITIES.map((commodity) => (
          <button
            key={commodity.id}
            onClick={() => setSelectedCommodity(commodity)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium"
            style={{
              backgroundColor: selectedCommodity.id === commodity.id ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedCommodity.id === commodity.id ? '#fff' : 'var(--text-primary)',
              border: `1px solid ${selectedCommodity.id === commodity.id ? 'var(--primary)' : 'var(--border-default)'}`,
            }}
          >
            <span className="text-lg">{commodity.emoji}</span>
            <span className="whitespace-nowrap">{commodity.names[appLanguage]}</span>
          </button>
        ))}
      </div>

      {priceData && (
        <>
          {/* Main Price Card */}
          <div
            className="rounded-xl p-4 sm:p-5"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: 'var(--bg-accent)' }}
                >
                  {selectedCommodity.emoji}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedCommodity.names[appLanguage]}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('price.per', appLanguage)} {selectedCommodity.unit}
                  </p>
                </div>
              </div>

              {(() => {
                const trendInfo = getTrendInfo(priceData.trend);
                const TrendIcon = trendInfo.icon;
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ backgroundColor: 'var(--bg-surface-alt)', color: trendInfo.color }}
                  >
                    <TrendIcon className="w-4 h-4" />
                    <span>{trendInfo.text}</span>
                  </div>
                );
              })()}
            </div>

            {/* Price Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('price.min', appLanguage)}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(priceData.minPrice)}</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-accent)', border: '2px solid var(--primary-light)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--primary)' }}>{t('price.avg', appLanguage)}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(priceData.avgPrice)}</p>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-alt)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('price.max', appLanguage)}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(priceData.maxPrice)}</p>
              </div>
            </div>
          </div>

          {/* AI Prediction */}
          {prediction && (
            <div
              className="rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-1 sm:gap-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: '#7c3aed' }} />
                  <span className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                    {t('ai.prediction', appLanguage)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                    {t('ai.nextWeek', appLanguage)}
                  </span>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${prediction.confidence >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {getConfidenceLabel(prediction.confidence)} ({prediction.confidence}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('ai.currentPrice', appLanguage)}</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(prediction.current)}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('ai.predictedPrice', appLanguage)}</p>
                  <p className={`text-lg font-bold ${prediction.predicted > prediction.current ? 'text-emerald-600' : prediction.predicted < prediction.current ? 'text-rose-600' : ''}`}
                    style={{ color: prediction.predicted === prediction.current ? 'var(--text-primary)' : undefined }}
                  >
                    {formatCurrency(prediction.predicted)}
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{t('ai.expectedChange', appLanguage)}</p>
                  <p className={`text-lg font-bold ${prediction.predicted > prediction.current ? 'text-emerald-600' : prediction.predicted < prediction.current ? 'text-rose-600' : ''}`}
                    style={{ color: prediction.predicted === prediction.current ? 'var(--text-primary)' : undefined }}
                  >
                    {prediction.predicted >= prediction.current ? '+' : ''}
                    {formatCurrency(prediction.predicted - prediction.current)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Calculator */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('calculator.title', appLanguage)}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                value={calculatorQuantity}
                onChange={(e) => setCalculatorQuantity(Number(e.target.value) || 0)}
                min="0"
                className="w-24 px-3 py-2 rounded-lg text-center text-base font-medium glass-input"
              />
              <span style={{ color: 'var(--text-muted)' }}>{selectedCommodity.unit}</span>
              <span style={{ color: 'var(--text-muted)' }}>×</span>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(priceData.avgPrice)}</span>
              <span style={{ color: 'var(--text-muted)' }}>=</span>
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(priceData.avgPrice * calculatorQuantity)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
