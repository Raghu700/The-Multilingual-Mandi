/**
 * Price Service Tests
 * Unit tests and property-based tests for price discovery functionality
 */

import { describe, it, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import {
  getCommodities,
  getPriceData,
  calculateTotal,
  getPriceColor,
  getTrendIndicator,
  formatCurrency,
  validateQuantity,

} from './priceService';
import { getAllCommodities } from '../data/commodities';

afterEach(() => {
  cleanup();
});

describe('Price Service - Unit Tests', () => {
  describe('getCommodities', () => {
    it('returns all 18 commodities', () => {
      const commodities = getCommodities();
      expect(commodities).toHaveLength(18);
    });

    it('returns commodities with required properties', () => {
      const commodities = getCommodities();
      commodities.forEach((commodity) => {
        expect(commodity).toHaveProperty('id');
        expect(commodity).toHaveProperty('names');
        expect(commodity).toHaveProperty('basePrice');
        expect(commodity).toHaveProperty('unit');
        expect(commodity).toHaveProperty('emoji');
      });
    });
  });

  describe('getPriceData', () => {
    it('generates price data with min, avg, max', () => {
      const commodities = getCommodities();
      const priceData = getPriceData(commodities[0]);

      expect(priceData).toHaveProperty('minPrice');
      expect(priceData).toHaveProperty('avgPrice');
      expect(priceData).toHaveProperty('maxPrice');
      expect(priceData).toHaveProperty('trend');
      expect(priceData).toHaveProperty('lastUpdated');
    });

    it('ensures min < avg < max', () => {
      const commodities = getCommodities();
      const priceData = getPriceData(commodities[0]);

      expect(priceData.minPrice).toBeLessThan(priceData.avgPrice);
      expect(priceData.avgPrice).toBeLessThan(priceData.maxPrice);
    });

    it('generates valid trend values', () => {
      const commodities = getCommodities();
      const priceData = getPriceData(commodities[0]);

      expect(['up', 'down', 'stable']).toContain(priceData.trend);
    });
  });

  describe('calculateTotal', () => {
    it('calculates correct total for positive values', () => {
      expect(calculateTotal(10, 50)).toBe(500);
      expect(calculateTotal(5, 100)).toBe(500);
      expect(calculateTotal(2.5, 40)).toBe(100);
    });

    it('returns 0 for zero quantity', () => {
      expect(calculateTotal(0, 50)).toBe(0);
    });

    it('returns 0 for negative quantity', () => {
      expect(calculateTotal(-5, 50)).toBe(0);
    });

    it('returns 0 for negative price', () => {
      expect(calculateTotal(10, -50)).toBe(0);
    });
  });

  describe('getPriceColor', () => {
    it('returns green for min price', () => {
      expect(getPriceColor('min')).toBe('text-green');
    });

    it('returns yellow for avg price', () => {
      expect(getPriceColor('avg')).toBe('text-yellow-600');
    });

    it('returns red for max price', () => {
      expect(getPriceColor('max')).toBe('text-red-600');
    });
  });

  describe('getTrendIndicator', () => {
    it('returns ↑ for up trend', () => {
      expect(getTrendIndicator('up')).toBe('↑');
    });

    it('returns ↓ for down trend', () => {
      expect(getTrendIndicator('down')).toBe('↓');
    });

    it('returns → for stable trend', () => {
      expect(getTrendIndicator('stable')).toBe('→');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with ₹ symbol', () => {
      expect(formatCurrency(100)).toBe('₹100.00');
      expect(formatCurrency(50.5)).toBe('₹50.50');
      expect(formatCurrency(1234.56)).toBe('₹1234.56');
    });

    it('formats to 2 decimal places', () => {
      expect(formatCurrency(100.1)).toBe('₹100.10');
      expect(formatCurrency(100.999)).toBe('₹101.00');
    });
  });

  describe('validateQuantity', () => {
    it('validates positive quantities', () => {
      const result = validateQuantity(10);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects zero quantity', () => {
      const result = validateQuantity(0);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects negative quantity', () => {
      const result = validateQuantity(-5);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects NaN', () => {
      const result = validateQuantity(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects very large quantities', () => {
      const result = validateQuantity(200000);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('Price Service - Property Tests', () => {
  /**
   * Property 10: Price variation bounds
   * Validates: Requirements 2.1, 2.5
   * 
   * For any commodity, the generated prices must satisfy:
   * - minPrice = basePrice * 0.9 (±10%)
   * - avgPrice = basePrice
   * - maxPrice = basePrice * 1.1 (±10%)
   * - minPrice < avgPrice < maxPrice
   */
  it('Property 10: price variation stays within ±10% bounds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllCommodities()),
        (commodity) => {
          const priceData = getPriceData(commodity);
          const basePrice = commodity.basePrice;

          // Check ±10% bounds
          const expectedMin = Math.round(basePrice * 0.9);
          const expectedMax = Math.round(basePrice * 1.1);

          expect(priceData.minPrice).toBe(expectedMin);
          expect(priceData.avgPrice).toBe(basePrice);
          expect(priceData.maxPrice).toBe(expectedMax);

          // Check ordering
          expect(priceData.minPrice).toBeLessThan(priceData.avgPrice);
          expect(priceData.avgPrice).toBeLessThan(priceData.maxPrice);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 12: Price calculation correctness
   * Validates: Requirements 2.3, 10.2, 10.3
   * 
   * For any positive quantity and price:
   * - total = quantity × pricePerUnit
   * - Result is non-negative
   * - Result is finite
   */
  it('Property 12: price calculation is correct for all valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        (quantity, price) => {
          const total = calculateTotal(quantity, price);
          const expected = Math.round(quantity * price * 100) / 100;

          expect(total).toBe(expected);
          expect(total).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(total)).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 13: Price color coding logic
   * Validates: Requirements 2.4
   * 
   * Color coding must be consistent:
   * - min → green (best deal)
   * - avg → yellow (fair price)
   * - max → red (expensive)
   */
  it('Property 13: price color coding is consistent', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('min' as const, 'avg' as const, 'max' as const),
        (priceType) => {
          const color = getPriceColor(priceType);

          if (priceType === 'min') {
            expect(color).toBe('text-green');
          } else if (priceType === 'avg') {
            expect(color).toBe('text-yellow-600');
          } else if (priceType === 'max') {
            expect(color).toBe('text-red-600');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Mock data locality
   * Validates: Requirements 7.2
   * 
   * All price data should be generated locally without external API calls
   * - No network requests
   * - Deterministic based on base price
   * - Fast generation (< 10ms per commodity)
   */
  it('Property 16: price data generation is local and fast', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...getAllCommodities()),
        (commodity) => {
          const startTime = performance.now();
          const priceData = getPriceData(commodity);
          const endTime = performance.now();

          // Check generation is fast (< 10ms)
          expect(endTime - startTime).toBeLessThan(10);

          // Check data is generated (not null/undefined)
          expect(priceData).toBeDefined();
          expect(priceData.commodity).toBe(commodity);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Input validation for quantities
   * Validates: Requirements 10.1, 10.4
   * 
   * Quantity validation must reject:
   * - Zero and negative values
   * - NaN values
   * - Extremely large values (> 100000)
   */
  it('Property 14: quantity validation rejects invalid inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-1000), max: Math.fround(-0.01) }),
          fc.constant(NaN),
          fc.float({ min: Math.fround(100001), max: Math.fround(1000000) })
        ),
        (invalidQuantity) => {
          const result = validateQuantity(invalidQuantity);
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 15: Currency formatting consistency
   * Validates: Requirements 10.5
   * 
   * Currency formatting must:
   * - Always include ₹ symbol
   * - Always show 2 decimal places
   * - Handle all positive numbers correctly
   */
  it('Property 15: currency formatting is consistent', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }),
        (amount) => {
          const formatted = formatCurrency(amount);

          // Check ₹ symbol
          expect(formatted).toMatch(/^₹/);

          // Check 2 decimal places
          expect(formatted).toMatch(/\.\d{2}$/);

          // Check parseable back to number
          const parsed = parseFloat(formatted.substring(1));
          expect(Math.abs(parsed - amount)).toBeLessThan(0.01);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
