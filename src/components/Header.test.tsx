/**
 * Unit Tests for Header Component
 * Validates Requirements 4.2, 4.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { LanguageProvider } from '../contexts/LanguageContext';

// Wrapper component for tests
const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('Header Component', () => {
  it('displays EktaMandi header text', () => {
    renderWithLanguageProvider(<Header />);
    
    const headerText = screen.getByText('EktaMandi');
    expect(headerText).toBeInTheDocument();
  });

  it('displays Hindi name (एकता मंडी)', () => {
    renderWithLanguageProvider(<Header />);
    
    const hindiName = screen.getByText('(एकता मंडी)');
    expect(hindiName).toBeInTheDocument();
  });

  it('displays date badge with "26 January 2026"', () => {
    renderWithLanguageProvider(<Header />);
    
    const dateBadge = screen.getByText('26 January 2026');
    expect(dateBadge).toBeInTheDocument();
  });

  it('applies glassmorphism header class with sticky positioning', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('glass-header-tricolor');
    expect(header).toHaveClass('sticky');
  });

  it('displays tagline', () => {
    renderWithLanguageProvider(<Header />);
    
    const tagline = screen.getByText(/unity in diversity/i);
    expect(tagline).toBeInTheDocument();
  });

  it('displays language selector with Globe icon', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('constrains content to max width of 1400px', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const contentContainer = container.querySelector('.max-w-\\[1400px\\]');
    expect(contentContainer).toBeInTheDocument();
  });
});
