import { describe, it, expect } from 'vitest';
import {
  generateId,
  formatCurrency,
  isPositiveNumber,
  getPriceColor,
  getTrendIcon,
  getTrendColor,
} from './helpers';

describe('Helper utilities', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('₹100.00');
    expect(formatCurrency(50.5)).toBe('₹50.50');
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  it('should validate positive numbers', () => {
    expect(isPositiveNumber(10)).toBe(true);
    expect(isPositiveNumber('5.5')).toBe(true);
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-5)).toBe(false);
    expect(isPositiveNumber('abc')).toBe(false);
  });

  it('should determine price color correctly', () => {
    expect(getPriceColor(10, 10, 40)).toBe('red'); // Low price
    expect(getPriceColor(25, 10, 40)).toBe('yellow'); // Mid price
    expect(getPriceColor(35, 10, 40)).toBe('green'); // High price
  });

  it('should return correct trend icons', () => {
    expect(getTrendIcon('up')).toBe('↑');
    expect(getTrendIcon('down')).toBe('↓');
    expect(getTrendIcon('stable')).toBe('→');
  });

  it('should return correct trend colors', () => {
    expect(getTrendColor('up')).toBe('text-green-600');
    expect(getTrendColor('down')).toBe('text-red-600');
    expect(getTrendColor('stable')).toBe('text-gray-600');
  });
});
