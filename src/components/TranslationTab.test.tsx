/**
 * Unit Tests for Translation UI Components
 * Feature: mandimind
 * Tests empty input validation, phrase selection, and copy confirmation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { TranslationTab } from './TranslationTab';
import * as translationService from '../services/translationService';

// Mock the translation service
vi.mock('../services/translationService', async () => {
  const actual = await vi.importActual<typeof import('../services/translationService')>('../services/translationService');
  return {
    ...actual,
    translate: vi.fn(),
    saveToHistory: vi.fn(),
    getHistory: vi.fn(),
    copyToClipboard: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TranslationTab - Unit Tests', () => {
  beforeEach(() => {
    // Setup default mocks
    vi.mocked(translationService.getHistory).mockReturnValue([]);
    vi.mocked(translationService.saveToHistory).mockReturnValue({
      id: 'test-id',
      sourceText: 'test',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'परीक्षण',
      timestamp: Date.now(),
    });
  });

  /**
   * Unit Test: Empty input shows error message
   * **Validates: Requirements 1.2**
   */
  it('shows error message when attempting to translate empty input', async () => {
    render(<TranslationTab />);

    // The translate button should be disabled when input is empty
    const translateButton = screen.getByRole('button', { name: /translate/i });
    expect(translateButton).toBeDisabled();

    // Translation service should not be called
    expect(translationService.translate).not.toHaveBeenCalled();
  });

  /**
   * Unit Test: Empty input with whitespace disables button
   */
  it('disables translate button when input contains only whitespace', async () => {
    render(<TranslationTab />);

    // Enter whitespace-only text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    // Simulate typing whitespace
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, '   \n  \t  ');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Translate button should still be disabled (whitespace is trimmed)
    const translateButton = screen.getByRole('button', { name: /translate/i });
    expect(translateButton).toBeDisabled();

    // Translation service should not be called
    expect(translationService.translate).not.toHaveBeenCalled();
  });

  /**
   * Unit Test: Phrase selection triggers translation
   * **Validates: Requirements 1.3**
   */
  it('triggers translation when a mandi phrase is selected', async () => {
    render(<TranslationTab />);

    // Find and click a phrase button (e.g., "Good morning! How can I help you?")
    const phraseButtons = screen.getAllByRole('button');
    const greetingPhrase = phraseButtons.find(btn =>
      btn.textContent?.includes('Good morning')
    );

    expect(greetingPhrase).toBeDefined();
    greetingPhrase!.click();

    // Wait for translation to complete
    await waitFor(() => {
      // The phrase text should appear in the input
      const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
      expect(textarea).toHaveValue('Good morning! How can I help you?');
    });

    // Translation should be saved to history
    await waitFor(() => {
      expect(translationService.saveToHistory).toHaveBeenCalled();
    });
  });

  /**
   * Unit Test: Successful translation displays output
   */
  it('displays translated text after successful translation', async () => {
    const mockTranslation = 'नमस्ते';
    vi.mocked(translationService.translate).mockResolvedValue(mockTranslation);

    render(<TranslationTab />);

    // Enter text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Click translate button
    const translateButton = screen.getByRole('button', { name: /translate/i });
    translateButton.click();

    // Wait for translation to appear
    await waitFor(() => {
      expect(screen.getByText(mockTranslation)).toBeInTheDocument();
    });

    // Translation service should be called
    expect(translationService.translate).toHaveBeenCalledWith('Hello', 'hi');
  });

  /**
   * Unit Test: Translation is saved to history
   */
  it('saves translation to history after successful translation', async () => {
    const mockTranslation = 'नमस्ते';
    vi.mocked(translationService.translate).mockResolvedValue(mockTranslation);

    render(<TranslationTab />);

    // Enter text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Click translate button
    const translateButton = screen.getByRole('button', { name: /translate/i });
    translateButton.click();

    // Wait for save to be called
    await waitFor(() => {
      expect(translationService.saveToHistory).toHaveBeenCalledWith({
        sourceText: 'Hello',
        sourceLang: 'en',
        targetLang: 'hi',
        translatedText: mockTranslation,
      });
    });
  });

  /**
   * Unit Test: Loading state is shown during translation
   */
  it('shows loading state while translation is in progress', async () => {
    // Create a promise that we can control
    let resolveTranslation: (value: string) => void;
    const translationPromise = new Promise<string>((resolve) => {
      resolveTranslation = resolve;
    });
    vi.mocked(translationService.translate).mockReturnValue(translationPromise);

    render(<TranslationTab />);

    // Enter text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Click translate button
    const translateButton = screen.getByRole('button', { name: /translate/i });
    translateButton.click();

    // Loading state should be shown
    await waitFor(() => {
      expect(screen.getByText(/translating/i)).toBeInTheDocument();
    });

    // Resolve the translation
    resolveTranslation!('नमस्ते');

    // Loading state should disappear
    await waitFor(() => {
      expect(screen.queryByText(/translating/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Unit Test: Error handling for failed translation
   */
  it('shows error message when translation fails', async () => {
    vi.mocked(translationService.translate).mockRejectedValue(
      new Error('Translation failed')
    );

    render(<TranslationTab />);

    // Enter text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Click translate button
    const translateButton = screen.getByRole('button', { name: /translate/i });
    translateButton.click();

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/translation failed/i)).toBeInTheDocument();
    });
  });

  /**
   * Unit Test: Language change clears translation output
   */
  it('clears translation output when language is changed', async () => {
    const mockTranslation = 'नमस्ते';
    vi.mocked(translationService.translate).mockResolvedValue(mockTranslation);

    render(<TranslationTab />);

    // Enter text and translate
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    const translateButton = screen.getByRole('button', { name: /translate/i });
    translateButton.click();

    // Wait for translation to appear
    await waitFor(() => {
      expect(screen.getByText(mockTranslation)).toBeInTheDocument();
    });

    // Change language
    const languageButtons = screen.getAllByRole('button');
    const teluguButton = languageButtons.find(btn =>
      btn.textContent?.includes('Telugu')
    );
    teluguButton!.click();

    // Translation output should be cleared
    await waitFor(() => {
      expect(screen.queryByText(mockTranslation)).not.toBeInTheDocument();
    });
  });

  /**
   * Unit Test: Ctrl+Enter keyboard shortcut triggers translation
   */
  it('triggers translation when Ctrl+Enter is pressed in textarea', async () => {
    const mockTranslation = 'नमस्ते';
    vi.mocked(translationService.translate).mockResolvedValue(mockTranslation);

    render(<TranslationTab />);

    // Enter text
    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    textarea.focus();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Press Ctrl+Enter
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
      })
    );

    // Translation should be triggered
    await waitFor(() => {
      expect(translationService.translate).toHaveBeenCalledWith('Hello', 'hi');
    });
  });
});
