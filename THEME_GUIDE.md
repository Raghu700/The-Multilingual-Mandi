# MandiMind Theme Guide
## India's 77th Republic Day Special - Glassmorphism Edition

This guide documents the complete theme system for MandiMind, including tricolor colors, glassmorphism effects, and usage examples.

---

## 🎨 Color Palette

### Official Tricolor Colors

Based on India's national flag:

- **Saffron**: `#FF9933` - Primary action color, buttons, highlights
- **Saffron Light**: `#FFB366` - Hover states, lighter accents
- **White**: `#FFFFFF` - Background, text on dark backgrounds
- **Green**: `#138808` - Success states, positive indicators
- **Green Light**: `#1AAA0A` - Hover states for green elements
- **Navy Blue**: `#000080` - Headings, important text, dark accents

### Glassmorphism Colors (RGBA)

Transparent colors for glass effects:

#### White Glass Variants
- `glass-white`: `rgba(255, 255, 255, 0.7)` - Standard glass cards
- `glass-white-light`: `rgba(255, 255, 255, 0.5)` - Lighter glass
- `glass-white-lighter`: `rgba(255, 255, 255, 0.3)` - Subtle glass

#### Dark Glass Variants
- `glass-dark`: `rgba(0, 0, 0, 0.1)` - Light overlay
- `glass-dark-medium`: `rgba(0, 0, 0, 0.2)` - Medium overlay
- `glass-dark-heavy`: `rgba(0, 0, 0, 0.3)` - Heavy overlay

#### Tricolor Glass Variants
- `glass-saffron`: `rgba(255, 153, 51, 0.1)` - Light saffron tint
- `glass-saffron-medium`: `rgba(255, 153, 51, 0.2)` - Medium saffron
- `glass-saffron-heavy`: `rgba(255, 153, 51, 0.3)` - Heavy saffron
- `glass-green`: `rgba(19, 136, 8, 0.1)` - Light green tint
- `glass-green-medium`: `rgba(19, 136, 8, 0.2)` - Medium green
- `glass-green-heavy`: `rgba(19, 136, 8, 0.3)` - Heavy green
- `glass-navy`: `rgba(0, 0, 128, 0.1)` - Light navy tint
- `glass-navy-medium`: `rgba(0, 0, 128, 0.2)` - Medium navy
- `glass-navy-heavy`: `rgba(0, 0, 128, 0.3)` - Heavy navy

---

## 🌈 Gradients

### Tricolor Gradients

```css
/* Horizontal tricolor */
bg-tricolor

/* Diagonal header gradient */
bg-tricolor-header

/* Vertical tricolor */
bg-tricolor-vertical

/* 45-degree diagonal */
bg-tricolor-diagonal
```

### Glass Gradients

```css
/* Glass tricolor gradient */
bg-glass-tricolor

/* Glass saffron gradient */
bg-glass-saffron-gradient

/* Glass green gradient */
bg-glass-green-gradient

/* Glass navy gradient */
bg-glass-navy-gradient
```

---

## 🪟 Glassmorphism Components

### Glass Cards

#### Basic Glass Card
```jsx
<div className="glass-card">
  {/* Content */}
</div>
```

#### Light Glass Card
```jsx
<div className="glass-card-light">
  {/* Content */}
</div>
```

#### Heavy Glass Card
```jsx
<div className="glass-card-heavy">
  {/* Content */}
</div>
```

#### Tricolor Glass Cards
```jsx
<div className="glass-card-saffron">
  {/* Saffron-tinted glass */}
</div>

<div className="glass-card-green">
  {/* Green-tinted glass */}
</div>

<div className="glass-card-navy">
  {/* Navy-tinted glass */}
</div>
```

### Glass Buttons

#### Standard Glass Button
```jsx
<button className="glass-button">
  Click Me
</button>
```

#### Tricolor Glass Buttons
```jsx
<button className="glass-button-saffron">
  Saffron Action
</button>

<button className="glass-button-green">
  Green Action
</button>
```

### Glass Input Fields

```jsx
<input 
  type="text" 
  className="glass-input"
  placeholder="Enter text..."
/>
```

### Glass Badges

```jsx
<span className="glass-badge">
  Standard Badge
</span>

<span className="glass-badge-saffron">
  Unity in Diversity 🇮🇳
</span>

<span className="glass-badge-green">
  Digital India 🚀
</span>
```

### Glass Panels with Gradients

```jsx
<div className="glass-panel-saffron">
  {/* Saffron gradient panel */}
</div>

<div className="glass-panel-green">
  {/* Green gradient panel */}
</div>

<div className="glass-panel-navy">
  {/* Navy gradient panel */}
</div>
```

### Republic Day Special Glass

```jsx
<div className="glass-republic-day">
  {/* Special glass effect with tricolor diagonal overlay */}
</div>
```

---

## 🎭 Backdrop Effects

### Backdrop Blur

```css
backdrop-blur-xs    /* 2px */
backdrop-blur-sm    /* 4px */
backdrop-blur-md    /* 8px */
backdrop-blur-lg    /* 12px */
backdrop-blur-xl    /* 16px */
backdrop-blur-2xl   /* 24px */
backdrop-blur-3xl   /* 40px */
```

### Backdrop Saturate

```css
backdrop-saturate-0    /* 0% */
backdrop-saturate-50   /* 50% */
backdrop-saturate-100  /* 100% */
backdrop-saturate-150  /* 150% */
backdrop-saturate-200  /* 200% */
```

### Combined Backdrop Utilities

```jsx
<div className="backdrop-glass">
  {/* blur-lg + saturate-150 */}
</div>

<div className="backdrop-glass-heavy">
  {/* blur-2xl + saturate-200 */}
</div>

<div className="backdrop-glass-light">
  {/* blur-md + saturate-100 */}
</div>
```

---

## 🎨 Box Shadows

### Glass Shadows

```css
shadow-glass       /* Standard glass shadow */
shadow-glass-sm    /* Small glass shadow */
shadow-glass-lg    /* Large glass shadow */
```

### Tricolor Shadows

```css
shadow-glass-saffron  /* Saffron-tinted shadow */
shadow-glass-green    /* Green-tinted shadow */
shadow-glass-navy     /* Navy-tinted shadow */
```

---

## 🔧 Utility Functions (TypeScript)

### Get Tricolor Class

```typescript
import { getTricolorClass } from '@/utils/theme';

// Get button class
const buttonClass = getTricolorClass('saffron', 'button');
// Returns: 'bg-saffron hover:bg-saffron-light text-white'

// Get card class
const cardClass = getTricolorClass('green', 'card');
// Returns: 'glass-card-green'

// Get text class
const textClass = getTricolorClass('navy', 'text');
// Returns: 'text-navy-blue'
```

### Create Custom Glass Style

```typescript
import { createGlassStyle } from '@/utils/theme';

// Create custom glass effect
const customGlass = createGlassStyle({
  blur: 16,
  opacity: 0.8,
  color: '255, 153, 51', // RGB for saffron
  borderOpacity: 0.4,
  shadow: true,
});

// Use in component
<div style={customGlass}>
  {/* Content */}
</div>
```

### Use Glass Presets

```typescript
import { GLASS_PRESETS } from '@/utils/theme';

// Apply preset
<div style={GLASS_PRESETS.card}>
  {/* Standard glass card */}
</div>

<div style={GLASS_PRESETS.cardSaffron}>
  {/* Saffron glass card */}
</div>

<button style={GLASS_PRESETS.buttonSaffron}>
  {/* Saffron glass button */}
</button>
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
import { BREAKPOINTS } from '@/utils/theme';

BREAKPOINTS.mobile    // 320px
BREAKPOINTS.tablet    // 768px
BREAKPOINTS.desktop   // 1024px
BREAKPOINTS.maxWidth  // 1200px
```

### Usage in Tailwind

```jsx
<div className="w-full md:w-1/2 lg:w-1/3 max-w-[1200px]">
  {/* Responsive container */}
</div>
```

---

## 🎯 Best Practices

### 1. **Layering Glass Effects**

Stack glass elements carefully to maintain readability:

```jsx
<div className="glass-card">
  <div className="glass-card-light p-4">
    {/* Nested glass for depth */}
  </div>
</div>
```

### 2. **Contrast for Readability**

Always ensure sufficient contrast:

```jsx
{/* Good: Dark text on light glass */}
<div className="glass-card text-navy-blue">
  Content
</div>

{/* Good: Light text on dark glass */}
<div className="glass-dark text-white">
  Content
</div>
```

### 3. **Hover Effects**

Use glass hover utilities for interactive elements:

```jsx
<button className="glass-button glass-hover-saffron">
  Interactive Button
</button>
```

### 4. **Performance Considerations**

- Limit backdrop-blur on large areas (can be GPU-intensive)
- Use lighter blur values (sm, md) for better performance
- Avoid nesting too many glass effects

### 5. **Accessibility**

- Maintain WCAG AA contrast ratios
- Test with screen readers
- Ensure keyboard navigation works
- Add focus indicators to interactive elements

---

## 🇮🇳 Republic Day Theme Elements

### Header

```jsx
<header className="glass-header-tricolor p-4">
  <h1 className="text-navy-blue font-bold">
    India's 77th Republic Day Special 🇮🇳
  </h1>
  <span className="glass-badge">26 January 2026</span>
</header>
```

### Feature Badges

```jsx
<span className="glass-badge-saffron">
  Unity in Diversity 🇮🇳
</span>

<span className="glass-badge-green">
  Digital India 🚀
</span>

<span className="glass-badge">
  Atmanirbhar Bharat 💪
</span>
```

### Anniversary Badge

```jsx
<div className="glass-badge text-saffron font-bold text-2xl">
  77
</div>
```

### Footer

```jsx
<footer className="glass-card text-center p-4">
  <p className="text-navy-blue font-semibold">Jai Hind 🇮🇳</p>
</footer>
```

---

## 🎨 Example Compositions

### Feature Card

```jsx
<div className="glass-card-saffron p-6 space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-navy-blue text-xl font-bold">
      Translation Module
    </h2>
    <span className="glass-badge-saffron">
      Unity in Diversity 🇮🇳
    </span>
  </div>
  <p className="text-gray-700">
    Translate between 5 Indian languages instantly
  </p>
  <button className="glass-button-saffron w-full">
    Start Translating
  </button>
</div>
```

### Price Card

```jsx
<div className="glass-card-green p-4">
  <div className="flex justify-between items-center mb-2">
    <span className="text-navy-blue font-semibold">Rice</span>
    <span className="glass-badge-green">↑ Trending</span>
  </div>
  <div className="space-y-1">
    <div className="flex justify-between">
      <span className="text-sm">Min:</span>
      <span className="text-red-600">₹45/kg</span>
    </div>
    <div className="flex justify-between">
      <span className="text-sm">Avg:</span>
      <span className="text-yellow-600">₹50/kg</span>
    </div>
    <div className="flex justify-between">
      <span className="text-sm">Max:</span>
      <span className="text-green-600">₹55/kg</span>
    </div>
  </div>
</div>
```

### Tab Navigation

```jsx
<nav className="glass-card flex gap-2 p-2">
  <button className="glass-button-saffron flex-1">
    Translation
  </button>
  <button className="glass-button flex-1">
    Price Discovery
  </button>
  <button className="glass-button flex-1">
    Negotiation
  </button>
</nav>
```

---

## 🚀 Quick Start

1. **Import theme utilities in your component:**

```typescript
import { getTricolorClass, GLASS_PRESETS } from '@/utils/theme';
```

2. **Use Tailwind classes for quick styling:**

```jsx
<div className="glass-card-saffron p-4">
  <h2 className="text-navy-blue">Title</h2>
  <button className="glass-button-saffron">Action</button>
</div>
```

3. **Or use inline styles with presets:**

```jsx
<div style={GLASS_PRESETS.cardGreen}>
  <h2>Title</h2>
</div>
```

---

## 📚 Resources

- **Tailwind Config**: `tailwind.config.js`
- **Theme Constants**: `src/utils/theme.ts`
- **Glassmorphism CSS**: `src/styles/glassmorphism.css`
- **Main CSS**: `src/index.css`

---

## 🎉 Celebrating India's 77th Republic Day

This theme system is designed to honor India's 77th Republic Day with:
- **Tricolor pride**: Official flag colors throughout
- **Modern design**: Glassmorphism for contemporary appeal
- **Cultural respect**: Patriotic badges and messages
- **Accessibility**: WCAG AA compliant
- **Performance**: Optimized for all devices

**Jai Hind! 🇮🇳**
