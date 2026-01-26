/**
 * Price Discovery Service
 * Handles price data generation, calculations, and formatting
 */

import { Commodity, getAllCommodities } from '../data/commodities';

export interface PriceData {
  commodity: Commodity;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

export interface PriceCalculation {
  quantity: number;
  pricePerUnit: number;
  total: number;
  commodity: Commodity;
  priceType: 'min' | 'avg' | 'max';
}

/**
 * Get all commodities
 */
export function getCommodities(): Commodity[] {
  return getAllCommodities();
}

/**
 * Generate price data with ±10% variation from base price
 * Trend distribution: 40% up, 40% down, 20% stable
 */
export function getPriceData(commodity: Commodity): PriceData {
  const basePrice = commodity.basePrice;
  
  // Generate prices with ±10% variation
  const variation = 0.1; // 10%
  const minPrice = Math.round(basePrice * (1 - variation));
  const maxPrice = Math.round(basePrice * (1 + variation));
  const avgPrice = basePrice;

  // Generate trend with specified distribution
  const rand = Math.random();
  let trend: 'up' | 'down' | 'stable';
  
  if (rand < 0.4) {
    trend = 'up';
  } else if (rand < 0.8) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  return {
    commodity,
    minPrice,
    avgPrice,
    maxPrice,
    trend,
    lastUpdated: Date.now(),
  };
}

/**
 * Calculate total price: quantity × price
 */
export function calculateTotal(
  quantity: number,
  pricePerUnit: number
): number {
  if (quantity <= 0 || pricePerUnit < 0) {
    return 0;
  }
  return Math.round(quantity * pricePerUnit * 100) / 100; // Round to 2 decimals
}

/**
 * Get color for price display based on type
 * Min = green (good deal)
 * Avg = yellow (fair price)
 * Max = red (expensive)
 */
export function getPriceColor(priceType: 'min' | 'avg' | 'max'): string {
  switch (priceType) {
    case 'min':
      return 'text-green';
    case 'avg':
      return 'text-yellow-600';
    case 'max':
      return 'text-red-600';
    default:
      return 'text-gray-700';
  }
}

/**
 * Get background color for price cards
 */
export function getPriceBackgroundColor(priceType: 'min' | 'avg' | 'max'): string {
  switch (priceType) {
    case 'min':
      return 'bg-glass-green';
    case 'avg':
      return 'bg-yellow-50';
    case 'max':
      return 'bg-red-50';
    default:
      return 'bg-glass-white';
  }
}

/**
 * Get trend indicator symbol
 */
export function getTrendIndicator(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
    default:
      return '→';
  }
}

/**
 * Get trend color
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-red-600';
    case 'down':
      return 'text-green';
    case 'stable':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Format currency with ₹ symbol
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/**
 * Validate quantity input
 */
export function validateQuantity(quantity: number): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(quantity)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  
  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than 0' };
  }
  
  if (quantity > 100000) {
    return { valid: false, error: 'Quantity is too large' };
  }
  
  return { valid: true };
}

/**
 * Create price calculation object
 */
export function createPriceCalculation(
  commodity: Commodity,
  quantity: number,
  priceType: 'min' | 'avg' | 'max',
  priceData: PriceData
): PriceCalculation {
  let pricePerUnit: number;
  
  switch (priceType) {
    case 'min':
      pricePerUnit = priceData.minPrice;
      break;
    case 'avg':
      pricePerUnit = priceData.avgPrice;
      break;
    case 'max':
      pricePerUnit = priceData.maxPrice;
      break;
    default:
      pricePerUnit = priceData.avgPrice;
  }

  const total = calculateTotal(quantity, pricePerUnit);

  return {
    quantity,
    pricePerUnit,
    total,
    commodity,
    priceType,
  };
}
