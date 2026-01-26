/**
 * Unit Tests for TranslationOutput Component
 * Feature: mandimind
 * Tests copy confirmation message display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { TranslationOutput } from './TranslationOutput';
import * as translationService from '../services/translationService';

// Mock the translation service
vi.mock('../services/translationService', async () => {
  const actual = await vi.importActual('../services/translationService');
  return {
    ...actual,
    copyToClipboard: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TranslationOutput - Unit Tests', () => {
  /**
   * Unit Test: Copy confirmation appears after successful copy
   * **Validates: Requirements 9.2**
   */
  it('displays copy confirmation message after successful copy', async () => {
    vi.mocked(translationService.copyToClipboard).mockResolvedValue(true);

    render(
      <TranslationOutput
        translatedText="नमस्ते"
        targetLanguage="hi"
      />
    );

    // Find and click the copy button
    const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
    copyButton.click();

    // Wait for confirmation message to appear
    await waitFor(() => {
      expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
    });

    // Verify copyToClipboard was called with correct text
    expect(translationService.copyToClipboard).toHaveBeenCalledWith('नमस्ते');
  });

  /**
   * Unit Test: Copy button shows check icon after successful copy
   */
  it('changes copy button icon to check mark after successful copy', async () => {
    vi.mocked(translationService.copyToClipboard).mockResolvedValue(true);

    const { container } = render(
      <TranslationOutput
        translatedText="नमस्ते"
        targetLanguage="hi"
      />
    );

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy to clipboard/i });
    copyButton.click();

    // Button should have green background after successful copy
    await waitFor(() => {
      expect(copyButton.className).toContain('bg-green');
    });
  });

  /**
   * Unit Test: Component renders nothing when no translated text
   */
  it('renders nothing when translatedText is empty', () => {
    const { container } = render(
      <TranslationOutput
        translatedText=""
        targetLanguage="hi"
      />
    );

    // Component should not render anything
    expect(container.firstChild).toBeNull();
  });

  /**
   * Unit Test: Displays translated text correctly
   */
  it('displays the translated text in the output area', () => {
    render(
      <TranslationOutput
        translatedText="नमस्ते दुनिया"
        targetLanguage="hi"
      />
    );

    // Translated text should be visible
    expect(screen.getByText('नमस्ते दुनिया')).toBeInTheDocument();
  });

  /**
   * Unit Test: Displays target language label
   */
  it('displays the target language in the label', () => {
    render(
      <TranslationOutput
        translatedText="నమస్కారం"
        targetLanguage="te"
      />
    );

    // Target language should be shown
    expect(screen.getByText(/target: te/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Preserves multiline text formatting
   */
  it('preserves newlines in translated text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    
    const { container } = render(
      <TranslationOutput
        translatedText={multilineText}
        targetLanguage="hi"
      />
    );

    // Text should be displayed with preserved formatting
    const textElement = container.querySelector('.whitespace-pre-wrap');
    expect(textElement).toBeInTheDocument();
    expect(textElement?.textContent).toBe(multilineText);
  });
});
