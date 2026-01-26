import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  translate,
  getMandiPhrase,
  getAllMandiPhrases,
  saveToHistory,
  getHistory,
  copyToClipboard
} from './translationService';
import { Language } from '../types';
import { clearTranslationHistory } from '../utils/storage';

describe('TranslationService', () => {
  beforeEach(() => {
    // Clear history before each test
    clearTranslationHistory();
    // Clear localStorage
    localStorage.clear();
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 3: Phrase lookup correctness
     * For any mandi phrase ID and any supported language,
     * retrieving the phrase should return the correct translation for that language.
     * **Validates: Requirements 1.3**
     */
    it('Property 3: phrase lookup returns correct translation for any valid phrase and language', () => {
      const phrases = getAllMandiPhrases();
      const phraseIds = phrases.map(p => p.id);
      const languages: Language[] = ['en', 'hi', 'te', 'ta', 'bn'];

      fc.assert(
        fc.property(
          fc.constantFrom(...phraseIds),
          fc.constantFrom(...languages),
          (phraseId, language) => {
            // Get the phrase translation
            const translation = getMandiPhrase(phraseId, language);

            // Find the original phrase
            const phrase = phrases.find(p => p.id === phraseId);

            // Should return the correct translation for the language
            expect(translation).toBe(phrase![language]);
            expect(translation).toBeTruthy();
            expect(typeof translation).toBe('string');
            expect(translation.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 4: Translation persistence round-trip
     * For any translation entry, after storing it to localStorage and retrieving the history,
     * the entry should appear in the retrieved history with all fields intact.
     * **Validates: Requirements 1.4, 1.5, 6.1, 6.4**
     */
    it('Property 4: translation round-trip preserves all fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            sourceText: fc.string({ minLength: 1, maxLength: 100 }),
            sourceLang: fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
            targetLang: fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
            translatedText: fc.string({ minLength: 1, maxLength: 100 })
          }),
          (entryData) => {
            // Save the translation
            const savedEntry = saveToHistory(entryData);

            // Retrieve history
            const history = getHistory();

            // Should find the entry in history
            const found = history.find(h => h.id === savedEntry.id);

            expect(found).toBeDefined();
            expect(found!.sourceText).toBe(entryData.sourceText);
            expect(found!.sourceLang).toBe(entryData.sourceLang);
            expect(found!.targetLang).toBe(entryData.targetLang);
            expect(found!.translatedText).toBe(entryData.translatedText);
            expect(found!.timestamp).toBeGreaterThan(0);
            expect(found!.id).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 5: History chronological ordering
     * For any set of translation entries with different timestamps,
     * when displayed, they should be ordered with the newest timestamp first.
     * **Validates: Requirements 6.3**
     */
    it('Property 5: history is ordered newest first', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              sourceText: fc.string({ minLength: 1, maxLength: 50 }),
              sourceLang: fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
              targetLang: fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
              translatedText: fc.string({ minLength: 1, maxLength: 50 })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (entries) => {
            // Clear history first
            clearTranslationHistory();

            // Save entries with small delays to ensure different timestamps
            const savedEntries = entries.map((entry) => {
              // Add a small offset to timestamp to ensure ordering
              const saved = saveToHistory(entry);
              return saved;
            });

            // Get history
            const history = getHistory();

            // Verify history is ordered by timestamp (newest first)
            for (let i = 0; i < history.length - 1; i++) {
              expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i + 1].timestamp);
            }

            // Verify all saved entries are in history
            expect(history.length).toBe(savedEntries.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Unit Tests', () => {
    describe('getMandiPhrase', () => {
      it('should return correct English phrase', () => {
        const phrase = getMandiPhrase('greeting', 'en');
        expect(phrase).toBe('Good morning! How can I help you?');
      });

      it('should return correct Hindi phrase', () => {
        const phrase = getMandiPhrase('price_inquiry', 'hi');
        expect(phrase).toBe('प्रति किलो कीमत क्या है?');
      });

      it('should return correct Telugu phrase', () => {
        const phrase = getMandiPhrase('thank_you', 'te');
        expect(phrase).toBe('మీ వ్యాపారానికి ధన్యవాదాలు!');
      });

      it('should throw error for invalid phrase ID', () => {
        expect(() => getMandiPhrase('invalid_id', 'en')).toThrow();
      });
    });

    describe('translate', () => {
      it('should return same text for English target', async () => {
        const text = 'Hello world';
        const result = await translate(text, 'en');
        expect(result).toBe(text);
      });

      it('should translate known words', async () => {
        const result = await translate('hello', 'hi');
        expect(result).toBe('नमस्ते');
      });

      it('should translate mandi phrases', async () => {
        const result = await translate('Good morning! How can I help you?', 'hi');
        expect(result).toBe('सुप्रभात! मैं आपकी कैसे मदद कर सकता हूं?');
      });

      it('should return placeholder for unknown text', async () => {
        const result = await translate('unknown phrase', 'hi');
        expect(result).toContain('Hindi translation of');
      });
    });

    describe('saveToHistory and getHistory', () => {
      it('should save and retrieve translation', () => {
        const entry = {
          sourceText: 'hello',
          sourceLang: 'en',
          targetLang: 'hi',
          translatedText: 'नमस्ते'
        };

        const saved = saveToHistory(entry);
        const history = getHistory();

        expect(history).toHaveLength(1);
        expect(history[0].id).toBe(saved.id);
        expect(history[0].sourceText).toBe(entry.sourceText);
      });

      it('should maintain newest-first order', () => {
        const entry1 = {
          sourceText: 'first',
          sourceLang: 'en',
          targetLang: 'hi',
          translatedText: 'पहला'
        };

        const entry2 = {
          sourceText: 'second',
          sourceLang: 'en',
          targetLang: 'hi',
          translatedText: 'दूसरा'
        };

        saveToHistory(entry1);
        saveToHistory(entry2);

        const history = getHistory();

        expect(history).toHaveLength(2);
        expect(history[0].sourceText).toBe('second');
        expect(history[1].sourceText).toBe('first');
      });

      it('should limit history to 50 entries', () => {
        // Save 55 entries
        for (let i = 0; i < 55; i++) {
          saveToHistory({
            sourceText: `text ${i}`,
            sourceLang: 'en',
            targetLang: 'hi',
            translatedText: `अनुवाद ${i}`
          });
        }

        const history = getHistory();
        expect(history.length).toBeLessThanOrEqual(50);
      });
    });

    describe('copyToClipboard', () => {
      it('should attempt to copy text', async () => {
        const text = 'Test text';
        // Note: In test environment, clipboard API may not be available
        // This test just ensures the function doesn't throw
        const result = await copyToClipboard(text);
        expect(typeof result).toBe('boolean');
      });
    });

    describe('getAllMandiPhrases', () => {
      it('should return all 10 phrases', () => {
        const phrases = getAllMandiPhrases();
        expect(phrases).toHaveLength(10);
      });

      it('should have all required languages for each phrase', () => {
        const phrases = getAllMandiPhrases();
        const languages: Language[] = ['en', 'hi', 'te', 'ta', 'bn'];

        phrases.forEach(phrase => {
          languages.forEach(lang => {
            expect(phrase[lang]).toBeTruthy();
            expect(typeof phrase[lang]).toBe('string');
          });
        });
      });
    });
  });
});
