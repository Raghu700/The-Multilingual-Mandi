/**
 * Translation Service
 * Handles loading, caching, and retrieval of translations
 * Supports offline functionality with localStorage caching
 */

import { Language } from '../types';

interface TranslationEntry {
  en: string;
  hi: string;
  bn: string;
  te: string;
  ta: string;
}

interface TranslationCache {
  version: string;
  lastUpdated: number;
  entries: Record<string, TranslationEntry>;
}

export interface TranslationService {
  getTranslation(key: string, language: Language, params?: Record<string, string>): string;
  loadTranslations(): Promise<void>;
  updateCache(force?: boolean): Promise<void>;
  isAvailableOffline(): boolean;
}

class TranslationServiceImpl implements TranslationService {
  private cache: TranslationCache | null = null;
  private readonly CACHE_KEY = 'ektamandi_translations';
  private readonly CACHE_VERSION = '1.0.0';

  async loadTranslations(): Promise<void> {
    // Try to load from cache first
    const cached = localStorage.getItem(this.CACHE_KEY);

    if (cached) {
      try {
        this.cache = JSON.parse(cached);

        // Check if cache is current version
        if (this.cache?.version === this.CACHE_VERSION) {
          return;
        }
      } catch (error) {
        console.error('Failed to parse cached translations:', error);
        localStorage.removeItem(this.CACHE_KEY);
      }
    }

    // Load from network
    try {
      const response = await fetch('/translations/all.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      this.cache = {
        version: this.CACHE_VERSION,
        lastUpdated: Date.now(),
        entries: data
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to load translations:', error);

      // Fall back to cached version even if outdated
      if (cached) {
        try {
          this.cache = JSON.parse(cached);
        } catch (e) {
          console.error('Failed to use cached translations:', e);
          // Use empty cache as last resort
          this.cache = {
            version: this.CACHE_VERSION,
            lastUpdated: Date.now(),
            entries: {}
          };
        }
      }
    }
  }

  getTranslation(key: string, language: Language, params?: Record<string, string>): string {
    if (!this.cache) {
      return key; // Fallback to key if translations not loaded
    }

    const entry = this.cache.entries[key];

    if (!entry) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    let translation = entry[language] || entry.en;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }

    return translation;
  }

  async updateCache(force = false): Promise<void> {
    if (!navigator.onLine && !force) {
      return;
    }

    await this.loadTranslations();
  }

  isAvailableOffline(): boolean {
    return this.cache !== null;
  }
}

// Singleton instance
export const translationService = new TranslationServiceImpl();

// Initialize translations on module load
translationService.loadTranslations().catch(console.error);

// Legacy exports for backward compatibility
export async function translate(text: string, targetLang: string): Promise<any> {
  return { translatedText: text, sourceLang: 'en', targetLang };
}

export function getMandiPhrase(_id: string): any {
  return null;
}

export function getAllMandiPhrases(): any[] {
  return [];
}

export function saveToHistory(entry: any): any {
  return entry;
}

export function getHistory(): any[] {
  return [];
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
