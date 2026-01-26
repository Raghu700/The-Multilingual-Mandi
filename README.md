# 🇮🇳 EktaMandi (एकता मंडी) - Unity Market

### AI-Powered Marketplace for India's 50M+ Local Vendors

[![Republic Day](https://img.shields.io/badge/26%20January%202026-77th%20Republic%20Day-FF9933?style=for-the-badge&labelColor=138808)](https://en.wikipedia.org/wiki/Republic_Day_(India))
[![Made with ❤️ for Bharat](https://img.shields.io/badge/Made%20with%20%E2%9D%A4%EF%B8%8F%20for-Bharat-orange?style=for-the-badge)](https://github.com)

> **🎥 [Watch Demo Video on YouTube](https://youtu.be/7CtHhV3Krqc)** - See the platform in action!
> 
> *([Download local video file](./EktaMandiDemo.mp4))*

---

## 🚀 Quick Start

Get the app running in 2 minutes:

```bash
# Clone the repository
git clone <repository-url>
cd The-Multilingual-Mandi

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at **http://localhost:8000**

---

## 🎯 The Problem

India's local vendors (farmers, traders, small business owners) face three critical challenges:

1. **Language Barriers** 🗣️ - 22 official languages create communication gaps in trade
2. **Price Discovery Gap** 💰 - No real-time access to fair market prices
3. **Inefficient Matching** 🤝 - Hours spent manually finding buyers/sellers in mandis

**Result**: Lost time, unfair deals, and limited market access for semi-literate vendors.

---

## 💡 Our Solution: EktaMandi

A **multilingual, AI-powered marketplace** that automates price discovery and buyer-seller matching with a **simple, icon-first UX** designed for semi-literate users.

### 🌟 Core Innovation: **Smart Match AI**

Instead of manual negotiation, vendors can:
1. **Post a requirement** in 3 taps (Buy/Sell → Select Item → Enter Details)
2. **AI finds matches** automatically from the marketplace
3. **Connect instantly** with ranked matches (% score, distance, ratings)

**Impact**: What takes 2-3 hours in a physical mandi now takes **30 seconds**.

---

## ✨ Key Features

### 1️⃣ **Smart Match** (AI-Powered Marketplace) 🆕
- **3-Tap Posting**: Buy/Sell → Commodity → Quantity + Price
- **AI Matching Engine**: Ranks sellers/buyers by compatibility (price, quantity, distance)
- **One-Tap Connect**: Instant deal confirmation
- **Visual Match Scores**: 90%+ = Best Match (green), 80%+ = Good Match (amber)
- **Dynamic Units**: Auto-adjusts for kg, dozen, pieces based on commodity

**UX for Semi-Literate Users**:
- ✅ Large emoji-based commodity selection (🍚🌾🍅🧅)
- ✅ Preset quantity buttons (no typing needed)
- ✅ Minimal text input (only price)
- ✅ Visual progress indicators

### 2️⃣ **Price Discovery** (Market Intelligence)
- Real-time prices for **18+ commodities** (Rice, Wheat, Tomato, Onion, etc.)
- **AI Price Prediction** (next week forecast with confidence %)
- **Trend Analysis**: Trending Up ↗️ / Down ↘️ / Stable →
- **Quick Calculator**: Instant total value computation

### 3️⃣ **Negotiation Practice** (AI Training)
- **Role-based simulation**: Practice as Buyer or Seller
- **AI Counterpart**: Realistic negotiation with smart AI trader
- **Input Validation**: Rejects unrealistic offers (±50% of market price)
- **Quick Actions**: Split, Accept, +/-₹2, +/-₹5 buttons
- **AI Coach Tips**: Real-time strategy suggestions

### 4️⃣ **5 Indian Languages** 🌐
Full UI translation in:
- **English** (en)
- **हिन्दी** Hindi (hi)
- **తెలుగు** Telugu (te)
- **தமிழ்** Tamil (ta)
- **বাংলা** Bengali (bn)

---

## 🎨 Design Philosophy

### **Culturally Respectful**
- **Konark Sun Dial Inspired Logo**: The spinning wheel in the header is inspired by the intricate [Konark Sun Temple](https://en.wikipedia.org/wiki/Konark_Sun_Temple) dials, symbolizing the "Wheel of Time" and progress (Kaal Chakra).
- **Brick Red Palette**: The logo color (`#A63A2E`) mimics the red sandstone of the temple.
### **Accessibility-First**
- **Large touch targets** (64x64px minimum)
- **Icon-first, text-secondary** design
- **High contrast** colors (WCAG AA compliant)
- **No scrolling overload** - compact, focused screens

### **Modern Aesthetics**
- **Glassmorphism** cards with subtle shadows
- **Smooth animations** (fade-in, scale, rotate)
- **Gradient buttons** for primary actions

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Type-safe component architecture |
| **Build Tool** | Vite | Lightning-fast HMR & optimized builds |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Icons** | Lucide React | Consistent, scalable icon system |
| **State** | React Context API | Language & app state management |
| **AI Logic** | Custom algorithms | Price prediction, matching, negotiation |

---

##  Project Structure

```
src/
├── components/
│   ├── SmartMatchTab.tsx       # 🆕 AI-powered marketplace matching
│   ├── NegotiationRoom.tsx     # Practice negotiation with AI
│   ├── PriceDiscoveryTab.tsx   # Market prices & AI predictions
│   ├── Header.tsx              # Konark Chakra logo + language selector
│   ├── Footer.tsx              # "जय हिंद!" footer
│   └── TabNavigation.tsx       # 3-tab navigation
├── contexts/
│   └── LanguageContext.tsx     # Multilingual state (5 languages)
├── data/
│   ├── commodities.ts          # 18 commodities with emoji, prices, units
│   └── translations.ts         # UI strings in 5 languages
├── services/
│   ├── priceService.ts         # Price calculations & trends
│   └── aiService.ts            # AI prediction logic
└── index.css                   # Tailwind + custom animations
```

---

## 🎮 User Journey (Watch the Demo!)

### **Scenario: Farmer wants to sell 50kg Rice**

1. **Open App** → See Ashok Chakra logo, select Hindi (हिन्दी)
2. **Click "Smart Match"** tab (purple gradient, marked "NEW")
3. **Tap "Sell Goods"** → Large orange button with store icon
4. **Select Rice** 🍚 → Tap emoji from grid
5. **Choose 50 kg** → Tap preset button
6. **Enter ₹40/kg** → Type in clean input box
7. **Tap "Find Matches"** → AI processes in <1 second
8. **See 5 Buyers** → Ranked by match score (95%, 88%, 82%...)
   - **Best Match**: Hotel Taj, 0.5km away, ₹42/kg, 4.8★ rating
9. **Tap "Connect"** → Deal confirmed! 🎉
10. **Total**: ₹2100 (50kg × ₹42)

**Time taken**: ~30 seconds vs. 2-3 hours in physical mandi.

---

## 📊 Innovation Highlights

### **1. Dynamic Unit System**
- **Eggs**: Presets in `dozen` (1, 2, 5, 10, 20)
- **Coconut**: Presets in `pieces` (5, 10, 20, 50, 100)
- **Rice/Wheat**: Presets in `kg` (10, 25, 50, 100, 200)

### **2. AI Matching Algorithm**
```typescript
matchScore = f(priceCompatibility, quantityMatch, distance, rating)
- 90%+ = Best Match (green highlight)
- 80-89% = Good Match (amber)
- <80% = Average Match (gray)
```

### **3. Input Validation**
- Rejects offers outside **±50% of market price**
- Shows error: "₹2333? That's not realistic. Market is ₹49. Try again."
- Prevents junk data in the marketplace

### **4. Multilingual AI**
- All AI responses (matches, rejections, tips) adapt to selected language
- Example: "Deal Done!" → "सौदा पक्का!" (Hindi) → "డీల్ పక్కా!" (Telugu)

---

## 🎥 Demo Video Guide

**[Watch on YouTube](https://youtu.be/7CtHhV3Krqc)** showcases:

1. **0:00-0:15** - App overview, Konark Chakra logo, language switching
2. **0:15-0:45** - Price Discovery tab (market prices, AI predictions)
3. **0:45-1:30** - **Smart Match flow** (Buy/Sell → Select → Match → Connect)
4. **1:30-2:00** - Negotiation Practice (AI counterpart, validation)
5. **2:00-2:15** - Multilingual demo (switching between Hindi/Telugu/Tamil)

**Key Moments to Watch**:
- ✨ **0:50** - 3-tap posting flow (incredibly simple)
- 🎯 **1:10** - AI match results with scores
- 🚫 **1:45** - Input validation rejecting unrealistic price

---

## 🏆 Why EktaMandi Wins

### **Impact**
- **50M+ vendors** can access fair prices instantly
- **Language barriers eliminated** across 22 states
- **Time saved**: 2-3 hours → 30 seconds per transaction

### **Innovation**
- **First** AI-powered mandi matching in India
- **Simplest UX** for semi-literate users (emoji-first, 3-tap flow)
- **Culturally authentic** (Konark Chakra, "जय हिंद!")

### **Scalability**
- **Cloud-ready** architecture (React + Vite)
- **Extensible** to 22+ Indian languages
- **API-first** design (ready for mobile apps)

---

## 🙏 Acknowledgments

Built for **Google Gemini API Developer Competition - Hackathon 2026**  
Celebrating **India's 77th Republic Day** 🇮🇳

**Special Thanks**:
- India's farmers and local vendors (our inspiration)
- Open-source community (React, Tailwind, Lucide)
- Republic Day spirit (unity in diversity)

---

## 📜 License

MIT License - Built with ❤️ for Bharat

---

<div align="center">

### **जय हिंद! 🇮🇳**

*विविधता में एकता, व्यापार में समृद्धि*  
*Unity in Diversity, Prosperity in Trade*

**Made with ❤️ for Bharat**

</div>
