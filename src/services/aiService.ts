/**
 * AI Service
 * Handles AI-powered features for price discovery and negotiation
 */

import { Commodity } from '../data/commodities';
import { NegotiationContext, NegotiationStrategy } from '../types';

// AI Configuration


export interface MarketInsight {
  id: string;
  type: 'price_trend' | 'demand_forecast' | 'seasonal_factor' | 'market_alert';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
  timeframe: string;
}

export interface PricePrediction {
  commodity: Commodity;
  currentPrice: number;
  predictedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  confidence: number;
  factors: string[];
  timeframe: '1day' | '1week' | '1month';
}

export interface SmartPriceRecommendation {
  recommendedPrice: number;
  reasoning: string;
  marketPosition: 'competitive' | 'premium' | 'budget';
  expectedDemand: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Generate AI-powered negotiation strategies
 */
export async function generateAINegotiationStrategies(
  context: NegotiationContext
): Promise<NegotiationStrategy[]> {
  try {
    // Calculate key metrics
    const priceDifference = context.askingPrice - context.buyerOffer;
    const priceGapPercent = (priceDifference / context.askingPrice) * 100;

    // Create AI prompt for negotiation strategies (for future API integration)


    // In a real implementation, this would call the actual AI API
    // For now, we'll use enhanced mock data based on the context
    const strategies = await generateContextualStrategies(context, priceDifference, priceGapPercent);

    return strategies;
  } catch (error) {
    console.error('AI strategy generation failed:', error);
    throw new Error('Failed to generate AI strategies');
  }
}

/**
 * Generate contextual strategies based on negotiation parameters
 */
async function generateContextualStrategies(
  context: NegotiationContext,
  priceDifference: number,
  priceGapPercent: number
): Promise<NegotiationStrategy[]> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  const strategies: NegotiationStrategy[] = [];

  // Strategy 1: Based on price gap size
  if (priceGapPercent > 20) {
    strategies.push({
      id: 'bridge-gap-gradually',
      title: 'Bridge Gap Gradually',
      description: `With a ${priceGapPercent.toFixed(1)}% price difference, avoid immediate compromise. Use incremental concessions to find middle ground while maintaining value perception.`,
      actionPoints: [
        `Start by reducing your price by only ₹${Math.ceil(priceDifference * 0.3)} (30% of gap)`,
        'Emphasize product quality and freshness to justify premium',
        'Ask buyer to meet halfway on the remaining difference',
        'Offer small quantity discount if they increase order size'
      ]
    });
  } else {
    strategies.push({
      id: 'quick-close',
      title: 'Quick Close Strategy',
      description: `Small price gap of ${priceGapPercent.toFixed(1)}% suggests serious buyer. Focus on closing quickly with minor adjustments.`,
      actionPoints: [
        `Meet in middle at ₹${((context.askingPrice + context.buyerOffer) / 2).toFixed(0)}`,
        'Highlight immediate availability and fresh stock',
        'Offer to throw in small extra quantity at same price',
        'Confirm payment terms and delivery schedule'
      ]
    });
  }

  // Strategy 2: Based on quantity
  if (context.quantity > 100) {
    strategies.push({
      id: 'volume-advantage',
      title: 'Volume Advantage Play',
      description: `Large order of ${context.quantity} units provides leverage. Use bulk pricing psychology while maintaining margins.`,
      actionPoints: [
        'Acknowledge their large order and express appreciation',
        `Offer tiered pricing: current rate for first 100, ₹${(context.askingPrice * 0.95).toFixed(0)} for remainder`,
        'Propose future bulk order discounts for repeat business',
        'Suggest payment terms that work for both parties'
      ]
    });
  } else {
    strategies.push({
      id: 'quality-focus',
      title: 'Quality Focus Approach',
      description: `Smaller quantity suggests quality-conscious buyer. Emphasize superior product attributes and service.`,
      actionPoints: [
        'Highlight specific quality features of your product',
        'Offer quality guarantee or return policy',
        'Compare with lower-quality alternatives in market',
        'Suggest trial purchase with promise of better rates for future orders'
      ]
    });
  }

  // Strategy 3: Based on total deal value
  const totalValue = context.askingPrice * context.quantity;
  if (totalValue > 10000) {
    strategies.push({
      id: 'relationship-builder',
      title: 'Relationship Builder Strategy',
      description: `High-value deal of ₹${totalValue.toLocaleString()} warrants long-term thinking. Focus on building lasting business relationship.`,
      actionPoints: [
        'Position this as start of long-term business partnership',
        'Offer exclusive supplier status for their regular needs',
        'Provide market insights and advance notice of price changes',
        'Suggest quarterly contracts with predictable pricing'
      ]
    });
  } else {
    strategies.push({
      id: 'value-demonstration',
      title: 'Value Demonstration',
      description: 'Focus on demonstrating clear value proposition to justify your pricing in this smaller transaction.',
      actionPoints: [
        'Break down cost components (quality, handling, transport)',
        'Show comparison with market alternatives',
        'Offer additional services (sorting, packaging, delivery)',
        'Provide references from satisfied customers'
      ]
    });
  }

  return strategies;
}

/**
 * Generate AI-powered price predictions
 */
export async function generatePricePrediction(
  commodity: Commodity,
  timeframe: '1day' | '1week' | '1month' = '1week'
): Promise<PricePrediction> {
  try {
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 600));

    const basePrice = commodity.basePrice;

    // Generate realistic price prediction based on commodity type and timeframe
    const prediction = generateRealisticPrediction(commodity, basePrice, timeframe);

    return prediction;
  } catch (error) {
    console.error('Price prediction failed:', error);
    throw new Error('Failed to generate price prediction');
  }
}

/**
 * Generate realistic price predictions with market factors
 */
function generateRealisticPrediction(
  commodity: Commodity,
  basePrice: number,
  timeframe: '1day' | '1week' | '1month'
): PricePrediction {
  // Seasonal and market factors for different commodities
  const seasonalFactors = getSeasonalFactors(commodity.id);
  const marketVolatility = getMarketVolatility(commodity.id);

  // Time-based prediction variance
  const timeMultiplier = {
    '1day': 0.02,   // 2% max change
    '1week': 0.08,  // 8% max change
    '1month': 0.15  // 15% max change
  }[timeframe];

  // Generate prediction with realistic factors
  const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
  const seasonalImpact = seasonalFactors.impact * seasonalFactors.strength;
  const volatilityImpact = marketVolatility * randomFactor;

  const totalImpact = (seasonalImpact + volatilityImpact) * timeMultiplier;
  const predictedPrice = Math.round(basePrice * (1 + totalImpact));

  const priceChange = predictedPrice - basePrice;
  const priceChangePercent = (priceChange / basePrice) * 100;

  // Generate confidence based on volatility (lower volatility = higher confidence)
  const confidence = Math.round(85 - (marketVolatility * 30));

  return {
    commodity,
    currentPrice: basePrice,
    predictedPrice,
    priceChange,
    priceChangePercent,
    confidence: Math.max(60, Math.min(95, confidence)),
    factors: generatePriceFactors(commodity.id, seasonalFactors, totalImpact > 0),
    timeframe
  };
}

/**
 * Get seasonal factors for commodities
 */
function getSeasonalFactors(commodityId: string): { impact: number; strength: number } {
  const currentMonth = new Date().getMonth(); // 0-11

  const seasonalMap: Record<string, { peak: number[]; impact: number }> = {
    'rice': { peak: [9, 10, 11], impact: 0.1 },      // Oct-Dec harvest
    'wheat': { peak: [2, 3, 4], impact: 0.12 },      // Mar-May harvest
    'tomato': { peak: [0, 1, 11], impact: 0.15 },    // Winter peak
    'onion': { peak: [2, 3, 4], impact: 0.18 },      // Mar-May storage issues
    'potato': { peak: [0, 1, 2], impact: 0.12 },     // Winter harvest
    'mango': { peak: [3, 4, 5], impact: 0.25 },      // Summer season
    'banana': { peak: [], impact: 0.05 },            // Year-round
    'apple': { peak: [8, 9, 10], impact: 0.2 },      // Sep-Nov harvest
  };

  const factors = seasonalMap[commodityId] || { peak: [], impact: 0.1 };
  const isPeakSeason = factors.peak.includes(currentMonth);

  return {
    impact: isPeakSeason ? factors.impact : -factors.impact * 0.5,
    strength: isPeakSeason ? 1 : 0.5
  };
}

/**
 * Get market volatility for commodities
 */
function getMarketVolatility(commodityId: string): number {
  const volatilityMap: Record<string, number> = {
    'tomato': 0.3,    // High volatility
    'onion': 0.25,    // High volatility
    'potato': 0.2,    // Medium-high volatility
    'mango': 0.2,     // Seasonal volatility
    'rice': 0.1,      // Low volatility (staple)
    'wheat': 0.1,     // Low volatility (staple)
    'banana': 0.15,   // Medium volatility
    'apple': 0.18,    // Medium volatility
  };

  return volatilityMap[commodityId] || 0.15;
}

/**
 * Generate price factors explanation
 */
function generatePriceFactors(commodityId: string, _seasonalFactors: any, _isIncreasing: boolean): string[] {
  const baseFactors = [
    'Current market demand trends',
    'Supply chain conditions',
    'Weather impact on production'
  ];

  const commoditySpecific: Record<string, string[]> = {
    'tomato': ['Monsoon season effects', 'Transportation costs', 'Storage challenges'],
    'onion': ['Export demand fluctuations', 'Storage losses', 'Regional supply variations'],
    'rice': ['Government procurement policies', 'Monsoon rainfall patterns', 'Export restrictions'],
    'wheat': ['International wheat prices', 'Government MSP announcements', 'Harvest quality'],
    'mango': ['Summer demand surge', 'Export opportunities', 'Ripening season timing'],
  };

  const specific = commoditySpecific[commodityId] || ['Market sentiment', 'Regional demand', 'Quality variations'];

  return [...baseFactors, ...specific.slice(0, 2)];
}

/**
 * Generate market insights
 */
export async function generateMarketInsights(commodity: Commodity): Promise<MarketInsight[]> {
  await new Promise(resolve => setTimeout(resolve, 400));

  const insights: MarketInsight[] = [];
  const currentMonth = new Date().getMonth();

  // Generate 2-3 relevant insights
  insights.push(generateTrendInsight(commodity));
  insights.push(generateSeasonalInsight(commodity, currentMonth));

  if (Math.random() > 0.5) {
    insights.push(generateDemandInsight(commodity));
  }

  return insights;
}

function generateTrendInsight(commodity: Commodity): MarketInsight {
  const trends = ['up', 'down', 'stable'] as const;
  const trend = trends[Math.floor(Math.random() * trends.length)];

  const trendMessages = {
    up: {
      title: 'Upward Price Trend',
      description: `${commodity.names.en} prices showing 5-8% increase over past week due to strong demand.`,
      impact: 'positive' as const
    },
    down: {
      title: 'Price Correction',
      description: `${commodity.names.en} prices declining 3-6% as supply improves in major markets.`,
      impact: 'negative' as const
    },
    stable: {
      title: 'Stable Market Conditions',
      description: `${commodity.names.en} prices remain steady with balanced supply-demand dynamics.`,
      impact: 'neutral' as const
    }
  };

  const message = trendMessages[trend];

  return {
    id: `trend-${commodity.id}`,
    type: 'price_trend',
    title: message.title,
    description: message.description,
    impact: message.impact,
    confidence: 75 + Math.floor(Math.random() * 20),
    timeframe: 'Next 7 days'
  };
}

function generateSeasonalInsight(commodity: Commodity, _currentMonth: number): MarketInsight {
  const seasonalMessages = [
    {
      title: 'Seasonal Demand Peak',
      description: `${commodity.names.en} entering high-demand season. Expect 10-15% price increase.`,
      impact: 'positive' as const
    },
    {
      title: 'Harvest Season Impact',
      description: `Fresh ${commodity.names.en} harvest increasing supply. Prices may soften by 8-12%.`,
      impact: 'negative' as const
    },
    {
      title: 'Off-Season Stability',
      description: `${commodity.names.en} in stable off-season period with predictable pricing.`,
      impact: 'neutral' as const
    }
  ];

  const message = seasonalMessages[Math.floor(Math.random() * seasonalMessages.length)];

  return {
    id: `seasonal-${commodity.id}`,
    type: 'seasonal_factor',
    title: message.title,
    description: message.description,
    impact: message.impact,
    confidence: 80 + Math.floor(Math.random() * 15),
    timeframe: 'Next 2-4 weeks'
  };
}

function generateDemandInsight(commodity: Commodity): MarketInsight {
  const demandMessages = [
    {
      title: 'Export Demand Surge',
      description: `International buyers increasing ${commodity.names.en} orders. Local prices may rise.`,
      impact: 'positive' as const
    },
    {
      title: 'Regional Demand Shift',
      description: `Demand patterns changing across regions for ${commodity.names.en}. Monitor closely.`,
      impact: 'neutral' as const
    }
  ];

  const message = demandMessages[Math.floor(Math.random() * demandMessages.length)];

  return {
    id: `demand-${commodity.id}`,
    type: 'demand_forecast',
    title: message.title,
    description: message.description,
    impact: message.impact,
    confidence: 70 + Math.floor(Math.random() * 20),
    timeframe: 'Next 1-2 weeks'
  };
}

/**
 * Generate smart pricing recommendations
 */
export async function generatePriceRecommendation(
  commodity: Commodity,
  quantity: number,
  targetMargin: number = 15
): Promise<SmartPriceRecommendation> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const basePrice = commodity.basePrice;
  const marketConditions = await analyzeMarketConditions(commodity);

  // Calculate recommended price based on multiple factors
  let recommendedPrice = basePrice;
  let reasoning = '';
  let marketPosition: 'competitive' | 'premium' | 'budget' = 'competitive';
  let expectedDemand: 'high' | 'medium' | 'low' = 'medium';
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';

  // Adjust based on quantity
  if (quantity > 100) {
    recommendedPrice *= 0.95; // 5% bulk discount
    reasoning += 'Bulk quantity allows for competitive pricing. ';
    expectedDemand = 'high';
  } else if (quantity < 10) {
    recommendedPrice *= 1.05; // 5% premium for small quantities
    reasoning += 'Small quantity justifies premium pricing. ';
    marketPosition = 'premium';
  }

  // Adjust based on market conditions
  if (marketConditions.trend === 'up') {
    recommendedPrice *= 1.08;
    reasoning += 'Rising market trend supports higher pricing. ';
    riskLevel = 'low';
  } else if (marketConditions.trend === 'down') {
    recommendedPrice *= 0.92;
    reasoning += 'Declining market requires competitive pricing. ';
    riskLevel = 'high';
    expectedDemand = 'low';
  }

  // Apply target margin
  recommendedPrice *= (1 + targetMargin / 100);
  reasoning += `${targetMargin}% margin applied for sustainable business.`;

  return {
    recommendedPrice: Math.round(recommendedPrice),
    reasoning,
    marketPosition,
    expectedDemand,
    riskLevel
  };
}

async function analyzeMarketConditions(commodity: Commodity) {
  // Simplified market analysis
  const trends = ['up', 'down', 'stable'] as const;
  return {
    trend: trends[Math.floor(Math.random() * trends.length)],
    volatility: getMarketVolatility(commodity.id),
    demand: Math.random() > 0.5 ? 'high' : 'medium'
  };
}