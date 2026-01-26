# Design Document: MandiMind

## Overview

MandiMind is a client-side React application celebrating India's 77th Republic Day. The system provides three core modules: real-time translation, price discovery, and AI-powered negotiation assistance. Built with React + Vite + Tailwind CSS, it runs entirely in the browser using localStorage for persistence and optional Claude API integration for AI features.

The application follows a tab-based navigation pattern with three main views, each representing a core module. All data is mock/client-generated except for optional Claude API calls. The design emphasizes rapid development (24-hour timeline) with a patriotic tricolor theme throughout.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           React Application (Vite)                 │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │ │
│  │  │ Translation  │  │    Price     │  │   AI    │ │ │
│  │  │   Module     │  │  Discovery   │  │ Negotia │ │ │
│  │  │              │  │   Module     │  │  tion   │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬────┘ │ │
│  │         │                 │                │      │ │
│  │         └─────────┬───────┴────────────────┘      │ │
│  │                   │                               │ │
│  │         ┌─────────▼─────────┐                     │ │
│  │         │  Shared Services  │                     │ │
│  │         │  - LocalStorage   │                     │ │
│  │         │  - Theme System   │                     │ │
│  │         │  - Utils          │                     │ │
│  │         └─────────┬─────────┘                     │ │
│  │                   │                               │ │
│  └───────────────────┼───────────────────────────────┘ │
│                      │                                  │
│         ┌────────────┼────────────┐                     │
│         │            │            │                     │
│    ┌────▼────┐  ┌───▼────┐  ┌───▼──────┐              │
│    │LocalStor│  │Clipboar│  │ Claude   │              │
│    │age API  │  │d API   │  │ API      │              │
│    └─────────┘  └────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Header (Republic Day branding)
├── TabNavigation
│   ├── TranslationTab
│   ├── PriceDiscoveryTab
│   └── NegotiationTab
└── Footer (Jai Hind message)

TranslationTab
├── LanguageSelector
├── TextInput
├── TranslateButton
├── TranslationOutput
├── CopyButton
├── PhraseLibrary
└── TranslationHistory

PriceDiscoveryTab
├── CommoditySelector
├── PriceCard (Min/Avg/Max)
├── TrendIndicator
├── PriceCalculator
└── ResultDisplay

NegotiationTab
├── ContextForm
│   ├── ProductInput
│   ├── AskingPriceInput
│   ├── BuyerOfferInput
│   └── QuantityInput
├── GenerateButton
├── StrategyList
└── QuickTips
```

## Components and Interfaces

### Translation Module

**TranslationService**
```typescript
interface TranslationEntry {
  id: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  translatedText: string;
  timestamp: number;
}

interface TranslationService {
  // Translate text to target language
  translate(text: string, targetLang: Language): Promise<string>;
  
  // Get pre-translated mandi phrase
  getMandiPhrase(phraseId: string, targetLang: Language): string;
  
  // Save translation to history
  saveToHistory(entry: TranslationEntry): void;
  
  // Retrieve translation history
  getHistory(): TranslationEntry[];
  
  // Copy text to clipboard
  copyToClipboard(text: string): Promise<boolean>;
}

type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn';

interface MandiPhrase {
  id: string;
  en: string;
  hi: string;
  te: string;
  ta: string;
  bn: string;
}
```

**Implementation Notes:**
- Use a translation map for common mandi phrases (10-15 pre-translated)
- For dynamic translation, use a simple translation API or library (e.g., Google Translate API via client, or a lightweight library)
- LocalStorage key: `mandimind_translation_history`
- History limited to last 50 entries to prevent storage bloat
- Clipboard API with fallback to document.execCommand for older browsers

### Price Discovery Module

**PriceService**
```typescript
interface Commodity {
  id: string;
  name: string;
  nameHi: string;
  nameTe: string;
  nameTa: string;
  nameBn: string;
  unit: string; // kg, quintal, dozen, etc.
  basePrice: number; // Base price for calculations
}

interface PriceData {
  commodity: Commodity;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface PriceCalculation {
  quantity: number;
  pricePerUnit: number;
  total: number;
  commodity: Commodity;
}

interface PriceService {
  // Get list of all commodities
  getCommodities(): Commodity[];
  
  // Get price data for a commodity
  getPriceData(commodityId: string): PriceData;
  
  // Calculate total price
  calculateTotal(commodityId: string, quantity: number, priceType: 'min' | 'avg' | 'max'): PriceCalculation;
  
  // Get price color coding
  getPriceColor(price: number, minPrice: number, maxPrice: number): 'red' | 'yellow' | 'green';
}
```

**Mock Data Generation:**
- 15-20 common commodities: Rice, Wheat, Tomatoes, Onions, Potatoes, Mangoes, Bananas, Apples, Milk, Eggs, Chicken, Fish, Lentils, Sugar, Tea, Coffee, Spices
- Base prices with ±10% random variation for min/max
- Average = (min + max) / 2
- Trend randomly assigned with 40% up, 40% down, 20% stable
- Prices regenerated on each page load for demo purposes

### AI Negotiation Assistant

**NegotiationService**
```typescript
interface NegotiationContext {
  product: string;
  askingPrice: number;
  buyerOffer: number;
  quantity: number;
  language: Language;
}

interface NegotiationStrategy {
  id: string;
  title: string;
  description: string;
  actionPoints: string[];
}

interface NegotiationService {
  // Generate strategies using Claude API
  generateStrategies(context: NegotiationContext): Promise<NegotiationStrategy[]>;
  
  // Get hardcoded quick tips
  getQuickTips(language: Language): string[];
  
  // Translate strategy to target language
  translateStrategy(strategy: NegotiationStrategy, targetLang: Language): Promise<NegotiationStrategy>;
}
```

**Claude API Integration:**
```typescript
interface ClaudeRequest {
  model: string; // claude-3-haiku-20240307 for speed
  max_tokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface ClaudeResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  stop_reason: string;
}
```

**Prompt Template:**
```
You are a negotiation expert helping Indian mandi vendors. Given:
- Product: {product}
- Asking Price: ₹{askingPrice}
- Buyer's Offer: ₹{buyerOffer}
- Quantity: {quantity} {unit}

Generate 3 practical negotiation strategies. Each strategy should:
1. Have a clear title
2. Provide 2-3 specific action points
3. Be culturally appropriate for Indian markets
4. Focus on win-win outcomes

Format as JSON array with structure:
[
  {
    "title": "Strategy name",
    "description": "Brief description",
    "actionPoints": ["Point 1", "Point 2", "Point 3"]
  }
]
```

**Hardcoded Quick Tips (Fallback):**
1. Start with a counter-offer 15-20% above buyer's offer
2. Highlight product quality and freshness
3. Offer bulk discounts for larger quantities
4. Build rapport by asking about buyer's needs
5. Be willing to meet halfway on price
6. Mention market rates to justify your price

### Theme System

**ThemeConfig**
```typescript
interface TricolorTheme {
  colors: {
    saffron: '#FF9933';
    white: '#FFFFFF';
    green: '#138808';
    navyBlue: '#000080';
    // Derived colors
    saffronLight: '#FFB366';
    greenLight: '#1AAA0A';
    grayLight: '#F5F5F5';
    grayDark: '#333333';
  };
  gradients: {
    tricolor: 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)';
    header: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)';
  };
  badges: {
    translation: 'Unity in Diversity 🇮🇳';
    priceDiscovery: 'Digital India 🚀';
    negotiation: 'Atmanirbhar Bharat 💪';
  };
}
```

**Tailwind Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        'saffron-light': '#FFB366',
        green: '#138808',
        'green-light': '#1AAA0A',
        'navy-blue': '#000080',
      },
      backgroundImage: {
        'tricolor': 'linear-gradient(to right, #FF9933, #FFFFFF, #138808)',
        'tricolor-header': 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
      },
    },
  },
}
```

### LocalStorage Schema

**Translation History:**
```typescript
// Key: mandimind_translation_history
{
  version: 1,
  entries: TranslationEntry[]
}
```

**User Preferences:**
```typescript
// Key: mandimind_preferences
{
  version: 1,
  lastSelectedLanguage: Language,
  lastSelectedTab: number
}
```

## Data Models

### Translation Models

```typescript
// Mandi phrases database
const MANDI_PHRASES: MandiPhrase[] = [
  {
    id: 'greeting',
    en: 'Good morning! How can I help you?',
    hi: 'सुप्रभात! मैं आपकी कैसे मदद कर सकता हूं?',
    te: 'శుభోదయం! నేను మీకు ఎలా సహాయం చేయగలను?',
    ta: 'காலை வணக்கம்! நான் உங்களுக்கு எப்படி உதவ முடியும்?',
    bn: 'সুপ্রভাত! আমি আপনাকে কিভাবে সাহায্য করতে পারি?'
  },
  {
    id: 'price_inquiry',
    en: 'What is the price per kg?',
    hi: 'प्रति किलो कीमत क्या है?',
    te: 'కిలో ధర ఎంత?',
    ta: 'கிலோ விலை என்ன?',
    bn: 'কিলো প্রতি দাম কত?'
  },
  {
    id: 'quality_check',
    en: 'This is fresh and high quality',
    hi: 'यह ताजा और उच्च गुणवत्ता का है',
    te: 'ఇది తాజా మరియు అధిక నాణ్యత',
    ta: 'இது புதிய மற்றும் உயர் தரம்',
    bn: 'এটি তাজা এবং উচ্চ মানের'
  },
  {
    id: 'bulk_discount',
    en: 'I can offer a discount for bulk purchase',
    hi: 'मैं थोक खरीद पर छूट दे सकता हूं',
    te: 'నేను పెద్ద మొత్తంలో కొనుగోలుకు తగ్గింపు ఇవ్వగలను',
    ta: 'மொத்த வாங்குதலுக்கு தள்ளுபடி தர முடியும்',
    bn: 'আমি বাল্ক ক্রয়ের জন্য ছাড় দিতে পারি'
  },
  {
    id: 'payment_terms',
    en: 'Cash or digital payment accepted',
    hi: 'नकद या डिजिटल भुगतान स्वीकार किया जाता है',
    te: 'నగదు లేదా డిజిటల్ చెల్లింపు అంగీకరించబడుతుంది',
    ta: 'பணம் அல்லது டிஜிட்டல் பணம் ஏற்கப்படும்',
    bn: 'নগদ বা ডিজিটাল পেমেন্ট গৃহীত'
  },
  {
    id: 'negotiation_start',
    en: 'Let us discuss the price',
    hi: 'आइए कीमत पर चर्चा करें',
    te: 'ధర గురించి చర్చిద్దాం',
    ta: 'விலையை பற்றி பேசுவோம்',
    bn: 'আসুন দাম নিয়ে আলোচনা করি'
  },
  {
    id: 'final_offer',
    en: 'This is my best price',
    hi: 'यह मेरी सबसे अच्छी कीमत है',
    te: 'ఇది నా ఉత్తమ ధర',
    ta: 'இது என் சிறந்த விலை',
    bn: 'এটি আমার সেরা দাম'
  },
  {
    id: 'thank_you',
    en: 'Thank you for your business!',
    hi: 'आपके व्यवसाय के लिए धन्यवाद!',
    te: 'మీ వ్యాపారానికి ధన్యవాదాలు!',
    ta: 'உங்கள் வணிகத்திற்கு நன்றி!',
    bn: 'আপনার ব্যবসার জন্য ধন্যবাদ!'
  },
  {
    id: 'delivery',
    en: 'Delivery available within city',
    hi: 'शहर के भीतर डिलीवरी उपलब्ध है',
    te: 'నగరంలో డెలివరీ అందుబాటులో ఉంది',
    ta: 'நகரத்திற்குள் டெலிவரி கிடைக்கும்',
    bn: 'শহরের মধ্যে ডেলিভারি উপলব্ধ'
  },
  {
    id: 'minimum_order',
    en: 'Minimum order is 5 kg',
    hi: 'न्यूनतम आदेश 5 किलो है',
    te: 'కనీస ఆర్డర్ 5 కిలోలు',
    ta: 'குறைந்தபட்ச ஆர்டர் 5 கிலோ',
    bn: 'ন্যূনতম অর্ডার 5 কেজি'
  }
];
```

### Commodity Models

```typescript
const COMMODITIES: Commodity[] = [
  { id: 'rice', name: 'Rice', nameHi: 'चावल', nameTe: 'బియ్యం', nameTa: 'அரிசி', nameBn: 'চাল', unit: 'kg', basePrice: 50 },
  { id: 'wheat', name: 'Wheat', nameHi: 'गेहूं', nameTe: 'గోధుమ', nameTa: 'கோதுமை', nameBn: 'গম', unit: 'kg', basePrice: 30 },
  { id: 'tomato', name: 'Tomatoes', nameHi: 'टमाटर', nameTe: 'టమోటాలు', nameTa: 'தக்காளி', nameBn: 'টমেটো', unit: 'kg', basePrice: 40 },
  { id: 'onion', name: 'Onions', nameHi: 'प्याज', nameTe: 'ఉల్లిపాయలు', nameTa: 'வெங்காயம்', nameBn: 'পেঁয়াজ', unit: 'kg', basePrice: 35 },
  { id: 'potato', name: 'Potatoes', nameHi: 'आलू', nameTe: 'బంగాళాదుంపలు', nameTa: 'உருளைக்கிழங்கு', nameBn: 'আলু', unit: 'kg', basePrice: 25 },
  { id: 'mango', name: 'Mangoes', nameHi: 'आम', nameTe: 'మామిడి', nameTa: 'மாம்பழம்', nameBn: 'আম', unit: 'kg', basePrice: 80 },
  { id: 'banana', name: 'Bananas', nameHi: 'केला', nameTe: 'అరటిపండ్లు', nameTa: 'வாழைப்பழம்', nameBn: 'কলা', unit: 'dozen', basePrice: 40 },
  { id: 'apple', name: 'Apples', nameHi: 'सेब', nameTe: 'ఆపిల్', nameTa: 'ஆப்பிள்', nameBn: 'আপেল', unit: 'kg', basePrice: 120 },
  { id: 'milk', name: 'Milk', nameHi: 'दूध', nameTe: 'పాలు', nameTa: 'பால்', nameBn: 'দুধ', unit: 'liter', basePrice: 60 },
  { id: 'egg', name: 'Eggs', nameHi: 'अंडे', nameTe: 'గుడ్లు', nameTa: 'முட்டை', nameBn: 'ডিম', unit: 'dozen', basePrice: 70 },
  { id: 'chicken', name: 'Chicken', nameHi: 'मुर्गी', nameTe: 'కోడి', nameTa: 'கோழி', nameBn: 'মুরগি', unit: 'kg', basePrice: 180 },
  { id: 'lentil', name: 'Lentils', nameHi: 'दाल', nameTe: 'పప్పు', nameTa: 'பருப்பு', nameBn: 'ডাল', unit: 'kg', basePrice: 90 },
  { id: 'sugar', name: 'Sugar', nameHi: 'चीनी', nameTe: 'చక్కెర', nameTa: 'சர்க்கரை', nameBn: 'চিনি', unit: 'kg', basePrice: 45 },
  { id: 'tea', name: 'Tea', nameHi: 'चाय', nameTe: 'టీ', nameTa: 'தேநீர்', nameBn: 'চা', unit: 'kg', basePrice: 400 },
  { id: 'coffee', name: 'Coffee', nameHi: 'कॉफी', nameTe: 'కాఫీ', nameTa: 'காபி', nameBn: 'কফি', unit: 'kg', basePrice: 600 },
  { id: 'turmeric', name: 'Turmeric', nameHi: 'हल्दी', nameTe: 'పసుపు', nameTa: 'மஞ்சள்', nameBn: 'হলুদ', unit: 'kg', basePrice: 150 },
  { id: 'chili', name: 'Chili', nameHi: 'मिर्च', nameTe: 'మిరపకాయ', nameTa: 'மிளகாய்', nameBn: 'মরিচ', unit: 'kg', basePrice: 200 },
  { id: 'coriander', name: 'Coriander', nameHi: 'धनिया', nameTe: 'కొత్తిమీర', nameTa: 'கொத்தமல்லி', nameBn: 'ধনে', unit: 'kg', basePrice: 80 }
];
```

### Price Generation Algorithm

```typescript
function generatePriceData(commodity: Commodity): PriceData {
  const variation = 0.10; // ±10%
  const avgPrice = commodity.basePrice;
  const minPrice = Math.round(avgPrice * (1 - variation));
  const maxPrice = Math.round(avgPrice * (1 + variation));
  
  // Random trend
  const rand = Math.random();
  const trend = rand < 0.4 ? 'up' : rand < 0.8 ? 'down' : 'stable';
  
  return {
    commodity,
    minPrice,
    avgPrice,
    maxPrice,
    trend,
    lastUpdated: Date.now()
  };
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several opportunities to consolidate redundant properties:

- **Translation persistence (1.4) and retrieval (1.5)**: These can be combined into a single round-trip property
- **Price calculation (2.3, 10.3)**: These are duplicate requirements and should be one property
- **Input validation (10.1, 10.4)**: These can be combined into a comprehensive input validation property
- **Clipboard functionality (1.6, 9.1)**: These are the same requirement and should be one property
- **Color coding consistency (4.1, 5.4, 5.5)**: These can be combined into a theme consistency property

### Translation Module Properties

**Property 1: Language selection state consistency**
*For any* supported language (Hindi, Telugu, Tamil, Bengali, English), when selected, the UI state should reflect that language as the active selection.
**Validates: Requirements 1.1**

**Property 2: Translation function completeness**
*For any* non-empty input text and any target language, the translation function should return a non-empty translated string.
**Validates: Requirements 1.2**

**Property 3: Phrase lookup correctness**
*For any* mandi phrase ID and any supported language, retrieving the phrase should return the correct translation for that language.
**Validates: Requirements 1.3**

**Property 4: Translation persistence round-trip**
*For any* translation entry, after storing it to localStorage and retrieving the history, the entry should appear in the retrieved history with all fields intact (source text, source language, target language, translated text, timestamp).
**Validates: Requirements 1.4, 1.5, 6.1, 6.4**

**Property 5: History chronological ordering**
*For any* set of translation entries with different timestamps, when displayed, they should be ordered with the newest timestamp first.
**Validates: Requirements 6.3**

**Property 6: Clipboard copy functionality**
*For any* translated text, after triggering the copy action, the system clipboard should contain that exact text.
**Validates: Requirements 1.6, 9.1**

**Property 7: Copy confirmation feedback**
*For any* successful copy operation, a visual confirmation message should be displayed to the user.
**Validates: Requirements 9.2**

**Property 8: Copy availability for all outputs**
*For any* translated output (dynamic translation, mandi phrase, or negotiation strategy), a copy button should be available.
**Validates: Requirements 9.3**

**Property 9: Clipboard fallback mechanism**
*For any* environment where the Clipboard API is unavailable, the system should provide an alternative text selection mechanism.
**Validates: Requirements 9.4**

### Price Discovery Module Properties

**Property 10: Price variation bounds**
*For any* commodity with base price P, the generated minimum price should be within [0.9P, P] and maximum price should be within [P, 1.1P].
**Validates: Requirements 2.1, 2.5**

**Property 11: Trend indicator presence**
*For any* commodity with price data, the display should include exactly one trend indicator (↑, ↓, or →) matching the trend value.
**Validates: Requirements 2.2**

**Property 12: Price calculation correctness**
*For any* positive quantity Q and price P, the calculated total should equal Q × P.
**Validates: Requirements 2.3, 10.2, 10.3**

**Property 13: Price color coding logic**
*For any* price within a commodity's min-max range, the color should be red if price ≤ (min + 0.33 × range), yellow if price is in the middle third, and green if price ≥ (min + 0.67 × range).
**Validates: Requirements 2.4**

**Property 14: Input validation for quantities**
*For any* quantity input, the system should accept it if and only if it is a positive number; zero or negative values should trigger an error message.
**Validates: Requirements 10.1, 10.4**

**Property 15: Currency formatting consistency**
*For any* calculated total, the displayed value should include the rupee symbol (₹) and be formatted to 2 decimal places.
**Validates: Requirements 10.5**

**Property 16: Mock data locality**
*For any* price data request, the data should be generated locally without making external network calls.
**Validates: Requirements 7.2**

### Negotiation Assistant Properties

**Property 17: Context parameter completeness**
*For any* negotiation request, the system should accept it if and only if all four parameters (product, asking price, buyer's offer, quantity) are provided and valid.
**Validates: Requirements 3.1**

**Property 18: Strategy generation count**
*For any* valid negotiation context when Claude API is available and responds successfully, exactly 3 unique strategies should be generated.
**Validates: Requirements 3.2**

**Property 19: Strategy translation**
*For any* generated strategy and any target language, the strategy should be translated to that language while preserving the structure (title, description, action points).
**Validates: Requirements 3.3**

**Property 20: Fallback tips on API failure**
*For any* negotiation request when Claude API is unavailable or fails, the system should display 5-6 hardcoded negotiation tips.
**Validates: Requirements 3.4**

### Theme and UI Properties

**Property 21: Tricolor theme consistency**
*For any* themed UI element (button, heading, accent), it should use one of the official tricolor colors (Saffron #FF9933, Green #138808, Navy Blue #000080, or White #FFFFFF).
**Validates: Requirements 4.1, 5.4, 5.5**

**Property 22: Responsive layout constraint**
*For any* viewport width greater than 1200px, the main content container width should be constrained to a maximum of 1200px.
**Validates: Requirements 5.2**

**Property 23: Mobile-first responsiveness**
*For any* viewport width from 320px to 1920px, all content should be readable and interactive without horizontal scrolling.
**Validates: Requirements 5.1**

**Property 24: Language display format**
*For any* language option in the selector, it should display both the English name and the native script name.
**Validates: Requirements 8.2**

**Property 25: UI language separation**
*For any* UI label or button text, it should be in English, while user-generated or translated content should be in the selected target language.
**Validates: Requirements 8.4**

### Data Integrity Properties

**Property 26: Translation entry completeness**
*For any* translation stored in localStorage, it should contain all required fields: id, sourceText, sourceLang, targetLang, translatedText, and timestamp.
**Validates: Requirements 6.4**

**Property 27: LocalStorage initialization**
*For any* application load, if translation history exists in localStorage, it should be retrieved and made available to the UI.
**Validates: Requirements 6.2**

## Error Handling

### Translation Module Errors

**Empty Input Handling:**
- When user attempts to translate empty or whitespace-only text, display message: "Please enter text to translate"
- Do not create history entry for failed translations
- Keep UI in ready state for next input

**LocalStorage Quota Exceeded:**
- When localStorage is full, remove oldest 10 entries and retry
- If still failing, display warning: "Storage full. Some history may be lost."
- Continue allowing new translations (just don't persist)

**Clipboard API Failure:**
- Fall back to document.execCommand('copy') for older browsers
- If both fail, display text in a modal with "Select and copy manually" instruction
- Log error to console for debugging

### Price Discovery Module Errors

**Invalid Quantity Input:**
- When quantity is zero, negative, or non-numeric, display: "Please enter a valid positive quantity"
- Disable calculate button until valid input provided
- Clear previous calculation results

**Missing Price Selection:**
- When user tries to calculate without selecting price type, highlight price cards with animation
- Display message: "Please select a price (Min, Avg, or Max)"

### Negotiation Assistant Errors

**Incomplete Context:**
- When any of the 4 required fields is missing, highlight empty fields in red
- Display message: "Please fill in all fields: product, asking price, buyer's offer, and quantity"
- Disable generate button until all fields valid

**Claude API Errors:**
- Network timeout (>10s): Fall back to hardcoded tips immediately
- API error response: Log error, show hardcoded tips with message "Using offline tips"
- Invalid API key: Show hardcoded tips with message "AI features unavailable"
- Rate limit exceeded: Show hardcoded tips with message "Too many requests. Try again later."

**Invalid Price Values:**
- When asking price or buyer offer is zero or negative, display: "Prices must be positive numbers"
- When buyer offer > asking price, display warning: "Buyer's offer is higher than asking price. Are you sure?"

### General Error Handling

**Network Errors:**
- Only Claude API requires network; all other features work offline
- Display connection status indicator when API calls are in progress
- Timeout all API calls after 10 seconds

**Browser Compatibility:**
- Detect missing Clipboard API and use fallback automatically
- Detect missing localStorage and show warning: "History features disabled"
- Test for ES6 support; show upgrade message if missing

**Data Corruption:**
- When localStorage data is malformed, clear it and start fresh
- Log corruption details to console
- Display message: "History reset due to data error"

## Testing Strategy

### Overview

MandiMind uses a dual testing approach combining unit tests for specific examples and edge cases with property-based tests for universal correctness properties. This ensures both concrete functionality and general correctness across all inputs.

### Property-Based Testing

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- Minimum 100 iterations per property test to ensure comprehensive input coverage
- Each property test must reference its design document property number

**Test Tagging Format:**
```javascript
// Feature: mandimind, Property 4: Translation persistence round-trip
test('translation round-trip preserves all fields', () => {
  fc.assert(
    fc.property(
      fc.record({
        sourceText: fc.string({ minLength: 1 }),
        sourceLang: fc.constantFrom('en', 'hi', 'te', 'ta', 'bn'),
        targetLang: fc.constantFrom('en', 'hi', 'te', 'ta', 'bn'),
        translatedText: fc.string({ minLength: 1 })
      }),
      (entry) => {
        // Store to localStorage
        saveTranslation(entry);
        
        // Retrieve from localStorage
        const history = getHistory();
        
        // Should find entry with all fields intact
        const found = history.find(h => 
          h.sourceText === entry.sourceText &&
          h.sourceLang === entry.sourceLang &&
          h.targetLang === entry.targetLang &&
          h.translatedText === entry.translatedText
        );
        
        expect(found).toBeDefined();
        expect(found.timestamp).toBeGreaterThan(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test Coverage:**
- Each of the 27 correctness properties should have at least one property-based test
- Properties 1-9: Translation module (9 tests)
- Properties 10-16: Price discovery module (7 tests)
- Properties 17-20: Negotiation assistant (4 tests)
- Properties 21-25: Theme and UI (5 tests)
- Properties 26-27: Data integrity (2 tests)

### Unit Testing

**Unit Test Focus:**
- Specific examples demonstrating correct behavior
- Edge cases (empty strings, boundary values, special characters)
- Error conditions and error messages
- Integration between components
- UI interactions and state changes

**Example Unit Tests:**

```javascript
// Specific example: Republic Day header content
test('displays Republic Day header with flag', () => {
  render(<Header />);
  expect(screen.getByText(/India's 77th Republic Day Special/i)).toBeInTheDocument();
  expect(screen.getByText(/🇮🇳/)).toBeInTheDocument();
});

// Edge case: empty translation input
test('rejects empty translation input', () => {
  render(<TranslationTab />);
  const input = screen.getByRole('textbox');
  const button = screen.getByRole('button', { name: /translate/i });
  
  fireEvent.change(input, { target: { value: '   ' } });
  fireEvent.click(button);
  
  expect(screen.getByText(/please enter text/i)).toBeInTheDocument();
});

// Error condition: negative quantity
test('shows error for negative quantity', () => {
  render(<PriceCalculator />);
  const quantityInput = screen.getByLabelText(/quantity/i);
  
  fireEvent.change(quantityInput, { target: { value: '-5' } });
  
  expect(screen.getByText(/valid positive quantity/i)).toBeInTheDocument();
});
```

**Unit Test Coverage:**
- Translation module: 15-20 unit tests
- Price discovery module: 15-20 unit tests
- Negotiation assistant: 10-15 unit tests
- Theme and UI: 10-15 unit tests
- Error handling: 10-15 unit tests

### Testing Balance

**Avoid Over-Testing:**
- Don't write exhaustive unit tests for every possible input combination
- Property-based tests handle comprehensive input coverage
- Unit tests should focus on:
  - Specific examples that clarify requirements
  - Edge cases that property tests might miss
  - Error conditions and user-facing messages
  - Integration points between modules

**Complementary Approach:**
- Unit tests catch concrete bugs in specific scenarios
- Property tests verify general correctness across all inputs
- Together they provide comprehensive coverage without redundancy

### Test Execution

**Development Workflow:**
```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm test -- --watch

# Run only property-based tests
npm test -- --testNamePattern="Property"

# Run only unit tests
npm test -- --testNamePattern="Unit"

# Run tests with coverage
npm test -- --coverage
```

**CI/CD Integration:**
- All tests must pass before deployment
- Property tests run with 100 iterations in CI
- Coverage target: 80% for core business logic
- UI components: 60% coverage (focus on interactions, not styling)

### Mock Data for Testing

**Translation Mocks:**
```javascript
const mockTranslations = {
  'hello': { hi: 'नमस्ते', te: 'హలో', ta: 'வணக்கம்', bn: 'হ্যালো' },
  'thank you': { hi: 'धन्यवाद', te: 'ధన్యవాదాలు', ta: 'நன்றி', bn: 'ধন্যবাদ' }
};
```

**Price Data Mocks:**
```javascript
const mockCommodity = {
  id: 'rice',
  name: 'Rice',
  unit: 'kg',
  basePrice: 50
};

const mockPriceData = {
  commodity: mockCommodity,
  minPrice: 45,
  avgPrice: 50,
  maxPrice: 55,
  trend: 'up',
  lastUpdated: Date.now()
};
```

**Claude API Mocks:**
```javascript
const mockStrategies = [
  {
    id: '1',
    title: 'Quality Emphasis',
    description: 'Highlight product quality',
    actionPoints: ['Show freshness', 'Mention grade', 'Compare with market']
  },
  {
    id: '2',
    title: 'Volume Discount',
    description: 'Offer bulk pricing',
    actionPoints: ['Calculate bulk rate', 'Show savings', 'Suggest larger order']
  },
  {
    id: '3',
    title: 'Market Rate Justification',
    description: 'Reference current market prices',
    actionPoints: ['Cite market rates', 'Explain price factors', 'Show value proposition']
  }
];
```

### Performance Testing

**Load Time Targets:**
- Initial page load: < 2 seconds
- Tab switching: < 100ms
- Translation: < 500ms
- Price calculation: < 50ms
- Claude API call: < 5 seconds (with 10s timeout)

**Performance Monitoring:**
- Use React DevTools Profiler to identify slow renders
- Monitor localStorage operations (should be < 10ms)
- Track API call durations
- Measure bundle size (target: < 500KB gzipped)

### Accessibility Testing

**WCAG 2.1 Level AA Compliance:**
- All interactive elements keyboard accessible
- Color contrast ratios meet AA standards
- Screen reader compatible
- Focus indicators visible
- ARIA labels on all form inputs

**Testing Tools:**
- axe-core for automated accessibility testing
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

### Browser Compatibility Testing

**Target Browsers:**
- Chrome 90+ (primary)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+

**Compatibility Tests:**
- Clipboard API fallback for older browsers
- LocalStorage availability check
- CSS Grid and Flexbox support
- ES6 features (with Babel transpilation)
