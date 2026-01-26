# Requirements Document: MandiMind Exchange

## Introduction

MandiMind Exchange reimagines India's traditional mandi as a **real-time digital trading floor** celebrating India's 77th Republic Day (26 January 2026). The platform transforms static price discovery into a dynamic bidding exchange where 50M+ vendors can post offers, buyers can counter-bid, and deals happen through multilingual negotiation. Built as a 24-hour hackathon project with a focus on creating an engaging, powerful trading experience.

## Vision Statement

**"From Static Prices to Live Trading: India's First Voice-of-the-Mandi Exchange"**

The platform creates a live exchange board where:
- **Sellers post ASK prices** (what they're willing to sell for)
- **Buyers post BID prices** (what they're willing to pay)
- **The spread narrows** through real-time negotiation
- **Deals close** when bid meets ask
- **All in 5+ languages** with AI-powered negotiation coaching

## Glossary

- **Exchange_Board**: Real-time display of active bids and asks across all commodities
- **Ask_Price**: Seller's listing price (what they want to receive)
- **Bid_Price**: Buyer's offer price (what they're willing to pay)
- **Spread**: Difference between highest bid and lowest ask (₹Ask - ₹Bid)
- **Order_Book**: List of all active bids/asks for a specific commodity, sorted by price
- **Match_Engine**: System that automatically matches compatible bids and asks
- **Trade_Notification**: Alert when a bid/ask match occurs or is close
- **Negotiation_Room**: Private chat space where buyer-seller negotiate in real-time
- **Market_Depth**: Visual representation of buy/sell volume at different price levels
- **Price_Momentum**: Indicator showing whether recent trades are trending up/down
- **Multilingual_Board**: Exchange interface supporting 5 Indian languages simultaneously
- **AI_Coach**: Claude-powered assistant suggesting optimal bid/ask strategies
- **Quick_Counter**: One-click interface to counter-offer with suggested prices

## Core Requirements

### Requirement 1: Live Exchange Board

**User Story:** As a vendor, I want to see live market activity across all commodities, so that I can spot opportunities and understand real-time demand/supply.

#### Acceptance Criteria

1. WHEN a user opens the Exchange Board, THE System SHALL display a grid/list of all 15-20 commodities with:
   - Current highest BID price (what buyers offer)
   - Current lowest ASK price (what sellers want)
   - The SPREAD (difference) highlighted
   - Number of active bids and asks
   - Price momentum indicator (↑↑ strong up, ↑ up, → stable, ↓ down, ↓↓ strong down)
   - Last trade price and time

2. WHEN new bids or asks are posted, THE Exchange Board SHALL update within 1 second using WebSocket-style simulation (client-side mock updates)

3. WHEN the spread is narrow (< 5% difference), THE System SHALL highlight that commodity as "HOT DEAL" with animated border

4. WHEN a user clicks on a commodity, THE System SHALL navigate to detailed Order Book view for that commodity

5. THE Exchange Board SHALL auto-refresh market data every 3-5 seconds to simulate live market activity

6. THE Exchange Board SHALL display total daily volume (simulated) for each commodity

### Requirement 2: Order Book Interface

**User Story:** As a trader, I want to see all active bids and asks for a commodity, so that I can understand market depth and make informed decisions.

#### Acceptance Criteria

1. WHEN a user views an Order Book, THE System SHALL display two columns:
   - **BUY SIDE**: All active bids sorted highest to lowest
   - **SELL SIDE**: All active asks sorted lowest to highest
   
2. EACH order entry SHALL show:
   - Price per unit
   - Quantity available/wanted
   - Total value (Price × Quantity)
   - Time posted
   - Trader type (Buyer/Seller)
   - Anonymous trader ID (B-1234, S-5678)

3. THE Order Book SHALL use visual depth bars showing relative volume at each price level

4. WHEN bids and asks at matching prices exist, THE System SHALL highlight the potential match zone

5. THE Order Book SHALL include a mid-market price indicator (average of best bid and best ask)

6. THE System SHALL allow filtering orders by:
   - Minimum quantity
   - Posted within last hour/day
   - Price range

### Requirement 3: Quick Bid/Ask Posting

**User Story:** As a vendor, I want to quickly post my ask price, so that buyers can see my offer and potentially buy.

#### Acceptance Criteria

1. WHEN a user clicks "POST ASK" or "POST BID", THE System SHALL display a quick-entry form with:
   - Commodity selector (with autocomplete)
   - Price input (with smart defaults based on current market)
   - Quantity input
   - Unit selector (kg, quintal, dozen, etc.)
   - Optional: Minimum order quantity
   - Optional: Validity period (1 hour, 4 hours, 24 hours, until sold)

2. THE System SHALL provide smart price suggestions:
   - "Current best ask: ₹50/kg - You could list at ₹48/kg to sell faster"
   - "Average recent trades: ₹52/kg"
   - Price range slider showing market min/max

3. WHEN a user posts an ask/bid, THE System SHALL:
   - Immediately add it to the Order Book
   - Show confirmation with order ID
   - Display estimated time to match based on current spread
   - Add to user's "My Active Orders" dashboard

4. THE System SHALL validate:
   - Price is positive
   - Quantity is positive
   - Price is within reasonable range (not 10x market rate)
   
5. THE System SHALL allow quick editing/canceling of own orders

### Requirement 4: Intelligent Matching & Notifications

**User Story:** As a trader, I want to be notified when someone posts a matching or near-matching offer, so I can act quickly.

#### Acceptance Criteria

1. WHEN a new bid/ask is posted that exactly matches an existing order, THE Match_Engine SHALL:
   - Create a "POTENTIAL MATCH" notification
   - Highlight both orders on the board
   - Display countdown timer (60 seconds to accept)
   - Allow one-click "ACCEPT DEAL" button

2. WHEN a bid/ask comes within 5% of a user's order, THE System SHALL send a "CLOSE MATCH" notification with:
   - Details of the near-match
   - Quick counter-offer button
   - Option to enter Negotiation Room

3. THE System SHALL display toast notifications for:
   - New orders in user's watched commodities
   - Price movements > 10% in active markets
   - User's order about to expire
   - Successful matches

4. WHEN a match is accepted, THE System SHALL:
   - Remove both orders from the book
   - Record the trade in Trade History
   - Update market statistics (last trade price, volume)
   - Show success animation

5. THE System SHALL maintain a "Near Matches" sidebar showing opportunities where user could adjust price slightly to get a deal

### Requirement 5: Real-time Negotiation Room

**User Story:** As a buyer and seller, I want to negotiate directly with a counterparty in my language, so we can reach a mutually beneficial deal.

#### Acceptance Criteria

1. WHEN a user clicks "NEGOTIATE" on an order, THE System SHALL create/join a Negotiation Room with:
   - Private chat interface (simulated with AI or canned responses for demo)
   - Shared view of current bid/ask spread
   - Quick counter-offer buttons (±₹5, ±₹10, ±10%)
   - AI negotiation coach suggestions
   - Language selector (all 5 supported languages)

2. THE Negotiation Room SHALL display:
   - Product details and quantity
   - Current spread visualization
   - Negotiation history/timeline
   - Suggested meeting prices
   - Market comparison data

3. THE System SHALL provide quick-action buttons:
   - "Split the difference" (average of bid and ask)
   - "Meet at market rate" (use recent avg trade price)
   - "Counter with ±X%" buttons
   - "Accept current offer"
   - "Walk away"

4. THE AI Coach SHALL suggest:
   - "Buyer is at 88% of your ask - good time to counter at 94%"
   - "Market is trending up - hold firm on your ask"
   - "You could offer bulk discount to close this deal"

5. WHEN both parties reach agreement, THE System SHALL:
   - Display deal summary
   - Confirm trade
   - Update both users' trade history
   - Remove orders from Order Book

6. THE Negotiation Room SHALL support real-time translation:
   - Buyer types in Hindi, seller sees in Telugu
   - All messages auto-translated
   - Original and translated text both visible

### Requirement 6: Multilingual Exchange Experience

**User Story:** As a regional vendor, I want to see the entire exchange in my language, so I can trade confidently without language barriers.

#### Acceptance Criteria

1. THE System SHALL allow users to select interface language from: Hindi, Telugu, Tamil, Bengali, English

2. WHEN a language is selected, THE System SHALL translate:
   - All UI labels and buttons
   - Commodity names
   - Order book labels (BID, ASK, SPREAD, etc.)
   - Notification messages
   - AI coach suggestions

3. THE Exchange Board SHALL display commodity names in both English and user's selected language

4. WHEN viewing orders from traders using different languages, THE System SHALL show:
   - Original message/offer
   - Auto-translated version in user's language
   - Language indicator icon

5. THE System SHALL maintain a phrase library for common trading terms:
   - "What's your best price?"
   - "Can you do bulk discount?"
   - "This is my final offer"
   - "Deal accepted"
   - "Let me check and get back"
   
6. THE Translation_Module SHALL preserve numeric values (prices, quantities) exactly without translation

### Requirement 7: AI-Powered Negotiation Coach

**User Story:** As a vendor with limited negotiation experience, I want AI guidance during negotiations, so I can get better deals.

#### Acceptance Criteria

1. WHEN a user enters a Negotiation Room, THE AI_Coach SHALL analyze:
   - Current spread percentage
   - Recent trade history for this commodity
   - Market momentum (trending up/down)
   - User's order compared to market
   - Counterparty's negotiation patterns (simulated)

2. THE AI_Coach SHALL provide contextual suggestions:
   - **Aggressive**: "Counter at ₹55 (10% higher) - market is hot"
   - **Moderate**: "Suggest ₹52 (split difference) - reasonable middle ground"
   - **Conservative**: "Accept ₹50 - good price given current market"

3. THE AI_Coach SHALL display confidence indicators:
   - "85% confidence this is a fair price based on 24 recent trades"
   - "Low confidence - limited recent data for this commodity"

4. WHEN using Claude API, THE AI_Coach SHALL generate:
   - 3 negotiation strategies with specific talking points
   - Cultural context (appropriate for Indian markets)
   - Risk assessment (might lose deal if too aggressive)
   - Alternative suggestions (offer payment terms, delivery options)

5. THE AI_Coach SHALL provide live coaching during negotiation:
   - "Buyer countered at ₹48 - this is 96% of market rate, consider accepting"
   - "You've been negotiating for 5 minutes - time to make a decision"
   - "Similar deals closed at ₹51 today"

6. IF Claude API unavailable, THE System SHALL use rule-based coaching:
   - Hardcoded strategies based on spread percentage
   - Simple suggestions: "Counter +10%", "Accept", "Hold firm"
   - Quick tips library

### Requirement 8: Personal Trading Dashboard

**User Story:** As an active trader, I want to track my orders and deals, so I can manage my trading activity effectively.

#### Acceptance Criteria

1. THE Dashboard SHALL display user's:
   - **Active Orders**: All open bids/asks with edit/cancel options
   - **Near Matches**: Opportunities where adjusting price slightly could match
   - **Pending Negotiations**: Active negotiation rooms
   - **Completed Trades**: Trade history with dates, prices, quantities
   - **Watched Commodities**: Quick access to favorite markets

2. EACH active order SHALL show:
   - Time remaining until expiry
   - Number of views (simulated engagement)
   - Distance from best market price
   - Quick edit button
   - Cancel button

3. THE Dashboard SHALL include performance metrics:
   - Total trades completed (simulated for demo)
   - Average deal completion time
   - Success rate (% of orders that matched)
   - Best deals (greatest savings/profits)

4. THE Dashboard SHALL provide quick actions:
   - "Repost expired order"
   - "Adjust price to market"
   - "Clone order for different commodity"
   - "Share order link"

5. THE System SHALL send dashboard notifications for:
   - Order about to expire
   - New near match found
   - Market price changed significantly for watched items

### Requirement 9: Market Depth Visualization

**User Story:** As a data-driven trader, I want to visualize market depth, so I can understand supply-demand dynamics at a glance.

#### Acceptance Criteria

1. THE Order Book SHALL include a depth chart showing:
   - Cumulative buy volume at each price level (green bars extending left)
   - Cumulative sell volume at each price level (red bars extending right)
   - Current mid-market price line
   - User's order position highlighted

2. THE depth chart SHALL be interactive:
   - Hover to see exact volume at price level
   - Click price level to auto-fill order form
   - Zoom in/out for different price ranges

3. THE System SHALL display visual spread indicators:
   - Narrow spread (< 5%): Green "HOT MARKET"
   - Medium spread (5-15%): Yellow "NORMAL"
   - Wide spread (> 15%): Red "ILLIQUID"

4. THE Market Depth SHALL update in real-time as orders are added/removed

5. THE System SHALL provide historical depth snapshots:
   - "Market depth 1 hour ago"
   - "Market depth yesterday same time"
   - Trend analysis

### Requirement 10: Republic Day Exchange Theme

**User Story:** As a user celebrating Republic Day, I want an engaging, patriotic trading experience, so the platform feels special and uniquely Indian.

#### Acceptance Criteria

1. THE Exchange Board SHALL feature:
   - Tricolor gradient header with animated flag
   - "India's First Digital Mandi - 77th Republic Day Special"
   - Live ticker showing total trades and volume (simulated)
   - "Jai Hind" message when deals are closed

2. THE System SHALL use Republic Day themed design:
   - Saffron (#FF9933) for ASK/SELL actions
   - Green (#138808) for BID/BUY actions
   - Navy Blue (#000080) for headings
   - White background with subtle tricolor patterns

3. WHEN a trade matches, THE System SHALL display:
   - Tricolor confetti animation
   - Success sound (optional)
   - "Unity in Trade 🇮🇳" celebration message

4. THE Order Book SHALL include patriotic badges:
   - "Digital India Exchange 🚀"
   - "Atmanirbhar Trading 💪"
   - "Unity in Diversity Markets 🇮🇳"

5. THE System SHALL display "26 January 2026" prominently in header

6. THE Footer SHALL include:
   - "Empowering India's 50M+ Vendors"
   - "Celebrating 77 Years of Republic"
   - "Jai Hind 🇮🇳"

## Enhanced User Flows

### Flow 1: Quick Sell (Vendor Posts Ask)

1. Vendor opens Exchange Board
2. Sees Tomatoes spread: BID ₹38/kg ← **₹7 SPREAD** → ASK ₹45/kg
3. Clicks "QUICK SELL TOMATOES"
4. System suggests: "List at ₹42/kg to sell faster (5% below current ask)"
5. Vendor enters: ₹43/kg, 50 kg
6. Posts ask → appears on Order Book
7. Notification: "Your ask is ₹5 above highest bid - consider adjusting"
8. Within 2 minutes, buyer posts bid at ₹42/kg
9. Notification: "CLOSE MATCH! Buyer willing to pay ₹42 - just ₹1 below you"
10. Vendor clicks "Counter at ₹42.50"
11. Buyer accepts → Deal closed!
12. Tricolor confetti 🎉 "Deal Complete - Unity in Trade 🇮🇳"

### Flow 2: Strategic Buy (Buyer Uses AI Coach)

1. Buyer wants to buy 100kg rice
2. Views Rice Order Book:
   - Best BID: ₹48/kg (competitor)
   - Best ASK: ₹52/kg
   - Spread: ₹4 (8.3%)
3. Clicks "AI COACH"
4. AI analyzes: "Market trending up (+5% today). Suggest bidding ₹50/kg for quick match"
5. Buyer posts bid: ₹50/kg, 100kg
6. Seller sees notification: "BID-102 wants 100kg at ₹50 - you're asking ₹52"
7. Seller clicks "NEGOTIATE"
8. Negotiation Room opens
9. AI Coach suggests to seller: "Buyer at 96% of your ask - counter at ₹51"
10. Seller counters: ₹51/kg
11. AI suggests to buyer: "Good price! Market avg is ₹51.5"
12. Buyer accepts → Trade recorded

### Flow 3: Multilingual Cross-Region Trade

1. Tamil vendor (Chennai) posts ask: Mangoes ₹80/kg
2. Bengali buyer (Kolkata) views exchange in Bengali
3. Sees "আম (Mangoes)" listing
4. Clicks "দর কষাকষি করুন (Negotiate)"
5. Types in Bengali: "আমি ৭৫ টাকা দিতে পারি" (I can pay ₹75)
6. Vendor sees in Tamil: "என்னால் ₹75 கொடுக்க முடியும்"
7. Vendor replies in Tamil: "நல்லது, ₹78 இறுதி விலை" (OK, ₹78 final)
8. Buyer sees in Bengali: "ঠিক আছে, ₹78 চূড়ান্ত দাম"
9. Both agree → Deal closed across languages!

## Non-Functional Requirements

### Performance

1. Exchange Board SHALL update within 1 second of new order
2. Order Book SHALL render within 500ms for 100+ active orders
3. Negotiation Room messages SHALL appear within 200ms
4. Initial page load SHALL complete within 2 seconds
5. All animations SHALL be smooth 60fps

### Scalability (Simulation)

1. System SHALL simulate 500+ active orders across all commodities
2. System SHALL simulate 50-100 trades per hour
3. Order Books SHALL handle 50+ orders per commodity
4. System SHALL maintain performance with 20+ simultaneous negotiations

### Usability

1. First-time user SHALL be able to post order within 60 seconds
2. All critical actions SHALL be achievable within 3 clicks
3. System SHALL provide contextual help tooltips
4. Mobile interface SHALL support all trading features
5. Color-blind friendly mode SHALL be available

### Data Integrity (Client-Side)

1. Orders SHALL persist in LocalStorage
2. Trade history SHALL be retrievable after browser refresh
3. Active negotiations SHALL resume after page reload
4. System SHALL validate all price/quantity inputs
5. Order IDs SHALL be unique and traceable

## Success Metrics

### For Hackathon Demo

1. **Engagement**: User spends 5+ minutes exploring features
2. **Comprehension**: User can explain bid/ask spread concept after using
3. **Delight**: User reacts positively to tricolor animations and AI coach
4. **Functionality**: User successfully completes simulated trade end-to-end
5. **Multilingual**: User switches languages and sees proper translations

### For Real-World Vision

1. **Market Liquidity**: Average spread < 10% across commodities
2. **Trade Velocity**: 70%+ of orders match within 1 hour
3. **Language Diversity**: Usage across all 5 languages
4. **Negotiation Success**: 60%+ of negotiations result in deals
5. **AI Effectiveness**: AI suggestions accepted 40%+ of time

## Out of Scope (For 24hr Hackathon)

1. Real backend server / database
2. Actual payment processing
3. User authentication / accounts
4. Real-time WebSocket connections
5. Mobile native apps
6. Delivery/logistics integration
7. Dispute resolution system
8. Advanced charting (candlesticks, technical indicators)
9. Order types (limit, stop-loss, etc.)
10. Multi-commodity basket orders

## Future Enhancements (Post-Hackathon)

1. **Blockchain Integration**: Immutable trade records
2. **Smart Contracts**: Automated deal execution
3. **Credit System**: Buy now, pay later for verified vendors
4. **Quality Ratings**: Seller reputation scores
5. **Video Negotiation**: Face-to-face for high-value deals
6. **Warehouse Integration**: Link to actual inventory
7. **Weather Alerts**: Price predictions based on weather
8. **Government Price Floor/Ceiling**: MSP integration
9. **Export Markets**: International buyers
10. **Voice Trading**: Speak to post orders (Siri/Alexa style)
