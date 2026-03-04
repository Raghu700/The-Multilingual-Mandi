/**
 * SmartMatchTab - Innovative AI-Powered Matching
 * Simple UX for semi-literate vendors
 * Post requirement → See AI matches → One-tap deal
 */

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMODITIES, Commodity } from '../data/commodities';
import {
    ShoppingBag,
    Store,
    Sparkles,
    MapPin,
    Star,
    Check,
    Plus,
    ArrowRight,
    Zap,
    Users
} from 'lucide-react';

interface Requirement {
    type: 'buy' | 'sell';
    commodity: Commodity;
    quantity: number;
    priceLimit: number;
}

interface Match {
    id: string;
    name: string;
    type: 'buyer' | 'seller';
    commodity: Commodity;
    quantity: number;
    price: number;
    distance: string;
    rating: number;
    matchScore: number;
}

// Simulated AI matches
const generateMatches = (req: Requirement): Match[] => {
    const basePrice = req.commodity.basePrice;
    const names = req.type === 'buy'
        ? ['Ramesh Farms', 'Kisaan Fresh', 'Green Valley', 'Annapurna Traders', 'Desi Organic']
        : ['Hotel Taj', 'City Grocers', 'Metro Mart', 'Sharma Restaurant', 'Fresh Basket'];

    return names.map((name, i) => {
        const priceVariation = req.type === 'buy'
            ? basePrice * (0.9 + Math.random() * 0.15) // Sellers offer lower
            : basePrice * (1.0 + Math.random() * 0.2); // Buyers offer higher

        const matchScore = Math.max(70, Math.min(99, 95 - i * 5 - Math.floor(Math.random() * 10)));
        const matchType: 'buyer' | 'seller' = req.type === 'buy' ? 'seller' : 'buyer';

        return {
            id: `match-${i}`,
            name,
            type: matchType,
            commodity: req.commodity,
            quantity: Math.round((req.quantity * (0.5 + Math.random())) / 5) * 5,
            price: Math.round(priceVariation),
            distance: ['0.5 km', '1.2 km', '2.5 km', '3 km', '5 km'][i],
            rating: Math.round((4 + Math.random()) * 10) / 10,
            matchScore
        };
    }).sort((a, b) => b.matchScore - a.matchScore);
};

export function SmartMatchTab() {
    const { appLanguage } = useLanguage();

    const [step, setStep] = useState<'type' | 'commodity' | 'details' | 'matches'>('type');
    const [requirement, setRequirement] = useState<Partial<Requirement>>({});
    const [matches, setMatches] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [dealDone, setDealDone] = useState(false);

    // Labels in all languages
    const L: Record<string, Record<string, string>> = {
        whatDoYouWant: {
            en: 'What do you want to do?',
            hi: 'आप क्या करना चाहते हैं?',
            te: 'మీరు ఏమి చేయాలనుకుంటున్నారు?',
            ta: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
            bn: 'আপনি কী করতে চান?'
        },
        buyGoods: {
            en: 'Buy Goods',
            hi: 'माल खरीदना है',
            te: 'సరుకు కొనాలి',
            ta: 'பொருட்கள் வாங்க',
            bn: 'পণ্য কিনতে চাই'
        },
        sellGoods: {
            en: 'Sell Goods',
            hi: 'माल बेचना है',
            te: 'సరుకు అమ్మాలి',
            ta: 'பொருட்கள் விற்க',
            bn: 'পণ্য বিক্রি করতে চাই'
        },
        selectItem: {
            en: 'Select Item',
            hi: 'सामान चुनें',
            te: 'వస్తువు ఎంచుకోండి',
            ta: 'பொருள் தேர்ந்தெடு',
            bn: 'পণ্য নির্বাচন করুন'
        },
        howMuch: {
            en: 'How much?',
            hi: 'कितना?',
            te: 'ఎంత?',
            ta: 'எவ்வளவு?',
            bn: 'কতটা?'
        },
        yourPrice: {
            en: 'Your Price',
            hi: 'आपका भाव',
            te: 'మీ ధర',
            ta: 'உங்கள் விலை',
            bn: 'আপনার দাম'
        },
        findMatches: {
            en: 'Find Matches',
            hi: 'मैच खोजें',
            te: 'మ్యాచ్‌లు కనుగొనండి',
            ta: 'பொருத்தங்களைக் கண்டறி',
            bn: 'ম্যাচ খুঁজুন'
        },
        aiMatches: {
            en: 'AI Found Matches!',
            hi: 'AI ने मैच खोजे!',
            te: 'AI మ్యాచ్‌లు కనుగొన్నది!',
            ta: 'AI பொருத்தங்களைக் கண்டறிந்தது!',
            bn: 'AI ম্যাচ খুঁজে পেয়েছে!'
        },
        bestMatch: {
            en: 'Best Match',
            hi: 'सबसे अच्छा',
            te: 'ఉత్తమం',
            ta: 'சிறந்தது',
            bn: 'সেরা'
        },
        connect: {
            en: 'Connect',
            hi: 'जोड़ें',
            te: 'కనెక్ట్',
            ta: 'இணை',
            bn: 'সংযুক্ত'
        },
        dealDone: {
            en: 'Deal Confirmed!',
            hi: 'सौदा पक्का!',
            te: 'డీల్ పక్కా!',
            ta: 'ஒப்பந்தம் உறுதி!',
            bn: 'চুক্তি নিশ্চিত!'
        },
        newSearch: {
            en: 'New Search',
            hi: 'नई खोज',
            te: 'కొత్త శోధన',
            ta: 'புதிய தேடல்',
            bn: 'নতুন অনুসন্ধান'
        },
        market: {
            en: 'Market',
            hi: 'बाजार',
            te: 'మార్కెట్',
            ta: 'சந்தை',
            bn: 'বাজার'
        },
        available: {
            en: 'Available',
            hi: 'उपलब्ध',
            te: 'అందుబాటులో',
            ta: 'கிடைக்கும்',
            bn: 'উপলব্ধ'
        },
        needed: {
            en: 'Needed',
            hi: 'चाहिए',
            te: 'కావాలి',
            ta: 'தேவை',
            bn: 'প্রয়োজন'
        },
        kg: { en: 'kg', hi: 'kg', te: 'kg', ta: 'kg', bn: 'kg' }
    };

    const t = (key: string) => L[key]?.[appLanguage] || L[key]?.en || key;

    const handleFindMatches = () => {
        if (requirement.commodity && requirement.quantity && requirement.priceLimit) {
            const fullReq = requirement as Requirement;
            const results = generateMatches(fullReq);
            setMatches(results);
            setStep('matches');
        }
    };

    const handleConnect = (match: Match) => {
        setSelectedMatch(match);
        setDealDone(true);
    };

    const resetSearch = () => {
        setStep('type');
        setRequirement({});
        setMatches([]);
        setSelectedMatch(null);
        setDealDone(false);
    };

    // Step 1: Buy or Sell
    if (step === 'type') {
        return (
            <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-sm border border-slate-100 text-center">
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-8 h-8 text-violet-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-8">{t('whatDoYouWant')}</h2>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <button
                            onClick={() => { setRequirement({ type: 'buy' }); setStep('commodity'); }}
                            className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-100 hover:border-emerald-300 transition-all group"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <span className="text-base sm:text-lg font-bold text-emerald-700">{t('buyGoods')}</span>
                        </button>

                        <button
                            onClick={() => { setRequirement({ type: 'sell' }); setStep('commodity'); }}
                            className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-100 hover:border-orange-300 transition-all group"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Store className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <span className="text-base sm:text-lg font-bold text-orange-700">{t('sellGoods')}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Select Commodity
    if (step === 'commodity') {
        return (
            <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setStep('type')}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                            ←
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 flex-1 text-center pr-10">{t('selectItem')}</h2>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                        {COMMODITIES.slice(0, 12).map(commodity => (
                            <button
                                key={commodity.id}
                                onClick={() => {
                                    setRequirement(prev => ({ ...prev, commodity }));
                                    setStep('details');
                                }}
                                className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-orange-300 transition-all"
                            >
                                <span className="text-4xl">{commodity.emoji}</span>
                                <span className="text-xs font-medium text-slate-700 text-center leading-tight">
                                    {commodity.names[appLanguage]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Step 3: Quantity & Price
    if (step === 'details') {
        const marketPrice = requirement.commodity?.basePrice || 50;
        const unit = requirement.commodity?.unit || 'kg';

        // Dynamic quantity presets based on unit type
        const getQuantityPresets = () => {
            if (unit === 'dozen') return [1, 2, 5, 10, 20];
            if (unit === 'piece') return [5, 10, 20, 50, 100];
            return [10, 25, 50, 100, 200]; // kg
        };
        const presets = getQuantityPresets();

        const isFormComplete = requirement.quantity && requirement.priceLimit && requirement.priceLimit > 0;

        return (
            <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100">
                    {/* Back Button & Selected Item */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => setStep('commodity')}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                        >
                            ←
                        </button>
                        <div className="flex items-center gap-3 flex-1 p-3 bg-slate-50 rounded-xl">
                            <span className="text-3xl">{requirement.commodity?.emoji}</span>
                            <div>
                                <p className="font-bold text-slate-800">{requirement.commodity?.names[appLanguage]}</p>
                                <p className="text-sm text-slate-500">{t('market')}: ₹{marketPrice}/{unit}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quantity Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-600 mb-3">
                            {t('howMuch')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map(qty => (
                                <button
                                    key={qty}
                                    onClick={() => setRequirement(prev => ({ ...prev, quantity: qty }))}
                                    className={`px-5 py-3 rounded-xl font-bold text-lg transition-all ${requirement.quantity === qty
                                        ? 'bg-orange-500 text-white shadow-lg scale-105'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    {qty} {unit}
                                </button>
                            ))}
                        </div>
                        {!requirement.quantity && (
                            <p className="text-xs text-slate-400 mt-2">
                                {appLanguage === 'hi' ? '↑ कृपया मात्रा चुनें' : '↑ Please select quantity'}
                            </p>
                        )}
                    </div>

                    {/* Price Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-600 mb-3">
                            {t('yourPrice')} ({requirement.type === 'buy' ? 'max' : 'min'}) <span className="text-rose-500">*</span>
                        </label>

                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-400 transition-all">
                            <span className="text-xl font-medium text-slate-500 mr-2">₹</span>
                            <input
                                type="number"
                                value={requirement.priceLimit || ''}
                                onChange={(e) => setRequirement(prev => ({ ...prev, priceLimit: parseInt(e.target.value) || 0 }))}
                                placeholder={String(marketPrice)}
                                className="flex-1 text-2xl font-bold text-slate-800 bg-transparent outline-none w-full appearance-none m-0"
                                style={{ MozAppearance: 'textfield' }} // Firefox hide spinner
                            />
                            <span className="text-sm font-medium text-slate-400 ml-2">/{unit}</span>
                        </div>
                        {/* Hide webkit spinners globally with style tag since inline style doesn't cover webkit */}
                        <style>{`
                            input[type=number]::-webkit-inner-spin-button, 
                            input[type=number]::-webkit-outer-spin-button { 
                                -webkit-appearance: none; 
                                margin: 0; 
                            }
                        `}</style>
                    </div>

                    {/* Summary */}
                    {isFormComplete && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center animate-fadeIn">
                            <p className="text-emerald-700 font-medium">
                                {requirement.quantity} {unit} × ₹{requirement.priceLimit} = <span className="font-bold">₹{(requirement.quantity || 0) * (requirement.priceLimit || 0)}</span>
                            </p>
                        </div>
                    )}

                    {/* Find Matches Button */}
                    <button
                        onClick={handleFindMatches}
                        disabled={!isFormComplete}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all ${isFormComplete
                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <Zap className="w-6 h-6" />
                        {t('findMatches')}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    // Step 4: Show Matches
    if (step === 'matches') {
        // Deal Done State
        if (dealDone && selectedMatch) {
            return (
                <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 text-center border border-emerald-200">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('dealDone')}</h2>

                        <div className="bg-white rounded-2xl p-4 my-6 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{selectedMatch.commodity.emoji}</span>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedMatch.name}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {selectedMatch.distance}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                <span className="text-slate-600">{selectedMatch.quantity} {t('kg')}</span>
                                <span className="text-2xl font-bold text-emerald-600">₹{selectedMatch.price}/{selectedMatch.commodity.unit}</span>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-6">
                            {appLanguage === 'hi' ? 'विक्रेता से संपर्क किया जाएगा' :
                                appLanguage === 'te' ? 'విక్రేతతో సంప్రదించబడుతుంది' :
                                    'Seller will be contacted shortly'}
                        </p>

                        <button
                            onClick={resetSearch}
                            className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700"
                        >
                            {t('newSearch')}
                        </button>
                    </div>
                </div>
            );
        }

        // Show Matches
        return (
            <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-600" />
                        <h2 className="text-lg font-bold text-slate-800">{t('aiMatches')}</h2>
                    </div>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {matches.length} {requirement.type === 'buy' ? 'sellers' : 'buyers'}
                    </span>
                </div>

                {/* Match Cards */}
                <div className="space-y-3">
                    {matches.map((match, index) => (
                        <div
                            key={match.id}
                            className={`bg-white rounded-2xl p-4 border-2 transition-all ${index === 0 ? 'border-emerald-300 shadow-lg shadow-emerald-100' : 'border-slate-100 hover:border-slate-200'
                                }`}
                        >
                            {/* Best Match Badge */}
                            {index === 0 && (
                                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mb-2">
                                    <Zap className="w-3 h-3" />
                                    {t('bestMatch')}
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                {/* Left: Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
                                        {match.commodity.emoji}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{match.name}</p>
                                        <div className="flex items-center gap-3 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {match.distance}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {match.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Price & Match Score */}
                                <div className="text-right">
                                    <p className="text-xl font-bold text-slate-800">₹{match.price}</p>
                                    <p className="text-xs text-slate-500">{match.quantity} {t('kg')} {requirement.type === 'buy' ? t('available') : t('needed')}</p>
                                </div>
                            </div>

                            {/* Match Score Bar */}
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${match.matchScore >= 90 ? 'bg-emerald-500' : match.matchScore >= 80 ? 'bg-amber-500' : 'bg-slate-400'}`}
                                        style={{ width: `${match.matchScore}%` }}
                                    />
                                </div>
                                <span className={`text-sm font-bold ${match.matchScore >= 90 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                    {match.matchScore}%
                                </span>

                                {/* Connect Button */}
                                <button
                                    onClick={() => handleConnect(match)}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${index === 0
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <Check className="w-4 h-4" />
                                    {t('connect')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* New Search */}
                <button
                    onClick={resetSearch}
                    className="w-full mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-700 py-3"
                >
                    <Plus className="w-4 h-4" />
                    {t('newSearch')}
                </button>
            </div>
        );
    }

    return null;
}
