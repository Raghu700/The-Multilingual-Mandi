# 24-Hour Hackathon Implementation Roadmap

## Time Budget Breakdown

```
Total Time: 24 hours
Sleep: 0 hours (powered by Republic Day spirit! 🇮🇳)

Recommended Schedule:
├─ Hour 0-2:   Setup & Core Architecture (2h)
├─ Hour 2-8:   Exchange Board & Market Simulation (6h)  ⭐ MVP Core
├─ Hour 8-14:  Order Book & Matching Engine (6h)        ⭐ MVP Core
├─ Hour 14-18: Negotiation Room (4h)                    ⭐ MVP Core
├─ Hour 18-21: UI Polish & Multilingual (3h)
├─ Hour 21-23: Testing & Bug Fixes (2h)
└─ Hour 23-24: Deploy & Demo Prep (1h)
```

## MVP Feature Prioritization

### MUST HAVE (Core Experience)
1. **Exchange Board** - Live view of all commodities with bid/ask spreads
2. **Order Posting** - Quick form to post bids/asks
3. **Order Book** - See all orders for a commodity
4. **Basic Matching** - Highlight when orders overlap
5. **Negotiation Room** - Chat-like interface with counter-offers
6. **Hindi Translation** - At least one Indian language working
7. **LocalStorage** - Persist orders between sessions

### SHOULD HAVE (Enhanced Experience)
1. **Market Simulation** - Auto-generate fake orders/trades
2. **AI Coach** - Basic hardcoded negotiation tips
3. **Near Match Alerts** - Notify when close to a deal
4. **Quick Counter Buttons** - One-click split-difference
5. **Price Trends** - Up/down/stable indicators
6. **3 More Languages** - Telugu, Tamil, Bengali

### NICE TO HAVE (Wow Factor)
1. **Claude API Integration** - Advanced AI coaching
2. **Market Depth Chart** - Visual volume representation
3. **Celebration Animations** - Confetti on deal close
4. **Dashboard** - User's active orders view
5. **Hot Deals Panel** - Highlight narrow spreads
6. **Mobile Optimizations** - Touch-friendly gestures

### OUT OF SCOPE (Post-Hackathon)
- Real backend/database
- User authentication
- Payment processing
- WebSocket (use interval-based updates)
- Advanced charts/analytics
- Mobile native apps

## Hour-by-Hour Plan

### Hour 0-1: Project Setup

**Goal**: Get development environment running

```bash
# Create project
npm create vite@latest mandimind-exchange -- --template react-ts
cd mandimind-exchange
npm install

# Install dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Additional packages
npm install zustand # State management (simpler than Redux)
npm install date-fns # Date formatting
npm install clsx # Conditional CSS classes
```

**Setup Tailwind** with tricolor theme:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#FF9933',
        green: '#138808',
        navy: '#000080',
      },
    },
  },
  plugins: [],
};
```

**Create folder structure**:
```
src/
├── components/
│   ├── ExchangeBoard.tsx
│   ├── CommodityCard.tsx
│   ├── OrderBook.tsx
│   ├── NegotiationRoom.tsx
│   └── ...
├── services/
│   ├── market.ts          # Market simulation
│   ├── orders.ts          # Order management
│   ├── matching.ts        # Match engine
│   ├── translation.ts     # i18n
│   └── storage.ts         # LocalStorage wrapper
├── store/
│   └── useStore.ts        # Zustand store
├── types/
│   └── index.ts           # TypeScript interfaces
├── data/
│   ├── commodities.ts     # Commodity list
│   └── phrases.ts         # Translation phrases
└── utils/
    └── helpers.ts         # Utility functions
```

**Deliverable**: Empty React app with Tailwind working

---

### Hour 1-2: Core Data Models & Store

**Goal**: Define all TypeScript interfaces and setup state management

**Create types** (`src/types/index.ts`):
```typescript
export type Language = 'en' | 'hi' | 'te' | 'ta' | 'bn';
export type Momentum = 'surge_up' | 'up' | 'stable' | 'down' | 'surge_down';

export interface Commodity {
  id: string;
  name: string;
  nameHi: string;
  unit: string;
  basePrice: number;
  icon: string;
  volatility: number;
}

export interface Order {
  id: string;
  type: 'bid' | 'ask';
  commodityId: string;
  price: number;
  quantity: number;
  unit: string;
  traderId: string;
  timestamp: number;
  expiresAt: number;
  status: 'active' | 'matched' | 'expired';
}

// ... rest of interfaces from design doc
```

**Setup Zustand store** (`src/store/useStore.ts`):
```typescript
import create from 'zustand';
import { Commodity, Order, Trade } from '../types';

interface AppState {
  language: Language;
  commodities: Commodity[];
  orders: Order[];
  trades: Trade[];
  userOrders: string[];
  
  // Actions
  setLanguage: (lang: Language) => void;
  addOrder: (order: Order) => void;
  cancelOrder: (orderId: string) => void;
  // ... more actions
}

export const useStore = create<AppState>((set) => ({
  language: 'en',
  commodities: [],
  orders: [],
  trades: [],
  userOrders: [],
  
  setLanguage: (lang) => set({ language: lang }),
  addOrder: (order) => set((state) => ({
    orders: [...state.orders, order]
  })),
  // ... implement actions
}));
```

**Create commodity data** (`src/data/commodities.ts`):
```typescript
export const COMMODITIES: Commodity[] = [
  {
    id: 'rice',
    name: 'Rice',
    nameHi: 'चावल',
    unit: 'kg',
    basePrice: 50,
    icon: '🍚',
    volatility: 0.02
  },
  // ... add all 15-20 commodities
];
```

**Deliverable**: Complete type system and state management

---

### Hour 2-5: Exchange Board (3 hours)

**Goal**: Main screen showing all markets

**Component hierarchy**:
```
ExchangeBoard
├── LiveTicker (total trades, volume)
├── HotDealsPanel (narrow spread commodities)
└── CommodityList
    └── CommodityCard (x15-20)
```

**Implement CommodityCard** (`src/components/CommodityCard.tsx`):
```tsx
interface Props {
  commodity: Commodity;
  marketData: MarketData;
  onViewBook: () => void;
}

export function CommodityCard({ commodity, marketData, onViewBook }: Props) {
  const { bestBid, bestAsk, spread, spreadPercent, momentum } = marketData;
  
  const isHotDeal = spreadPercent < 5;
  
  return (
    <div className={`
      border rounded-lg p-4
      ${isHotDeal ? 'border-saffron animate-pulse-slow' : 'border-gray-300'}
    `}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{commodity.icon}</span>
        <span className={getMomentumColor(momentum)}>
          {getMomentumIcon(momentum)}
        </span>
      </div>
      
      <h3 className="font-bold text-lg mt-2">{commodity.name}</h3>
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-green-600">
          <div className="text-xs">BID</div>
          <div className="font-bold">₹{bestBid}</div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-gray-500">SPREAD</div>
          <div className="font-bold">₹{spread}</div>
          <div className="text-xs">({spreadPercent}%)</div>
        </div>
        
        <div className="text-saffron">
          <div className="text-xs">ASK</div>
          <div className="font-bold">₹{bestAsk}</div>
        </div>
      </div>
      
      {isHotDeal && (
        <div className="mt-2 text-center text-sm font-bold text-saffron">
          🔥 HOT DEAL
        </div>
      )}
      
      <button
        onClick={onViewBook}
        className="mt-4 w-full bg-navy text-white py-2 rounded"
      >
        View Book
      </button>
    </div>
  );
}
```

**Deliverable**: Working exchange board with all commodities displayed

---

### Hour 5-8: Market Simulation (3 hours)

**Goal**: Auto-generate realistic market activity

**Implement market simulator** (`src/services/market.ts`):
```typescript
export class MarketSimulator {
  private interval: NodeJS.Timeout | null = null;
  
  start() {
    this.interval = setInterval(() => {
      this.simulateTick();
    }, 5000); // Every 5 seconds
  }
  
  stop() {
    if (this.interval) clearInterval(this.interval);
  }
  
  private simulateTick() {
    // 1. Generate 1-3 random orders
    const numOrders = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numOrders; i++) {
      const commodity = this.randomCommodity();
      const order = this.generateOrder(commodity);
      useStore.getState().addOrder(order);
    }
    
    // 2. Try to match orders
    this.attemptMatches();
    
    // 3. Update trends
    this.updateMomentum();
    
    // 4. Expire old orders
    this.expireOrders();
  }
  
  private generateOrder(commodity: Commodity): Order {
    const marketData = this.getMarketData(commodity.id);
    const type = Math.random() > 0.5 ? 'bid' : 'ask';
    
    const basePrice = marketData.midPrice || commodity.basePrice;
    const variation = type === 'bid' ? -0.05 : 0.05;
    const random = (Math.random() - 0.5) * 0.1;
    const price = Math.round(basePrice * (1 + variation + random));
    
    const quantity = Math.floor(Math.random() * 95) + 5; // 5-100
    
    return {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      commodityId: commodity.id,
      price,
      quantity,
      unit: commodity.unit,
      traderId: type === 'bid' ? `B-${this.randomId()}` : `S-${this.randomId()}`,
      timestamp: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
      status: 'active'
    };
  }
  
  private attemptMatches() {
    // Find overlapping bid/ask pairs
    const { orders } = useStore.getState();
    
    for (const bid of orders.filter(o => o.type === 'bid' && o.status === 'active')) {
      for (const ask of orders.filter(o => o.type === 'ask' && o.status === 'active')) {
        if (bid.commodityId === ask.commodityId && bid.price >= ask.price) {
          // Match found!
          if (Math.random() > 0.7) { // 30% auto-accept rate
            this.executeMatch(bid, ask);
          }
        }
      }
    }
  }
}
```

**Integrate into app**:
```tsx
// In App.tsx
useEffect(() => {
  const simulator = new MarketSimulator();
  simulator.start();
  
  return () => simulator.stop();
}, []);
```

**Deliverable**: Self-updating exchange with realistic activity

---

### Hour 8-11: Order Book View (3 hours)

**Goal**: Detailed view of all orders for one commodity

**Component structure**:
```
OrderBookView
├── OrderBookHeader (commodity info, spread)
├── OrderBookTable
│   ├── BidsSide (left column)
│   └── AsksSide (right column)
└── QuickOrderForm
```

**Implement OrderBookTable** (`src/components/OrderBookTable.tsx`):
```tsx
export function OrderBookTable({ commodityId }: { commodityId: string }) {
  const orders = useStore(state => 
    state.orders.filter(o => o.commodityId === commodityId && o.status === 'active')
  );
  
  const bids = orders
    .filter(o => o.type === 'bid')
    .sort((a, b) => b.price - a.price); // Descending
    
  const asks = orders
    .filter(o => o.type === 'ask')
    .sort((a, b) => a.price - b.price); // Ascending
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* BIDS (left) */}
      <div>
        <h3 className="text-green-600 font-bold mb-4">🟢 BIDS (Buy)</h3>
        {bids.map(bid => (
          <OrderRow key={bid.id} order={bid} side="bid" />
        ))}
      </div>
      
      {/* ASKS (right) */}
      <div>
        <h3 className="text-saffron font-bold mb-4">🟠 ASKS (Sell)</h3>
        {asks.map(ask => (
          <OrderRow key={ask.id} order={ask} side="ask" />
        ))}
      </div>
    </div>
  );
}

function OrderRow({ order, side }: { order: Order; side: 'bid' | 'ask' }) {
  const totalValue = order.price * order.quantity;
  const timeAgo = formatDistanceToNow(order.timestamp);
  
  // Calculate volume bar width (relative to max order)
  const maxQty = 100; // Assume max 100kg for demo
  const barWidth = (order.quantity / maxQty) * 100;
  
  return (
    <div className={`
      border p-3 mb-2 rounded
      ${side === 'bid' ? 'border-green-200' : 'border-orange-200'}
      hover:shadow-md cursor-pointer
    `}>
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">
          ₹{order.price}/{order.unit}
        </div>
        <div className="text-sm text-gray-600">
          {order.quantity}{order.unit}
        </div>
      </div>
      
      <div className="mt-1 text-sm text-gray-500">
        Total: ₹{totalValue.toLocaleString()} | {order.traderId}
      </div>
      
      <div className="text-xs text-gray-400 mt-1">
        {timeAgo} ago
      </div>
      
      {/* Volume bar */}
      <div className="mt-2 h-1 bg-gray-200 rounded">
        <div 
          className={`h-full rounded ${side === 'bid' ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
```

**Deliverable**: Complete order book with bid/ask display

---

### Hour 11-14: Order Posting & Matching (3 hours)

**Goal**: Users can post orders and see matches

**Implement QuickOrderForm** (`src/components/QuickOrderForm.tsx`):
```tsx
export function QuickOrderForm({ commodityId }: { commodityId: string }) {
  const [orderType, setOrderType] = useState<'bid' | 'ask'>('bid');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const addOrder = useStore(state => state.addOrder);
  const commodity = useStore(state => 
    state.commodities.find(c => c.id === commodityId)
  );
  
  const marketData = useMarketData(commodityId);
  
  const handleSubmit = () => {
    const order: Order = {
      id: `ORD-USER-${Date.now()}`,
      type: orderType,
      commodityId,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      unit: commodity!.unit,
      traderId: 'USER-1234', // Mock user ID
      timestamp: Date.now(),
      expiresAt: Date.now() + 14400000, // 4 hours
      status: 'active'
    };
    
    addOrder(order);
    
    // Reset form
    setPrice('');
    setQuantity('');
    
    // Check for matches
    checkForMatches(order);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-4">Post Your Order</h3>
      
      {/* Bid/Ask Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setOrderType('bid')}
          className={`flex-1 py-2 rounded ${
            orderType === 'bid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          🟢 BUY
        </button>
        <button
          onClick={() => setOrderType('ask')}
          className={`flex-1 py-2 rounded ${
            orderType === 'ask'
              ? 'bg-saffron text-white'
              : 'bg-gray-200'
          }`}
        >
          🟠 SELL
        </button>
      </div>
      
      {/* Price Input */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Price per {commodity?.unit}</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="₹"
        />
        <div className="mt-1 flex gap-2 text-xs">
          <button
            onClick={() => setPrice(marketData.midPrice.toString())}
            className="text-blue-600"
          >
            Mid: ₹{marketData.midPrice}
          </button>
          <button
            onClick={() => setPrice(marketData.bestBid?.toString() || '')}
            className="text-green-600"
          >
            Best Bid: ₹{marketData.bestBid}
          </button>
          <button
            onClick={() => setPrice(marketData.bestAsk?.toString() || '')}
            className="text-orange-600"
          >
            Best Ask: ₹{marketData.bestAsk}
          </button>
        </div>
      </div>
      
      {/* Quantity Input */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Quantity ({commodity?.unit})</label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full border rounded px-3 py-2"
          placeholder="0"
        />
      </div>
      
      {/* Total */}
      <div className="mb-4 text-right">
        <span className="text-gray-600">Total: </span>
        <span className="font-bold text-lg">
          ₹{(parseFloat(price || '0') * parseFloat(quantity || '0')).toLocaleString()}
        </span>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={!price || !quantity}
        className={`w-full py-3 rounded font-bold ${
          orderType === 'bid'
            ? 'bg-green-600 text-white'
            : 'bg-saffron text-white'
        } disabled:opacity-50`}
      >
        POST {orderType.toUpperCase()} ORDER
      </button>
    </div>
  );
}
```

**Implement match detection**:
```typescript
function checkForMatches(newOrder: Order) {
  const { orders } = useStore.getState();
  
  const oppositeType = newOrder.type === 'bid' ? 'ask' : 'bid';
  const candidates = orders.filter(o =>
    o.type === oppositeType &&
    o.commodityId === newOrder.commodityId &&
    o.status === 'active'
  );
  
  for (const candidate of candidates) {
    // Exact match
    if (newOrder.type === 'bid' && newOrder.price >= candidate.price) {
      showMatchNotification(newOrder, candidate, 'exact');
    } else if (newOrder.type === 'ask' && newOrder.price <= candidate.price) {
      showMatchNotification(newOrder, candidate, 'exact');
    }
    
    // Near match (within 5%)
    const spread = Math.abs(newOrder.price - candidate.price);
    const avgPrice = (newOrder.price + candidate.price) / 2;
    if (spread / avgPrice < 0.05) {
      showMatchNotification(newOrder, candidate, 'near');
    }
  }
}
```

**Deliverable**: Users can post orders and see match alerts

---

### Hour 14-18: Negotiation Room (4 hours)

**Goal**: Private chat for buyer-seller negotiation

**Component structure**:
```
NegotiationRoom
├── NegotiationHeader (deal summary, spread viz)
├── MessageThread (chat history)
├── QuickCounterButtons (split diff, ±amounts)
├── AICoachPanel (suggestions)
└── MessageInput (compose)
```

**Implement NegotiationRoom** (`src/components/NegotiationRoom.tsx`):
```tsx
interface Message {
  id: string;
  sender: 'user' | 'other' | 'system' | 'ai';
  text: string;
  timestamp: number;
  offerPrice?: number;
}

export function NegotiationRoom({ 
  buyerOrder, 
  sellerOrder 
}: { 
  buyerOrder: Order; 
  sellerOrder: Order; 
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOffer, setCurrentOffer] = useState({
    buyer: buyerOrder.price,
    seller: sellerOrder.price
  });
  
  const spread = currentOffer.seller - currentOffer.buyer;
  const spreadPercent = (spread / currentOffer.seller) * 100;
  
  const handleCounter = (newPrice: number, role: 'buyer' | 'seller') => {
    setCurrentOffer(prev => ({
      ...prev,
      [role]: newPrice
    }));
    
    addMessage({
      sender: role === 'buyer' ? 'user' : 'other',
      text: `Countered at ₹${newPrice}/${buyerOrder.unit}`,
      offerPrice: newPrice
    });
    
    // AI response
    setTimeout(() => {
      const aiAdvice = getAIAdvice(newPrice, currentOffer);
      addMessage({
        sender: 'ai',
        text: aiAdvice
      });
    }, 1000);
  };
  
  const handleAccept = () => {
    const finalPrice = (currentOffer.buyer + currentOffer.seller) / 2;
    
    // Create trade
    const trade: Trade = {
      id: `TRADE-${Date.now()}`,
      commodityId: buyerOrder.commodityId,
      price: finalPrice,
      quantity: Math.min(buyerOrder.quantity, sellerOrder.quantity),
      buyerId: buyerOrder.traderId,
      sellerId: sellerOrder.traderId,
      timestamp: Date.now()
    };
    
    useStore.getState().addTrade(trade);
    
    // Show celebration
    showCelebration(trade);
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-saffron via-white to-green p-4">
        <h2 className="font-bold text-lg">
          Negotiating: {getCommodityName(buyerOrder.commodityId)}
        </h2>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="text-sm">You (Seller):</span>
            <span className="font-bold ml-2">₹{currentOffer.seller}</span>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600">GAP</div>
            <div className="font-bold text-red-600">₹{spread}</div>
            <div className="text-xs">({spreadPercent.toFixed(1)}%)</div>
          </div>
          <div>
            <span className="text-sm">Buyer:</span>
            <span className="font-bold ml-2">₹{currentOffer.buyer}</span>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              const midPrice = (currentOffer.buyer + currentOffer.seller) / 2;
              handleCounter(midPrice, 'seller');
            }}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            Split Diff: ₹{((currentOffer.buyer + currentOffer.seller) / 2).toFixed(2)}
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            Accept ₹{currentOffer.buyer}
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleCounter(currentOffer.seller - 1, 'seller')}
            className="px-4 py-2 border rounded"
          >
            -₹1
          </button>
          <button
            onClick={() => handleCounter(currentOffer.seller - 5, 'seller')}
            className="px-4 py-2 border rounded"
          >
            -₹5
          </button>
          <button
            onClick={() => handleCounter(currentOffer.seller + 1, 'seller')}
            className="px-4 py-2 border rounded"
          >
            +₹1
          </button>
          <button
            onClick={() => handleCounter(currentOffer.seller + 5, 'seller')}
            className="px-4 py-2 border rounded"
          >
            +₹5
          </button>
        </div>
      </div>
      
      {/* AI Coach */}
      <AICoachPanel
        buyerOffer={currentOffer.buyer}
        sellerOffer={currentOffer.seller}
        marketAvg={getMarketAvg(buyerOrder.commodityId)}
      />
    </div>
  );
}
```

**Deliverable**: Working negotiation interface with basic AI tips

---

### Hour 18-21: Multilingual & UI Polish (3 hours)

**Goal**: Add Hindi, Telugu, Tamil, Bengali support + visual polish

**Translation service** (`src/services/translation.ts`):
```typescript
const TRANSLATIONS = {
  exchange_board: {
    en: 'Exchange Board',
    hi: 'विनिमय बोर्ड',
    te: 'ఎక్స్చేంజ్ బోర్డ్',
    ta: 'பரிமாற்ற பலகை',
    bn: 'এক্সচেঞ্জ বোর্ড'
  },
  bid: {
    en: 'BID',
    hi: 'खरीद',
    te: 'కొనుగోలు',
    ta: 'வாங்கு',
    bn: 'ক্রয়'
  },
  // ... all UI strings
};

export function translate(key: string, lang: Language): string {
  return TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.en || key;
}

// Commodity names
export function getCommodityName(id: string, lang: Language): string {
  const commodity = COMMODITIES.find(c => c.id === id);
  if (!commodity) return id;
  
  const nameMap = {
    en: commodity.name,
    hi: commodity.nameHi,
    te: commodity.nameTe,
    ta: commodity.nameTa,
    bn: commodity.nameBn
  };
  
  return nameMap[lang] || commodity.name;
}
```

**Language selector**:
```tsx
export function LanguageSelector() {
  const { language, setLanguage } = useStore();
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'bn', name: 'বাংলা' }
  ];
  
  return (
    <select
      value={language}
      onChange={e => setLanguage(e.target.value as Language)}
      className="border rounded px-3 py-2"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

**Add animations**:
```css
/* Hot deal pulse */
@keyframes pulse-slow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 153, 51, 0.7);
  }
  50% { 
    box-shadow: 0 0 20px 10px rgba(255, 153, 51, 0);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}

/* Match found bounce */
@keyframes bounce-once {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animate-bounce-once {
  animation: bounce-once 0.5s;
}

/* Deal celebration confetti */
@keyframes confetti {
  0% { 
    opacity: 1;
    transform: translateY(0) rotate(0deg);
  }
  100% { 
    opacity: 0;
    transform: translateY(-100px) rotate(360deg);
  }
}
```

**Deliverable**: Full i18n support + polished UI

---

### Hour 21-23: Testing & Bug Fixes (2 hours)

**Manual testing checklist**:
- [ ] Exchange board loads and shows all commodities
- [ ] Can post bid order successfully
- [ ] Can post ask order successfully
- [ ] Match detection works for exact overlaps
- [ ] Near match notifications appear
- [ ] Negotiation room opens correctly
- [ ] Counter-offers update state
- [ ] Split difference button works
- [ ] Accept button closes deal
- [ ] Celebration shows on deal
- [ ] Language switching works for all 5 languages
- [ ] Commodity names translate correctly
- [ ] UI labels translate correctly
- [ ] LocalStorage persists orders
- [ ] Market simulation generates orders
- [ ] Orders expire correctly
- [ ] Mobile view is usable
- [ ] All buttons are clickable
- [ ] No console errors

**Common bugs to fix**:
1. State not updating → Check Zustand selectors
2. Orders not appearing → Verify LocalStorage keys
3. Prices showing NaN → Add null checks
4. Translation missing → Add fallback to English
5. Animation janky → Use CSS transforms not position

**Deliverable**: Stable, working demo

---

### Hour 23-24: Deploy & Demo Prep (1 hour)

**Build for production**:
```bash
npm run build
```

**Deploy to Vercel**:
```bash
npm install -g vercel
vercel --prod
```

**Create demo script**:
```markdown
# MandiMind Exchange Demo Script

## Opening (30 seconds)
"Welcome to MandiMind Exchange! India's first digital mandi celebrating
our 77th Republic Day. We're transforming how 50 million vendors trade
by making markets transparent, multilingual, and AI-powered."

## Demo Flow (3 minutes)

1. **Exchange Board** (30s)
   - "Here's the live market - 20 commodities trading right now"
   - Point out hot deals (narrow spreads)
   - "See tomatoes? Just 2% spread - perfect time to trade!"

2. **Order Book** (45s)
   - Click tomatoes → "Full transparency - all bids and asks"
   - "I'm a seller, let me list at ₹40/kg"
   - Post order → appears instantly
   - "Smart suggestions tell me I could sell faster at ₹39"

3. **Match & Negotiate** (90s)
   - Point out near match: "A buyer at ₹38 - close!"
   - Click negotiate → chat opens
   - "Everything translates - I speak Telugu, buyer speaks Hindi"
   - Show AI coach: "Split difference at ₹39"
   - Click split → both accept → DEAL CLOSED
   - Confetti celebration! 🎉

4. **Multilingual** (15s)
   - Switch language → "Works in 5 languages"
   - "Breaking language barriers for traders across India"

## Closing (15 seconds)
"MandiMind Exchange - bringing transparency, technology, and unity
to India's agricultural markets. Jai Hind! 🇮🇳"
```

**Screenshots for submission**:
1. Exchange Board with hot deals
2. Order Book with depth visualization
3. Negotiation Room with AI coach
4. Deal celebration with confetti
5. Mobile responsive view

**Deliverable**: Live demo + deployment link

---

## Backup Plans

### If Behind Schedule

**Cut these features first** (in order):
1. Market depth chart visualization
2. Claude API integration (use only hardcoded tips)
3. Bengali + Tamil languages (keep just English + Hindi + Telugu)
4. Dashboard view
5. Hot deals panel
6. Celebration animations
7. Advanced filtering/sorting

**MVP Absolute Minimum**:
- Exchange board showing commodities
- Post bid/ask form
- Order book list view
- Basic match detection
- Simple chat (no AI)
- English + Hindi only

### If Ahead of Schedule

**Add these wow factors**:
1. Sound effects (ding on match, cheer on deal)
2. Dark mode toggle
3. Export trade history as CSV
4. Share deal on social media
5. Leaderboard (top traders)
6. Price alerts/watchlist
7. Historical price charts

---

## Development Tips

### Speed Up Coding

1. **Use Copilot/AI**: Let AI generate boilerplate
2. **Component library**: Consider shadcn/ui for faster UI
3. **Skip tests initially**: Add only for critical logic
4. **Mock everything**: No real APIs except optional Claude
5. **Copy-paste freely**: Reuse patterns across components

### Avoid Time Sinks

- Don't over-engineer state management
- Don't obsess over perfect TypeScript types
- Don't build custom validation - use HTML5
- Don't make pixel-perfect responsive - "good enough" is fine
- Don't add features not in MVP list

### Stay Energized

- Pomodoro: 50min code, 10min break
- Music/playlist for focus
- Quick meals (keep coding!)
- Celebrate small wins
- Remember: It's a hackathon, not production!

---

## Final Checklist

Before submitting:

- [ ] App loads without errors
- [ ] Can complete full trade flow end-to-end
- [ ] At least 2 languages working (English + Hindi minimum)
- [ ] Republic Day theme clearly visible
- [ ] Demo video recorded (2-3 mins)
- [ ] README with:
  - [ ] Project description
  - [ ] Features list
  - [ ] Tech stack
  - [ ] How to run locally
  - [ ] Screenshots
  - [ ] Demo link
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel/Netlify
- [ ] Submission form filled

---

## Good Luck! 🇮🇳

Remember: The goal isn't perfection - it's a working demo that shows
the vision. Focus on making the core trading flow smooth, the UI
delightful, and the Republic Day theme shine through.

**Make India proud! Jai Hind!** 🇮🇳
