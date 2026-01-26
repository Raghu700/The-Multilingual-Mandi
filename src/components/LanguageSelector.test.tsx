/**
 * Property-Based Tests for LanguageSelector Component
 * Feature: mandimind
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { LanguageSelector } from './LanguageSelector';
import { Language } from '../types';

afterEach(() => {
  cleanup();
});

describe('LanguageSelector - Property Tests', () => {
  /**
   * Property 1: Language selection state consistency
   * For any supported language (Hindi, Telugu, Tamil, Bengali, English),
   * when selected, the UI state should reflect that language as the active selection.
   * **Validates: Requirements 1.1**
   */
  it('Property 1: selected language is always highlighted in UI', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
        (selectedLang) => {
          const mockOnChange = vi.fn();
          const { container } = render(
            <LanguageSelector
              selectedLanguage={selectedLang}
              onLanguageChange={mockOnChange}
            />
          );

          // Find the button for the selected language
          const buttons = container.querySelectorAll('button');
          const languageButtons = Array.from(buttons).filter(btn => 
            btn.textContent?.includes('English') ||
            btn.textContent?.includes('Hindi') ||
            btn.textContent?.includes('Telugu') ||
            btn.textContent?.includes('Tamil') ||
            btn.textContent?.includes('Bengali')
          );

          // Map language codes to button indices
          const langMap: Record<Language, number> = {
            'en': 0,
            'hi': 1,
            'te': 2,
            'ta': 3,
            'bn': 4
          };

          const selectedButton = languageButtons[langMap[selectedLang]];
          
          // The selected button should have the saffron background class
          expect(selectedButton.className).toContain('bg-saffron');
          expect(selectedButton.className).toContain('text-white');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Language change callback is invoked with correct language
   * For any language selection, the callback should be called with that language code
   */
  it('Property: clicking any language button invokes callback with correct language', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
        fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
        (initialLang, targetLang) => {
          const mockOnChange = vi.fn();
          
          const { container, unmount } = render(
            <LanguageSelector
              selectedLanguage={initialLang}
              onLanguageChange={mockOnChange}
            />
          );

          // Find all language buttons
          const buttons = container.querySelectorAll('button');
          const languageButtons = Array.from(buttons).filter(btn => 
            btn.textContent?.includes('English') ||
            btn.textContent?.includes('Hindi') ||
            btn.textContent?.includes('Telugu') ||
            btn.textContent?.includes('Tamil') ||
            btn.textContent?.includes('Bengali')
          );

          // Map language codes to button indices
          const langMap: Record<Language, number> = {
            'en': 0,
            'hi': 1,
            'te': 2,
            'ta': 3,
            'bn': 4
          };

          // Click the target language button
          languageButtons[langMap[targetLang]].click();

          // Verify callback was called with correct language
          expect(mockOnChange).toHaveBeenCalledWith(targetLang);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Unity in Diversity badge is always displayed
   * For any selected language, the badge should be visible
   */
  it('Property: Unity in Diversity badge is always present', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
        (selectedLang) => {
          const mockOnChange = vi.fn();
          const { unmount } = render(
            <LanguageSelector
              selectedLanguage={selectedLang}
              onLanguageChange={mockOnChange}
            />
          );

          // Badge should always be present
          expect(screen.getAllByText(/Unity in Diversity/i).length).toBeGreaterThan(0);
          expect(screen.getAllByText(/🇮🇳/).length).toBeGreaterThan(0);
          
          // Clean up
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All 5 languages are always displayed
   * Regardless of selected language, all 5 options should be visible
   */
  it('Property: all 5 language options are always rendered', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Language>('en', 'hi', 'te', 'ta', 'bn'),
        (selectedLang) => {
          const mockOnChange = vi.fn();
          const { container } = render(
            <LanguageSelector
              selectedLanguage={selectedLang}
              onLanguageChange={mockOnChange}
            />
          );

          // Count language buttons (excluding the badge)
          const buttons = container.querySelectorAll('button');
          const languageButtons = Array.from(buttons).filter(btn => 
            btn.textContent?.includes('English') ||
            btn.textContent?.includes('Hindi') ||
            btn.textContent?.includes('Telugu') ||
            btn.textContent?.includes('Tamil') ||
            btn.textContent?.includes('Bengali')
          );

          // Should always have exactly 5 language buttons
          expect(languageButtons).toHaveLength(5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
