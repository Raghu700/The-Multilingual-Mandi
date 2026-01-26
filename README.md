# EktaMandi (एकतामंडी) - Unity Market 🇮🇳

## India's 77th Republic Day Special - Hackathon Entry

> **Creating a Real-time Linguistic Bridge for Local Trade**
> A web platform for local vendors that provides instant AI-driven price discovery and negotiation tools

![Republic Day](https://img.shields.io/badge/26%20January%202026-77th%20Republic%20Day-FF9933?style=for-the-badge&labelColor=138808)

## 🎯 Challenge Statement

EktaMandi addresses the critical challenge of empowering India's 50M+ local vendors who face:
- **Language Barriers** - Inability to negotiate effectively across linguistic regions
- **Price Information Gap** - Lack of real-time market price visibility
- **Negotiation Skills** - Limited access to professional trading strategies

## ✨ Key Features

### 1️⃣ AI-Powered Price Discovery
- Real-time market prices for 18+ commodities
- AI-generated price predictions and market insights
- Smart price recommendations based on market trends
- Interactive price calculator

### 2️⃣ Interactive Negotiation Room 🆕
**The core innovation** - A real-time, chat-based negotiation experience:
- **Role Selection**: Choose to be a Buyer or Seller
- **AI Counterpart**: Negotiate with an intelligent AI trader
- **Multilingual Support**: Full experience in 5 languages (EN, HI, TE, TA, BN)
- **AI Coach**: Real-time tips and strategy suggestions
- **Quick Actions**: Split difference, Accept, +/-₹2, +/-₹5 buttons
- **Visual Price Spread**: See how close you are to a deal

### 3️⃣ 5 Indian Languages
- English
- Hindi (हिन्दी)
- Telugu (తెలుగు)
- Tamil (தமிழ்)
- Bengali (বাংলা)

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Glassmorphism styling |
| Lucide React | Icons |
| Vitest | Testing |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 8000)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── components/
│   ├── NegotiationRoom.tsx    # 🆕 Interactive negotiation chat
│   ├── NegotiationTab.tsx     # Negotiation module wrapper
│   ├── PriceDiscoveryTab.tsx  # Price discovery module
│   ├── Header.tsx             # App header with language selector
│   └── ...
├── contexts/
│   └── LanguageContext.tsx    # Multilingual state management
├── data/
│   ├── commodities.ts         # 18 commodity database
│   └── translations.ts        # UI translations (5 languages)
├── services/
│   ├── aiService.ts           # AI features
│   ├── priceService.ts        # Price calculations
│   └── negotiationService.ts  # Negotiation logic
└── index.css                  # Glassmorphism styles
```

## 🎨 Design Theme

The Republic Day tricolor theme with modern glassmorphism:

| Color | Code | Usage |
|-------|------|-------|
| Saffron | `#FF9933` | Seller actions, highlights |
| White | `#FFFFFF` | Backgrounds, cards |
| Green | `#138808` | Buyer actions, success states |
| Navy Blue | `#000080` | Headers, neutral actions |

## 🎮 Demo Flow

1. **Open the app** → See Republic Day themed header
2. **Select Price Discovery** → Browse commodities, view AI insights
3. **Switch to Negotiation** → Choose Buyer/Seller role
4. **Pick a commodity** → Start negotiating with AI counterpart
5. **Use quick actions** → Split difference, counter, or accept
6. **Close the deal** → See celebration with total value

## 📱 Screenshots

*The app features:*
- Role selection cards (Buyer/Seller)
- Commodity grid with emojis and prices
- Real-time chat interface
- Price spread indicator bar
- AI Coach sidebar
- Deal celebration screen

## 🙏 Acknowledgments

Built for Google Gemini API Developer Competition - Hackathon 2026
Celebrating India's 77th Republic Day 🇮🇳

**Jai Hind!**

---

*Unity in Diversity, Prosperity in Trade*
*विविधता में एकता, व्यापार में समृद्धि*
