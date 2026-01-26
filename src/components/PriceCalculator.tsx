/**
 * PriceCalculator Component
 * Calculates total price based on quantity and selected price type
 */

import { useState } from 'react';
import { Commodity, getCommodityName } from '../data/commodities';
import {
  PriceData,
  validateQuantity,
  createPriceCalculation,
  formatCurrency,
  getPriceColor,
} from '../services/priceService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

interface PriceCalculatorProps {
  commodity: Commodity;
  priceData: PriceData;
  initialPriceType?: 'min' | 'avg' | 'max';
}

export function PriceCalculator({
  commodity,
  priceData,
  initialPriceType = 'avg',
}: PriceCalculatorProps) {
  const { appLanguage } = useLanguage();
  const [quantity, setQuantity] = useState<string>('');
  const [priceType, setPriceType] = useState<'min' | 'avg' | 'max'>(initialPriceType);
  const [error, setError] = useState<string>('');

  // Handle quantity change
  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    setError('');
  };

  // Calculate total
  const quantityNum = parseFloat(quantity);
  const validation = validateQuantity(quantityNum);
  const calculation = validation.valid
    ? createPriceCalculation(commodity, quantityNum, priceType, priceData)
    : null;

  // Get price based on type
  const getPrice = (type: 'min' | 'avg' | 'max'): number => {
    switch (type) {
      case 'min':
        return priceData.minPrice;
      case 'avg':
        return priceData.avgPrice;
      case 'max':
        return priceData.maxPrice;
    }
  };

  const commodityName = getCommodityName(commodity, appLanguage);

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-navy-blue mb-2">
          {t('calculator.title', appLanguage)}
        </h3>
        <p className="text-sm text-gray-600">
          {t('calculator.calculateFor', appLanguage)} {commodityName}
        </p>
      </div>

      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-semibold text-navy-blue mb-2">
          {t('calculator.quantity', appLanguage)} ({commodity.unit})
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          placeholder={`${t('calculator.enterQuantity', appLanguage)} ${commodity.unit}`}
          min="0"
          step="0.01"
          className={`
            w-full px-4 py-3 rounded-lg
            glass-card border-2
            ${error || (!validation.valid && quantity) ? 'border-red-500' : 'border-transparent'}
            focus:outline-none focus:ring-2 focus:ring-saffron
            text-navy-blue font-semibold
          `}
        />
        {!validation.valid && quantity && (
          <p className="text-red-600 text-sm mt-2">{validation.error}</p>
        )}
      </div>

      {/* Price Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-navy-blue mb-2">
          {t('calculator.priceType', appLanguage)}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['min', 'avg', 'max'] as const).map((type) => {
            const isSelected = priceType === type;
            const colorClass = getPriceColor(type);
            const price = getPrice(type);

            return (
              <button
                key={type}
                onClick={() => setPriceType(type)}
                className={`
                  glass-card p-3 text-center transition-all duration-300
                  ${
                    isSelected
                      ? 'ring-2 ring-saffron bg-saffron/10 scale-105'
                      : 'hover:bg-glass-white-light'
                  }
                `}
              >
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  {t(`price.${type}`, appLanguage).toUpperCase()}
                </div>
                <div className={`text-sm font-bold ${colorClass}`}>
                  {formatCurrency(price)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculation Result */}
      {calculation && (
        <div className="glass-card-light p-6 text-center space-y-2">
          <div className="text-sm text-gray-600">{t('calculator.totalCost', appLanguage)}</div>
          <div className="text-4xl font-bold text-saffron">
            {formatCurrency(calculation.total)}
          </div>
          <div className="text-sm text-gray-600">
            {calculation.quantity} {commodity.unit} × {formatCurrency(calculation.pricePerUnit)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!quantity && (
        <div className="text-center text-gray-500 text-sm py-4">
          {t('calculator.enterToCalculate', appLanguage)}
        </div>
      )}
    </div>
  );
}
