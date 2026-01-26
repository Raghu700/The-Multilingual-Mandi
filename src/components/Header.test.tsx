/**
 * Unit Tests for Header Component
 * Validates Requirements 4.2, 4.3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import { REPUBLIC_DAY_MESSAGES } from '../utils/theme';

describe('Header Component', () => {
  it('displays Republic Day header text', () => {
    render(<Header />);
    
    const headerText = screen.getByText(REPUBLIC_DAY_MESSAGES.header);
    expect(headerText).toBeInTheDocument();
  });

  it('displays Indian flag emoji', () => {
    render(<Header />);
    
    const flagEmoji = screen.getByRole('img', { name: /indian flag/i });
    expect(flagEmoji).toBeInTheDocument();
    expect(flagEmoji).toHaveTextContent(REPUBLIC_DAY_MESSAGES.flag);
  });

  it('displays date badge with "26 January 2026"', () => {
    render(<Header />);
    
    const dateBadge = screen.getByText(REPUBLIC_DAY_MESSAGES.date);
    expect(dateBadge).toBeInTheDocument();
  });

  it('applies glassmorphism header class', () => {
    const { container } = render(<Header />);
    
    const header = container.querySelector('header');
    expect(header).toHaveClass('glass-header-tricolor');
  });

  it('displays subtitle about empowering vendors', () => {
    render(<Header />);
    
    const subtitle = screen.getByText(/empowering india's 50m\+ vendors/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('applies responsive layout classes', () => {
    const { container } = render(<Header />);
    
    const titleContainer = container.querySelector('.flex.flex-col.md\\:flex-row');
    expect(titleContainer).toBeInTheDocument();
  });

  it('constrains content to max width of 1200px', () => {
    const { container } = render(<Header />);
    
    const contentContainer = container.querySelector('.max-w-\\[1200px\\]');
    expect(contentContainer).toBeInTheDocument();
  });
});
