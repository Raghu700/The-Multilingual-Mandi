// Base types for MandiMind application

// Language types
export type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn';

// Translation types
export interface TranslationEntry {
  id: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  translatedText: string;
  timestamp: number;
}

export interface MandiPhrase {
  id: string;
  en: string;
  hi: string;
  te: string;
  ta: string;
  bn: string;
}

// Commodity and Price types
export interface Commodity {
  id: string;
  name: string;
  nameHi: string;
  nameTe: string;
  nameTa: string;
  nameBn: string;
  unit: string; // kg, quintal, dozen, liter, etc.
  basePrice: number; // Base price for calculations
}

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
}

// Negotiation types
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

// Theme types
export interface TricolorTheme {
  colors: {
    saffron: string;
    white: string;
    green: string;
    navyBlue: string;
    saffronLight: string;
    greenLight: string;
    grayLight: string;
    grayDark: string;
  };
  gradients: {
    tricolor: string;
    header: string;
  };
  badges: {
    translation: string;
    priceDiscovery: string;
    negotiation: string;
  };
}

// LocalStorage schema types
export interface TranslationHistoryStorage {
  version: number;
  entries: TranslationEntry[];
}

export interface UserPreferences {
  version: number;
  lastSelectedLanguage: Language;
  lastSelectedTab: number;
}

// Claude API types
export interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  stop_reason: string;
}
