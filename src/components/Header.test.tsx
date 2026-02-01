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

  it('displays current date badge', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    // Check that date badge container exists
    const dateBadge = container.querySelector('.bg-orange-50\\/50');
    expect(dateBadge).toBeInTheDocument();
  });

  it('applies glassmorphism styling with sticky positioning', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('backdrop-blur-xl');
    expect(header).toHaveClass('sticky');
  });

  it('displays tricolor gradient border', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const tricolorBorder = container.querySelector('.bg-gradient-to-r.from-\\[\\#FF9933\\]');
    expect(tricolorBorder).toBeInTheDocument();
  });

  it('displays language selector with Globe icon', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const select = container.querySelector('select');
    expect(select).toBeInTheDocument();
  });

  it('constrains content to max width', () => {
    const { container } = renderWithLanguageProvider(<Header />);
    
    const contentContainer = container.querySelector('.max-w-5xl');
    expect(contentContainer).toBeInTheDocument();
  });
});
