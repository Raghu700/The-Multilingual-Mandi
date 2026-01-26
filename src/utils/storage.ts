import { TranslationEntry, TranslationHistoryStorage, UserPreferences } from '../types';

// LocalStorage keys
const STORAGE_KEYS = {
  TRANSLATION_HISTORY: 'mandimind_translation_history',
  USER_PREFERENCES: 'mandimind_preferences',
} as const;

// Maximum number of translation entries to store
const MAX_HISTORY_ENTRIES = 50;

/**
 * Save translation entry to localStorage
 */
export function saveTranslation(entry: TranslationEntry): void {
  try {
    const history = getTranslationHistory();
    
    // Add new entry at the beginning
    history.entries.unshift(entry);
    
    // Limit to MAX_HISTORY_ENTRIES
    if (history.entries.length > MAX_HISTORY_ENTRIES) {
      history.entries = history.entries.slice(0, MAX_HISTORY_ENTRIES);
    }
    
    localStorage.setItem(STORAGE_KEYS.TRANSLATION_HISTORY, JSON.stringify(history));
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded. Removing oldest entries...');
      try {
        const history = getTranslationHistory();
        // Remove oldest 10 entries
        history.entries = history.entries.slice(0, MAX_HISTORY_ENTRIES - 10);
        localStorage.setItem(STORAGE_KEYS.TRANSLATION_HISTORY, JSON.stringify(history));
        
        // Try saving again
        history.entries.unshift(entry);
        localStorage.setItem(STORAGE_KEYS.TRANSLATION_HISTORY, JSON.stringify(history));
      } catch (retryError) {
        console.error('Failed to save translation after cleanup:', retryError);
      }
    } else {
      console.error('Failed to save translation:', error);
    }
  }
}

/**
 * Get translation history from localStorage
 */
export function getTranslationHistory(): TranslationHistoryStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSLATION_HISTORY);
    
    if (!stored) {
      return { version: 1, entries: [] };
    }
    
    const parsed = JSON.parse(stored) as TranslationHistoryStorage;
    
    // Validate structure
    if (!parsed.version || !Array.isArray(parsed.entries)) {
      console.warn('Invalid translation history format. Resetting...');
      return { version: 1, entries: [] };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load translation history:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEYS.TRANSLATION_HISTORY);
    return { version: 1, entries: [] };
  }
}

/**
 * Clear translation history
 */
export function clearTranslationHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSLATION_HISTORY);
  } catch (error) {
    console.error('Failed to clear translation history:', error);
  }
}

/**
 * Save user preferences
 */
export function saveUserPreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save user preferences:', error);
  }
}

/**
 * Get user preferences from localStorage
 */
export function getUserPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    
    if (!stored) {
      return {
        version: 1,
        lastSelectedLanguage: 'en',
        lastSelectedTab: 0,
      };
    }
    
    const parsed = JSON.parse(stored) as UserPreferences;
    
    // Validate structure
    if (!parsed.version) {
      console.warn('Invalid preferences format. Resetting...');
      return {
        version: 1,
        lastSelectedLanguage: 'en',
        lastSelectedTab: 0,
      };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load user preferences:', error);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    return {
      version: 1,
      lastSelectedLanguage: 'en',
      lastSelectedTab: 0,
    };
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
