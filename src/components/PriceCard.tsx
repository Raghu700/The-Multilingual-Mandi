/**
 * PriceCard Component
 * Displays min, avg, max prices with color coding and trend indicators
 */

import {
  PriceData,
  getPriceColor,
  getPriceBackgroundColor,
  getTrendIndicator,
  getTrendColor,
  formatCurrency,
} from '../services/priceService';
import { getCommodityName } from '../data/commodities';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

interface PriceCardProps {
  priceData: PriceData;
  onPriceSelect?: (priceType: 'min' | 'avg' | 'max', price: number) => void;
}

export function PriceCard({ priceData, onPriceSelect }: PriceCardProps) {
  const { appLanguage } = useLanguage();
  const { minPrice, avgPrice, maxPrice, trend, commodity } = priceData;
  const trendIndicator = getTrendIndicator(trend);
  const trendColor = getTrendColor(trend);
  const commodityName = getCommodityName(commodity, appLanguage);

  const priceTypes: Array<{
    type: 'min' | 'avg' | 'max';
    labelKey: string;
    price: number;
  }> = [
    { type: 'min', labelKey: 'price.min', price: minPrice },
    { type: 'avg', labelKey: 'price.avg', price: avgPrice },
    { type: 'max', labelKey: 'price.max', price: maxPrice },
  ];

  // Get trend text
  const getTrendText = () => {
    if (trend === 'up') return t('price.trendingUp', appLanguage);
    if (trend === 'down') return t('price.trendingDown', appLanguage);
    return t('price.stable', appLanguage);
  };

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header with Commodity Name and Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{commodity.emoji}</span>
          <div>
            <h3 className="text-lg font-bold text-navy-blue">
              {commodityName}
            </h3>
            <p className="text-sm text-gray-600">{t('price.per', appLanguage)} {commodity.unit}</p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${trendColor}`}>
          {trendIndicator}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-3 gap-3">
        {priceTypes.map(({ type, labelKey, price }) => {
          const colorClass = getPriceColor(type);
          const bgClass = getPriceBackgroundColor(type);

          return (
            <button
              key={type}
              onClick={() => onPriceSelect?.(type, price)}
              className={`
                ${bgClass} p-4 rounded-lg text-center
                transition-all duration-300
                hover:scale-105 hover:shadow-lg
                cursor-pointer
              `}
            >
              <div className="text-xs font-semibold text-gray-600 mb-1">
                {t(labelKey, appLanguage)}
              </div>
              <div className={`text-lg font-bold ${colorClass}`}>
                {formatCurrency(price)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Trend Description */}
      <div className="text-center text-sm text-gray-600">
        {getTrendText()}
      </div>
    </div>
  );
}
