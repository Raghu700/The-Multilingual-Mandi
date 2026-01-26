/**
 * Unit Tests for PhraseLibrary Component
 * Feature: mandimind
 * Tests phrase selection and display
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PhraseLibrary } from './PhraseLibrary';
import { MandiPhrase } from '../types';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PhraseLibrary - Unit Tests', () => {
  /**
   * Unit Test: All phrases are displayed
   */
  it('displays all mandi phrases', () => {
    const mockOnSelect = vi.fn();

    render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Should display the header
    expect(screen.getByText(/common mandi phrases/i)).toBeInTheDocument();

    // Should display multiple phrase buttons
    const phraseButtons = screen.getAllByRole('button').filter(btn => 
      !btn.textContent?.includes('Common Mandi Phrases')
    );
    
    // Should have at least 10 phrases
    expect(phraseButtons.length).toBeGreaterThanOrEqual(10);
  });

  /**
   * Unit Test: Phrases show English and translated text
   */
  it('displays both English and translated text for each phrase', () => {
    const mockOnSelect = vi.fn();

    render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Check for a specific phrase (greeting)
    expect(screen.getByText(/good morning/i)).toBeInTheDocument();
    expect(screen.getByText(/सुप्रभात/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Clicking a phrase calls onPhraseSelect
   */
  it('calls onPhraseSelect when a phrase is clicked', () => {
    const mockOnSelect = vi.fn();

    render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Find and click a phrase button
    const phraseButtons = screen.getAllByRole('button');
    const greetingButton = phraseButtons.find(btn => 
      btn.textContent?.includes('Good morning')
    );

    expect(greetingButton).toBeDefined();
    greetingButton!.click();

    // Callback should be called
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    
    // Should be called with a MandiPhrase object
    const calledWith = mockOnSelect.mock.calls[0][0] as MandiPhrase;
    expect(calledWith).toHaveProperty('id');
    expect(calledWith).toHaveProperty('en');
    expect(calledWith).toHaveProperty('hi');
  });

  /**
   * Unit Test: Phrases update when language changes
   */
  it('updates phrase translations when language changes', () => {
    const mockOnSelect = vi.fn();

    const { rerender } = render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Should show Hindi translation
    expect(screen.getByText(/सुप्रभात/i)).toBeInTheDocument();

    // Change to Telugu
    rerender(
      <PhraseLibrary
        selectedLanguage="te"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Should show Telugu translation
    expect(screen.getByText(/శుభోదయం/i)).toBeInTheDocument();
    // Hindi should not be visible anymore
    expect(screen.queryByText(/सुप्रभात/i)).not.toBeInTheDocument();
  });

  /**
   * Unit Test: Info message is displayed
   */
  it('displays helpful info message', () => {
    const mockOnSelect = vi.fn();

    render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Should show info message
    expect(screen.getByText(/click any phrase to use it/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: BookOpen icon is displayed
   */
  it('displays the BookOpen icon in header', () => {
    const mockOnSelect = vi.fn();

    const { container } = render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Check for SVG icon (lucide-react icons render as SVG)
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  /**
   * Unit Test: Phrases are clickable and have hover effects
   */
  it('phrase buttons have interactive styling classes', () => {
    const mockOnSelect = vi.fn();

    const { container } = render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Find phrase buttons
    const phraseButtons = Array.from(container.querySelectorAll('button')).filter(btn => 
      btn.textContent?.includes('Good morning')
    );

    expect(phraseButtons.length).toBeGreaterThan(0);
    const button = phraseButtons[0];

    // Should have hover and transition classes
    expect(button.className).toContain('hover:scale-105');
    expect(button.className).toContain('transition-all');
  });

  /**
   * Unit Test: All required phrases are present
   */
  it('includes all required mandi phrases', () => {
    const mockOnSelect = vi.fn();

    render(
      <PhraseLibrary
        selectedLanguage="en"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Check for key phrases using getAllByText since phrases appear twice (English + translation)
    const requiredPhrases = [
      /good morning/i,
      /price per kg/i,
      /fresh and high quality/i,
      /bulk purchase/i,
      /thank you/i,
    ];

    requiredPhrases.forEach(phrase => {
      expect(screen.getAllByText(phrase).length).toBeGreaterThan(0);
    });
  });

  /**
   * Unit Test: Grid layout is responsive
   */
  it('uses responsive grid layout', () => {
    const mockOnSelect = vi.fn();

    const { container } = render(
      <PhraseLibrary
        selectedLanguage="hi"
        onPhraseSelect={mockOnSelect}
      />
    );

    // Find the grid container
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeDefined();
    expect(gridContainer?.className).toContain('grid-cols-1');
    expect(gridContainer?.className).toContain('sm:grid-cols-2');
  });
});
