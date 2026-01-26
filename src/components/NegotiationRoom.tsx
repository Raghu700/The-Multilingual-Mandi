/**
 * NegotiationRoom Component - With Input Validation
 * Rejects unrealistic offers, validates prices
 */

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  TrendingUp,
  Scale,
  Sparkles,
  RefreshCw,
  Bot,
  User,
  Check,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMODITIES, Commodity } from '../data/commodities';

interface Message {
  id: string;
  sender: 'user' | 'counterpart' | 'system';
  text: string;
  price?: number;
  timestamp: Date;
  type: 'message' | 'offer' | 'counter' | 'accept' | 'reject';
}

interface NegotiationState {
  role: 'buyer' | 'seller' | null;
  commodity: Commodity | null;
  quantity: number;
  userPrice: number;
  counterpartPrice: number;
  marketPrice: number;
  status: 'selecting' | 'active' | 'completed';
  dealPrice?: number;
}

// Validate if price is reasonable (within 50% of market)
const isPriceReasonable = (price: number, marketPrice: number, role: 'buyer' | 'seller'): boolean => {
  const minReasonable = marketPrice * 0.5;
  const maxReasonable = marketPrice * 1.5;
  return price >= minReasonable && price <= maxReasonable;
};

// Generate AI response with validation
const generateResponse = (
  role: 'buyer' | 'seller',
  userOffer: number,
  counterpartPrice: number,
  marketPrice: number,
  round: number,
  language: string
): { text: string; newPrice: number; type: 'counter' | 'accept' | 'reject' } => {
  const isUserBuying = role === 'buyer';

  // Check for unrealistic offers
  if (!isPriceReasonable(userOffer, marketPrice, role)) {
    const rejectResponses: Record<string, string> = {
      en: `₹${userOffer}? That's not realistic. Market is ₹${marketPrice}. Try again.`,
      hi: `₹${userOffer}? ये सही नहीं है। बाजार भाव ₹${marketPrice}। फिर से बोलो।`,
      te: `₹${userOffer}? ఇది సరైనది కాదు. మార్కెట్ ₹${marketPrice}. మళ్ళీ చెప్పండి.`,
      ta: `₹${userOffer}? இது சரியல்ல. சந்தை ₹${marketPrice}. மீண்டும் முயற்சி.`,
      bn: `₹${userOffer}? এটা ঠিক নয়। বাজার ₹${marketPrice}। আবার বলুন।`
    };
    return { text: rejectResponses[language] || rejectResponses.en, newPrice: counterpartPrice, type: 'reject' };
  }

  const spread = Math.abs(userOffer - counterpartPrice);
  const spreadPercent = (spread / marketPrice) * 100;

  // Accept if close
  if (spreadPercent < 5 || (round > 3 && spreadPercent < 12)) {
    const responses: Record<string, string> = {
      en: `Done! ₹${userOffer} 🤝`,
      hi: `पक्का! ₹${userOffer} 🤝`,
      te: `ఓకే! ₹${userOffer} 🤝`,
      ta: `சரி! ₹${userOffer} 🤝`,
      bn: `ঠিক! ₹${userOffer} 🤝`
    };
    return { text: responses[language] || responses.en, newPrice: userOffer, type: 'accept' };
  }

  // Counter offer - move towards user's offer
  const adjustment = isUserBuying
    ? Math.round((counterpartPrice - userOffer) * 0.35)
    : Math.round((userOffer - counterpartPrice) * 0.35);

  const newPrice = isUserBuying
    ? counterpartPrice - adjustment
    : counterpartPrice + adjustment;

  const counterResponses: Record<string, string[]> = {
    en: [`₹${newPrice}?`, `Best: ₹${newPrice}`, `How about ₹${newPrice}?`],
    hi: [`₹${newPrice}?`, `फाइनल: ₹${newPrice}`, `₹${newPrice} चलेगा?`],
    te: [`₹${newPrice}?`, `ఫైనల్: ₹${newPrice}`, `₹${newPrice} ఓకేనా?`],
    ta: [`₹${newPrice}?`, `இறுதி: ₹${newPrice}`, `₹${newPrice} சரியா?`],
    bn: [`₹${newPrice}?`, `ফাইনাল: ₹${newPrice}`, `₹${newPrice} হবে?`]
  };

  const msgs = counterResponses[language] || counterResponses.en;
  return { text: msgs[Math.floor(Math.random() * msgs.length)], newPrice, type: 'counter' };
};

// AI Coach tip
const getCoachTip = (
  userPrice: number,
  counterpartPrice: number,
  marketPrice: number,
  language: string
): string => {
  const spread = Math.abs(userPrice - counterpartPrice);
  const spreadPercent = (spread / marketPrice) * 100;

  if (spreadPercent < 8) {
    const tips: Record<string, string> = {
      en: `💡 Close! Split or accept.`,
      hi: `💡 करीब! बीच में मिलें।`,
      te: `💡 దగ్గరలో! మధ్యలో కలవండి।`,
      ta: `💡 நெருக்கம்! நடுவில் சேருங்கள்।`,
      bn: `💡 কাছে! মাঝে মিলুন।`
    };
    return tips[language] || tips.en;
  }

  const tips: Record<string, string> = {
    en: `💡 Market: ₹${marketPrice}. Stay within ±50%`,
    hi: `💡 बाजार: ₹${marketPrice}. ±50% में रहें`,
    te: `💡 మార్కెట్: ₹${marketPrice}. ±50% లో ఉండండి`,
    ta: `💡 சந்தை: ₹${marketPrice}. ±50% இருங்கள்`,
    bn: `💡 বাজার: ₹${marketPrice}. ±50% থাকুন`
  };
  return tips[language] || tips.en;
};

export function NegotiationRoom() {
  const { appLanguage } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<NegotiationState>({
    role: null,
    commodity: null,
    quantity: 50,
    userPrice: 0,
    counterpartPrice: 0,
    marketPrice: 0,
    status: 'selecting'
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrice, setInputPrice] = useState<string>('');
  const [round, setRound] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [coachTip, setCoachTip] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (state.status === 'active' && state.userPrice && state.counterpartPrice) {
      setCoachTip(getCoachTip(state.userPrice, state.counterpartPrice, state.marketPrice, appLanguage));
    }
  }, [state.userPrice, state.counterpartPrice, state.status, state.marketPrice, appLanguage]);

  const startNegotiation = (role: 'buyer' | 'seller', commodity: Commodity) => {
    const basePrice = commodity.basePrice;
    const marketPrice = Math.round(basePrice * (1 + (Math.random() * 0.2) - 0.1));

    const userStartPrice = role === 'buyer' ? Math.round(marketPrice * 0.85) : Math.round(marketPrice * 1.15);
    const counterpartStartPrice = role === 'buyer' ? Math.round(marketPrice * 1.12) : Math.round(marketPrice * 0.88);

    setState({ role, commodity, quantity: 50, userPrice: userStartPrice, counterpartPrice: counterpartStartPrice, marketPrice, status: 'active' });

    const welcomeMessages: Record<string, string> = {
      en: role === 'buyer' ? `Fresh ${commodity.names.en}! ₹${counterpartStartPrice}/${commodity.unit}` : `Need ${commodity.names.en}. ₹${counterpartStartPrice}/${commodity.unit}`,
      hi: role === 'buyer' ? `ताजा ${commodity.names.hi}! ₹${counterpartStartPrice}/${commodity.unit}` : `${commodity.names.hi} चाहिए। ₹${counterpartStartPrice}/${commodity.unit}`,
      te: role === 'buyer' ? `తాజా ${commodity.names.te}! ₹${counterpartStartPrice}/${commodity.unit}` : `${commodity.names.te} కావాలి। ₹${counterpartStartPrice}/${commodity.unit}`,
      ta: role === 'buyer' ? `புதிய ${commodity.names.ta}! ₹${counterpartStartPrice}/${commodity.unit}` : `${commodity.names.ta} வேண்டும். ₹${counterpartStartPrice}/${commodity.unit}`,
      bn: role === 'buyer' ? `তাজা ${commodity.names.bn}! ₹${counterpartStartPrice}/${commodity.unit}` : `${commodity.names.bn} দরকার। ₹${counterpartStartPrice}/${commodity.unit}`
    };

    setMessages([{ id: '1', sender: 'counterpart', text: welcomeMessages[appLanguage] || welcomeMessages.en, price: counterpartStartPrice, timestamp: new Date(), type: 'offer' }]);
    setRound(1);
  };

  // Validate input before sending
  const validateInput = (value: string): { valid: boolean; price: number; error: string } => {
    const price = parseInt(value);

    if (!value || isNaN(price)) {
      return { valid: false, price: 0, error: appLanguage === 'hi' ? 'कृपया मूल्य दर्ज करें' : 'Please enter a price' };
    }

    if (price <= 0) {
      return { valid: false, price: 0, error: appLanguage === 'hi' ? 'मूल्य 0 से अधिक होना चाहिए' : 'Price must be greater than 0' };
    }

    if (price > 10000) {
      return { valid: false, price: 0, error: appLanguage === 'hi' ? 'मूल्य बहुत अधिक है' : 'Price too high' };
    }

    return { valid: true, price, error: '' };
  };

  const sendOffer = (offerPrice: number) => {
    if (!state.role || !state.commodity) return;

    setInputError('');

    setMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: `₹${offerPrice}`, price: offerPrice, timestamp: new Date(), type: 'counter' }]);
    setState(prev => ({ ...prev, userPrice: offerPrice }));
    setInputPrice('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(state.role!, offerPrice, state.counterpartPrice, state.marketPrice, round, appLanguage);
      setMessages(prev => [...prev, { id: `counter-${Date.now()}`, sender: 'counterpart', text: response.text, price: response.newPrice, timestamp: new Date(), type: response.type }]);
      setIsTyping(false);

      if (response.type === 'accept') {
        setState(prev => ({ ...prev, status: 'completed', dealPrice: offerPrice }));
      } else if (response.type === 'counter') {
        setState(prev => ({ ...prev, counterpartPrice: response.newPrice }));
        setRound(r => r + 1);
      }
      // For 'reject', we don't update prices - user needs to try again
    }, 800 + Math.random() * 600);
  };

  const handleSubmit = () => {
    const validation = validateInput(inputPrice);
    if (!validation.valid) {
      setInputError(validation.error);
      return;
    }
    sendOffer(validation.price);
  };

  const handleSplit = () => sendOffer(Math.round((state.userPrice + state.counterpartPrice) / 2));
  const handleAccept = () => sendOffer(state.counterpartPrice);
  const handleCounter = (adj: number) => sendOffer(Math.max(1, state.role === 'buyer' ? state.userPrice + adj : state.userPrice - adj));

  const resetNegotiation = () => {
    setState({ role: null, commodity: null, quantity: 50, userPrice: 0, counterpartPrice: 0, marketPrice: 0, status: 'selecting' });
    setMessages([]);
    setRound(0);
    setCoachTip('');
    setInputError('');
  };

  // Labels
  const L: Record<string, Record<string, string>> = {
    selectRole: { en: 'I am a...', hi: 'मैं हूं...', te: 'నేను...', ta: 'நான்...', bn: 'আমি...' },
    buyer: { en: 'Buyer', hi: 'खरीदार', te: 'కొనుగోలుదారు', ta: 'வாங்குபவர்', bn: 'ক্রেতা' },
    seller: { en: 'Seller', hi: 'विक्रेता', te: 'విక్రేత', ta: 'விற்பனையாளர்', bn: 'বিক্রেতা' },
    selectItem: { en: 'What are you trading?', hi: 'क्या बेचना/खरीदना है?', te: 'ఏమి ట్రేడ్ చేస్తున్నారు?', ta: 'என்ன வர்த்தகம்?', bn: 'কী ট্রেড করবেন?' },
    split: { en: 'Split', hi: 'बीच में', te: 'మధ్యలో', ta: 'நடுவில்', bn: 'মাঝে' },
    accept: { en: 'Accept', hi: 'ठीक है', te: 'ఓకే', ta: 'சரி', bn: 'ঠিক' },
    newDeal: { en: 'New Deal', hi: 'नया सौदा', te: 'కొత్త డీల్', ta: 'புதிய', bn: 'নতুন' },
    dealDone: { en: 'Deal Done!', hi: 'सौदा पक्का!', te: 'డీల్ పక్కా!', ta: 'ஒப்பந்தம்!', bn: 'চুক্তি হয়ে গেল!' },
    total: { en: 'Total', hi: 'कुल', te: 'మొత్తం', ta: 'மொத்தம்', bn: 'মোট' }
  };

  const t = (key: string) => L[key]?.[appLanguage] || L[key]?.en || key;

  // Role Selection
  if (state.status === 'selecting') {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">{t('selectRole')}</h2>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setState(prev => ({ ...prev, role: 'buyer' }))}
              className={`flex-1 max-w-[140px] py-5 rounded-xl font-medium transition-all ${state.role === 'buyer'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'
                }`}
            >
              <User className="w-6 h-6 mx-auto mb-2" />
              {t('buyer')}
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, role: 'seller' }))}
              className={`flex-1 max-w-[140px] py-5 rounded-xl font-medium transition-all ${state.role === 'seller'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-100'
                }`}
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              {t('seller')}
            </button>
          </div>
        </div>

        {state.role && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-fadeIn">
            <h3 className="text-sm font-medium text-slate-600 mb-4">{t('selectItem')}</h3>
            <div className="grid grid-cols-4 gap-2">
              {COMMODITIES.slice(0, 8).map(commodity => (
                <button
                  key={commodity.id}
                  onClick={() => startNegotiation(state.role!, commodity)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all hover:scale-105 text-center"
                >
                  <span className="text-2xl block mb-1">{commodity.emoji}</span>
                  <span className="text-xs text-slate-600 block truncate">{commodity.names[appLanguage]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Deal Complete
  if (state.status === 'completed') {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center border border-orange-100">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('dealDone')}</h3>
          <p className="text-slate-600 mb-1">
            {state.commodity?.emoji} {state.quantity} {state.commodity?.unit} × ₹{state.dealPrice}
          </p>
          <p className="text-3xl font-bold text-orange-600 mb-6">
            {t('total')}: ₹{(state.dealPrice || 0) * state.quantity}
          </p>
          <button onClick={resetNegotiation} className="bg-slate-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-700">
            {t('newDeal')}
          </button>
        </div>
      </div>
    );
  }

  // Active Negotiation
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{state.commodity?.emoji}</span>
          <span className="font-medium text-slate-800">{state.commodity?.names[appLanguage]}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className={`font-bold ${state.role === 'buyer' ? 'text-emerald-600' : 'text-orange-600'}`}>₹{state.userPrice}</span>
          <span className="text-slate-300">→</span>
          <span className={`font-bold ${state.role === 'buyer' ? 'text-orange-600' : 'text-emerald-600'}`}>₹{state.counterpartPrice}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">₹{state.marketPrice}</span>
        </div>

        <button onClick={resetNegotiation} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat */}
      <div className="bg-white rounded-xl p-4 h-[280px] overflow-y-auto shadow-sm border border-slate-100">
        <div className="space-y-3">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.sender === 'user'
                  ? state.role === 'buyer' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
                  : message.type === 'reject'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                {message.sender === 'counterpart' && (
                  <span className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                    <Bot className="w-3 h-3" />
                    {state.role === 'buyer' ? t('seller') : t('buyer')}
                  </span>
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Coach Tip */}
      {coachTip && (
        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm text-violet-700">{coachTip}</span>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={handleSplit} disabled={isTyping}
            className="flex items-center gap-1 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50">
            <Scale className="w-4 h-4" />
            {t('split')} ₹{Math.round((state.userPrice + state.counterpartPrice) / 2)}
          </button>
          <button onClick={handleAccept} disabled={isTyping}
            className="flex items-center gap-1 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50">
            <Check className="w-4 h-4" />
            {t('accept')} ₹{state.counterpartPrice}
          </button>
          <button onClick={() => handleCounter(2)} disabled={isTyping}
            className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50">
            {state.role === 'buyer' ? '+' : '-'}₹2
          </button>
          <button onClick={() => handleCounter(5)} disabled={isTyping}
            className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50">
            {state.role === 'buyer' ? '+' : '-'}₹5
          </button>
        </div>

        {/* Input with Error */}
        <div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                value={inputPrice}
                onChange={(e) => { setInputPrice(e.target.value); setInputError(''); }}
                placeholder="..."
                disabled={isTyping}
                className={`w-full pl-7 pr-3 py-2.5 rounded-lg border focus:ring-2 outline-none text-sm disabled:bg-slate-50 ${inputError ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-orange-300 focus:ring-orange-100'
                  }`}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isTyping || !inputPrice}
              className="bg-orange-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {inputError && (
            <div className="flex items-center gap-1 mt-2 text-rose-600 text-xs">
              <AlertCircle className="w-3 h-3" />
              {inputError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
