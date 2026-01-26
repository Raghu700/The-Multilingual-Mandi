/**
 * Negotiation Service
 * Handles AI-powered negotiation strategies with fallback to quick tips
 */

import { Language } from '../types';
import { getAllTips, NegotiationTip } from '../data/negotiationTips';

export interface NegotiationContext {
  product: string;
  askingPrice: number;
  buyerOffer: number;
  quantity: number;
  language: Language;
}

export interface NegotiationStrategy {
  id: string;
  title: string;
  description: string;
  actionPoints: string[];
}

/**
 * Validate negotiation context
 */
export function validateContext(context: NegotiationContext): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!context.product || context.product.trim() === '') {
    errors.push('Product name is required');
  }

  if (context.askingPrice <= 0) {
    errors.push('Asking price must be greater than 0');
  }

  if (context.buyerOffer <= 0) {
    errors.push('Buyer offer must be greater than 0');
  }

  if (context.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate AI-powered negotiation strategies
 * Currently returns mock strategies since we don't have Claude API key
 * In production, this would call Claude API
 */
export async function generateStrategies(
  context: NegotiationContext
): Promise<NegotiationStrategy[]> {
  // Validate context
  const validation = validateContext(context);
  if (!validation.valid) {
    throw new Error(`Invalid context: ${validation.errors.join(', ')}`);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock AI-generated strategies
  // In production, this would call Claude API with a prompt template
  const priceDifference = context.askingPrice - context.buyerOffer;
  const percentageDiff = (priceDifference / context.askingPrice) * 100;

  const strategies: NegotiationStrategy[] = [
    {
      id: 'strategy-1',
      title: 'Meet in the Middle',
      description: `The buyer's offer is ${percentageDiff.toFixed(1)}% below your asking price. Consider meeting halfway to close the deal quickly.`,
      actionPoints: [
        `Counter-offer at ₹${Math.round((context.askingPrice + context.buyerOffer) / 2)} per unit`,
        'Emphasize the quality and freshness of your product',
        'Mention that this is a special price for today only',
        'Ask if they can commit to the full quantity',
      ],
    },
    {
      id: 'strategy-2',
      title: 'Volume Discount Approach',
      description: 'Offer a better price if the buyer increases their quantity. This maintains your profit margin while securing a larger sale.',
      actionPoints: [
        `Keep your asking price of ₹${context.askingPrice} for current quantity`,
        `Offer ₹${Math.round(context.askingPrice * 0.95)} if they double the quantity`,
        'Highlight the savings they get with bulk purchase',
        'Mention limited availability to create urgency',
      ],
    },
    {
      id: 'strategy-3',
      title: 'Quality Justification',
      description: 'Stand firm on your price by emphasizing the superior quality and value of your product.',
      actionPoints: [
        `Maintain your asking price of ₹${context.askingPrice}`,
        'Show examples of market rates for similar quality products',
        'Explain your growing/sourcing methods that ensure quality',
        'Offer a small sample to demonstrate quality',
        'Suggest payment terms if price is the main concern',
      ],
    },
  ];

  return strategies;
}

/**
 * Get quick tips as fallback
 */
export function getQuickTips(language: Language = 'en'): NegotiationTip[] {
  return getAllTips(language);
}

/**
 * Translate strategy to target language
 * Currently returns English only
 * In production, this would use translation service
 */
export function translateStrategy(
  strategy: NegotiationStrategy,
  language: Language
): NegotiationStrategy {
  // For now, return as-is (English only)
  // In production, integrate with translation service
  return strategy;
}

/**
 * Format currency for display
 */
export function formatPrice(price: number): string {
  return `₹${price.toFixed(2)}`;
}

/**
 * Calculate price difference percentage
 */
export function calculatePriceDifference(
  askingPrice: number,
  buyerOffer: number
): number {
  return ((askingPrice - buyerOffer) / askingPrice) * 100;
}
