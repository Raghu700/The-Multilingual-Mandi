/**
 * Negotiation Service
 * Handles AI-powered negotiation strategies with fallback to quick tips
 */

import { Language } from '../types';
import { getAllTips, NegotiationTip } from '../data/negotiationTips';
import { generateAINegotiationStrategies } from './aiService';

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
 * Uses advanced AI analysis for contextual strategies
 */
export async function generateStrategies(
  context: NegotiationContext
): Promise<NegotiationStrategy[]> {
  // Validate context
  const validation = validateContext(context);
  if (!validation.valid) {
    throw new Error(`Invalid context: ${validation.errors.join(', ')}`);
  }

  try {
    // Use AI service for intelligent strategy generation
    const strategies = await generateAINegotiationStrategies(context);
    return strategies;
  } catch (error) {
    console.error('AI strategy generation failed, using fallback:', error);
    
    // Fallback to enhanced mock strategies
    return generateFallbackStrategies(context);
  }
}

/**
 * Enhanced fallback strategies with better context awareness
 */
function generateFallbackStrategies(context: NegotiationContext): NegotiationStrategy[] {
  const priceDifference = context.askingPrice - context.buyerOffer;
  const percentageDiff = (priceDifference / context.askingPrice) * 100;
  const totalValue = context.askingPrice * context.quantity;

  const strategies: NegotiationStrategy[] = [
    {
      id: 'strategy-1',
      title: 'Smart Compromise Strategy',
      description: `With a ${percentageDiff.toFixed(1)}% price gap, find middle ground while maintaining value perception. Total deal worth ₹${totalValue.toLocaleString()}.`,
      actionPoints: [
        `Counter-offer at ₹${Math.round((context.askingPrice + context.buyerOffer) / 2)} per unit`,
        'Emphasize the quality and freshness of your product',
        'Mention that this is a special price for today only',
        'Ask if they can commit to the full quantity immediately',
      ],
    },
    {
      id: 'strategy-2',
      title: 'Volume Incentive Approach',
      description: 'Leverage quantity to create win-win scenario. Maintain margins while offering value for larger commitments.',
      actionPoints: [
        `Keep your asking price of ₹${context.askingPrice} for current quantity`,
        `Offer ₹${Math.round(context.askingPrice * 0.95)} if they increase quantity by 50%`,
        'Highlight the savings they get with bulk purchase',
        'Create urgency by mentioning limited stock availability',
      ],
    },
    {
      id: 'strategy-3',
      title: 'Value Demonstration Strategy',
      description: 'Stand firm on pricing by clearly demonstrating superior value proposition and market positioning.',
      actionPoints: [
        `Maintain your asking price of ₹${context.askingPrice} with confidence`,
        'Compare with market rates for similar quality products',
        'Explain your quality standards and sourcing methods',
        'Offer quality guarantee or small sample for verification',
        'Suggest flexible payment terms if price is the concern',
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
