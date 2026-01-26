/**
 * Unit Tests for Footer Component
 * Validates Requirements 4.5
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { REPUBLIC_DAY_MESSAGES } from '../utils/theme';

describe('Footer Component', () => {
  it('displays "Jai Hind" message', () => {
    render(<Footer />);
    
    const jaiHindText = screen.getByText(REPUBLIC_DAY_MESSAGES.footer);
    expect(jaiHindText).toBeInTheDocument();
  });

  it('displays Indian flag emoji', () => {
    render(<Footer />);
    
    const flagEmoji = screen.getByRole('img', { name: /indian flag/i });
    expect(flagEmoji).toBeInTheDocument();
    expect(flagEmoji).toHaveTextContent(REPUBLIC_DAY_MESSAGES.flag);
  });

  it('applies glassmorphism green card class', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('glass-card-green');
  });

  it('displays Republic Day celebration message', () => {
    render(<Footer />);
    
    const celebrationText = screen.getByText(/celebrating india's 77th republic day/i);
    expect(celebrationText).toBeInTheDocument();
  });

  it('displays empowering vendors tagline', () => {
    render(<Footer />);
    
    const tagline = screen.getByText(/empowering vendors, uniting markets/i);
    expect(tagline).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<Footer />);
    
    const flexContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
    expect(flexContainer).toBeInTheDocument();
  });

  it('constrains content to max width of 1200px', () => {
    const { container } = render(<Footer />);
    
    const contentContainer = container.querySelector('.max-w-\\[1200px\\]');
    expect(contentContainer).toBeInTheDocument();
  });

  it('applies patriotic navy blue text color', () => {
    render(<Footer />);
    
    const jaiHindHeading = screen.getByRole('heading', { name: REPUBLIC_DAY_MESSAGES.footer });
    expect(jaiHindHeading).toHaveClass('text-navy-blue');
  });
});
