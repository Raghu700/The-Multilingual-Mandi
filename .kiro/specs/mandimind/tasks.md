# Implementation Plan: MandiMind

## Overview

This implementation plan breaks down the MandiMind Republic Day hackathon project into discrete, incremental coding tasks. The approach prioritizes getting core features working quickly, with testing integrated throughout. Each task builds on previous work, ensuring no orphaned code. The implementation uses React + Vite + Tailwind CSS + TypeScript.

## Tasks

- [x] 1. Project setup and foundation
  - Initialize Vite + React + TypeScript project
  - Configure Tailwind CSS with custom tricolor theme colors
  - Set up project structure: components/, services/, types/, utils/
  - Install dependencies: lucide-react for icons, fast-check for property testing
  - Create base types and interfaces (Language, TranslationEntry, Commodity, PriceData)
  - _Requirements: 7.1, 7.4_

- [ ] 2. Implement Republic Day theme system
  - [x] 2.1 Create theme configuration with tricolor colors
    - Define Tailwind config with saffron (#FF9933), green (#138808), navy blue (#000080)
    - Create tricolor gradient utilities
    - _Requirements: 4.1_
  
  - [x] 2.2 Build Header component with Republic Day branding
    - Display "India's 77th Republic Day Special" with 🇮🇳 flag
    - Add "26 January 2026" date badge
    - Apply tricolor gradient background
    - _Requirements: 4.2, 4.3_
  
  - [x] 2.3 Build Footer component
    - Display "Jai Hind" message
    - Apply patriotic styling
    - _Requirements: 4.5_
  
  - [~] 2.4 Write unit tests for theme components
    - Test header displays correct text and flag
    - Test footer displays "Jai Hind"
    - Test date badge shows "26 January 2026"
    - _Requirements: 4.2, 4.3, 4.5_

- [ ] 3. Build tab navigation system
  - [x] 3.1 Create TabNavigation component
    - Implement 3 tabs: Translation, Price Discovery, Negotiation
    - Add patriotic icons using lucide-react
    - Apply saffron button styling for active tab
    - _Requirements: 5.3_
  
  - [x] 3.2 Create tab content containers
    - Set up routing/state for tab switching
    - Ensure mobile-responsive layout
    - Apply max-width constraint (1200px)
    - _Requirements: 5.1, 5.2_
  
  - [~] 3.3 Write property test for responsive layout
    - **Property 22: Responsive layout constraint**
    - **Validates: Requirements 5.2**
  
  - [~] 3.4 Write property test for mobile responsiveness
    - **Property 23: Mobile-first responsiveness**
    - **Validates: Requirements 5.1**

- [x] 4. Implement Translation Module data layer
  - [x] 4.1 Create mandi phrases database
    - Define 10 pre-translated phrases in all 5 languages
    - Include common phrases: greetings, price inquiry, quality, bulk discount, payment, negotiation, thank you, delivery, minimum order
    - _Requirements: 1.3, 8.1_
  
  - [x] 4.2 Implement TranslationService
    - Create translate() function (use simple translation map or library)
    - Create getMandiPhrase() function for phrase lookup
    - Create saveToHistory() function for localStorage persistence
    - Create getHistory() function to retrieve translations
    - _Requirements: 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.3 Implement localStorage utilities
    - Create functions to read/write translation history
    - Handle localStorage quota exceeded errors
    - Limit history to 50 entries
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.4 Write property test for phrase lookup
    - **Property 3: Phrase lookup correctness**
    - **Validates: Requirements 1.3**
  
  - [x] 4.5 Write property test for translation persistence
    - **Property 4: Translation persistence round-trip**
    - **Validates: Requirements 1.4, 1.5, 6.1, 6.4**
  
  - [x] 4.6 Write property test for history ordering
    - **Property 5: History chronological ordering**
    - **Validates: Requirements 6.3**

- [x] 5. Build Translation Module UI components
  - [x] 5.1 Create LanguageSelector component
    - Display 5 languages with English and native names
    - Highlight selected language
    - Add "Unity in Diversity 🇮🇳" badge
    - _Requirements: 1.1, 4.4, 8.1, 8.2_
  
  - [x] 5.2 Create TextInput and TranslateButton components
    - Build textarea for input
    - Add translate button with saffron styling
    - Handle empty input validation
    - _Requirements: 1.2_
  
  - [x] 5.3 Create TranslationOutput component
    - Display translated text
    - Add copy-to-clipboard button
    - Show copy confirmation message
    - _Requirements: 1.6, 9.1, 9.2_
  
  - [x] 5.4 Create PhraseLibrary component
    - Display list of 10 mandi phrases
    - Make phrases clickable to auto-translate
    - _Requirements: 1.3_
  
  - [x] 5.5 Create TranslationHistory component
    - Display history in reverse chronological order
    - Show source/target languages and timestamp
    - Add copy buttons for each entry
    - _Requirements: 1.5, 9.3_
  
  - [x] 5.6 Wire Translation components together
    - Connect all components in TranslationTab
    - Implement state management with useState
    - Handle translation flow from input to output to history
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 5.7 Write property test for language selection
    - **Property 1: Language selection state consistency**
    - **Validates: Requirements 1.1**
  
  - [x] 5.8 Write property test for clipboard functionality
    - **Property 6: Clipboard copy functionality**
    - **Validates: Requirements 1.6, 9.1**
  
  - [x] 5.9 Write unit tests for Translation UI
    - Test empty input shows error message
    - Test phrase selection triggers translation
    - Test copy confirmation appears
    - _Requirements: 1.2, 1.3, 9.2_

- [x] 6. Checkpoint - Translation module complete
  - Ensure all translation tests pass, verify UI works on mobile and desktop, ask the user if questions arise.

- [x] 7. Implement Price Discovery Module data layer
  - [x] 7.1 Create commodities database
    - Define 18 commodities with names in all 5 languages
    - Include: rice, wheat, tomato, onion, potato, mango, banana, apple, milk, egg, chicken, lentil, sugar, tea, coffee, turmeric, chili, coriander
    - Set base prices and units for each
    - _Requirements: 2.1, 2.5_
  
  - [x] 7.2 Implement PriceService
    - Create getCommodities() function
    - Create getPriceData() function with ±10% variation logic
    - Create calculateTotal() function for quantity × price
    - Create getPriceColor() function for color coding
    - Generate random trends (40% up, 40% down, 20% stable)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 7.3 Write property test for price variation bounds
    - **Property 10: Price variation bounds**
    - **Validates: Requirements 2.1, 2.5**
  
  - [x] 7.4 Write property test for price calculation
    - **Property 12: Price calculation correctness**
    - **Validates: Requirements 2.3, 10.2, 10.3**
  
  - [x] 7.5 Write property test for color coding logic
    - **Property 13: Price color coding logic**
    - **Validates: Requirements 2.4**
  
  - [x] 7.6 Write property test for mock data locality
    - **Property 16: Mock data locality**
    - **Validates: Requirements 7.2**

- [x] 8. Build Price Discovery Module UI components
  - [x] 8.1 Create CommoditySelector component
    - Display dropdown/list of 18 commodities
    - Show commodity names in selected language
    - Add "Digital India 🚀" badge
    - _Requirements: 2.1, 4.4_
  
  - [x] 8.2 Create PriceCard component
    - Display min, avg, max prices
    - Apply color coding (red/yellow/green)
    - Show trend indicators (↑ ↓ →)
    - Make cards clickable for calculator
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 8.3 Create PriceCalculator component
    - Add quantity input with validation
    - Add price type selector (min/avg/max)
    - Display calculated total with ₹ symbol
    - Handle zero/negative quantity errors
    - _Requirements: 2.3, 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 8.4 Wire Price Discovery components together
    - Connect all components in PriceDiscoveryTab
    - Implement state management
    - Handle commodity selection → price display → calculation flow
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 8.5 Write property test for input validation
    - **Property 14: Input validation for quantities**
    - **Validates: Requirements 10.1, 10.4**
  
  - [x] 8.6 Write property test for currency formatting
    - **Property 15: Currency formatting consistency**
    - **Validates: Requirements 10.5**
  
  - [x] 8.7 Write unit tests for Price Discovery UI
    - Test negative quantity shows error
    - Test calculation displays correct total
    - Test trend indicators appear correctly
    - _Requirements: 10.4, 2.3, 2.2_

- [x] 9. Checkpoint - Price Discovery module complete
  - Ensure all price discovery tests pass, verify calculations work correctly, ask the user if questions arise.

- [x] 10. Implement Negotiation Assistant Module
  - [x] 10.1 Create hardcoded negotiation tips
    - Define 5-6 quick tips in English
    - Create translation function for tips
    - _Requirements: 3.4_
  
  - [x] 10.2 Implement NegotiationService
    - Create generateStrategies() function with Claude API integration
    - Create getQuickTips() function for fallback
    - Create translateStrategy() function
    - Handle API errors and timeouts (10s)
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [x] 10.3 Set up Claude API client
    - Configure API endpoint and authentication
    - Create prompt template for negotiation strategies
    - Parse JSON response into strategy objects
    - Implement error handling and fallback
    - _Requirements: 3.2_
  
  - [x] 10.4 Write property test for context validation
    - **Property 17: Context parameter completeness**
    - **Validates: Requirements 3.1**
  
  - [x] 10.5 Write property test for strategy count
    - **Property 18: Strategy generation count**
    - **Validates: Requirements 3.2**
  
  - [x] 10.6 Write property test for fallback tips
    - **Property 20: Fallback tips on API failure**
    - **Validates: Requirements 3.4**

- [x] 11. Build Negotiation Assistant UI components
  - [x] 11.1 Create ContextForm component
    - Add inputs for product, asking price, buyer's offer, quantity
    - Validate all fields are filled
    - Highlight empty fields in red
    - Add "Atmanirbhar Bharat 💪" badge
    - _Requirements: 3.1, 4.4_
  
  - [x] 11.2 Create GenerateButton and loading state
    - Add generate button with saffron styling
    - Show loading indicator during API call
    - Disable button while loading
    - _Requirements: 3.2_
  
  - [x] 11.3 Create StrategyList component
    - Display 3 strategies with titles and action points
    - Format strategies in easy-to-read cards
    - Add copy buttons for each strategy
    - _Requirements: 3.2, 3.5, 9.3_
  
  - [x] 11.4 Create QuickTips component
    - Display 5-6 hardcoded tips
    - Show when API fails or as alternative
    - _Requirements: 3.4_
  
  - [x] 11.5 Wire Negotiation components together
    - Connect all components in NegotiationTab
    - Implement state management
    - Handle form submission → API call → strategy display flow
    - Handle API errors → fallback tips flow
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 11.6 Write unit tests for Negotiation UI
    - Test incomplete form shows error
    - Test API failure shows hardcoded tips
    - Test strategies display with action points
    - _Requirements: 3.1, 3.4, 3.5_

- [x] 12. Implement clipboard functionality with fallback
  - [x] 12.1 Create clipboard utility
    - Implement copyToClipboard() with Clipboard API
    - Add fallback using document.execCommand
    - Add fallback using text selection modal
    - _Requirements: 1.6, 9.1, 9.4_
  
  - [x] 12.2 Write property test for clipboard fallback
    - **Property 9: Clipboard fallback mechanism**
    - **Validates: Requirements 9.4**

- [x] 13. Implement responsive design and theme consistency
  - [x] 13.1 Add responsive breakpoints
    - Test on mobile (320px-768px)
    - Test on tablet (768px-1024px)
    - Test on desktop (1024px+)
    - Ensure no horizontal scrolling
    - _Requirements: 5.1, 5.2_
  
  - [x] 13.2 Apply consistent theme styling
    - Ensure all buttons use saffron color
    - Ensure all headings use navy blue
    - Ensure all accents use green
    - Add tricolor gradients to section headers
    - _Requirements: 4.1, 5.4, 5.5_
  
  - [x] 13.3 Write property test for theme consistency
    - **Property 21: Tricolor theme consistency**
    - **Validates: Requirements 4.1, 5.4, 5.5**

- [x] 14. Add "77" anniversary badges and final Republic Day touches
  - [x] 14.1 Add "77" badges to feature sections
    - Add badge to Translation module
    - Add badge to Price Discovery module
    - Add badge to Negotiation module
    - _Requirements: 4.6_
  
  - [x] 14.2 Add Ashoka Chakra or Indian motifs
    - Add subtle background pattern or watermark
    - Ensure it doesn't interfere with readability
    - _Requirements: 4.1_
  
  - [x] 14.3 Write unit tests for Republic Day elements
    - Test all badges display correctly
    - Test "77" appears in all feature sections
    - _Requirements: 4.4, 4.6_

- [x] 15. Final integration and polish
  - [x] 15.1 Wire all modules into main App component
    - Integrate Header, TabNavigation, Footer
    - Set up initial state and preferences
    - Load translation history on mount
    - _Requirements: 6.2_
  
  - [x] 15.2 Add error boundaries
    - Wrap each module in error boundary
    - Display friendly error messages
    - Log errors to console
    - _Requirements: Error Handling_
  
  - [x] 15.3 Optimize performance
    - Lazy load tab content
    - Memoize expensive calculations
    - Optimize re-renders with React.memo
    - _Requirements: 7.5_
  
  - [x] 15.4 Write integration tests
    - Test full translation flow
    - Test full price calculation flow
    - Test full negotiation flow
    - _Requirements: 1.1-1.6, 2.1-2.5, 3.1-3.4_

- [x] 16. Final checkpoint - Complete application
  - Run all tests (unit + property tests)
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile devices
  - Verify all Republic Day theme elements present
  - Verify all 3 modules working correctly
  - Ensure application is ready for Vercel deployment
  - Ask the user if questions arise or if ready to deploy

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties (27 properties total)
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation prioritizes getting features working quickly for the 24-hour hackathon timeline
- All code should be production-ready with proper error handling
- Focus on mobile-first responsive design throughout
