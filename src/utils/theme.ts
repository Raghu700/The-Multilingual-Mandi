/**
 * Theme Configuration for MandiMind
 * India's 77th Republic Day Special - 26 January 2026
 * 
 * This file contains all theme-related constants, colors, and utilities
 * for the tricolor theme with glassmorphism effects.
 */

/**
 * Official Tricolor Colors
 * Based on India's national flag colors
 */
export const TRICOLOR_COLORS = {
  saffron: '#FF9933',
  saffronLight: '#FFB366',
  white: '#FFFFFF',
  green: '#138808',
  greenLight: '#1AAA0A',
  navyBlue: '#000080',
} as const;

/**
 * Glassmorphism Background Colors (RGBA)
 * These provide transparency for glass effects
 */
export const GLASS_BACKGROUNDS = {
  white: 'rgba(255, 255, 255, 0.7)',
  whiteLight: 'rgba(255, 255, 255, 0.5)',
  whiteLighter: 'rgba(255, 255, 255, 0.3)',
  dark: 'rgba(0, 0, 0, 0.1)',
  darkMedium: 'rgba(0, 0, 0, 0.2)',
  darkHeavy: 'rgba(0, 0, 0, 0.3)',
  saffron: 'rgba(255, 153, 51, 0.1)',
  saffronMedium: 'rgba(255, 153, 51, 0.2)',
  saffronHeavy: 'rgba(255, 153, 51, 0.3)',
  green: 'rgba(19, 136, 8, 0.1)',
  greenMedium: 'rgba(19, 136, 8, 0.2)',
  greenHeavy: 'rgba(19, 136, 8, 0.3)',
  navy: 'rgba(0, 0, 128, 0.1)',
  navyMedium: 'rgba(0, 0, 128, 0.2)',
  navyHeavy: 'rgba(0, 0, 128, 0.3)',
} as const;

/**
 * Gradient Definitions
 * Pre-defined gradients for headers, backgrounds, and effects
 */
export const GRADIENTS = {
  tricolor: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
  tricolorHeader: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  tricolorVertical: 'linear-gradient(to bottom, #FF9933, #FFFFFF, #138808)',
  tricolorDiagonal: 'linear-gradient(45deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  glassTricolor: 'linear-gradient(135deg, rgba(255, 153, 51, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(19, 136, 8, 0.2) 100%)',
  glassSaffron: 'linear-gradient(135deg, rgba(255, 153, 51, 0.3) 0%, rgba(255, 153, 51, 0.1) 100%)',
  glassGreen: 'linear-gradient(135deg, rgba(19, 136, 8, 0.3) 0%, rgba(19, 136, 8, 0.1) 100%)',
  glassNavy: 'linear-gradient(135deg, rgba(0, 0, 128, 0.3) 0%, rgba(0, 0, 128, 0.1) 100%)',
} as const;

/**
 * Republic Day Badges
 * Feature-specific badges for the three main modules
 */
export const REPUBLIC_DAY_BADGES = {
  translation: '77th Republic Day | Unity in Diversity 🇮🇳',
  priceDiscovery: '77th Republic Day | Digital India 🚀',
  negotiation: '77th Republic Day | Atmanirbhar Bharat 💪',
  anniversary: '77',
} as const;

/**
 * Republic Day Messages
 */
export const REPUBLIC_DAY_MESSAGES = {
  header: "India's 77th Republic Day Special",
  date: '26 January 2026',
  footer: 'Jai Hind',
  flag: '🇮🇳',
} as const;

/**
 * Glassmorphism Effect Presets
 * Ready-to-use style objects for common glass effects
 */
export const GLASS_PRESETS = {
  card: {
    backgroundColor: GLASS_BACKGROUNDS.white,
    backdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.5rem',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  },
  cardLight: {
    backgroundColor: GLASS_BACKGROUNDS.whiteLight,
    backdropFilter: 'blur(8px) saturate(100%)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.1)',
  },
  cardSaffron: {
    backgroundColor: GLASS_BACKGROUNDS.saffron,
    backdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid rgba(255, 153, 51, 0.3)',
    borderRadius: '0.5rem',
    boxShadow: '0 8px 32px 0 rgba(255, 153, 51, 0.2)',
  },
  cardGreen: {
    backgroundColor: GLASS_BACKGROUNDS.green,
    backdropFilter: 'blur(12px) saturate(150%)',
    border: '1px solid rgba(19, 136, 8, 0.3)',
    borderRadius: '0.5rem',
    boxShadow: '0 8px 32px 0 rgba(19, 136, 8, 0.2)',
  },
  button: {
    backgroundColor: GLASS_BACKGROUNDS.white,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
  },
  buttonSaffron: {
    backgroundColor: GLASS_BACKGROUNDS.saffronMedium,
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 153, 51, 0.3)',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
  },
} as const;

/**
 * Utility function to get a tricolor-themed class name
 * @param variant - The color variant (saffron, green, navy)
 * @param type - The type of element (button, card, badge, etc.)
 * @returns Tailwind class string
 */
export function getTricolorClass(
  variant: 'saffron' | 'green' | 'navy',
  type: 'button' | 'card' | 'badge' | 'border' | 'text' | 'bg'
): string {
  const classMap: Record<string, Record<string, string>> = {
    button: {
      saffron: 'bg-saffron hover:bg-saffron-light text-white',
      green: 'bg-green hover:bg-green-light text-white',
      navy: 'bg-navy-blue hover:opacity-90 text-white',
    },
    card: {
      saffron: 'glass-card-saffron',
      green: 'glass-card-green',
      navy: 'glass-card-navy',
    },
    badge: {
      saffron: 'glass-badge-saffron text-saffron',
      green: 'glass-badge-green text-green',
      navy: 'bg-navy-blue/10 text-navy-blue',
    },
    border: {
      saffron: 'border-saffron',
      green: 'border-green',
      navy: 'border-navy-blue',
    },
    text: {
      saffron: 'text-saffron',
      green: 'text-green',
      navy: 'text-navy-blue',
    },
    bg: {
      saffron: 'bg-saffron',
      green: 'bg-green',
      navy: 'bg-navy-blue',
    },
  };

  return classMap[type]?.[variant] || '';
}

/**
 * Utility function to create inline glass effect styles
 * @param options - Configuration options for the glass effect
 * @returns React style object
 */
export function createGlassStyle(options: {
  blur?: number;
  opacity?: number;
  color?: string;
  borderOpacity?: number;
  shadow?: boolean;
}): React.CSSProperties {
  const {
    blur = 12,
    opacity = 0.7,
    color = '255, 255, 255',
    borderOpacity = 0.3,
    shadow = true,
  } = options;

  return {
    backgroundColor: `rgba(${color}, ${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(150%)`,
    border: `1px solid rgba(${color}, ${borderOpacity})`,
    borderRadius: '0.5rem',
    ...(shadow && {
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    }),
  };
}

/**
 * Breakpoint values for responsive design
 */
export const BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  maxWidth: 1200,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Z-index layers for proper stacking
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  modal: 20,
  overlay: 30,
  toast: 40,
} as const;
