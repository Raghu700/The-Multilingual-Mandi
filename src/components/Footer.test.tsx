/**
 * Unit Tests for Footer Component
 * Validates Requirements 4.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { LanguageProvider } from '../contexts/LanguageContext';

// Wrapper component for tests
const renderWithLanguageProvider = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe('Footer Component', () => {
  it('displays "Jai Hind" message', () => {
    renderWithLanguageProvider(<Footer />);
    
    const jaiHindText = screen.getByText('जय हिंद!');
    expect(jaiHindText).toBeInTheDocument();
  });

  it('displays heart emoji', () => {
    renderWithLanguageProvider(<Footer />);
    
    const heartEmoji = screen.getByText('❤️');
    expect(heartEmoji).toBeInTheDocument();
  });

  it('applies gradient background styling', () => {
    const { container } = renderWithLanguageProvider(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-gradient-to-br');
  });

  it('displays "Made with love for Bharat" message', () => {
    renderWithLanguageProvider(<Footer />);
    
    const madeWithLove = screen.getByText('Made with');
    const bharatText = screen.getByText('Bharat');
    expect(madeWithLove).toBeInTheDocument();
    expect(bharatText).toBeInTheDocument();
  });

  it('displays tricolor top border', () => {
    const { container } = renderWithLanguageProvider(<Footer />);
    
    const tricolorBorder = container.querySelector('.bg-gradient-to-r.from-\\[\\#FF9933\\]');
    expect(tricolorBorder).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    const { container } = renderWithLanguageProvider(<Footer />);
    
    const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
    expect(flexContainer).toBeInTheDocument();
  });

  it('constrains content to max width', () => {
    const { container } = renderWithLanguageProvider(<Footer />);
    
    const contentContainer = container.querySelector('.max-w-5xl');
    expect(contentContainer).toBeInTheDocument();
  });

  it('displays gradient text for Jai Hind heading', () => {
    renderWithLanguageProvider(<Footer />);
    
    const jaiHindHeading = screen.getByRole('heading', { name: 'जय हिंद!' });
    expect(jaiHindHeading).toHaveClass('bg-clip-text');
  });
});
