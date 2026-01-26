# Requirements Document: MandiMind

## Introduction

MandiMind is a multilingual mandi (market) platform celebrating India's 77th Republic Day (26 January 2026). The system helps India's 50M+ vendors overcome language barriers through real-time translation, price discovery, and AI-powered negotiation assistance. Built as a 24-hour hackathon project, it emphasizes rapid delivery of core features with a patriotic tricolor theme.

## Glossary

- **Translation_Module**: Component that converts text between English and 5 Indian languages (Hindi, Telugu, Tamil, Bengali, English)
- **Price_Discovery_Module**: Component that displays mock commodity prices with trends and calculations
- **Negotiation_Assistant**: Component that generates negotiation strategies using Claude API
- **LocalStorage**: Browser-based persistent storage for translation history
- **Commodity**: Agricultural or market product (e.g., rice, wheat, tomatoes)
- **Mandi_Phrase**: Common market-related expression used by vendors
- **Price_Trend**: Indicator showing price movement (up, down, stable)
- **Tricolor_Theme**: Design system using India's flag colors (Saffron #FF9933, White #FFFFFF, Green #138808, Navy Blue #000080)

## Requirements

### Requirement 1: Real-time Translation

**User Story:** As a mandi vendor, I want to translate text between English and Indian languages, so that I can communicate with customers who speak different languages.

#### Acceptance Criteria

1. WHEN a user selects a target language from the 5 supported languages (Hindi, Telugu, Tamil, Bengali, English), THE Translation_Module SHALL display the language selector with the selected language highlighted
2. WHEN a user enters text in the input textarea and triggers translation, THE Translation_Module SHALL translate the text to the selected target language
3. WHEN a user selects a pre-translated mandi phrase from the list of 10-15 phrases, THE Translation_Module SHALL display the phrase in the selected language
4. WHEN a translation is completed, THE Translation_Module SHALL store the translation entry in LocalStorage with timestamp
5. WHEN a user views translation history, THE Translation_Module SHALL retrieve and display all stored translations from LocalStorage
6. WHEN a user clicks the copy button on a translated text, THE Translation_Module SHALL copy the text to the system clipboard

### Requirement 2: Price Discovery

**User Story:** As a mandi vendor, I want to view current market prices for commodities, so that I can make informed pricing decisions.

#### Acceptance Criteria

1. WHEN a user selects a commodity from the list of 15-20 products, THE Price_Discovery_Module SHALL display minimum, average, and maximum prices with ±10% variation
2. WHEN prices are displayed, THE Price_Discovery_Module SHALL show price trend indicators (↑ for increase, ↓ for decrease, → for stable)
3. WHEN a user enters quantity and selects a price point, THE Price_Discovery_Module SHALL calculate the total as Quantity × Price
4. WHEN displaying price cards, THE Price_Discovery_Module SHALL apply color coding (Red for low prices, Yellow for mid-range, Green for high prices)
5. THE Price_Discovery_Module SHALL generate mock price data with realistic variations for all commodities

### Requirement 3: AI Negotiation Assistant

**User Story:** As a mandi vendor, I want negotiation strategy suggestions, so that I can negotiate better deals with buyers.

#### Acceptance Criteria

1. WHEN a user provides negotiation context (product, asking price, buyer's offer, quantity), THE Negotiation_Assistant SHALL accept all four input parameters
2. WHERE Claude API is available, WHEN negotiation context is submitted, THE Negotiation_Assistant SHALL generate 3 unique negotiation strategies using the API
3. WHEN negotiation strategies are generated, THE Negotiation_Assistant SHALL translate the strategies to the user's selected language
4. IF Claude API is unavailable or fails, THEN THE Negotiation_Assistant SHALL display 5-6 hardcoded quick negotiation tips
5. THE Negotiation_Assistant SHALL display strategies in an easy-to-read format with clear action points

### Requirement 4: Republic Day Theme

**User Story:** As a user celebrating Republic Day, I want to see patriotic design elements, so that the platform reflects the national celebration.

#### Acceptance Criteria

1. THE System SHALL apply the Tricolor_Theme color scheme (Saffron #FF9933, White #FFFFFF, Green #138808, Navy Blue #000080) throughout the interface
2. THE System SHALL display a header containing "India's 77th Republic Day Special" text and 🇮🇳 flag emoji
3. THE System SHALL display "26 January 2026" date badge prominently
4. THE System SHALL display feature badges: "Unity in Diversity 🇮🇳" for Translation_Module, "Digital India 🚀" for Price_Discovery_Module, "Atmanirbhar Bharat 💪" for Negotiation_Assistant
5. THE System SHALL display "Jai Hind" message in the footer
6. THE System SHALL include "77" anniversary badges on feature sections

### Requirement 5: User Interface and Responsiveness

**User Story:** As a mobile user, I want the platform to work well on my device, so that I can access it anywhere in the mandi.

#### Acceptance Criteria

1. WHEN the application is viewed on any device, THE System SHALL render a mobile-first responsive layout
2. WHEN the viewport width exceeds 1200px, THE System SHALL constrain the maximum content width to 1200px
3. THE System SHALL organize features into 3 tabs with patriotic icons for easy navigation
4. THE System SHALL apply consistent styling: saffron buttons, green accents, navy blue headings
5. THE System SHALL display tricolor gradient headers on major sections

### Requirement 6: Data Persistence

**User Story:** As a returning user, I want my translation history saved, so that I can reference previous translations.

#### Acceptance Criteria

1. WHEN a translation is completed, THE System SHALL persist the translation to LocalStorage immediately
2. WHEN the application loads, THE System SHALL retrieve translation history from LocalStorage
3. WHEN LocalStorage contains translation history, THE System SHALL display the history in reverse chronological order (newest first)
4. THE System SHALL store each translation with text, source language, target language, translated text, and timestamp

### Requirement 7: Client-Side Architecture

**User Story:** As a hackathon participant, I want a deployable client-side application, so that I can quickly deploy without backend infrastructure.

#### Acceptance Criteria

1. THE System SHALL run entirely in the browser without requiring a backend server
2. THE System SHALL use mock data for price information without external API calls
3. WHERE Claude API is used, THE System SHALL make API calls directly from the client
4. THE System SHALL be deployable to Vercel as a static site
5. THE System SHALL load and render the initial view within 3 seconds on standard broadband connections

### Requirement 8: Language Support

**User Story:** As a vendor speaking regional languages, I want support for my native language, so that I can use the platform comfortably.

#### Acceptance Criteria

1. THE Translation_Module SHALL support exactly 5 languages: Hindi, Telugu, Tamil, Bengali, and English
2. WHEN displaying language options, THE Translation_Module SHALL show language names in both English and native script
3. THE Translation_Module SHALL maintain translation accuracy for common mandi terminology across all supported languages
4. THE System SHALL display UI labels and buttons in English with translated content in the selected language

### Requirement 9: Copy and Share Functionality

**User Story:** As a vendor, I want to copy translated text, so that I can share it via messaging apps with customers.

#### Acceptance Criteria

1. WHEN a user clicks a copy button next to translated text, THE System SHALL copy the text to the system clipboard
2. WHEN text is successfully copied, THE System SHALL display a visual confirmation message
3. THE System SHALL provide copy functionality for all translated outputs including mandi phrases and negotiation strategies
4. WHEN the clipboard API is unavailable, THE System SHALL provide a fallback selection mechanism

### Requirement 10: Price Calculator

**User Story:** As a vendor, I want to calculate total prices for quantities, so that I can quickly quote prices to buyers.

#### Acceptance Criteria

1. WHEN a user enters a quantity value, THE Price_Discovery_Module SHALL accept positive numeric input
2. WHEN a user selects a price point (minimum, average, or maximum), THE Price_Discovery_Module SHALL use that price for calculation
3. WHEN both quantity and price are provided, THE Price_Discovery_Module SHALL calculate total as Quantity × Price and display the result
4. WHEN quantity is zero or negative, THE Price_Discovery_Module SHALL display an error message and prevent calculation
5. THE Price_Discovery_Module SHALL format calculated totals with appropriate currency symbols and decimal places
