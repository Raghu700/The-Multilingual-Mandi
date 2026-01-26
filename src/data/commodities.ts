/**
 * Commodities Database
 * 18 agricultural commodities with multilingual names and base prices
 * Supports: Hindi, Telugu, Tamil, Bengali, English
 */

import { Language } from '../types';

export interface Commodity {
  id: string;
  names: Record<Language, string>;
  basePrice: number; // Base price in INR per unit
  unit: string; // Unit of measurement (kg, dozen, liter)
  emoji: string;
}

/**
 * 18 Commodities Database
 * Base prices are realistic Indian market prices (as of 2026)
 */
export const COMMODITIES: Commodity[] = [
  {
    id: 'rice',
    names: {
      en: 'Rice',
      hi: 'चावल',
      te: 'బియ్యం',
      ta: 'அரிசி',
      bn: 'চাল',
    },
    basePrice: 50,
    unit: 'kg',
    emoji: '🌾',
  },
  {
    id: 'wheat',
    names: {
      en: 'Wheat',
      hi: 'गेहूं',
      te: 'గోధుమ',
      ta: 'கோதுமை',
      bn: 'গম',
    },
    basePrice: 30,
    unit: 'kg',
    emoji: '🌾',
  },
  {
    id: 'tomato',
    names: {
      en: 'Tomatoes',
      hi: 'टमाटर',
      te: 'టమోటా',
      ta: 'தக்காளி',
      bn: 'টমেটো',
    },
    basePrice: 40,
    unit: 'kg',
    emoji: '🍅',
  },
  {
    id: 'onion',
    names: {
      en: 'Onions',
      hi: 'प्याज',
      te: 'ఉల్లిపాయ',
      ta: 'வெங்காயம்',
      bn: 'পেঁয়াজ',
    },
    basePrice: 35,
    unit: 'kg',
    emoji: '🧅',
  },
  {
    id: 'potato',
    names: {
      en: 'Potatoes',
      hi: 'आलू',
      te: 'బంగాళాదుంప',
      ta: 'உருளைக்கிழங்கு',
      bn: 'আলু',
    },
    basePrice: 25,
    unit: 'kg',
    emoji: '🥔',
  },
  {
    id: 'mango',
    names: {
      en: 'Mangoes',
      hi: 'आम',
      te: 'మామిడి',
      ta: 'மாம்பழம்',
      bn: 'আম',
    },
    basePrice: 80,
    unit: 'kg',
    emoji: '🥭',
  },
  {
    id: 'banana',
    names: {
      en: 'Bananas',
      hi: 'केला',
      te: 'అరటి',
      ta: 'வாழைப்பழம்',
      bn: 'কলা',
    },
    basePrice: 50,
    unit: 'dozen',
    emoji: '🍌',
  },
  {
    id: 'apple',
    names: {
      en: 'Apples',
      hi: 'सेब',
      te: 'ఆపిల్',
      ta: 'ஆப்பிள்',
      bn: 'আপেল',
    },
    basePrice: 120,
    unit: 'kg',
    emoji: '🍎',
  },
  {
    id: 'milk',
    names: {
      en: 'Milk',
      hi: 'दूध',
      te: 'పాలు',
      ta: 'பால்',
      bn: 'দুধ',
    },
    basePrice: 60,
    unit: 'liter',
    emoji: '🥛',
  },
  {
    id: 'egg',
    names: {
      en: 'Eggs',
      hi: 'अंडे',
      te: 'గుడ్లు',
      ta: 'முட்டை',
      bn: 'ডিম',
    },
    basePrice: 70,
    unit: 'dozen',
    emoji: '🥚',
  },
  {
    id: 'chicken',
    names: {
      en: 'Chicken',
      hi: 'मुर्गी',
      te: 'కోడి',
      ta: 'கோழி',
      bn: 'মুরগি',
    },
    basePrice: 180,
    unit: 'kg',
    emoji: '🍗',
  },
  {
    id: 'lentil',
    names: {
      en: 'Lentils',
      hi: 'दाल',
      te: 'పప్పు',
      ta: 'பருப்பு',
      bn: 'ডাল',
    },
    basePrice: 100,
    unit: 'kg',
    emoji: '🫘',
  },
  {
    id: 'sugar',
    names: {
      en: 'Sugar',
      hi: 'चीनी',
      te: 'చక్కెర',
      ta: 'சர்க்கரை',
      bn: 'চিনি',
    },
    basePrice: 45,
    unit: 'kg',
    emoji: '🍬',
  },
  {
    id: 'tea',
    names: {
      en: 'Tea',
      hi: 'चाय',
      te: 'టీ',
      ta: 'தேநீர்',
      bn: 'চা',
    },
    basePrice: 400,
    unit: 'kg',
    emoji: '🍵',
  },
  {
    id: 'coffee',
    names: {
      en: 'Coffee',
      hi: 'कॉफी',
      te: 'కాఫీ',
      ta: 'காபி',
      bn: 'কফি',
    },
    basePrice: 600,
    unit: 'kg',
    emoji: '☕',
  },
  {
    id: 'turmeric',
    names: {
      en: 'Turmeric',
      hi: 'हल्दी',
      te: 'పసుపు',
      ta: 'மஞ்சள்',
      bn: 'হলুদ',
    },
    basePrice: 150,
    unit: 'kg',
    emoji: '🟡',
  },
  {
    id: 'chili',
    names: {
      en: 'Chili',
      hi: 'मिर्च',
      te: 'మిరపకాయ',
      ta: 'மிளகாய்',
      bn: 'মরিচ',
    },
    basePrice: 200,
    unit: 'kg',
    emoji: '🌶️',
  },
  {
    id: 'coriander',
    names: {
      en: 'Coriander',
      hi: 'धनिया',
      te: 'కొత్తిమీర',
      ta: 'கொத்தமல்லி',
      bn: 'ধনে',
    },
    basePrice: 80,
    unit: 'kg',
    emoji: '🌿',
  },
];

/**
 * Get commodity by ID
 */
export function getCommodityById(id: string): Commodity | undefined {
  return COMMODITIES.find((c) => c.id === id);
}

/**
 * Get all commodities
 */
export function getAllCommodities(): Commodity[] {
  return COMMODITIES;
}

/**
 * Get commodity name in specified language
 */
export function getCommodityName(commodity: Commodity, language: Language): string {
  return commodity.names[language];
}
