/**
 * Unit Tests for TranslationHistory Component
 * Feature: mandimind
 * Tests history display and copy functionality
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { TranslationHistory } from './TranslationHistory';
import { TranslationEntry } from '../types';
import * as translationService from '../services/translationService';

// Mock the translation service
vi.mock('../services/translationService', async () => {
  const actual = await vi.importActual<typeof import('../services/translationService')>('../services/translationService');
  return {
    ...actual,
    copyToClipboard: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TranslationHistory - Unit Tests', () => {
  const mockHistory: TranslationEntry[] = [
    {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now() - 1000,
    },
    {
      id: '2',
      sourceText: 'Thank you',
      sourceLang: 'en',
      targetLang: 'te',
      translatedText: 'ధన్యవాదాలు',
      timestamp: Date.now() - 5000,
    },
    {
      id: '3',
      sourceText: 'Good morning',
      sourceLang: 'en',
      targetLang: 'ta',
      translatedText: 'காலை வணக்கம்',
      timestamp: Date.now() - 10000,
    },
  ];

  /**
   * Unit Test: Displays empty state when no history
   */
  it('displays empty state message when history is empty', () => {
    render(<TranslationHistory history={[]} />);

    expect(screen.getByText(/no translation history yet/i)).toBeInTheDocument();
    expect(screen.getByText(/your translations will appear here/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Displays all history entries
   */
  it('displays all translation entries', () => {
    render(<TranslationHistory history={mockHistory} />);

    // All source texts should be visible
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Thank you')).toBeInTheDocument();
    expect(screen.getByText('Good morning')).toBeInTheDocument();

    // All translated texts should be visible
    expect(screen.getByText('नमस्ते')).toBeInTheDocument();
    expect(screen.getByText('ధన్యవాదాలు')).toBeInTheDocument();
    expect(screen.getByText('காலை வணக்கம்')).toBeInTheDocument();
  });

  /**
   * Unit Test: Displays language labels
   */
  it('displays source and target language labels', () => {
    render(<TranslationHistory history={mockHistory} />);

    // Should show language names
    expect(screen.getAllByText(/english/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hindi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/telugu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tamil/i).length).toBeGreaterThan(0);
  });

  /**
   * Unit Test: Displays timestamps
   */
  it('displays relative timestamps for entries', () => {
    render(<TranslationHistory history={mockHistory} />);

    // Should show relative time (e.g., "Just now", "5m ago")
    const timeElements = screen.getAllByText(/ago|just now/i);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  /**
   * Unit Test: Copy button works for each entry
   */
  it('copies translated text when copy button is clicked', async () => {
    vi.mocked(translationService.copyToClipboard).mockResolvedValue(true);

    render(<TranslationHistory history={mockHistory} />);

    // Find all copy buttons
    const copyButtons = screen.getAllByRole('button', { name: /copy translation/i });
    expect(copyButtons.length).toBe(3);

    // Click the first copy button
    copyButtons[0].click();

    // Should call copyToClipboard with the correct text
    await waitFor(() => {
      expect(translationService.copyToClipboard).toHaveBeenCalledWith('नमस्ते');
    });
  });

  /**
   * Unit Test: Copy button shows check icon after successful copy
   */
  it('shows check icon after successful copy', async () => {
    vi.mocked(translationService.copyToClipboard).mockResolvedValue(true);

    render(<TranslationHistory history={mockHistory} />);

    // Click first copy button
    const copyButtons = screen.getAllByRole('button', { name: /copy translation/i });
    copyButtons[0].click();

    // Button should change to show check icon
    await waitFor(() => {
      const button = copyButtons[0];
      expect(button.className).toContain('bg-green');
    });
  });

  /**
   * Unit Test: Displays entry count
   */
  it('displays the total number of translations', () => {
    render(<TranslationHistory history={mockHistory} />);

    expect(screen.getByText(/3 translations/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Singular form for single entry
   */
  it('uses singular form when only one translation', () => {
    const singleEntry = [mockHistory[0]];
    
    render(<TranslationHistory history={singleEntry} />);

    expect(screen.getByText(/1 translation$/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Displays header with icon
   */
  it('displays header with History icon', () => {
    const { container } = render(<TranslationHistory history={mockHistory} />);

    expect(screen.getByText(/translation history/i)).toBeInTheDocument();
    
    // Check for SVG icon
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  /**
   * Unit Test: History list is scrollable
   */
  it('applies scrollable styling to history list', () => {
    const { container } = render(<TranslationHistory history={mockHistory} />);

    // Find the scrollable container
    const scrollContainer = container.querySelector('.overflow-y-auto');
    expect(scrollContainer).toBeDefined();
    expect(scrollContainer?.className).toContain('max-h-[500px]');
  });

  /**
   * Unit Test: Entries have hover effects
   */
  it('entries have hover effect styling', () => {
    const { container } = render(<TranslationHistory history={mockHistory} />);

    // Find entry cards
    const entryCards = container.querySelectorAll('.glass-card');
    expect(entryCards.length).toBeGreaterThan(0);

    const firstCard = entryCards[0];
    expect(firstCard.className).toContain('hover:shadow-glass-lg');
  });

  /**
   * Unit Test: Language direction arrow is displayed
   */
  it('displays arrow between source and target languages', () => {
    render(<TranslationHistory history={mockHistory} />);

    // Should show arrows (→)
    const arrows = screen.getAllByText('→');
    expect(arrows.length).toBe(mockHistory.length);
  });

  /**
   * Unit Test: Handles very recent timestamps
   */
  it('displays "Just now" for very recent translations', () => {
    const recentEntry: TranslationEntry = {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now() - 100, // 100ms ago
    };

    render(<TranslationHistory history={[recentEntry]} />);

    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Formats old dates correctly
   */
  it('formats dates correctly for old entries', () => {
    const oldEntry: TranslationEntry = {
      id: '1',
      sourceText: 'Hello',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'नमस्ते',
      timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
    };

    const { container } = render(<TranslationHistory history={[oldEntry]} />);

    // Should show formatted date instead of relative time
    // Look for any text that matches a date pattern
    const timeElements = container.querySelectorAll('.text-xs.text-gray-500');
    expect(timeElements.length).toBeGreaterThan(0);
    
    // The timestamp should not say "ago" for dates older than 7 days
    const timestampText = timeElements[0].textContent;
    expect(timestampText).not.toMatch(/ago$/i);
  });

  /**
   * Unit Test: Text is truncated with line-clamp
   */
  it('applies line-clamp to long text', () => {
    const longTextEntry: TranslationEntry = {
      id: '1',
      sourceText: 'This is a very long source text that should be truncated with line clamp to prevent it from taking too much space in the history view',
      sourceLang: 'en',
      targetLang: 'hi',
      translatedText: 'यह एक बहुत लंबा अनुवादित पाठ है जिसे लाइन क्लैंप के साथ काटा जाना चाहिए',
      timestamp: Date.now(),
    };

    const { container } = render(<TranslationHistory history={[longTextEntry]} />);

    // Find text elements with line-clamp
    const clampedElements = container.querySelectorAll('.line-clamp-2');
    expect(clampedElements.length).toBeGreaterThan(0);
  });
});
