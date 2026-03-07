/**
 * PriceAnalysisTab Component
 * Deep price analysis with interactive charts, predictions & seasonal insights.
 * Uses HTML5 Canvas for charts — zero extra dependencies.
 * Fully multilingual for Indian farmers.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { COMMODITIES } from '../data/commodities';
import { generatePrediction, PredictionResult, getMonthName } from '../services/predictionService';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, ShoppingCart, DollarSign, BarChart3, Info } from 'lucide-react';

// --- Translations ---
const T: Record<string, Record<Language, string>> = {
    'tab.title': { en: 'Price Analysis & Prediction', hi: 'मूल्य विश्लेषण एवं भविष्यवाणी', te: 'ధర విశ్లేషణ & అంచనా', ta: 'விலை பகுப்பாய்வு & கணிப்பு', bn: 'মূল্য বিশ্লেষণ ও পূর্বাভাস' },
    'tab.subtitle': { en: '3-Year historical data with AI-powered forecasts', hi: '3 साल का ऐतिहासिक डेटा और AI भविष्यवाणी', te: '3 సంవత్సరాల చారిత్రక డేటా మరియు AI అంచనాలు', ta: '3 ஆண்டு வரலாற்று தரவு மற்றும் AI கணிப்புகள்', bn: '৩ বছরের ঐতিহাসিক তথ্য এবং AI পূর্বাভাস' },
    'select.crop': { en: 'Select Crop', hi: 'फसल चुनें', te: 'పంట ఎంచుకోండి', ta: 'பயிர் தேர்ந்தெடு', bn: 'ফসল নির্বাচন করুন' },
    'chart.title': { en: 'Price Trend', hi: 'मूल्य रुझान', te: 'ధర ధోరణి', ta: 'விலை போக்கு', bn: 'মূল্য প্রবণতা' },
    'chart.historical': { en: 'Historical', hi: 'ऐतिहासिक', te: 'చారిత్రక', ta: 'வரலாற்று', bn: 'ঐতিহাসিক' },
    'chart.predicted': { en: 'Predicted', hi: 'अनुमानित', te: 'అంచనా', ta: 'கணிப்பு', bn: 'অনুমানিত' },
    'chart.range': { en: 'Confidence Range', hi: 'विश्वास सीमा', te: 'విశ్వాస పరిధి', ta: 'நம்பகத்தன்மை வரம்பு', bn: 'আস্থা সীমা' },
    'stats.yoy': { en: 'Year-over-Year Change', hi: 'साल-दर-साल बदलाव', te: 'సంవత్సరం-సంవత్సరం మార్పు', ta: 'ஆண்டுக்கு ஆண்டு மாற்றம்', bn: 'বছর-প্রতি-বছর পরিবর্তন' },
    'stats.trend': { en: 'Annual Trend', hi: 'वार्षिक रुझान', te: 'వార్షిక ధోరణి', ta: 'வருடாந்திர போக்கு', bn: 'বার্ষিক প্রবণতা' },
    'stats.volatility': { en: 'Volatility', hi: 'अस्थिरता', te: 'అస్థిరత', ta: 'நிலையற்ற தன்மை', bn: 'অস্থিরতা' },
    'stats.confidence': { en: 'Model Confidence', hi: 'मॉडल विश्वसनीयता', te: 'మోడల్ విశ్వసనీయత', ta: 'மாதிரி நம்பகத்தன்மை', bn: 'মডেল নির্ভরযোগ্যতা' },
    'advice.bestBuy': { en: 'Best Month to Buy', hi: 'खरीदने का सबसे अच्छा महीना', te: 'కొనడానికి ఉత్తమ నెల', ta: 'வாங்க சிறந்த மாதம்', bn: 'কেনার সেরা মাস' },
    'advice.bestSell': { en: 'Best Month to Sell', hi: 'बेचने का सबसे अच्छा महीना', te: 'అమ్మడానికి ఉత్తమ నెల', ta: 'விற்க சிறந்த மாதம்', bn: 'বিক্রির সেরা মাস' },
    'advice.title': { en: 'Smart Insights', hi: 'स्मार्ट जानकारी', te: 'స్మార్ట్ సమాచారం', ta: 'ஸ்மார்ட் தகவல்கள்', bn: 'স্মার্ট তথ্য' },
    'forecast.title': { en: '6-Month Forecast', hi: '6 माह का पूर्वानुमान', te: '6 నెలల అంచనా', ta: '6 மாத முன்னறிவிப்பு', bn: '৬ মাসের পূর্বাভাস' },
    'forecast.month': { en: 'Month', hi: 'महीना', te: 'నెల', ta: 'மாதம்', bn: 'মাস' },
    'forecast.price': { en: 'Expected Price', hi: 'अनुमानित मूल्य', te: 'అంచనా ధర', ta: 'எதிர்பார்க்கப்படும் விலை', bn: 'প্রত্যাশিত মূল্য' },
    'forecast.range': { en: 'Price Range', hi: 'मूल्य सीमा', te: 'ధర పరిధి', ta: 'விலை வரம்பு', bn: 'মূল্য সীমা' },
    'disclaimer': { en: '⚠️ Disclaimer: These predictions are based on historical patterns and statistical models. Actual prices may vary due to weather, government policies, demand-supply dynamics, and other market factors. This is not financial advice.', hi: '⚠️ अस्वीकरण: ये भविष्यवाणियां ऐतिहासिक पैटर्न और सांख्यिकीय मॉडल पर आधारित हैं। वास्तविक कीमतें मौसम, सरकारी नीतियों, मांग-आपूर्ति और अन्य कारणों से भिन्न हो सकती हैं। यह वित्तीय सलाह नहीं है।', te: '⚠️ నిరాకరణ: ఈ అంచనాలు చారిత్రక నమూనాలు మరియు గణాంక నమూనాల ఆధారంగా ఉన్నాయి. వాస్తవ ధరలు వాతావరణం, ప్రభుత్వ విధానాలు, డిమాండ్-సప్లయ్ మరియు ఇతర మార్కెట్ కారకాల కారణంగా భిన్నంగా ఉండవచ్చు.', ta: '⚠️ மறுப்பு: இந்த கணிப்புகள் வரலாற்று முறைகள் மற்றும் புள்ளியியல் மாதிரிகளை அடிப்படையாகக் கொண்டவை. உண்மையான விலைகள் வானிலை, அரசு கொள்கைகள், தேவை-வழங்கல் மற்றும் பிற காரணிகளால் மாறலாம்.', bn: '⚠️ দাবিত্যাগ: এই পূর্বাভাসগুলি ঐতিহাসিক প্যাটার্ন এবং পরিসংখ্যানগত মডেলের উপর ভিত্তি করে। আবহাওয়া, সরকারি নীতি, চাহিদা-সরবরাহ এবং অন্যান্য বাজার কারণে প্রকৃত দাম ভিন্ন হতে পারে।' },
    'seasonal.title': { en: 'Seasonal Price Pattern', hi: 'मौसमी मूल्य पैटर्न', te: 'సీజనల్ ధర నమూనా', ta: 'பருவகால விலை முறை', bn: 'মৌসুমী মূল্য প্যাটার্ন' },
    'per': { en: 'per', hi: 'प्रति', te: 'ప్రతి', ta: 'ஒரு', bn: 'প্রতি' },
};

function tr(key: string, lang: Language): string {
    return T[key]?.[lang] || T[key]?.en || key;
}

// Localized month names
const MONTH_NAMES_LOCAL: Record<Language, string[]> = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    hi: ['जन', 'फर', 'मार', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'],
    te: ['జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్', 'జూలై', 'ఆగ', 'సెప్టె', 'అక్టో', 'నవ', 'డిసె'],
    ta: ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'],
    bn: ['জান', 'ফেব', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ', 'অক্টো', 'নভ', 'ডিসে'],
};

function getLocalMonthName(monthIndex: number, lang: Language): string {
    return MONTH_NAMES_LOCAL[lang]?.[monthIndex] || getMonthName(monthIndex);
}

// --- Chart Drawing (Canvas) ---

function drawPriceChart(
    canvas: HTMLCanvasElement,
    prediction: PredictionResult,
    lang: Language
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Read theme colors from CSS variables
    const cs = getComputedStyle(document.documentElement);
    const bgColor = cs.getPropertyValue('--bg-surface').trim() || '#fafafa';
    const gridColor = cs.getPropertyValue('--border-light').trim() || '#e2e8f0';
    const textColor = cs.getPropertyValue('--text-secondary').trim() || '#64748b';

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Data
    const hist = prediction.historical;
    const fore = prediction.forecast;
    const allPrices = [...hist.map(d => d.avg), ...fore.map(d => d.predicted)];
    const allMin = [...hist.map(d => d.min), ...fore.map(d => d.lower)];
    const allMax = [...hist.map(d => d.max), ...fore.map(d => d.upper)];

    const minP = Math.min(...allMin) * 0.92;
    const maxP = Math.max(...allMax) * 1.08;
    const totalPoints = allPrices.length;

    const padL = 55, padR = 20, padT = 20, padB = 45;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const xScale = (i: number) => padL + (i / (totalPoints - 1)) * chartW;
    const yScale = (v: number) => padT + chartH - ((v - minP) / (maxP - minP)) * chartH;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padT + (i / gridLines) * chartH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(W - padR, y);
        ctx.stroke();

        // Y-axis labels
        const val = maxP - (i / gridLines) * (maxP - minP);
        ctx.fillStyle = textColor;
        ctx.font = '11px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${Math.round(val)}`, padL - 6, y + 4);
    }

    // Divider line between historical and forecast
    const dividerX = xScale(hist.length - 1);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(dividerX, padT);
    ctx.lineTo(dividerX, padT + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label "Historical" and "Predicted"
    ctx.fillStyle = textColor;
    ctx.font = 'bold 10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(tr('chart.historical', lang), (padL + dividerX) / 2, padT + 14);
    ctx.fillStyle = '#7c3aed';
    ctx.fillText(tr('chart.predicted', lang), (dividerX + W - padR) / 2, padT + 14);

    // Forecast confidence band
    if (fore.length > 0) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.10)';
        ctx.beginPath();
        for (let i = 0; i < fore.length; i++) {
            const x = xScale(hist.length + i);
            const y = yScale(fore[i].upper);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        for (let i = fore.length - 1; i >= 0; i--) {
            ctx.lineTo(xScale(hist.length + i), yScale(fore[i].lower));
        }
        ctx.closePath();
        ctx.fill();
    }

    // Historical min-max band
    ctx.fillStyle = 'rgba(249, 115, 22, 0.08)';
    ctx.beginPath();
    for (let i = 0; i < hist.length; i++) {
        const x = xScale(i);
        if (i === 0) ctx.moveTo(x, yScale(hist[i].max));
        else ctx.lineTo(x, yScale(hist[i].max));
    }
    for (let i = hist.length - 1; i >= 0; i--) {
        ctx.lineTo(xScale(i), yScale(hist[i].min));
    }
    ctx.closePath();
    ctx.fill();

    // Historical line
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < hist.length; i++) {
        const x = xScale(i);
        const y = yScale(hist[i].avg);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Forecast line (dashed)
    if (fore.length > 0) {
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        // Connect from last historical point
        ctx.moveTo(xScale(hist.length - 1), yScale(hist[hist.length - 1].avg));
        for (let i = 0; i < fore.length; i++) {
            ctx.lineTo(xScale(hist.length + i), yScale(fore[i].predicted));
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Forecast dots
        ctx.fillStyle = '#7c3aed';
        for (let i = 0; i < fore.length; i++) {
            const x = xScale(hist.length + i);
            const y = yScale(fore[i].predicted);
            ctx.beginPath();
            ctx.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // X-axis labels (every 6th point)
    const allMonths = [...hist.map(d => d.month), ...fore.map(d => d.month)];
    ctx.fillStyle = textColor;
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i < totalPoints; i += Math.max(1, Math.floor(totalPoints / 8))) {
        const label = allMonths[i];
        const [y, m] = label.split('-').map(Number);
        const localLabel = `${getLocalMonthName(m - 1, lang)} ${y % 100}`;
        ctx.fillText(localLabel, xScale(i), H - padB + 18);
    }
    // Always draw last label
    if (totalPoints > 1) {
        const lastLabel = allMonths[totalPoints - 1];
        const [y, m] = lastLabel.split('-').map(Number);
        ctx.fillText(`${getLocalMonthName(m - 1, lang)} ${y % 100}`, xScale(totalPoints - 1), H - padB + 18);
    }
}

// --- Seasonal Bar Chart ---

function drawSeasonalChart(
    canvas: HTMLCanvasElement,
    prediction: PredictionResult,
    lang: Language
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cs = getComputedStyle(document.documentElement);
    const bgColor = cs.getPropertyValue('--bg-surface').trim() || '#fafafa';
    const textColor = cs.getPropertyValue('--text-secondary').trim() || '#64748b';
    const textDarkColor = cs.getPropertyValue('--text-primary').trim() || '#334155';

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Compute average per calendar month
    const monthAvgs = new Array(12).fill(0);
    const monthCounts = new Array(12).fill(0);
    for (const d of prediction.historical) {
        const m = parseInt(d.month.split('-')[1]) - 1;
        monthAvgs[m] += d.avg;
        monthCounts[m] += 1;
    }
    const avgs = monthAvgs.map((s, i) => monthCounts[i] > 0 ? Math.round(s / monthCounts[i]) : 0);
    const minVal = Math.min(...avgs.filter(v => v > 0)) * 0.85;
    const maxVal = Math.max(...avgs) * 1.1;

    const padL = 50, padR = 10, padT = 10, padB = 35;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barW = chartW / 12 - 4;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    const bestBuy = prediction.bestBuyMonth;
    const bestSell = prediction.bestSellMonth;

    for (let i = 0; i < 12; i++) {
        if (avgs[i] === 0) continue;
        const x = padL + (i / 12) * chartW + 2;
        const barH = ((avgs[i] - minVal) / (maxVal - minVal)) * chartH;
        const y = padT + chartH - barH;

        // Color: green for best buy, orange for best sell, light for others
        if (i === bestBuy) {
            ctx.fillStyle = '#22c55e';
        } else if (i === bestSell) {
            ctx.fillStyle = '#f97316';
        } else {
            ctx.fillStyle = '#cbd5e1';
        }
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Price label on bar
        ctx.fillStyle = textDarkColor;
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${avgs[i]}`, x + barW / 2, y - 4);

        // Month label
        ctx.fillStyle = textColor;
        ctx.font = '10px system-ui';
        ctx.fillText(getLocalMonthName(i, lang), x + barW / 2, H - padB + 14);
    }
}

// --- Main Component ---

export function PriceAnalysisTab() {
    const { appLanguage } = useLanguage();
    const { theme } = useTheme();
    const [selectedId, setSelectedId] = useState<string>(COMMODITIES[0].id);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const priceChartRef = useRef<HTMLCanvasElement>(null);
    const seasonalChartRef = useRef<HTMLCanvasElement>(null);

    const selectedCommodity = COMMODITIES.find(c => c.id === selectedId) || COMMODITIES[0];

    useEffect(() => {
        const result = generatePrediction(selectedId);
        setPrediction(result);
    }, [selectedId]);

    const drawCharts = useCallback(() => {
        if (!prediction) return;
        if (priceChartRef.current) drawPriceChart(priceChartRef.current, prediction, appLanguage);
        if (seasonalChartRef.current) drawSeasonalChart(seasonalChartRef.current, prediction, appLanguage);
    }, [prediction, appLanguage, theme]);

    useEffect(() => {
        drawCharts();
        window.addEventListener('resize', drawCharts);
        return () => window.removeEventListener('resize', drawCharts);
    }, [drawCharts]);

    if (!prediction) {
        return <div className="text-center py-12 text-slate-500">Loading analysis...</div>;
    }

    const trendColor = prediction.annualTrendPercent > 0 ? 'text-red-600' : prediction.annualTrendPercent < 0 ? 'text-emerald-600' : 'text-slate-600';
    const trendBg = prediction.annualTrendPercent > 0 ? 'bg-red-50' : prediction.annualTrendPercent < 0 ? 'bg-emerald-50' : 'bg-slate-50';
    const TrendIcon = prediction.annualTrendPercent > 0 ? TrendingUp : prediction.annualTrendPercent < 0 ? TrendingDown : Minus;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4 px-1 sm:px-0">
            {/* Title */}
            <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
                    <BarChart3 className="w-6 h-6 text-violet-500" />
                    {tr('tab.title', appLanguage)}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{tr('tab.subtitle', appLanguage)}</p>
            </div>

            {/* Commodity Selector - Scrollable */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {COMMODITIES.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${selectedId === c.id
                            ? 'bg-violet-600 text-white shadow-md shadow-violet-200'
                            : 'bg-white text-slate-700 border border-slate-100 hover:border-violet-200'
                            }`}
                    >
                        <span className="text-xl">{c.emoji}</span>
                        <span className="font-medium text-sm whitespace-nowrap">{c.names[appLanguage]}</span>
                    </button>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* YoY Change */}
                <div className={`rounded-xl p-3 ${trendBg} border border-slate-100`}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                        <span className="text-[10px] sm:text-xs text-slate-500">{tr('stats.yoy', appLanguage)}</span>
                    </div>
                    <p className={`text-lg sm:text-xl font-bold ${trendColor}`}>
                        {prediction.yoyChangePercent > 0 ? '+' : ''}{prediction.yoyChangePercent}%
                    </p>
                </div>

                {/* Volatility */}
                <div className="rounded-xl p-3 bg-amber-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] sm:text-xs text-slate-500">{tr('stats.volatility', appLanguage)}</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-amber-700">
                        {prediction.volatilityScore}/100
                    </p>
                </div>

                {/* Best Buy Month */}
                <div className="rounded-xl p-3 bg-emerald-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ShoppingCart className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] sm:text-xs text-slate-500">{tr('advice.bestBuy', appLanguage)}</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-emerald-700">
                        {getLocalMonthName(prediction.bestBuyMonth, appLanguage)}
                    </p>
                </div>

                {/* Best Sell Month */}
                <div className="rounded-xl p-3 bg-orange-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 mb-1">
                        <DollarSign className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] sm:text-xs text-slate-500">{tr('advice.bestSell', appLanguage)}</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-orange-700">
                        {getLocalMonthName(prediction.bestSellMonth, appLanguage)}
                    </p>
                </div>
            </div>

            {/* Price Trend Chart */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        {tr('chart.title', appLanguage)} — {selectedCommodity.names[appLanguage]}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block rounded"></span>{tr('chart.historical', appLanguage)}</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded" style={{ borderBottom: '2px dashed #7c3aed' }}></span>{tr('chart.predicted', appLanguage)}</span>
                    </div>
                </div>
                <canvas
                    ref={priceChartRef}
                    className="w-full"
                    style={{ height: '280px' }}
                />
            </div>

            {/* Seasonal Pattern */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    {tr('seasonal.title', appLanguage)}
                </h3>
                <div className="flex gap-4 text-[10px] mb-2">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded inline-block"></span>{tr('advice.bestBuy', appLanguage)}</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded inline-block"></span>{tr('advice.bestSell', appLanguage)}</span>
                </div>
                <canvas
                    ref={seasonalChartRef}
                    className="w-full"
                    style={{ height: '200px' }}
                />
            </div>

            {/* 6-Month Forecast Table */}
            <div className="bg-violet-50 rounded-2xl p-4 sm:p-5 border border-violet-100">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-violet-500" />
                    {tr('forecast.title', appLanguage)}
                    <span className="ml-auto text-xs font-normal px-2 py-0.5 bg-violet-200 text-violet-700 rounded-full">
                        {tr('stats.confidence', appLanguage)}: {prediction.confidence}%
                    </span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-500 text-xs border-b border-violet-200">
                                <th className="py-2 text-left font-medium">{tr('forecast.month', appLanguage)}</th>
                                <th className="py-2 text-center font-medium">{tr('forecast.price', appLanguage)}</th>
                                <th className="py-2 text-center font-medium">{tr('forecast.range', appLanguage)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prediction.forecast.map((f, i) => {
                                const [y, m] = f.month.split('-').map(Number);
                                const change = i === 0
                                    ? f.predicted - prediction.historical[prediction.historical.length - 1].avg
                                    : f.predicted - prediction.forecast[i - 1].predicted;
                                const changeColor = change > 0 ? 'text-red-500' : change < 0 ? 'text-emerald-500' : 'text-slate-400';
                                return (
                                    <tr key={f.month} className="border-b border-violet-100/50">
                                        <td className="py-2.5 font-medium text-slate-700">
                                            {getLocalMonthName(m - 1, appLanguage)} {y}
                                        </td>
                                        <td className="py-2.5 text-center">
                                            <span className="font-bold text-violet-700">₹{f.predicted}</span>
                                            <span className={`ml-1.5 text-xs ${changeColor}`}>
                                                {change > 0 ? '↑' : change < 0 ? '↓' : '→'}
                                                {change !== 0 ? ` ₹${Math.abs(change)}` : ''}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-center text-xs text-slate-500">
                                            ₹{f.lower} – ₹{f.upper}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">
                    {tr('per', appLanguage)} {selectedCommodity.unit}
                </p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                        {tr('disclaimer', appLanguage)}
                    </p>
                </div>
            </div>
        </div>
    );
}
