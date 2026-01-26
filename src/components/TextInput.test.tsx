/**
 * Unit Tests for TextInput Component
 * Feature: mandimind
 * Tests input validation and error display
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { TextInput } from './TextInput';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('TextInput - Unit Tests', () => {
  /**
   * Unit Test: Renders textarea with label
   */
  it('renders textarea with correct label', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    // Label should be present
    expect(screen.getByText(/enter text to translate/i)).toBeInTheDocument();
    
    // Textarea should be present
    expect(screen.getByRole('textbox', { name: /enter text to translate/i })).toBeInTheDocument();
  });

  /**
   * Unit Test: Displays custom placeholder
   */
  it('displays custom placeholder text', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
        placeholder="Custom placeholder"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  /**
   * Unit Test: Displays default placeholder when not provided
   */
  it('displays default placeholder when none provided', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea).toHaveAttribute('placeholder', 'Type your message here...');
  });

  /**
   * Unit Test: Calls onChange when text is entered
   */
  it('calls onChange callback when text is entered', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    
    // Simulate typing
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(textarea, 'Hello world');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    // onChange should be called with the new value
    expect(mockOnChange).toHaveBeenCalledWith('Hello world');
  });

  /**
   * Unit Test: Displays error message when provided
   */
  it('displays error message when error prop is provided', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
        error="Please enter text to translate"
      />
    );

    // Error message should be visible
    expect(screen.getByText(/please enter text to translate/i)).toBeInTheDocument();
    
    // Error icon should be present
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  /**
   * Unit Test: Applies error styling when error is present
   */
  it('applies error styling to textarea when error exists', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
        error="Error message"
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea.className).toContain('border-red-500');
  });

  /**
   * Unit Test: No error styling when no error
   */
  it('does not apply error styling when no error', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea.className).not.toContain('border-red-500');
  });

  /**
   * Unit Test: Textarea has correct number of rows
   */
  it('renders textarea with 5 rows', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea).toHaveAttribute('rows', '5');
  });

  /**
   * Unit Test: Textarea is not resizable
   */
  it('textarea has resize-none class', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea.className).toContain('resize-none');
  });

  /**
   * Unit Test: Displays current value
   */
  it('displays the current value in textarea', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value="Current text value"
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea).toHaveValue('Current text value');
  });

  /**
   * Unit Test: Has glassmorphism styling
   */
  it('applies glassmorphism styling classes', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea.className).toContain('glass-input');
  });

  /**
   * Unit Test: Has focus styling
   */
  it('has focus ring styling with saffron color', () => {
    const mockOnChange = vi.fn();

    render(
      <TextInput
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /enter text to translate/i });
    expect(textarea.className).toContain('focus:ring-saffron');
    expect(textarea.className).toContain('focus:border-saffron');
  });
});
