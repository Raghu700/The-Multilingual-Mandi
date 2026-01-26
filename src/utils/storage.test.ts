import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTranslation,
  getTranslationHistory,
  clearTranslationHistory,
  saveUserPreferences,
  getUserPreferences,
  isLocalStorageAvailable,
} from './storage';
import { TranslationEntry } from '../types';

describe('Storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should check localStorage availability', () => {
    expect(isLocalStorageAvailable()).toBe(true);
  });

  it('should save and retrieve translation history', () => {
    const entry: TranslationEntry = {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now(),
    };

    saveTranslation(entry);
    const history = getTranslationHistory();

    expect(history.entries).toHaveLength(1);
    expect(history.entries[0].sourceText).toBe('Hello');
  });

  it('should maintain chronological order (newest first)', () => {
    const entry1: TranslationEntry = {
      id: '1',
      sourceText: 'First',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'पहला',
      timestamp: 1000,
    };

    const entry2: TranslationEntry = {
      id: '2',
      sourceText: 'Second',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'दूसरा',
      timestamp: 2000,
    };

    saveTranslation(entry1);
    saveTranslation(entry2);

    const history = getTranslationHistory();
    expect(history.entries[0].sourceText).toBe('Second');
    expect(history.entries[1].sourceText).toBe('First');
  });

  it('should clear translation history', () => {
    const entry: TranslationEntry = {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now(),
    };

    saveTranslation(entry);
    clearTranslationHistory();

    const history = getTranslationHistory();
    expect(history.entries).toHaveLength(0);
  });

  it('should save and retrieve user preferences', () => {
    saveUserPreferences({
      lastSelectedLanguage: 'hi',
      lastSelectedTab: 1,
    });

    const prefs = getUserPreferences();
    expect(prefs.lastSelectedLanguage).toBe('hi');
    expect(prefs.lastSelectedTab).toBe(1);
  });

  it('should return default preferences when none exist', () => {
    const prefs = getUserPreferences();
    expect(prefs.lastSelectedLanguage).toBe('en');
    expect(prefs.lastSelectedTab).toBe(0);
  });
});
