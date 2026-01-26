# Design Document: MandiMind Exchange (Enhanced)

## Overview

MandiMind Exchange transforms the original static platform into a **live trading floor** celebrating India's 77th Republic Day. The system provides a real-time bidding exchange where buyers and sellers negotiate prices, post orders, and close deals across 5 Indian languages. Built with React + Vite + Tailwind CSS, it simulates a high-frequency trading environment entirely client-side using localStorage for persistence and sophisticated mock data generation for live market dynamics.

The application centers on a **live exchange board** showing bid-ask spreads, an **order book** with market depth, and a **negotiation interface** with AI-powered coaching. All data is client-generated with realistic market simulation, plus optional Claude API for advanced negotiation strategies.

## Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser (Client)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           React Application (Vite)                       │ │
│  │                                                          │ │
│  │  ┌────────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   Exchange     │  │  Order Book  │  │ Negotiation │ │ │
│  │  │     Board      │  │   & Depth    │  │    Room     │ │ │
│  │  │  (Live View)   │  │  Viewer      │  │  (AI Coach) │ │ │
│  │  └───────┬────────┘  └──────┬───────┘  └──────┬──────┘ │ │
│  │          │                   │                  │        │ │
│  │          └───────────┬───────┴──────────────────┘        │ │
│  │                      │                                   │ │
│  │          ┌───────────▼──────────┐                        │ │
│  │          │   Core Services      │                        │ │
│  │          │  - Match Engine      │                        │ │
│  │          │  - Market Simulator  │                        │ │
│  │          │  - Price Generator   │                        │ │
│  │          │  - Translation       │                        │ │
│  │          │  - LocalStorage      │                        │ │
│  │          └───────────┬──────────┘                        │ │
│  │                      │                                   │ │
│  └──────────────────────┼───────────────────────────────────┘ │
│                         │                                     │
│            ┌────────────┼────────────┐                        │
│            │            │            │                        │
│       ┌────▼────┐  ┌───▼────┐  ┌───▼──────┐                 │
│       │LocalStor│  │Interval│  │ Claude   │                 │
│       │age API  │  │ Timers │  │ API      │                 │
│       └─────────┘  └────────┘  └──────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── Header (Republic Day Exchange Branding)
├── ExchangeView (Main Container)
│   ├── ExchangeBoard (Default View)
│   │   ├── LiveTicker (Total volume, active traders)
│   │   ├── CommodityGrid
│   │   │   └── CommodityCard (x15-20)
│   │   │       ├── BidAskSpread
│   │   │       ├── MomentumIndicator
│   │   │       ├── VolumeInfo
│   │   │       └── QuickTradeButton
│   │   └── HotDealsPanel
│   │       └── NarrowSpreadAlerts
│   │
│   ├── OrderBookView (Drill-Down)
│   │   ├── OrderBookHeader
│   │   │   ├── CommodityInfo
│   │   │   ├── MidMarketPrice
│   │   │   └── SpreadIndicator
│   │   ├── DepthChart
│   │   │   ├── BuyDepthBars (Green)
│   │   │   └── SellDepthBars (Red)
│   │   ├── OrderBookTable
│   │   │   ├── BidsSide (Left Column)
│   │   │   │   └── BidRow (Price, Qty, Total, Time)
│   │   │   └── AsksSide (Right Column)
│   │   │       └── AskRow (Price, Qty, Total, Time)
│   │   ├── QuickOrderForm
│   │   │   ├── BidAskToggle
│   │   │   ├── PriceInput (Smart Suggestions)
│   │   │   ├── QuantityInput
│   │   │   └── PostOrderButton
│   │   └── NearMatchesPanel
│   │       └── AdjustPriceSuggestions
│   │
│   ├── NegotiationRoom (Modal/Slide-In)
│   │   ├── NegotiationHeader
│   │   │   ├── DealSummary
│   │   │   ├── SpreadVisualization
│   │   │   └── LanguageSelector
│   │   ├── MessageThread
│   │   │   └── Message (Translated)
│   │   ├── QuickCounterOffers
│   │   │   ├── SplitDifferenceButton
│   │   │   ├── PlusMinusButtons
│   │   │   └── AcceptButton
│   │   ├── AICoachPanel
│   │   │   ├── StrategyCards
│   │   │   ├── ConfidenceIndicator
│   │   │   └── MarketContext
│   │   └── MessageInput (Multilingual)
│   │
│   └── TradingDashboard (User's View)
│       ├── ActiveOrders
│       │   └── OrderCard (Edit, Cancel)
│       ├── NearMatches
│       │   └── OpportunityCard
│       ├── PendingNegotiations
│       │   └── NegotiationCard
│       ├── CompletedTrades
│       │   └── TradeHistoryItem
│       └── WatchedCommodities
│           └── QuickAccessCard
│
└── Footer (Jai Hind 🇮🇳)
```

### State Management Architecture

```typescript
// Global App State (React Context or Zustand)
interface AppState {
  // User State
  user: {
    id: string;
    language: Language;
    activeOrders: Order[];
    watchlist: string[]; // commodity IDs
  };
  
  // Market State
  market: {
    commodities: Commodity[];
    orderBooks: Map<string, OrderBook>; // commodityId -> OrderBook
    recentTrades: Trade[];
    marketStats: MarketStatistics;
  };
  
  // UI State
  ui: {
    currentView: 'exchange' | 'orderbook' | 'dashboard';
    selectedCommodity: string | null;
    activeNegotiations: Negotiation[];
    notifications: Notification[];
  };
  
  // Simulation State
  simulation: {
    isRunning: boolean;
    lastUpdateTime: number;
    marketEventQueue: MarketEvent[];
  };
}
```

## Core Components and Interfaces

### 1. Exchange Board System

**CommodityMarketData**
```typescript
interface CommodityMarketData {
  commodity: Commodity;
  bestBid: number | null; // Highest price buyers willing to pay
  bestAsk: number | null; // Lowest price sellers willing to accept
  spread: number; // bestAsk - bestBid
  spreadPercentage: number; // (spread / bestAsk) * 100
  lastTradePrice: number;
  lastTradeTime: number;
  momentum: Momentum; // '↑↑' | '↑' | '→' | '↓' | '↓↓'
  volume24h: number; // Total volume traded
  activeBids: number; // Count
  activeAsks: number; // Count
  isHotDeal: boolean; // spread < 5%
}

type Momentum = 'surge_up' | 'up' | 'stable' | 'down' | 'surge_down';

interface ExchangeBoardService {
  // Get all commodity market data
  getMarketOverview(): CommodityMarketData[];
  
  // Get specific commodity data
  getCommodityData(commodityId: string): CommodityMarketData;
  
  // Subscribe to live updates
  subscribeToMarketUpdates(callback: (data: CommodityMarketData[]) => void): UnsubscribeFn;
  
  // Get hot deals (narrow spreads)
  getHotDeals(): CommodityMarketData[];
  
  // Search commodities
  searchCommodities(query: string, language: Language): Commodity[];
}
```

**Implementation Notes:**
- Use `setInterval` to simulate live updates every 3-5 seconds
- Generate realistic price movements using random walk algorithm
- Maintain bid/ask spread within realistic bounds (2-20%)
- Hot deals flash with animated border when spread < 5%
- Momentum calculated from last 5 trades direction

### 2. Order Book & Depth System

**Order**
```typescript
interface Order {
  id: string; // ORD-123456
  type: 'bid' | 'ask';
  commodityId: string;
  price: number; // per unit
  quantity: number;
  unit: string; // kg, quintal, dozen
  totalValue: number; // price * quantity
  traderId: string; // Anonymous: B-1234, S-5678
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'matched' | 'expired' | 'cancelled';
  minOrderQty?: number; // Minimum order quantity
}

interface OrderBook {
  commodityId: string;
  bids: Order[]; // Sorted descending by price (best bid first)
  asks: Order[]; // Sorted ascending by price (best ask first)
  midMarketPrice: number; // (bestBid + bestAsk) / 2
  totalBidVolume: number;
  totalAskVolume: number;
  depthData: DepthLevel[];
}

interface DepthLevel {
  price: number;
  bidVolume: number; // Cumulative quantity at this price
  askVolume: number;
  bidOrders: number; // Count of orders
  askOrders: number;
}

interface OrderBookService {
  // Get full order book for commodity
  getOrderBook(commodityId: string): OrderBook;
  
  // Post new order
  postOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Order;
  
  // Cancel order
  cancelOrder(orderId: string): boolean;
  
  // Update order (price/quantity)
  updateOrder(orderId: string, updates: Partial<Order>): Order;
  
  // Get user's active orders
  getUserOrders(userId: string): Order[];
  
  // Calculate market depth
  calculateDepth(commodityId: string, priceRange: number): DepthLevel[];
  
  // Find near matches for user's order
  findNearMatches(orderId: string, threshold: number): Order[];
}
```

**Order Book Rendering:**
```typescript
// Visual depth bars
interface DepthBarConfig {
  maxBarWidth: number; // in pixels
  buyColor: '#138808'; // Green
  sellColor: '#FF9933'; // Saffron
}

// Depth chart shows cumulative volume
// BUY side: Green bars extending left from center
// SELL side: Red bars extending right from center
// User's order highlighted with animation
```

**Market Depth Calculation:**
```typescript
function calculateMarketDepth(orders: Order[], midPrice: number): DepthLevel[] {
  const priceRange = midPrice * 0.2; // ±20% from mid
  const priceStep = midPrice * 0.01; // 1% steps
  
  const levels: DepthLevel[] = [];
  
  for (let price = midPrice - priceRange; price <= midPrice + priceRange; price += priceStep) {
    const bidsAtPrice = orders.filter(o => o.type === 'bid' && Math.abs(o.price - price) < priceStep);
    const asksAtPrice = orders.filter(o => o.type === 'ask' && Math.abs(o.price - price) < priceStep);
    
    levels.push({
      price: Math.round(price * 100) / 100,
      bidVolume: sum(bidsAtPrice.map(o => o.quantity)),
      askVolume: sum(asksAtPrice.map(o => o.quantity)),
      bidOrders: bidsAtPrice.length,
      askOrders: asksAtPrice.length
    });
  }
  
  // Calculate cumulative volumes
  levels.forEach((level, i) => {
    if (i > 0) {
      level.bidVolume += levels[i - 1].bidVolume;
      level.askVolume += levels[i - 1].askVolume;
    }
  });
  
  return levels;
}
```

### 3. Matching Engine

**Match**
```typescript
interface Match {
  id: string;
  bidOrder: Order;
  askOrder: Order;
  matchPrice: number; // Price at which deal happens
  matchQuantity: number; // Quantity traded
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: number; // 60 second countdown
}

interface Trade {
  id: string;
  commodityId: string;
  price: number;
  quantity: number;
  buyerId: string;
  sellerId: string;
  timestamp: number;
  matchId: string;
}

interface MatchEngine {
  // Find exact matches
  findExactMatches(): Match[];
  
  // Find near matches (within threshold %)
  findNearMatches(threshold: number): Match[];
  
  // Accept a match
  acceptMatch(matchId: string, userId: string): Trade;
  
  // Reject/counter a match
  rejectMatch(matchId: string, userId: string): void;
  
  // Get pending matches for user
  getUserMatches(userId: string): Match[];
  
  // Auto-match if both parties agree on price
  autoMatch(bidId: string, askId: string): Match;
}
```

**Matching Logic:**
```typescript
function findMatches(orderBook: OrderBook): Match[] {
  const matches: Match[] = [];
  
  // Sort bids descending, asks ascending
  const sortedBids = orderBook.bids.sort((a, b) => b.price - a.price);
  const sortedAsks = orderBook.asks.sort((a, b) => a.price - b.price);
  
  for (const bid of sortedBids) {
    for (const ask of sortedAsks) {
      // Exact match: bid price >= ask price
      if (bid.price >= ask.price) {
        const matchQty = Math.min(bid.quantity, ask.quantity);
        const matchPrice = (bid.price + ask.price) / 2; // Fair price
        
        matches.push({
          id: `MATCH-${Date.now()}`,
          bidOrder: bid,
          askOrder: ask,
          matchPrice,
          matchQuantity: matchQty,
          timestamp: Date.now(),
          status: 'pending',
          expiresAt: Date.now() + 60000 // 1 minute
        });
      }
      
      // Near match: within 5%
      const spread = Math.abs(bid.price - ask.price);
      const avgPrice = (bid.price + ask.price) / 2;
      if (spread / avgPrice < 0.05) {
        // Create near match notification
        // (handled separately from exact matches)
      }
    }
  }
  
  return matches;
}
```

### 4. Negotiation Room

**Negotiation**
```typescript
interface Negotiation {
  id: string;
  commodityId: string;
  buyerOrder: Order;
  sellerOrder: Order;
  messages: NegotiationMessage[];
  currentBuyerOffer: number;
  currentSellerOffer: number;
  spread: number;
  status: 'active' | 'closed' | 'deal' | 'abandoned';
  createdAt: number;
  lastActivity: number;
}

interface NegotiationMessage {
  id: string;
  senderId: string;
  senderType: 'buyer' | 'seller' | 'system' | 'ai_coach';
  content: string;
  originalLanguage: Language;
  timestamp: number;
  messageType: 'text' | 'counter_offer' | 'accept' | 'reject';
  offerPrice?: number;
}

interface NegotiationService {
  // Start negotiation
  createNegotiation(bidId: string, askId: string): Negotiation;
  
  // Send message
  sendMessage(negotiationId: string, message: Omit<NegotiationMessage, 'id' | 'timestamp'>): void;
  
  // Counter offer
  counterOffer(negotiationId: string, userId: string, newPrice: number): void;
  
  // Accept offer
  acceptOffer(negotiationId: string, userId: string): Trade;
  
  // Get active negotiations for user
  getUserNegotiations(userId: string): Negotiation[];
  
  // Translate message
  translateMessage(message: NegotiationMessage, targetLang: Language): string;
  
  // Get AI coaching
  getAICoaching(negotiation: Negotiation, userRole: 'buyer' | 'seller'): AICoachAdvice;
}
```

**Quick Counter Interface:**
```typescript
interface QuickCounterActions {
  // Split the difference
  splitDifference: () => number; // (buyerOffer + sellerOffer) / 2
  
  // Adjust by percentage
  adjustByPercent: (percent: number) => number; // Current offer ± %
  
  // Adjust by fixed amount
  adjustByAmount: (amount: number) => number; // Current offer ± ₹
  
  // Meet at market rate
  meetAtMarket: () => number; // Use recent avg trade price
  
  // Bulk discount calculation
  bulkDiscount: (quantity: number) => number; // Auto-calculate discount
}
```

**AI Coach Interface:**
```typescript
interface AICoachAdvice {
  strategies: NegotiationStrategy[];
  currentContext: {
    spreadPercent: number;
    marketTrend: Momentum;
    recentAvgPrice: number;
    yourPosition: 'strong' | 'moderate' | 'weak';
    timeElapsed: number;
  };
  recommendations: {
    suggestedAction: 'accept' | 'counter' | 'hold_firm' | 'walk_away';
    suggestedPrice?: number;
    confidence: number; // 0-100
    reasoning: string;
  };
  quickTips: string[];
}

interface NegotiationStrategy {
  id: string;
  title: string;
  approach: 'aggressive' | 'moderate' | 'conservative';
  description: string;
  actionPoints: string[];
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
}
```

**Claude API Integration for Advanced Coaching:**
```typescript
interface ClaudeNegotiationPrompt {
  role: 'buyer' | 'seller';
  commodity: string;
  yourOffer: number;
  theirOffer: number;
  quantity: number;
  marketContext: {
    recentAvgPrice: number;
    trend: Momentum;
    spread: number;
  };
  negotiationHistory: string[]; // Previous messages
  timeElapsed: number;
}

// Prompt template
const NEGOTIATION_PROMPT = `
You are an expert mandi negotiation coach helping Indian vendors.

Context:
- Role: {role}
- Product: {commodity}
- Your current offer: ₹{yourOffer}/{unit}
- Their current offer: ₹{theirOffer}/{unit}
- Quantity: {quantity} {unit}
- Market avg price: ₹{marketAvg}
- Price trend: {trend}
- Time negotiating: {timeElapsed} minutes

Recent conversation:
{negotiationHistory}

Provide 3 specific negotiation strategies in JSON format:
[
  {
    "title": "Strategy name",
    "approach": "aggressive|moderate|conservative",
    "description": "Brief description",
    "actionPoints": ["Specific action 1", "Specific action 2", "Specific action 3"],
    "expectedOutcome": "What might happen",
    "riskLevel": "low|medium|high"
  }
]

Also provide your top recommendation:
{
  "suggestedAction": "accept|counter|hold_firm|walk_away",
  "suggestedPrice": <number or null>,
  "confidence": <0-100>,
  "reasoning": "Why this is best move"
}
`;
```

### 5. Market Simulation Engine

**Market Simulator:**
```typescript
interface MarketSimulator {
  // Generate initial market state
  initializeMarket(): void;
  
  // Simulate market activity (runs on interval)
  simulateMarketTick(): void;
  
  // Generate random order
  generateRandomOrder(commodityId: string): Order;
  
  // Generate random trade
  generateRandomTrade(commodityId: string): Trade;
  
  // Update price trends
  updateMomentum(commodityId: string): Momentum;
  
  // Simulate price movement
  simulatePriceWalk(currentPrice: number, volatility: number): number;
}
```

**Price Movement Algorithm:**
```typescript
function simulatePriceWalk(currentPrice: number, volatility: number): number {
  // Random walk with drift
  const drift = 0; // No directional bias
  const randomChange = (Math.random() - 0.5) * 2; // -1 to 1
  const percentChange = drift + randomChange * volatility;
  
  const newPrice = currentPrice * (1 + percentChange / 100);
  
  // Bounds checking (prevent unrealistic swings)
  const minPrice = currentPrice * 0.95; // Max 5% drop
  const maxPrice = currentPrice * 1.05; // Max 5% rise
  
  return Math.max(minPrice, Math.min(maxPrice, newPrice));
}
```

**Order Generation:**
```typescript
function generateRandomOrder(commodity: Commodity, marketData: CommodityMarketData): Order {
  const type = Math.random() > 0.5 ? 'bid' : 'ask';
  
  // Base price around mid-market with variation
  const basePrice = marketData.midMarketPrice || commodity.basePrice;
  const variation = type === 'bid' ? -0.05 : 0.05; // Bids lower, asks higher
  const randomSpread = (Math.random() - 0.5) * 0.1; // ±5%
  
  const price = Math.round(basePrice * (1 + variation + randomSpread));
  
  // Random quantity (realistic ranges)
  const quantityRanges = {
    small: [5, 20],
    medium: [20, 100],
    large: [100, 500]
  };
  const range = quantityRanges.medium;
  const quantity = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
  
  return {
    id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    commodityId: commodity.id,
    price,
    quantity,
    unit: commodity.unit,
    totalValue: price * quantity,
    traderId: type === 'bid' ? `B-${Math.floor(Math.random() * 9999)}` : `S-${Math.floor(Math.random() * 9999)}`,
    timestamp: Date.now(),
    expiresAt: Date.now() + (Math.random() * 3600000 + 3600000), // 1-2 hours
    status: 'active'
  };
}
```

**Market Event Simulation:**
```typescript
interface MarketEvent {
  type: 'new_order' | 'order_matched' | 'price_spike' | 'volume_surge';
  commodityId: string;
  timestamp: number;
  data: any;
}

function simulateMarketTick(state: AppState): void {
  // Every tick (3-5 seconds):
  
  // 1. Generate 1-3 random orders
  const numOrders = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < numOrders; i++) {
    const commodity = randomChoice(state.market.commodities);
    const order = generateRandomOrder(commodity, getCommodityData(commodity.id));
    addOrderToBook(order);
  }
  
  // 2. Attempt to match orders
  const matches = findExactMatches();
  matches.forEach(match => {
    if (Math.random() > 0.7) { // 30% auto-accept rate
      acceptMatch(match.id, 'system');
    }
  });
  
  // 3. Update prices based on recent trades
  state.market.commodities.forEach(commodity => {
    const recentTrades = getRecentTrades(commodity.id, 5);
    if (recentTrades.length > 0) {
      const avgTradePrice = average(recentTrades.map(t => t.price));
      updateMarketPrice(commodity.id, avgTradePrice);
    }
  });
  
  // 4. Update momentum indicators
  state.market.commodities.forEach(commodity => {
    const momentum = calculateMomentum(commodity.id);
    updateMomentum(commodity.id, momentum);
  });
  
  // 5. Expire old orders
  expireOldOrders();
  
  // 6. Trigger notifications
  checkForUserNearMatches(state.user);
}
```

### 6. Translation & Multilingual System

**Enhanced Translation Service:**
```typescript
interface TranslationService {
  // Translate UI text
  translateUI(key: string, language: Language): string;
  
  // Translate user message
  translateMessage(text: string, sourceLang: Language, targetLang: Language): string;
  
  // Translate commodity name
  translateCommodityName(commodityId: string, language: Language): string;
  
  // Get trading phrase
  getTradingPhrase(phraseId: string, language: Language): string;
  
  // Detect language (for auto-translation)
  detectLanguage(text: string): Language;
  
  // Format number/currency for language
  formatCurrency(amount: number, language: Language): string;
}

// Trading phrase library (expanded)
const TRADING_PHRASES = {
  bid_inquiry: {
    en: "What's your best price?",
    hi: "आपकी सबसे अच्छी कीमत क्या है?",
    te: "మీ ఉత్తమ ధర ఎంత?",
    ta: "உங்கள் சிறந்த விலை என்ன?",
    bn: "আপনার সেরা দাম কত?"
  },
  bulk_discount: {
    en: "Can you do bulk discount for {quantity}?",
    hi: "{quantity} के लिए थोक छूट मिल सकती है?",
    te: "{quantity} కోసం పెద్ద మొత్తం తగ్గింపు ఇవ్వగలరా?",
    ta: "{quantity} க்கு மொத்த தள்ளுபடி தர முடியுமா?",
    bn: "{quantity} এর জন্য বাল্ক ছাড় দিতে পারবেন?"
  },
  final_offer: {
    en: "This is my final offer: ₹{price}",
    hi: "यह मेरा अंतिम प्रस्ताव है: ₹{price}",
    te: "ఇది నా చివరి ఆఫర్: ₹{price}",
    ta: "இது என் இறுதி சலுகை: ₹{price}",
    bn: "এটি আমার চূড়ান্ত অফার: ₹{price}"
  },
  deal_accepted: {
    en: "Deal accepted! Let's finalize.",
    hi: "सौदा स्वीकार! आइए अंतिम रूप दें।",
    te: "డీల్ ఆమోదించబడింది! ఫైనలైజ్ చేద్దాం।",
    ta: "ஒப்பந்தம் ஏற்கப்பட்டது! இறுதி செய்வோம்.",
    bn: "চুক্তি গৃহীত! চূড়ান্ত করা যাক।"
  },
  split_difference: {
    en: "Let's split the difference - ₹{price}",
    hi: "आइए अंतर विभाजित करें - ₹{price}",
    te: "తేడాను విభజిద్దాం - ₹{price}",
    ta: "வேறுபாட்டைப் பிரிப்போம் - ₹{price}",
    bn: "পার্থক্য ভাগ করি - ₹{price}"
  },
  // ... 20+ more phrases
};

// UI text translations
const UI_TRANSLATIONS = {
  exchange_board: {
    en: "Exchange Board",
    hi: "विनिमय बोर्ड",
    te: "ఎక్స్చేంజ్ బోర్డ్",
    ta: "பரிமாற்ற பலகை",
    bn: "এক্সচেঞ্জ বোর্ড"
  },
  bid: {
    en: "BID",
    hi: "खरीद",
    te: "కొనుగోలు",
    ta: "வாங்கு",
    bn: "ক্রয়"
  },
  ask: {
    en: "ASK",
    hi: "बेचना",
    te: "అమ్మకం",
    ta: "விற்பனை",
    bn: "বিক্রয়"
  },
  // ... complete UI vocabulary
};
```

### 7. Notification System

**Notification Types:**
```typescript
interface Notification {
  id: string;
  type: 'match' | 'near_match' | 'price_alert' | 'order_expiring' | 'deal_closed';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
  actionHandler?: () => void;
  timestamp: number;
  read: boolean;
  expiresAt?: number; // Auto-dismiss time
}

interface NotificationService {
  // Create notification
  notify(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void;
  
  // Get user notifications
  getNotifications(userId: string): Notification[];
  
  // Mark as read
  markRead(notificationId: string): void;
  
  // Clear all
  clearAll(userId: string): void;
  
  // Subscribe to new notifications
  subscribe(callback: (notification: Notification) => void): UnsubscribeFn;
}

// Notification triggers
function checkNotifications(state: AppState): void {
  const user = state.user;
  
  // Check for exact matches
  user.activeOrders.forEach(order => {
    const matches = findExactMatches().filter(m => 
      m.bidOrder.id === order.id || m.askOrder.id === order.id
    );
    
    matches.forEach(match => {
      notify({
        type: 'match',
        priority: 'high',
        title: '🎯 EXACT MATCH FOUND!',
        message: `Your ${order.type} for ${order.commodity.name} matched at ₹${match.matchPrice}`,
        actionLabel: 'View Deal',
        actionHandler: () => openNegotiation(match.id)
      });
    });
  });
  
  // Check for near matches (within 5%)
  user.activeOrders.forEach(order => {
    const nearMatches = findNearMatches(order.id, 0.05);
    
    nearMatches.forEach(nearMatch => {
      notify({
        type: 'near_match',
        priority: 'medium',
        title: '🔔 Close Match Available',
        message: `${nearMatch.type === 'bid' ? 'Buyer' : 'Seller'} willing to ${nearMatch.type} at ₹${nearMatch.price} (you: ₹${order.price})`,
        actionLabel: 'Counter Offer',
        actionHandler: () => quickCounter(order.id, nearMatch.id)
      });
    });
  });
  
  // Check for expiring orders
  user.activeOrders.forEach(order => {
    const timeLeft = order.expiresAt - Date.now();
    if (timeLeft < 600000 && timeLeft > 0) { // < 10 minutes
      notify({
        type: 'order_expiring',
        priority: 'low',
        title: '⏰ Order Expiring Soon',
        message: `Your ${order.type} for ${order.commodity.name} expires in ${Math.floor(timeLeft / 60000)} minutes`,
        actionLabel: 'Extend',
        actionHandler: () => extendOrder(order.id)
      });
    }
  });
  
  // Price alerts for watched commodities
  user.watchlist.forEach(commodityId => {
    const data = getCommodityData(commodityId);
    const priceChange = calculatePriceChange(commodityId, '1h');
    
    if (Math.abs(priceChange) > 10) { // >10% move
      notify({
        type: 'price_alert',
        priority: 'medium',
        title: '📊 Significant Price Movement',
        message: `${data.commodity.name} ${priceChange > 0 ? 'up' : 'down'} ${Math.abs(priceChange).toFixed(1)}% in last hour`,
        actionLabel: 'View Market',
        actionHandler: () => viewOrderBook(commodityId)
      });
    }
  });
}
```

## Data Models

### Enhanced Commodity Model

```typescript
const COMMODITIES: Commodity[] = [
  {
    id: 'rice',
    name: 'Rice',
    nameHi: 'चावल',
    nameTe: 'బియ్యం',
    nameTa: 'அரிசி',
    nameBn: 'চাল',
    unit: 'kg',
    basePrice: 50,
    category: 'grains',
    icon: '🍚',
    volatility: 0.02 // 2% typical price swing
  },
  {
    id: 'tomato',
    name: 'Tomatoes',
    nameHi: 'टमाटर',
    nameTe: 'టమోటాలు',
    nameTa: 'தக்காளி',
    nameBn: 'টমেটো',
    unit: 'kg',
    basePrice: 40,
    category: 'vegetables',
    icon: '🍅',
    volatility: 0.08 // 8% - more volatile
  },
  // ... 15-20 total commodities
  {
    id: 'mango',
    name: 'Mangoes',
    nameHi: 'आम',
    nameTe: 'మామిడి',
    nameTa: 'மாம்பழம்',
    nameBn: 'আম',
    unit: 'kg',
    basePrice: 80,
    category: 'fruits',
    icon: '🥭',
    volatility: 0.05,
    seasonal: true,
    peakMonths: [4, 5, 6] // Apr-Jun
  }
];
```

### LocalStorage Schema

```typescript
// Key: mandimind_user_profile
interface UserProfile {
  id: string;
  language: Language;
  activeOrders: string[]; // order IDs
  watchlist: string[]; // commodity IDs
  tradeHistory: string[]; // trade IDs
  preferences: {
    autoAcceptMatches: boolean;
    notificationPrefs: NotificationPrefs;
    defaultOrderExpiry: number; // milliseconds
  };
}

// Key: mandimind_orders
interface OrdersStore {
  version: 1;
  orders: Order[];
  lastCleanup: number; // timestamp
}

// Key: mandimind_trades
interface TradesStore {
  version: 1;
  trades: Trade[];
  lastCleanup: number;
}

// Key: mandimind_negotiations
interface NegotiationsStore {
  version: 1;
  negotiations: Negotiation[];
  lastCleanup: number;
}

// Key: mandimind_market_state
interface MarketStateStore {
  version: 1;
  lastUpdate: number;
  orderBooks: { [commodityId: string]: OrderBook };
  recentTrades: Trade[];
  marketStats: MarketStatistics;
}
```

## UI/UX Design Patterns

### Exchange Board Layout

```
┌─────────────────────────────────────────────────────────┐
│  🇮🇳 MandiMind Exchange - 77th Republic Day Special     │
│  Live Ticker: 1,247 trades today | ₹12.3L volume       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  [Exchange Board] [My Orders] [Dashboard]               │
└─────────────────────────────────────────────────────────┘

🔥 HOT DEALS (Narrow Spread < 5%)
┌──────────────┬──────────────┬──────────────┐
│ Tomatoes     │ Onions       │ Potatoes     │
│ BID ₹38      │ BID ₹32      │ BID ₹23      │
│ ASK ₹40 [2%] │ ASK ₹34 [6%] │ ASK ₹24 [4%] │
└──────────────┴──────────────┴──────────────┘

ALL MARKETS
┌─────────────────────────────────────────────┐
│ Rice 🍚                              ↑      │
│ BID ₹48/kg ← ₹4 SPREAD → ASK ₹52/kg       │
│ 12 bids | 8 asks | Vol: 2,450 kg          │
│ Last: ₹50/kg @ 2:15 PM                     │
│ [Quick Buy] [Quick Sell] [View Book]       │
├─────────────────────────────────────────────┤
│ Tomatoes 🍅                          ↑↑    │
│ BID ₹38/kg ← ₹2 SPREAD → ASK ₹40/kg       │
│ 18 bids | 15 asks | Vol: 3,200 kg         │
│ Last: ₹39/kg @ 2:18 PM   🔥 HOT DEAL      │
│ [Quick Buy] [Quick Sell] [View Book]       │
├─────────────────────────────────────────────┤
│ ... (15-20 commodities total)              │
└─────────────────────────────────────────────┘
```

### Order Book Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Exchange    TOMATOES 🍅    [Post Order]      │
│  Mid-Market: ₹39/kg | Spread: ₹2 (5.1%) | Vol: 3.2T    │
└─────────────────────────────────────────────────────────┘

MARKET DEPTH CHART
┌─────────────────────────────────────────────────────────┐
│                     ₹39                                 │
│  ████████████████░░│░░████████████                     │
│  BUY VOLUME         │        SELL VOLUME                │
│  (Green bars ←)     │     (→ Red bars)                 │
└─────────────────────────────────────────────────────────┘

ORDER BOOK
┌──────────────────────┬──────────────────────┐
│   BIDS (Buy Orders)  │  ASKS (Sell Orders)  │
├──────────────────────┼──────────────────────┤
│ ₹38/kg  50kg  ₹1900  │  ₹40/kg  30kg  ₹1200│
│ B-1234  2m ago       │  S-5678  5m ago      │
│ ▓▓▓▓▓▓▓▓░░           │  ▓▓▓▓░░              │
├──────────────────────┼──────────────────────┤
│ ₹37/kg  100kg ₹3700  │  ₹41/kg  75kg  ₹3075│
│ B-2345  8m ago       │  S-6789  12m ago     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓░       │  ▓▓▓▓▓▓▓▓░░          │
├──────────────────────┼──────────────────────┤
│ ₹36/kg  25kg  ₹900   │  ₹42/kg  40kg  ₹1680│
│ B-3456  15m ago      │  S-7890  20m ago     │
│ ▓▓▓▓░░               │  ▓▓▓▓▓░░             │
└──────────────────────┴──────────────────────┘

QUICK ORDER ENTRY
┌─────────────────────────────────────────────────────────┐
│ [BID] [ASK]                                             │
│ Price: [₹39] /kg  💡 Suggested: ₹39 (mid-market)       │
│ Qty:   [50] kg                                          │
│ Total: ₹1,950                                           │
│         [POST ORDER]                                    │
└─────────────────────────────────────────────────────────┘

NEAR MATCHES FOR YOU
┌─────────────────────────────────────────────────────────┐
│ 🎯 S-5678 selling at ₹40 - just ₹1 above mid-market    │
│    [Counter at ₹39.50] [Accept ₹40] [Negotiate]        │
└─────────────────────────────────────────────────────────┘
```

### Negotiation Room Layout

```
┌─────────────────────────────────────────────────────────┐
│  Negotiating: Tomatoes 🍅                    [Language▾]│
│  You (Seller): ₹40/kg ← ₹2 GAP → Buyer: ₹38/kg        │
│  Quantity: 50 kg | Started: 3m ago                      │
└─────────────────────────────────────────────────────────┘

MESSAGES
┌─────────────────────────────────────────────────────────┐
│ [Buyer] 3m ago                                   [हिंदी]│
│ "₹38 is my best offer for 50kg"                        │
│ "50kg के लिए ₹38 मेरा सबसे अच्छा प्रस्ताव है"         │
├─────────────────────────────────────────────────────────┤
│ [You] 2m ago                                     [తెలుగు]│
│ "Can you do ₹39? Quality is excellent"                 │
│ "మీరు ₹39 చేయగలరా? నాణ్యత అద్భుతమైనది"               │
├─────────────────────────────────────────────────────────┤
│ [AI Coach] 1m ago                                       │
│ 💡 Market avg is ₹39.50 - your counter is reasonable   │
│    Buyer likely to accept or meet halfway at ₹38.50    │
└─────────────────────────────────────────────────────────┘

QUICK ACTIONS
┌─────────────────────────────────────────────────────────┐
│ [Split Difference: ₹39] [Accept ₹38] [Counter: ₹39.50] │
│ [±₹1] [±₹5] [±10%]                                      │
└─────────────────────────────────────────────────────────┘

AI NEGOTIATION COACH
┌─────────────────────────────────────────────────────────┐
│ 🤖 Strategy Suggestion (85% confidence)                 │
│                                                         │
│ ✅ MODERATE APPROACH (Recommended)                      │
│ • Counter at ₹39 (split the difference)                │
│ • Emphasize product quality                            │
│ • Offer small bulk discount if buyer increases qty     │
│ Expected: Deal closes at ₹38.50-₹39                    │
│                                                         │
│ [View 2 More Strategies]                               │
└─────────────────────────────────────────────────────────┘

MESSAGE INPUT
┌─────────────────────────────────────────────────────────┐
│ [Type message in Telugu...                            ]│
│ Quick phrases: ["Best price?"] ["Deal!"] ["Final₹39"] │
│                                             [Send]      │
└─────────────────────────────────────────────────────────┘
```

## Theme Implementation

### Tricolor Design System

```typescript
const EXCHANGE_THEME = {
  colors: {
    // Primary tricolor
    saffron: '#FF9933',
    white: '#FFFFFF',
    green: '#138808',
    navyBlue: '#000080',
    
    // Semantic colors
    buy: '#138808',    // Green for bids/buying
    sell: '#FF9933',   // Saffron for asks/selling
    neutral: '#000080', // Navy for informational
    
    // UI states
    success: '#138808',
    warning: '#FFB366',
    danger: '#FF4444',
    
    // Backgrounds
    bgLight: '#FAFAFA',
    bgWhite: '#FFFFFF',
    bgDark: '#1A1A1A',
    
    // Text
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textLight: '#999999',
  },
  
  gradients: {
    header: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
    buyButton: 'linear-gradient(135deg, #138808 0%, #1AAA0A 100%)',
    sellButton: 'linear-gradient(135deg, #FF9933 0%, #FFB366 100%)',
    hotDeal: 'linear-gradient(90deg, #FF9933 0%, #138808 100%)',
    celebration: 'linear-gradient(45deg, #FF9933, #FFFFFF, #138808)',
  },
  
  animations: {
    hotDealPulse: 'pulse 2s ease-in-out infinite',
    matchFound: 'bounce 0.5s',
    priceUpdate: 'flash 0.3s',
    dealClosed: 'confetti 1s',
  }
};

// Tailwind config
module.exports = {
  theme: {
    extend: {
      colors: EXCHANGE_THEME.colors,
      backgroundImage: EXCHANGE_THEME.gradients,
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-once': 'bounce 0.5s',
      },
    },
  },
};
```

### Visual Indicators

```typescript
// Spread color coding
function getSpreadColor(spreadPercent: number): string {
  if (spreadPercent < 5) return 'text-green-600'; // Hot deal
  if (spreadPercent < 15) return 'text-yellow-600'; // Normal
  return 'text-red-600'; // Wide spread
}

// Momentum indicators
function getMomentumIcon(momentum: Momentum): string {
  const icons = {
    surge_up: '↑↑',
    up: '↑',
    stable: '→',
    down: '↓',
    surge_down: '↓↓'
  };
  return icons[momentum];
}

function getMomentumColor(momentum: Momentum): string {
  const colors = {
    surge_up: 'text-green-700',
    up: 'text-green-500',
    stable: 'text-gray-500',
    down: 'text-red-500',
    surge_down: 'text-red-700'
  };
  return colors[momentum];
}

// Hot deal animation
const hotDealStyle = {
  border: '2px solid transparent',
  backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #FF9933, #138808)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  animation: 'pulse-slow 3s infinite',
};
```

## Performance Optimization

### Efficient Rendering

1. **Virtual Scrolling** for Order Books
   - Only render visible orders (20-30 at a time)
   - Use `react-window` or custom virtualization
   - Lazy load order details on hover

2. **Debounced Market Updates**
   - Batch multiple order updates
   - Update UI at max 60fps
   - Use `requestAnimationFrame` for smooth animations

3. **Memoization**
   - Memoize expensive calculations (depth charts, spread %)
   - Use React.memo for CommodityCard components
   - Cache translated strings

4. **LocalStorage Optimization**
   - Compress old data
   - Limit history to 500 trades, 200 orders
   - Periodic cleanup of expired orders

### Code Splitting

```typescript
// Lazy load heavy components
const OrderBookView = lazy(() => import('./components/OrderBookView'));
const NegotiationRoom = lazy(() => import('./components/NegotiationRoom'));
const DepthChart = lazy(() => import('./components/DepthChart'));

// Preload on hover
<CommodityCard
  onMouseEnter={() => preload(OrderBookView)}
  onClick={() => navigate('/orderbook')}
/>
```

## Testing Strategy (Enhanced)

### Property-Based Tests for Trading Logic

```typescript
// Property: Order matching is fair
test('matched trades use fair mid-price', () => {
  fc.assert(
    fc.property(
      fc.record({
        bidPrice: fc.float({ min: 10, max: 100 }),
        askPrice: fc.float({ min: 10, max: 100 })
      }).filter(({bidPrice, askPrice}) => bidPrice >= askPrice),
      ({bidPrice, askPrice}) => {
        const match = createMatch(bidPrice, askPrice);
        const midPrice = (bidPrice + askPrice) / 2;
        expect(match.matchPrice).toBe(midPrice);
      }
    )
  );
});

// Property: Spread calculation is accurate
test('spread always equals ask minus bid', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 10, max: 100 }),
      fc.float({ min: 0.01, max: 20 }),
      (askPrice, spreadAmount) => {
        const bidPrice = askPrice - spreadAmount;
        const spread = calculateSpread(bidPrice, askPrice);
        expect(spread).toBeCloseTo(spreadAmount, 2);
      }
    )
  );
});

// Property: Order book sorting is maintained
test('bids sorted descending, asks ascending', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        price: fc.float({ min: 10, max: 100 }),
        quantity: fc.integer({ min: 1, max: 500 })
      })),
      (orders) => {
        const bids = orders.map(o => ({...o, type: 'bid'}));
        const asks = orders.map(o => ({...o, type: 'ask'}));
        
        const book = createOrderBook(bids, asks);
        
        // Check bids descending
        for (let i = 1; i < book.bids.length; i++) {
          expect(book.bids[i-1].price).toBeGreaterThanOrEqual(book.bids[i].price);
        }
        
        // Check asks ascending
        for (let i = 1; i < book.asks.length; i++) {
          expect(book.asks[i-1].price).toBeLessThanOrEqual(book.asks[i].price);
        }
      }
    )
  );
});
```

### Integration Tests for User Flows

```typescript
test('Complete trade flow: post ask → receive bid → negotiate → deal', async () => {
  // 1. Seller posts ask
  const ask = postOrder({
    type: 'ask',
    commodityId: 'tomato',
    price: 40,
    quantity: 50
  });
  
  expect(ask.status).toBe('active');
  
  // 2. Buyer posts bid
  const bid = postOrder({
    type: 'bid',
    commodityId: 'tomato',
    price: 38,
    quantity: 50
  });
  
  // 3. System finds near match
  const nearMatches = findNearMatches(ask.id, 0.10);
  expect(nearMatches).toContain(bid);
  
  // 4. Notification sent
  await waitFor(() => {
    expect(getNotifications(ask.traderId)).toContainEqual(
      expect.objectContaining({
        type: 'near_match',
        message: expect.stringContaining('₹38')
      })
    );
  });
  
  // 5. Start negotiation
  const negotiation = createNegotiation(bid.id, ask.id);
  expect(negotiation.status).toBe('active');
  
  // 6. Counter offer
  counterOffer(negotiation.id, ask.traderId, 39);
  expect(negotiation.currentSellerOffer).toBe(39);
  
  // 7. Accept
  const trade = acceptOffer(negotiation.id, bid.traderId);
  
  expect(trade.price).toBe(39);
  expect(trade.quantity).toBe(50);
  expect(ask.status).toBe('matched');
  expect(bid.status).toBe('matched');
});
```

### Performance Tests

```typescript
test('Exchange board renders 20 commodities in <500ms', () => {
  const start = performance.now();
  
  render(<ExchangeBoard commodities={COMMODITIES} />);
  
  const end = performance.now();
  expect(end - start).toBeLessThan(500);
});

test('Order book handles 100+ orders without lag', () => {
  const orders = generateOrders(100);
  
  const start = performance.now();
  render(<OrderBookView orders={orders} />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(1000);
});

test('Market simulation runs smoothly', () => {
  const frameDelays: number[] = [];
  let lastTime = performance.now();
  
  const interval = setInterval(() => {
    simulateMarketTick();
    const now = performance.now();
    frameDelays.push(now - lastTime);
    lastTime = now;
  }, 3000);
  
  setTimeout(() => {
    clearInterval(interval);
    const avgDelay = average(frameDelays);
    expect(avgDelay).toBeLessThan(100); // <100ms overhead
  }, 30000);
});
```

## Deployment

### Build Configuration

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'exchange': ['./src/components/ExchangeBoard'],
          'orderbook': ['./src/components/OrderBookView'],
          'negotiation': ['./src/components/NegotiationRoom'],
          'vendor': ['react', 'react-dom']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
};
```

### Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Future Enhancements

### Phase 2 Features

1. **Real Backend Integration**
   - Replace mock data with actual API
   - WebSocket for true real-time updates
   - User authentication & profiles

2. **Advanced Order Types**
   - Limit orders (execute at specific price)
   - Stop-loss orders
   - Fill-or-kill orders
   - Good-till-cancelled orders

3. **Market Analytics**
   - Historical price charts (candlesticks)
   - Volume analysis
   - Technical indicators (MA, RSI, MACD)
   - Predictive analytics using ML

4. **Social Features**
   - Trader profiles & reputation
   - Follow successful traders
   - Community chat rooms
   - Deal reviews & ratings

5. **Mobile Native Apps**
   - React Native version
   - Push notifications
   - Offline mode
   - QR code trading

This enhanced design creates a truly dynamic, engaging trading experience that goes far beyond static price discovery, making MandiMind a pioneering platform for India's agricultural markets. 🇮🇳
