/**
 * ContextForm Component
 * Form for entering negotiation context (product, prices, quantity)
 */

import { useState } from 'react';
import { NegotiationContext } from '../services/negotiationService';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../data/translations';

interface ContextFormProps {
  onSubmit: (context: NegotiationContext) => void;
  loading?: boolean;
}

export function ContextForm({ onSubmit, loading = false }: ContextFormProps) {
  const { appLanguage } = useLanguage();
  const [product, setProduct] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [buyerOffer, setBuyerOffer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const newErrors: Record<string, string> = {};

    if (!product.trim()) {
      newErrors.product = 'Product name is required';
    }

    const askingPriceNum = parseFloat(askingPrice);
    if (!askingPrice || isNaN(askingPriceNum) || askingPriceNum <= 0) {
      newErrors.askingPrice = 'Valid asking price is required';
    }

    const buyerOfferNum = parseFloat(buyerOffer);
    if (!buyerOffer || isNaN(buyerOfferNum) || buyerOfferNum <= 0) {
      newErrors.buyerOffer = 'Valid buyer offer is required';
    }

    const quantityNum = parseFloat(quantity);
    if (!quantity || isNaN(quantityNum) || quantityNum <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit context
    setErrors({});
    onSubmit({
      product: product.trim(),
      askingPrice: askingPriceNum,
      buyerOffer: buyerOfferNum,
      quantity: quantityNum,
      language: appLanguage,
    });
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-navy-blue mb-2">
          {t('negotiation.context', appLanguage)}
        </h3>
        <p className="text-sm text-gray-600">
          {t('negotiation.enterDetails', appLanguage)}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-navy-blue mb-2">
            {t('negotiation.productName', appLanguage)}
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder={t('placeholder.productExample', appLanguage)}
            className={`
              w-full px-4 py-3 rounded-lg glass-card border-2
              ${errors.product ? 'border-red-500' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-saffron
              text-navy-blue font-semibold
            `}
            disabled={loading}
          />
          {errors.product && (
            <p className="text-red-600 text-sm mt-2">{errors.product}</p>
          )}
        </div>

        {/* Asking Price */}
        <div>
          <label className="block text-sm font-semibold text-navy-blue mb-2">
            {t('negotiation.askingPrice', appLanguage)} (₹ per unit)
          </label>
          <input
            type="number"
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
            placeholder={t('placeholder.priceExample', appLanguage)}
            min="0"
            step="0.01"
            className={`
              w-full px-4 py-3 rounded-lg glass-card border-2
              ${errors.askingPrice ? 'border-red-500' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-saffron
              text-navy-blue font-semibold
            `}
            disabled={loading}
          />
          {errors.askingPrice && (
            <p className="text-red-600 text-sm mt-2">{errors.askingPrice}</p>
          )}
        </div>

        {/* Buyer Offer */}
        <div>
          <label className="block text-sm font-semibold text-navy-blue mb-2">
            {t('negotiation.buyerOffer', appLanguage)} (₹ per unit)
          </label>
          <input
            type="number"
            value={buyerOffer}
            onChange={(e) => setBuyerOffer(e.target.value)}
            placeholder={t('placeholder.priceExample', appLanguage)}
            min="0"
            step="0.01"
            className={`
              w-full px-4 py-3 rounded-lg glass-card border-2
              ${errors.buyerOffer ? 'border-red-500' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-saffron
              text-navy-blue font-semibold
            `}
            disabled={loading}
          />
          {errors.buyerOffer && (
            <p className="text-red-600 text-sm mt-2">{errors.buyerOffer}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-semibold text-navy-blue mb-2">
            {t('negotiation.quantity', appLanguage)} (kg/units)
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t('placeholder.quantityExample', appLanguage)}
            min="0"
            step="0.01"
            className={`
              w-full px-4 py-3 rounded-lg glass-card border-2
              ${errors.quantity ? 'border-red-500' : 'border-transparent'}
              focus:outline-none focus:ring-2 focus:ring-saffron
              text-navy-blue font-semibold
            `}
            disabled={loading}
          />
          {errors.quantity && (
            <p className="text-red-600 text-sm mt-2">{errors.quantity}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full px-6 py-4 rounded-lg font-bold text-white
            transition-all duration-300
            ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-saffron hover:bg-saffron/90 hover:scale-105 shadow-lg'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              {t('negotiation.generatingStrategies', appLanguage)}
            </span>
          ) : (
            t('negotiation.generateStrategies', appLanguage)
          )}
        </button>
      </form>
    </div>
  );
}
