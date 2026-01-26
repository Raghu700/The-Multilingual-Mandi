/**
 * Unit Tests for TranslateButton Component
 * Feature: mandimind
 * Tests button states and interactions
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TranslateButton } from './TranslateButton';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TranslateButton - Unit Tests', () => {
  /**
   * Unit Test: Renders button with correct text
   */
  it('renders button with "Translate" text', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    expect(screen.getByRole('button', { name: /translate/i })).toBeInTheDocument();
  });

  /**
   * Unit Test: Calls onClick when clicked
   */
  it('calls onClick callback when button is clicked', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    button.click();

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  /**
   * Unit Test: Button is disabled when disabled prop is true
   */
  it('disables button when disabled prop is true', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button).toBeDisabled();
  });

  /**
   * Unit Test: Button is disabled when loading
   */
  it('disables button when loading prop is true', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        loading={true}
      />
    );

    const button = screen.getByRole('button', { name: /translating/i });
    expect(button).toBeDisabled();
  });

  /**
   * Unit Test: Shows loading text when loading
   */
  it('displays "Translating..." text when loading', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        loading={true}
      />
    );

    expect(screen.getByText(/translating/i)).toBeInTheDocument();
  });

  /**
   * Unit Test: Does not call onClick when disabled
   */
  it('does not call onClick when button is disabled', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    button.click();

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  /**
   * Unit Test: Has saffron background when enabled
   */
  it('applies saffron background styling when enabled', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button.className).toContain('bg-saffron');
    expect(button.className).toContain('text-white');
  });

  /**
   * Unit Test: Has gray background when disabled
   */
  it('applies gray background styling when disabled', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button.className).toContain('bg-gray-300');
    expect(button.className).toContain('text-gray-500');
  });

  /**
   * Unit Test: Has hover effects when enabled
   */
  it('has hover effect classes when enabled', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button.className).toContain('hover:bg-saffron-light');
    expect(button.className).toContain('hover:shadow-lg');
    expect(button.className).toContain('hover:scale-105');
  });

  /**
   * Unit Test: Displays Languages icon
   */
  it('displays Languages icon', () => {
    const mockOnClick = vi.fn();

    const { container } = render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    // Check for SVG icon (lucide-react icons render as SVG)
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(0);
  });

  /**
   * Unit Test: Icon animates when loading
   */
  it('animates icon when loading', () => {
    const mockOnClick = vi.fn();

    const { container } = render(
      <TranslateButton
        onClick={mockOnClick}
        loading={true}
      />
    );

    // Icon should have animate-spin class when loading
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeDefined();
    // Check if the class attribute contains animate-spin
    const classAttr = svgIcon?.getAttribute('class');
    expect(classAttr).toContain('animate-spin');
  });

  /**
   * Unit Test: Icon does not animate when not loading
   */
  it('does not animate icon when not loading', () => {
    const mockOnClick = vi.fn();

    const { container } = render(
      <TranslateButton
        onClick={mockOnClick}
        loading={false}
      />
    );

    // Icon should not have animate-spin class
    const svgIcon = container.querySelector('svg');
    expect(svgIcon).toBeDefined();
    // Check if the class attribute does not contain animate-spin
    const classAttr = svgIcon?.getAttribute('class');
    expect(classAttr).not.toContain('animate-spin');
  });

  /**
   * Unit Test: Has transition effects
   */
  it('has transition-all class for smooth animations', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button.className).toContain('transition-all');
  });

  /**
   * Unit Test: Button is enabled by default
   */
  it('is enabled by default when no props provided', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button).not.toBeDisabled();
  });

  /**
   * Unit Test: Has cursor-not-allowed when disabled
   */
  it('shows not-allowed cursor when disabled', () => {
    const mockOnClick = vi.fn();

    render(
      <TranslateButton
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /translate/i });
    expect(button.className).toContain('cursor-not-allowed');
  });
});
