import { describe, it, expect } from 'vitest';
import type { Language, TranslationEntry, Commodity, PriceData } from './index';

describe('Type definitions', () => {
  it('should allow valid Language types', () => {
    const languages: Language[] = ['en', 'hi', 'te', 'ta', 'bn'];
    expect(languages).toHaveLength(5);
  });

  it('should create valid TranslationEntry', () => {
    const entry: TranslationEntry = {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now(),
    };
    expect(entry.id).toBe('1');
    expect(entry.sourceText).toBe('Hello');
  });

  it('should create valid Commodity', () => {
    const commodity: Commodity = {
      id: 'rice',
      name: 'Rice',
      nameHi: 'चावल',
      nameTe: 'బియ్యం',
      nameTa: 'அரிசி',
      nameBn: 'চাল',
      unit: 'kg',
      basePrice: 50,
    };
    expect(commodity.id).toBe('rice');
    expect(commodity.basePrice).toBe(50);
  });

  it('should create valid PriceData', () => {
    const commodity: Commodity = {
      id: 'rice',
      name: 'Rice',
      nameHi: 'चावल',
      nameTe: 'బియ్యం',
      nameTa: 'அரிசி',
      nameBn: 'চাল',
      unit: 'kg',
      basePrice: 50,
    };

    const priceData: PriceData = {
      commodity,
      minPrice: 45,
      avgPrice: 50,
      maxPrice: 55,
      trend: 'up',
      lastUpdated: Date.now(),
    };
    expect(priceData.minPrice).toBe(45);
    expect(priceData.trend).toBe('up');
  });
});
