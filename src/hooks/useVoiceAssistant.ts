/**
 * useVoiceAssistant Hook
 * Provides speech recognition and text-to-speech via Web Speech API
 * Supports multilingual voice input/output for EktaMandi
 * 
 * Multilingual features:
 * - Voice-based language switching ("speak in Hindi", "हिंदी में बोलो")
 * - Auto-detect spoken language mode
 * - Mixed-language / code-switching support (Hinglish, etc.)
 * - Smart TTS voice selection per language
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Language } from '../types';
import { COMMODITIES, getCommodityName } from '../data/commodities';
import { getPriceData } from '../services/priceService';
import { getAllTips } from '../data/negotiationTips';

// BCP-47 language codes for Web Speech API
const LANG_CODES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  bn: 'bn-IN',
};

// Language display names (native + English) for UI and voice commands
const LANGUAGE_NAMES: Record<Language, { native: string; english: string; aliases: string[] }> = {
  en: { native: 'English', english: 'English', aliases: ['english', 'angrezi', 'अंग्रेज़ी', 'ఆంగ్లం', 'ஆங்கிலம்', 'ইংরেজি'] },
  hi: { native: 'हिन्दी', english: 'Hindi', aliases: ['hindi', 'हिंदी', 'हिन्दी', 'హిందీ', 'ஹிந்தி', 'হিন্দি'] },
  te: { native: 'తెలుగు', english: 'Telugu', aliases: ['telugu', 'तेलुगु', 'తెలుగు', 'தெலுங்கு', 'তেলুগু'] },
  ta: { native: 'தமிழ்', english: 'Tamil', aliases: ['tamil', 'तमिल', 'తమిళం', 'தமிழ்', 'তামিল'] },
  bn: { native: 'বাংলা', english: 'Bengali', aliases: ['bengali', 'bangla', 'बांग्ला', 'बंगाली', 'బెంగాలీ', 'பெங்காலி', 'বাংলা'] },
};

// All supported languages for iteration
const ALL_LANGUAGES: Language[] = ['en', 'hi', 'te', 'ta', 'bn'];

export interface VoiceMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  detectedLang?: Language;
}

export type VoiceAssistantStatus = 'idle' | 'listening' | 'processing' | 'speaking';

// Greeting messages per language
const GREETINGS: Record<Language, string> = {
  en: 'Hello! I am your EktaMandi voice assistant. You can ask me about commodity prices, negotiation tips, or say "help" for more options.',
  hi: 'नमस्ते! मैं आपका एकता मंडी वॉइस असिस्टेंट हूँ। आप मुझसे कमोडिटी की कीमतें, बातचीत के टिप्स पूछ सकते हैं, या "मदद" कहें।',
  te: 'నమస్కారం! నేను మీ ఏక్తామండి వాయిస్ అసిస్టెంట్. మీరు వస్తువుల ధరలు, చర్చ చిట్కాలు అడగవచ్చు, లేదా "సహాయం" అని చెప్పండి.',
  ta: 'வணக்கம்! நான் உங்கள் ஏக்தாமண்டி குரல் உதவியாளர். நீங்கள் பொருட்களின் விலைகள், பேச்சுவார்த்தை குறிப்புகள் கேட்கலாம், அல்லது "உதவி" என்று சொல்லுங்கள்.',
  bn: 'নমস্কার! আমি আপনার একতামণ্ডি ভয়েস অ্যাসিস্ট্যান্ট। আপনি আমাকে পণ্যের দাম, আলোচনার টিপস জিজ্ঞাসা করতে পারেন, বা "সাহায্য" বলুন।',
};

const HELP_MESSAGES: Record<Language, string> = {
  en: 'You can say: "Price of rice", "Price of tomatoes", "Negotiation tips", "Go to prices", "Go to negotiate", "Go to smart match", or ask about any commodity.',
  hi: 'आप कह सकते हैं: "चावल की कीमत", "टमाटर का भाव", "बातचीत के टिप्स", "भाव पेज पर जाओ", "बातचीत पेज पर जाओ", या किसी भी कमोडिटी के बारे में पूछें।',
  te: 'మీరు చెప్పవచ్చు: "బియ్యం ధర", "టమోటా ధర", "చర్చ చిట్కాలు", "ధరల పేజీకి వెళ్ళండి", "చర్చ పేజీకి వెళ్ళండి", లేదా ఏదైనా వస్తువు గురించి అడగండి.',
  ta: 'நீங்கள் சொல்லலாம்: "அரிசி விலை", "தக்காளி விலை", "பேச்சுவார்த்தை குறிப்புகள்", "விலை பக்கத்திற்கு செல்", "பேச்சு பக்கத்திற்கு செல்", அல்லது எந்த பொருளைப் பற்றியும் கேளுங்கள்.',
  bn: 'আপনি বলতে পারেন: "চালের দাম", "টমেটোর দাম", "আলোচনার টিপস", "দাম পেজে যাও", "আলোচনা পেজে যাও", বা যেকোনো পণ্য সম্পর্কে জিজ্ঞাসা করুন।',
};

interface UseVoiceAssistantProps {
  language: Language;
  onNavigate?: (tab: string) => void;
  onLanguageChange?: (lang: Language) => void;
}

export function useVoiceAssistant({ language, onNavigate, onLanguageChange }: UseVoiceAssistantProps) {
  const [status, setStatus] = useState<VoiceAssistantStatus>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceLang, setVoiceLang] = useState<Language>(language);
  const [autoDetect, setAutoDetect] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messageIdRef = useRef(0);
  // Use refs to avoid stale closures in recognition callbacks
  const statusRef = useRef<VoiceAssistantStatus>('idle');
  const languageRef = useRef<Language>(language);
  const voiceLangRef = useRef<Language>(language);
  const autoDetectRef = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  const onLanguageChangeRef = useRef(onLanguageChange);
  const voiceCacheRef = useRef<Map<string, SpeechSynthesisVoice>>(new Map());

  // Keep refs in sync
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { voiceLangRef.current = voiceLang; }, [voiceLang]);
  useEffect(() => { autoDetectRef.current = autoDetect; }, [autoDetect]);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);
  useEffect(() => { onLanguageChangeRef.current = onLanguageChange; }, [onLanguageChange]);

  // Sync voiceLang when app language changes externally
  useEffect(() => {
    setVoiceLang(language);
    voiceLangRef.current = language;
  }, [language]);

  // Cache best TTS voices per language
  useEffect(() => {
    const cacheVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const cache = new Map<string, SpeechSynthesisVoice>();
      for (const lang of ALL_LANGUAGES) {
        const langCode = LANG_CODES[lang];
        const shortCode = lang === 'en' ? 'en' : langCode.split('-')[0];
        // Prefer native voices, then any matching voice
        const native = voices.find(v => v.lang === langCode && !v.localService === false);
        const exact = voices.find(v => v.lang === langCode);
        const partial = voices.find(v => v.lang.startsWith(shortCode));
        const best = native || exact || partial;
        if (best) cache.set(lang, best);
      }
      voiceCacheRef.current = cache;
    };
    cacheVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', cacheVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', cacheVoices);
  }, []);

  const updateStatus = useCallback((newStatus: VoiceAssistantStatus) => {
    statusRef.current = newStatus;
    setStatus(newStatus);
  }, []);

  // Check browser support
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR || !window.speechSynthesis) {
      setIsSupported(false);
      console.warn('[VoiceAssistant] Speech API not supported in this browser');
    } else {
      console.log('[VoiceAssistant] Speech API available');
    }
  }, []);

  const addMessage = useCallback((text: string, sender: 'user' | 'assistant') => {
    const msg: VoiceMessage = {
      id: `msg-${++messageIdRef.current}`,
      text,
      sender,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  // Text-to-Speech with smart voice selection
  const speak = useCallback((text: string, overrideLang?: Language) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const lang = overrideLang || voiceLangRef.current;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_CODES[lang];
      utterance.rate = 0.95;
      utterance.pitch = 1;

      // Use cached best voice for this language
      const cachedVoice = voiceCacheRef.current.get(lang);
      if (cachedVoice) {
        utterance.voice = cachedVoice;
      }

      utterance.onstart = () => updateStatus('speaking');
      utterance.onend = () => {
        updateStatus('idle');
        resolve();
      };
      utterance.onerror = () => {
        updateStatus('idle');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }, [updateStatus]);

  // Switch voice language (and optionally app language)
  const switchVoiceLanguage = useCallback((newLang: Language, alsoSwitchApp = true) => {
    setVoiceLang(newLang);
    voiceLangRef.current = newLang;
    if (alsoSwitchApp && onLanguageChangeRef.current) {
      onLanguageChangeRef.current(newLang);
    }
    const langName = LANGUAGE_NAMES[newLang].native;
    const reply = getLanguageSwitchReply(newLang, langName);
    addMessage(reply, 'assistant');
    speak(reply, newLang);
  }, [addMessage, speak]);

  // Toggle auto-detect mode
  const toggleAutoDetect = useCallback(() => {
    const next = !autoDetectRef.current;
    setAutoDetect(next);
    autoDetectRef.current = next;
    const lang = voiceLangRef.current;
    const reply = next ? getAutoDetectOnReply(lang) : getAutoDetectOffReply(lang);
    addMessage(reply, 'assistant');
    speak(reply);
  }, [addMessage, speak]);

  // Process voice commands (uses refs to always read current language/navigate)
  const processCommand = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase().trim();
    const lang = voiceLangRef.current;
    const navigate = onNavigateRef.current;
    console.log('[VoiceAssistant] Processing command:', lower, '| lang:', lang);
    updateStatus('processing');

    // --- Language switching via voice ---
    const detectedLangSwitch = detectLanguageSwitchCommand(lower);
    if (detectedLangSwitch) {
      switchVoiceLanguage(detectedLangSwitch);
      return;
    }

    // --- Auto-detect toggle ---
    if (matchesAny(lower, [
      'auto detect', 'auto-detect', 'detect language', 'any language',
      'कोई भी भाषा', 'भाषा पहचानो', 'ఏ భాషైనా', 'எந்த மொழியும்', 'যেকোনো ভাষা',
    ])) {
      toggleAutoDetect();
      return;
    }

    // --- Greetings & casual conversation ---
    if (matchesAny(lower, [
      'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you',
      'what\'s up', 'sup', 'howdy', 'greetings',
      'नमस्ते', 'नमस्कार', 'हैलो', 'कैसे हो', 'कैसे हैं', 'क्या हाल',
      'నమస్కారం', 'హలో', 'ఎలా ఉన్నారు',
      'வணக்கம்', 'ஹலோ', 'எப்படி இருக்கீங்க',
      'নমস্কার', 'হ্যালো', 'কেমন আছেন',
    ])) {
      const reply = getGreetingReply(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Thank you ---
    if (matchesAny(lower, [
      'thank', 'thanks', 'thank you', 'dhanyavaad', 'shukriya',
      'धन्यवाद', 'शुक्रिया',
      'ధన్యవాదాలు',
      'நன்றி',
      'ধন্যবাদ',
    ])) {
      const reply = getThankYouReply(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Help ---
    if (matchesAny(lower, [
      'help', 'what can you do', 'what do you do', 'how does this work', 'guide', 'assist',
      'मदद', 'सहायता', 'क्या कर सकते',
      'సహాయం', 'ఏం చేయగలవు',
      'உதவி', 'என்ன செய்வீர்கள்',
      'সাহায্য', 'কি করতে পারো',
    ])) {
      const reply = HELP_MESSAGES[lang];
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Buying / selling intent ---
    if (matchesAny(lower, [
      'buy', 'purchase', 'want to buy', 'i want', 'need', 'looking for', 'find',
      'sell', 'selling', 'want to sell',
      'खरीदना', 'खरीद', 'बेचना', 'बेच', 'चाहिए', 'चाहता', 'चाहती', 'ढूंढ',
      'కొనాలి', 'అమ్మాలి', 'కావాలి',
      'வாங்க', 'விற்க', 'வேண்டும்',
      'কিনতে', 'বিক্রি', 'চাই', 'দরকার',
    ])) {
      // Check if they mention a specific commodity
      const matchedCommodity = findCommodityInText(lower);
      if (matchedCommodity) {
        const priceData = getPriceData(matchedCommodity);
        const name = getCommodityName(matchedCommodity, lang);
        const priceInfo = getPriceReply(name, priceData.minPrice, priceData.avgPrice, priceData.maxPrice, matchedCommodity.unit, lang);
        const buyReply = getBuyingSuggestion(lang, name) + ' ' + priceInfo;
        addMessage(buyReply, 'assistant');
        speak(buyReply);
      } else {
        // No specific commodity — guide them to Smart Match
        navigate?.('smart-match');
        const reply = getBuyingGenericReply(lang);
        addMessage(reply, 'assistant');
        speak(reply);
      }
      return;
    }

    // --- Quantity calculator: "price of 50 kg rice", "100 kg wheat price" ---
    const qtyMatch = lower.match(/(\d+)\s*(?:kg|kilogram|किलो|కిలో|கிலோ|কেজি|dozen|दर्जन|డజను|டஜன்|ডজন|liter|litre|लीटर|లీటర్|லிட்டர்|লিটার)\s*/i) 
      || lower.match(/(\d+)\s+/);
    if (qtyMatch) {
      const qty = parseInt(qtyMatch[1]);
      const commodityInQty = findCommodityInText(lower);
      if (commodityInQty && qty > 0 && qty <= 10000) {
        const priceData = getPriceData(commodityInQty);
        const name = getCommodityName(commodityInQty, lang);
        const total = qty * priceData.avgPrice;
        const reply = getQuantityCalcReply(lang, name, qty, commodityInQty.unit, priceData.avgPrice, total);
        addMessage(reply, 'assistant');
        speak(reply);
        return;
      }
    }

    // --- Price comparison: "compare rice and wheat", "rice vs wheat" ---
    const compareMatch = lower.match(/(?:compare|versus|vs|तुलना|तुलना करो|పోల్చు|ஒப்பிடு|তুলনা)\s*/i);
    if (compareMatch || lower.includes(' vs ') || lower.includes(' और ') || lower.includes(' మరియు ') || lower.includes(' மற்றும் ') || lower.includes(' এবং ')) {
      const allMatches = findAllCommoditiesInText(lower);
      if (allMatches.length >= 2) {
        const c1 = allMatches[0], c2 = allMatches[1];
        const p1 = getPriceData(c1), p2 = getPriceData(c2);
        const n1 = getCommodityName(c1, lang), n2 = getCommodityName(c2, lang);
        const reply = getCompareReply(lang, n1, p1.avgPrice, c1.unit, p1.trend, n2, p2.avgPrice, c2.unit, p2.trend);
        addMessage(reply, 'assistant');
        speak(reply);
        return;
      }
    }

    // --- Commodity price lookup (check before navigation to catch "rice price" etc.) ---
    // Use mixed-language commodity search — checks all language names regardless of current lang
    const matchedCommodity = findCommodityInText(lower);
    if (matchedCommodity) {
      const priceData = getPriceData(matchedCommodity);
      const name = getCommodityName(matchedCommodity, lang);
      const reply = getPriceReply(name, priceData.minPrice, priceData.avgPrice, priceData.maxPrice, matchedCommodity.unit, lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Market summary / overview ---
    if (matchesAny(lower, [
      'market summary', 'market overview', 'today summary', 'daily summary', 'market report',
      'how is the market', 'how is market', 'market update', 'what\'s happening',
      'बाजार', 'मंडी कैसी है', 'आज का हाल', 'बाज़ार कैसा',
      'మార్కెట్', 'మండీ ఎలా ఉంది', 'బజార్',
      'சந்தை', 'மார்க்கெட்', 'இன்று நிலவரம்',
      'বাজার', 'মণ্ডি কেমন', 'আজকের হাল',
    ])) {
      const reply = getMarketSummary(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Trending / what's up / what's hot ---
    if (matchesAny(lower, [
      'trending', 'trend', 'what\'s trending', 'trending up', 'going up', 'rising',
      'trending down', 'going down', 'falling', 'dropping',
      'cheapest', 'cheap', 'lowest price', 'sabse sasta', 'most expensive', 'costliest', 'highest price', 'sabse mehnga',
      'ट्रेंडिंग', 'सस्ता', 'महंगा', 'सबसे सस्ता', 'सबसे महंगा', 'बढ़ रहा', 'गिर रहा',
      'ట్రెండింగ్', 'చౌక', 'ఖరీదైన', 'పెరుగుతోంది', 'తగ్గుతోంది',
      'டிரெண்டிங்', 'மலிவான', 'விலை உயர்ந்த', 'ஏறுகிறது', 'இறங்குகிறது',
      'ট্রেন্ডিং', 'সস্তা', 'দামী', 'বাড়ছে', 'কমছে',
    ])) {
      const wantCheapest = matchesAny(lower, ['cheapest', 'cheap', 'lowest', 'sasta', 'सस्ता', 'सबसे सस्ता', 'చౌక', 'மலிவான', 'সস্তা']);
      const wantExpensive = matchesAny(lower, ['expensive', 'costliest', 'highest', 'mehnga', 'महंगा', 'सबसे महंगा', 'ఖరీదైన', 'விலை உயர்ந்த', 'দামী']);
      const reply = getTrendingReply(lang, wantCheapest, wantExpensive);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- List commodities ---
    if (matchesAny(lower, [
      'list', 'all commodities', 'all items', 'what commodities', 'what items', 'show all', 'available',
      'कौन कौन', 'सब कमोडिटी', 'सूची', 'क्या क्या', 'कौनसी चीज़ें',
      'అన్ని వస్తువులు', 'ఏమేమి', 'జాబితా',
      'அனைத்து பொருட்கள்', 'என்னென்ன', 'பட்டியல்',
      'সব পণ্য', 'কী কী', 'তালিকা',
    ])) {
      const reply = getCommodityListReply(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Seasonal / farming advice ---
    if (matchesAny(lower, [
      'season', 'seasonal', 'what to grow', 'what should i grow', 'best crop', 'which crop', 'farming advice',
      'kya ugayen', 'konsi fasal',
      'मौसम', 'कौनसी फसल', 'क्या उगाएं', 'खेती सलाह',
      'సీజన్', 'ఏ పంట', 'వ్యవసాయ సలహా',
      'பருவம்', 'என்ன பயிர்', 'விவசாய ஆலோசனை',
      'মৌসুম', 'কোন ফসল', 'চাষের পরামর্শ',
    ])) {
      const reply = getSeasonalAdvice(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Weather impact on prices ---
    if (matchesAny(lower, [
      'weather', 'rain', 'monsoon', 'drought', 'flood', 'climate',
      'मौसम', 'बारिश', 'मानसून', 'सूखा', 'बाढ़',
      'వాతావరణం', 'వర్షం', 'రుతుపవనాలు',
      'வானிலை', 'மழை', 'பருவமழை',
      'আবহাওয়া', 'বৃষ্টি', 'বর্ষা',
    ])) {
      const reply = getWeatherImpactReply(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- "What language" / current language query ---
    if (matchesAny(lower, [
      'what language', 'which language', 'current language', 'कौन सी भाषा', 'कौनसी भाषा',
      'ఏ భాష', 'எந்த மொழி', 'কোন ভাষা',
    ])) {
      const langName = LANGUAGE_NAMES[lang].native;
      const reply = getCurrentLanguageReply(lang, langName);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Navigation: prices ---
    if (matchesAny(lower, [
      'price', 'prices', 'rate', 'rates', 'cost', 'how much', 'show price', 'go to price', 'check price',
      'भाव', 'कीमत', 'दाम', 'रेट', 'कितना', 'कितने',
      'ధరలు', 'ధర', 'రేటు', 'ఎంత',
      'விலை', 'ரேட்', 'எவ்வளவு',
      'দাম', 'রেট', 'কত',
    ])) {
      navigate?.('price-discovery');
      const reply = getNavReply('price-discovery', lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Navigation: negotiation ---
    if (matchesAny(lower, [
      'negotiate', 'negotiation', 'bargain', 'deal', 'haggle', 'go to negoti',
      'बातचीत', 'सौदा', 'मोलभाव',
      'చర్చ', 'బేరం',
      'பேச்சு', 'பேரம்',
      'আলোচনা', 'দরাদরি',
    ])) {
      navigate?.('negotiation');
      const reply = getNavReply('negotiation', lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Navigation: smart match ---
    if (matchesAny(lower, [
      'smart match', 'match', 'find buyer', 'find seller', 'connect', 'go to smart',
      'स्मार्ट मैच', 'खोजो', 'मिलाओ',
      'స్మార్ట్', 'కనుగొను',
      'ஸ்மார்ட்', 'கண்டுபிடி',
      'স্মার্ট', 'খুঁজে',
    ])) {
      navigate?.('smart-match');
      const reply = getNavReply('smart-match', lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Negotiation tips ---
    if (matchesAny(lower, [
      'tip', 'tips', 'advice', 'suggest', 'strategy', 'how to negotiate', 'how to bargain',
      'टिप्स', 'सुझाव', 'रणनीति',
      'చిట్కాలు', 'సలహా',
      'குறிப்புகள்', 'ஆலோசனை',
      'টিপস', 'পরামর্শ',
    ])) {
      const tips = getAllTips(lang);
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      const reply = `${randomTip.title}: ${randomTip.description}`;
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Goodbye ---
    if (matchesAny(lower, [
      'bye', 'goodbye', 'see you', 'exit', 'close', 'quit',
      'अलविदा', 'बाय', 'चलता हूँ',
      'వెళ్తాను', 'బై',
      'போகிறேன்', 'பை',
      'যাই', 'বাই',
    ])) {
      const reply = getGoodbyeReply(lang);
      addMessage(reply, 'assistant');
      speak(reply);
      return;
    }

    // --- Fallback: more helpful ---
    const fallback = getSmartFallback(lower, lang);
    addMessage(fallback, 'assistant');
    speak(fallback);
  }, [addMessage, speak, updateStatus, switchVoiceLanguage, toggleAutoDetect]);

  // Start listening — supports auto-detect mode with fallback languages
  const startListening = useCallback((overrideLang?: Language) => {
    if (!isSupported) {
      setErrorMessage('Voice not supported in this browser.');
      return;
    }

    const listenLang = overrideLang || voiceLangRef.current;
    console.log('[VoiceAssistant] Starting speech recognition in:', listenLang, 'autoDetect:', autoDetectRef.current);
    setErrorMessage(null);

    // Stop any ongoing TTS so mic is not blocked
    window.speechSynthesis.cancel();

    // Clean up any previous recognition instance
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_e) { /* ignore */ }
      recognitionRef.current = null;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setErrorMessage('Speech recognition not available.');
      return;
    }

    const recognition = new SR();
    recognition.lang = LANG_CODES[listenLang];
    recognition.interimResults = false;
    recognition.maxAlternatives = autoDetectRef.current ? 3 : 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('[VoiceAssistant] Recognition started — listening in', listenLang);
      updateStatus('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log('[VoiceAssistant] Transcript:', transcript, '| Confidence:', confidence, '| Lang:', listenLang);

      // If confidence is very low in auto-detect, note it
      if (autoDetectRef.current && confidence < 0.3) {
        console.log('[VoiceAssistant] Low confidence in', listenLang, '- transcript may be inaccurate');
      }

      addMessage(transcript, 'user');
      processCommand(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VoiceAssistant] Recognition error:', event.error);
      const lang = voiceLangRef.current;
      if (event.error === 'no-speech') {
        const noSpeechMsgs: Record<Language, string> = {
          en: 'No speech detected. Please try again.',
          hi: 'कोई आवाज़ नहीं मिली। फिर से कोशिश करें।',
          te: 'మాట గుర్తించబడలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.',
          ta: 'பேச்சு கண்டறியப்படவில்லை. மீண்டும் முயற்சிக்கவும்.',
          bn: 'কোনো কথা শনাক্ত হয়নি। আবার চেষ্টা করুন।',
        };
        setErrorMessage(noSpeechMsgs[lang]);
      } else if (event.error === 'not-allowed') {
        const micDeniedMsgs: Record<Language, string> = {
          en: 'Microphone access denied. Please allow microphone in browser settings.',
          hi: 'माइक्रोफोन की अनुमति दें। ब्राउज़र सेटिंग्स में अनुमति दें।',
          te: 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతించండి.',
          ta: 'மைக்ரோஃபோன் அணுகல் மறுக்கப்பட்டது. உலாவி அமைப்புகளில் அனுமதிக்கவும்.',
          bn: 'মাইক্রোফোন অ্যাক্সেস অস্বীকৃত। ব্রাউজার সেটিংসে অনুমতি দিন।',
        };
        setErrorMessage(micDeniedMsgs[lang]);
      } else if (event.error === 'aborted') {
        // User or code aborted — not an error
      } else {
        setErrorMessage(`Error: ${event.error}`);
      }
      updateStatus('idle');
    };

    recognition.onend = () => {
      console.log('[VoiceAssistant] Recognition ended. Current status:', statusRef.current);
      // Only reset to idle if we're still in listening state (not processing/speaking)
      if (statusRef.current === 'listening') {
        updateStatus('idle');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('[VoiceAssistant] Failed to start recognition:', err);
      setErrorMessage('Failed to start microphone. Please try again.');
      updateStatus('idle');
    }
  }, [isSupported, addMessage, processCommand, updateStatus]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('[VoiceAssistant] Stopping...');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (_e) { /* ignore */ }
    }
    window.speechSynthesis.cancel();
    updateStatus('idle');
  }, [updateStatus]);

  // Greet on open (text only, no TTS to avoid blocking mic)
  const greet = useCallback(() => {
    const greeting = GREETINGS[voiceLangRef.current];
    addMessage(greeting, 'assistant');
  }, [addMessage]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    status,
    messages,
    isSupported,
    errorMessage,
    voiceLang,
    autoDetect,
    startListening,
    stopListening,
    greet,
    clearMessages,
    speak,
    switchVoiceLanguage,
    toggleAutoDetect,
  };
}

// --- Helper functions ---

function matchesAny(input: string, keywords: string[]): boolean {
  return keywords.some(kw => input.includes(kw));
}

function findCommodityInText(text: string) {
  // Check English names and native names
  for (const commodity of COMMODITIES) {
    const names = Object.values(commodity.names).map(n => n.toLowerCase());
    // Also check the commodity id
    names.push(commodity.id);
    if (names.some(name => text.includes(name))) {
      return commodity;
    }
  }
  return null;
}

function getNavReply(tab: string, lang: Language): string {
  const labels: Record<string, Record<Language, string>> = {
    'price-discovery': {
      en: 'Navigating to Prices tab.',
      hi: 'भाव टैब पर जा रहे हैं।',
      te: 'ధరల ట్యాబ్‌కి వెళ్తున్నాం.',
      ta: 'விலை தாவலுக்கு செல்கிறோம்.',
      bn: 'দাম ট্যাবে যাচ্ছি।',
    },
    'negotiation': {
      en: 'Navigating to Negotiation tab.',
      hi: 'बातचीत टैब पर जा रहे हैं।',
      te: 'చర్చ ట్యాబ్‌కి వెళ్తున్నాం.',
      ta: 'பேச்சுவார்த்தை தாவலுக்கு செல்கிறோம்.',
      bn: 'আলোচনা ট্যাবে যাচ্ছি।',
    },
    'smart-match': {
      en: 'Navigating to Smart Match tab.',
      hi: 'स्मार्ट मैच टैब पर जा रहे हैं।',
      te: 'స్మార్ట్ మ్యాచ్ ట్యాబ్‌కి వెళ్తున్నాం.',
      ta: 'ஸ்மார்ட் மேட்ச் தாவலுக்கு செல்கிறோம்.',
      bn: 'স্মার্ট ম্যাচ ট্যাবে যাচ্ছি।',
    },
  };
  return labels[tab]?.[lang] || labels[tab]?.en || 'Navigating...';
}

function getPriceReply(name: string, min: number, avg: number, max: number, unit: string, lang: Language): string {
  if (lang === 'en') {
    return `${name}: Minimum ₹${min}, Average ₹${avg}, Maximum ₹${max} per ${unit}.`;
  }
  if (lang === 'hi') {
    return `${name}: न्यूनतम ₹${min}, औसत ₹${avg}, अधिकतम ₹${max} प्रति ${unit}।`;
  }
  if (lang === 'te') {
    return `${name}: కనిష్ట ₹${min}, సగటు ₹${avg}, గరిష్ట ₹${max} ప్రతి ${unit}.`;
  }
  if (lang === 'ta') {
    return `${name}: குறைந்தபட்சம் ₹${min}, சராசரி ₹${avg}, அதிகபட்சம் ₹${max} ஒரு ${unit}.`;
  }
  if (lang === 'bn') {
    return `${name}: সর্বনিম্ন ₹${min}, গড় ₹${avg}, সর্বোচ্চ ₹${max} প্রতি ${unit}।`;
  }
  return `${name}: Min ₹${min}, Avg ₹${avg}, Max ₹${max} per ${unit}.`;
}

function getGreetingReply(lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'Hello! Welcome to EktaMandi. I can help you check commodity prices, find buyers or sellers, or get negotiation tips. What would you like to do?',
    hi: 'नमस्ते! एकता मंडी में आपका स्वागत है। मैं आपको कमोडिटी की कीमतें, खरीदार-विक्रेता खोजने, या बातचीत के टिप्स में मदद कर सकता हूँ। क्या करना चाहेंगे?',
    te: 'నమస్కారం! ఏక్తామండికి స్వాగతం. నేను మీకు వస్తువుల ధరలు, కొనుగోలుదారులు లేదా విక్రేతలను కనుగొనడంలో సహాయం చేయగలను. ఏం చేయాలి?',
    ta: 'வணக்கம்! ஏக்தாமண்டிக்கு வரவேற்கிறோம். பொருட்களின் விலை, வாங்குபவர் அல்லது விற்பனையாளரைக் கண்டறிய உதவ முடியும். என்ன செய்ய விரும்புகிறீர்கள்?',
    bn: 'নমস্কার! একতামণ্ডিতে স্বাগতম। আমি আপনাকে পণ্যের দাম, ক্রেতা বা বিক্রেতা খুঁজতে, বা আলোচনার টিপস দিতে পারি। কী করতে চান?',
  };
  return replies[lang];
}

function getThankYouReply(lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'You\'re welcome! Let me know if you need anything else.',
    hi: 'आपका स्वागत है! और कुछ चाहिए तो बताइए।',
    te: 'మీకు స్వాగతం! మరేదైనా కావాలంటే చెప్పండి.',
    ta: 'நன்றி! வேறு ஏதாவது வேண்டுமா?',
    bn: 'আপনাকে স্বাগতম! আর কিছু দরকার হলে জানান।',
  };
  return replies[lang];
}

function getBuyingSuggestion(lang: Language, commodityName: string): string {
  const replies: Record<Language, string> = {
    en: `Great choice! Here are the current prices for ${commodityName}.`,
    hi: `बढ़िया! ${commodityName} के मौजूदा भाव ये हैं।`,
    te: `మంచి ఎంపిక! ${commodityName} ప్రస్తుత ధరలు ఇవి.`,
    ta: `நல்ல தேர்வு! ${commodityName} தற்போதைய விலைகள் இவை.`,
    bn: `দারুণ! ${commodityName} এর বর্তমান দাম এখানে।`,
  };
  return replies[lang];
}

function getBuyingGenericReply(lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'I\'ve opened Smart Match for you! You can find buyers and sellers there. Or tell me a specific commodity like "rice" or "tomatoes" and I\'ll check the price.',
    hi: 'मैंने स्मार्ट मैच खोल दिया है! वहाँ खरीदार-विक्रेता मिलेंगे। या मुझे कोई कमोडिटी बताएं जैसे "चावल" या "टमाटर" तो भाव बता दूँगा।',
    te: 'స్మార్ట్ మ్యాచ్ తెరిచాను! అక్కడ కొనుగోలుదారులు మరియు విక్రేతలు కనుగొనవచ్చు. లేదా "బియ్యం" లేదా "టమోటా" వంటి వస్తువు చెప్పండి.',
    ta: 'ஸ்மார்ட் மேட்ச் திறந்துள்ளேன்! அங்கே வாங்குபவர்-விற்பனையாளர் கண்டறியலாம். அல்லது "அரிசி" அல்லது "தக்காளி" போன்ற பொருள் சொல்லுங்கள்.',
    bn: 'স্মার্ট ম্যাচ খুলেছি! সেখানে ক্রেতা-বিক্রেতা পাবেন। অথবা "চাল" বা "টমেটো" বলুন, দাম জানাব।',
  };
  return replies[lang];
}

function getGoodbyeReply(lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'Goodbye! Have a great day at the mandi. Come back anytime!',
    hi: 'अलविदा! मंडी में अच्छा दिन हो। कभी भी वापस आइए!',
    te: 'వెళ్ళొస్తాను! మండీలో మంచి రోజు గడపండి. ఎప్పుడైనా తిరిగి రండి!',
    ta: 'போய் வருகிறேன்! மண்டியில் நல்ல நாள் அமையட்டும். எப்போது வேண்டுமானாலும் வாருங்கள்!',
    bn: 'বিদায়! মণ্ডিতে ভালো দিন কাটুক। যেকোনো সময় ফিরে আসুন!',
  };
  return replies[lang];
}

function getSmartFallback(_input: string, lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'I\'m your mandi assistant! I can help with:\n- 💰 Prices: say "rice", "tomatoes", or "50 kg rice"\n- 📊 Compare: "compare rice and wheat"\n- 📈 Trends: "trending", "cheapest", "most expensive"\n- 🌧️ Weather: "weather impact", "monsoon"\n- 🌱 Season: "what to grow", "best crop"\n- 📋 List: "all commodities"\n- 📊 Summary: "market summary"\n- 💡 Tips: "negotiation tips"\n- 🌐 Language: "speak in Hindi"\nWhat would you like?',
    hi: 'मैं मदद कर सकता हूँ:\n- 💰 भाव: "चावल", "50 किलो टमाटर"\n- 📊 तुलना: "चावल और गेहूं तुलना"\n- 📈 ट्रेंड: "सबसे सस्ता", "सबसे महंगा"\n- 🌧️ मौसम: "बारिश का असर"\n- 🌱 फसल: "क्या उगाएं"\n- 📋 सूची: "सब कमोडिटी"\n- 📊 सारांश: "बाजार"\n- 💡 सुझाव: "टिप्स"\n- 🌐 भाषा: "English में बोलो"\nक्या चाहिए?',
    te: 'నేను సహాయం చేయగలను:\n- 💰 ధరలు: "బియ్యం", "50 కిలో టమోటా"\n- 📊 పోల్చు: "బియ్యం మరియు గోధుమ"\n- 📈 ట్రెండ్: "చౌక", "ఖరీదైన"\n- 🌧️ వాతావరణం: "వర్షం ప్రభావం"\n- 🌱 పంట: "ఏ పంట వేయాలి"\n- 📋 జాబితా: "అన్ని వస్తువులు"\n- 📊 సారాంశం: "మార్కెట్"\n- 🌐 భాష: "హిందీలో మాట్లాడు"\nఏం కావాలి?',
    ta: 'நான் உதவ முடியும்:\n- 💰 விலை: "அரிசி", "50 கிலோ தக்காளி"\n- 📊 ஒப்பிடு: "அரிசி மற்றும் கோதுமை"\n- 📈 போக்கு: "மலிவான", "விலை உயர்ந்த"\n- 🌧️ வானிலை: "மழை தாக்கம்"\n- 🌱 பயிர்: "என்ன பயிர்"\n- 📋 பட்டியல்: "அனைத்து பொருட்கள்"\n- 📊 சுருக்கம்: "சந்தை"\n- 🌐 மொழி: "ஹிந்தியில் பேசு"\nஎன்ன வேண்டும்?',
    bn: 'আমি সাহায্য করতে পারি:\n- 💰 দাম: "চাল", "50 কেজি টমেটো"\n- 📊 তুলনা: "চাল এবং গম"\n- 📈 ট্রেন্ড: "সস্তা", "দামী"\n- 🌧️ আবহাওয়া: "বৃষ্টির প্রভাব"\n- 🌱 ফসল: "কোন ফসল চাষ করব"\n- 📋 তালিকা: "সব পণ্য"\n- 📊 সারসংক্ষেপ: "বাজার"\n- 🌐 ভাষা: "হিন্দিতে বলো"\nকী চান?',
  };
  return replies[lang];
}

// --- Multilingual helper functions ---

/**
 * Detect if the user wants to switch language via voice command.
 * Handles patterns like: "speak in Hindi", "switch to Telugu", "हिंदी में बोलो", "తెలుగులో మాట్లాడు"
 */
function detectLanguageSwitchCommand(input: string): Language | null {
  const lower = input.toLowerCase();

  // Pattern: "speak in <language>", "switch to <language>", "change to <language>", "use <language>"
  const switchPatterns = [
    /(?:speak|switch|change|talk|converse|respond|reply)\s+(?:in|to)\s+(\w+)/,
    /(?:use|set)\s+(\w+)\s*(?:language)?/,
    /(\w+)\s+(?:language|में बोलो|में बात करो|में बोल|मे बोलो|లో మాట్లాడు|ல பேசு|তে বলো|য় বলো)/,
    /(\w+)\s+(?:me bolo|mein bolo|main bolo)/,
  ];

  for (const pattern of switchPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const langWord = match[1].toLowerCase();
      const detected = findLanguageByAlias(langWord);
      if (detected) return detected;
    }
  }

  // Direct native language names as standalone commands
  // e.g., user just says "हिंदी" or "తెలుగు" or "தமிழ்" or "বাংলা"
  for (const lang of ALL_LANGUAGES) {
    const { aliases } = LANGUAGE_NAMES[lang];
    if (aliases.some(alias => lower === alias || lower === alias + ' mein' || lower === alias + ' mein bolo')) {
      return lang;
    }
  }

  return null;
}

/**
 * Find a Language key by matching against all known aliases
 */
function findLanguageByAlias(word: string): Language | null {
  for (const lang of ALL_LANGUAGES) {
    const { aliases, english, native } = LANGUAGE_NAMES[lang];
    if (
      word === english.toLowerCase() ||
      word === native.toLowerCase() ||
      aliases.some(a => a.toLowerCase() === word)
    ) {
      return lang;
    }
  }
  return null;
}

function getLanguageSwitchReply(lang: Language, langName: string): string {
  const replies: Record<Language, string> = {
    en: `Switched to ${langName}! I'll now listen and respond in English. You can say "speak in Hindi" or any other language to switch again.`,
    hi: `${langName} में बदल दिया! अब मैं हिंदी में सुनूँगा और जवाब दूँगा। भाषा बदलने के लिए "English में बोलो" कहें।`,
    te: `${langName}కి మారాను! ఇప్పుడు నేను తెలుగులో వింటాను మరియు జవాబిస్తాను. భాష మార్చడానికి "హిందీలో మాట్లాడు" చెప్పండి.`,
    ta: `${langName}க்கு மாற்றிவிட்டேன்! இப்போது நான் தமிழில் கேட்டு பதிலளிப்பேன். மொழி மாற்ற "ஹிந்தியில் பேசு" சொல்லுங்கள்.`,
    bn: `${langName}তে বদলেছি! এখন আমি বাংলায় শুনব এবং উত্তর দেব। ভাষা বদলাতে "হিন্দিতে বলো" বলুন।`,
  };
  return replies[lang];
}

function getCurrentLanguageReply(lang: Language, langName: string): string {
  const replies: Record<Language, string> = {
    en: `I'm currently set to ${langName}. I'm listening and responding in English. Say "speak in Hindi" to switch.`,
    hi: `अभी मैं ${langName} में हूँ। हिंदी में सुन और बोल रहा हूँ। भाषा बदलने के लिए "English में बोलो" कहें।`,
    te: `ప్రస్తుతం నేను ${langName}లో ఉన్నాను. భాష మార్చడానికి "హిందీలో మాట్లాడు" చెప్పండి.`,
    ta: `தற்போது நான் ${langName}ல் இருக்கிறேன். மொழி மாற்ற "ஹிந்தியில் பேசு" சொல்லுங்கள்.`,
    bn: `এখন আমি ${langName}তে আছি। ভাষা বদলাতে "হিন্দিতে বলো" বলুন।`,
  };
  return replies[lang];
}

function getAutoDetectOnReply(lang: Language): string {
  const replies: Record<Language, string> = {
    en: 'Auto-detect mode ON! I\'ll try to understand you in any language. For best results, speak clearly in one language at a time.',
    hi: 'ऑटो-डिटेक्ट मोड चालू! मैं किसी भी भाषा में समझने की कोशिश करूँगा। सबसे अच्छे नतीजे के लिए, एक समय में एक भाषा में बोलें।',
    te: 'ఆటో-డిటెక్ట్ మోడ్ ఆన్! నేను ఏ భాషలోనైనా అర్థం చేసుకోవడానికి ప్రయత్నిస్తాను.',
    ta: 'தானியங்கி கண்டறிதல் இயக்கத்தில்! எந்த மொழியிலும் புரிந்துகொள்ள முயற்சிப்பேன்.',
    bn: 'অটো-ডিটেক্ট মোড চালু! যেকোনো ভাষায় বুঝতে চেষ্টা করব।',
  };
  return replies[lang];
}

function getAutoDetectOffReply(lang: Language): string {
  const langName = LANGUAGE_NAMES[lang].native;
  const replies: Record<Language, string> = {
    en: `Auto-detect mode OFF. I'm now listening only in ${langName}.`,
    hi: `ऑटो-डिटेक्ट बंद। अब मैं सिर्फ ${langName} में सुन रहा हूँ।`,
    te: `ఆటో-డిటెక్ట్ ఆఫ్. ఇప్పుడు నేను ${langName}లో మాత్రమే వింటున్నాను.`,
    ta: `தானியங்கி கண்டறிதல் நிறுத்தப்பட்டது. இப்போது ${langName}ல் மட்டுமே கேட்கிறேன்.`,
    bn: `অটো-ডিটেক্ট বন্ধ। এখন শুধু ${langName}তে শুনছি।`,
  };
  return replies[lang];
}

// --- New capability helper functions ---

/** Find ALL commodities mentioned in text (for comparison) */
function findAllCommoditiesInText(text: string): typeof COMMODITIES {
  const found: typeof COMMODITIES = [];
  for (const commodity of COMMODITIES) {
    const names = Object.values(commodity.names).map(n => n.toLowerCase());
    names.push(commodity.id);
    if (names.some(name => text.includes(name))) {
      found.push(commodity);
    }
  }
  return found;
}

/** Quantity calculator reply */
function getQuantityCalcReply(lang: Language, name: string, qty: number, unit: string, pricePerUnit: number, total: number): string {
  const replies: Record<Language, string> = {
    en: `${qty} ${unit} of ${name}: ₹${pricePerUnit} per ${unit} × ${qty} = ₹${total.toLocaleString('en-IN')} total.`,
    hi: `${qty} ${unit} ${name}: ₹${pricePerUnit} प्रति ${unit} × ${qty} = कुल ₹${total.toLocaleString('en-IN')}।`,
    te: `${qty} ${unit} ${name}: ₹${pricePerUnit} ప్రతి ${unit} × ${qty} = మొత్తం ₹${total.toLocaleString('en-IN')}.`,
    ta: `${qty} ${unit} ${name}: ₹${pricePerUnit} ஒரு ${unit} × ${qty} = மொத்தம் ₹${total.toLocaleString('en-IN')}.`,
    bn: `${qty} ${unit} ${name}: ₹${pricePerUnit} প্রতি ${unit} × ${qty} = মোট ₹${total.toLocaleString('en-IN')}।`,
  };
  return replies[lang];
}

/** Price comparison reply */
function getCompareReply(
  lang: Language,
  name1: string, price1: number, unit1: string, trend1: string,
  name2: string, price2: number, unit2: string, trend2: string
): string {
  const trendLabel = (t: string, l: Language) => {
    const labels: Record<string, Record<Language, string>> = {
      up: { en: '📈 Rising', hi: '📈 बढ़ रहा', te: '📈 పెరుగుతోంది', ta: '📈 ஏறுகிறது', bn: '📈 বাড়ছে' },
      down: { en: '📉 Falling', hi: '📉 गिर रहा', te: '📉 తగ్గుతోంది', ta: '📉 இறங்குகிறது', bn: '📉 কমছে' },
      stable: { en: '➡️ Stable', hi: '➡️ स्थिर', te: '➡️ స్థిరం', ta: '➡️ நிலையானது', bn: '➡️ স্থিতিশীল' },
    };
    return labels[t]?.[l] || t;
  };

  const diff = Math.abs(price1 - price2);
  const cheaper = price1 < price2 ? name1 : name2;

  const replies: Record<Language, string> = {
    en: `📊 ${name1}: ₹${price1}/${unit1} (${trendLabel(trend1, lang)}) vs ${name2}: ₹${price2}/${unit2} (${trendLabel(trend2, lang)}). ${cheaper} is cheaper by ₹${diff}.`,
    hi: `📊 ${name1}: ₹${price1}/${unit1} (${trendLabel(trend1, lang)}) बनाम ${name2}: ₹${price2}/${unit2} (${trendLabel(trend2, lang)})। ${cheaper} ₹${diff} सस्ता है।`,
    te: `📊 ${name1}: ₹${price1}/${unit1} (${trendLabel(trend1, lang)}) vs ${name2}: ₹${price2}/${unit2} (${trendLabel(trend2, lang)}). ${cheaper} ₹${diff} చౌక.`,
    ta: `📊 ${name1}: ₹${price1}/${unit1} (${trendLabel(trend1, lang)}) vs ${name2}: ₹${price2}/${unit2} (${trendLabel(trend2, lang)}). ${cheaper} ₹${diff} மலிவு.`,
    bn: `📊 ${name1}: ₹${price1}/${unit1} (${trendLabel(trend1, lang)}) vs ${name2}: ₹${price2}/${unit2} (${trendLabel(trend2, lang)}). ${cheaper} ₹${diff} সস্তা।`,
  };
  return replies[lang];
}

/** Market summary — scans all commodities */
function getMarketSummary(lang: Language): string {
  const allData = COMMODITIES.map(c => ({ ...getPriceData(c), name: getCommodityName(c, lang) }));
  const upCount = allData.filter(d => d.trend === 'up').length;
  const downCount = allData.filter(d => d.trend === 'down').length;
  const stableCount = allData.filter(d => d.trend === 'stable').length;

  const topRising = allData.filter(d => d.trend === 'up').slice(0, 3).map(d => d.name).join(', ');
  const topFalling = allData.filter(d => d.trend === 'down').slice(0, 3).map(d => d.name).join(', ');

  const replies: Record<Language, string> = {
    en: `📊 Market Summary:\n📈 Rising: ${upCount} items${topRising ? ` (${topRising})` : ''}\n📉 Falling: ${downCount} items${topFalling ? ` (${topFalling})` : ''}\n➡️ Stable: ${stableCount} items\nTotal ${COMMODITIES.length} commodities tracked. Say a commodity name for details!`,
    hi: `📊 बाज़ार सारांश:\n📈 बढ़ रहे: ${upCount} आइटम${topRising ? ` (${topRising})` : ''}\n📉 गिर रहे: ${downCount} आइटम${topFalling ? ` (${topFalling})` : ''}\n➡️ स्थिर: ${stableCount} आइटम\nकुल ${COMMODITIES.length} कमोडिटी ट्रैक। विवरण के लिए कमोडिटी का नाम बोलें!`,
    te: `📊 మార్కెట్ సారాంశం:\n📈 పెరుగుతోంది: ${upCount}${topRising ? ` (${topRising})` : ''}\n📉 తగ్గుతోంది: ${downCount}${topFalling ? ` (${topFalling})` : ''}\n➡️ స్థిరం: ${stableCount}\nమొత్తం ${COMMODITIES.length} వస్తువులు. వివరాలకు వస్తువు పేరు చెప్పండి!`,
    ta: `📊 சந்தை சுருக்கம்:\n📈 ஏறுகிறது: ${upCount}${topRising ? ` (${topRising})` : ''}\n📉 இறங்குகிறது: ${downCount}${topFalling ? ` (${topFalling})` : ''}\n➡️ நிலையானது: ${stableCount}\nமொத்தம் ${COMMODITIES.length} பொருட்கள். விவரங்களுக்கு பொருளின் பெயர் சொல்லுங்கள்!`,
    bn: `📊 বাজার সারসংক্ষেপ:\n📈 বাড়ছে: ${upCount}${topRising ? ` (${topRising})` : ''}\n📉 কমছে: ${downCount}${topFalling ? ` (${topFalling})` : ''}\n➡️ স্থিতিশীল: ${stableCount}\nমোট ${COMMODITIES.length} পণ্য। বিস্তারিত জানতে পণ্যের নাম বলুন!`,
  };
  return replies[lang];
}

/** Trending / cheapest / most expensive reply */
function getTrendingReply(lang: Language, wantCheapest: boolean, wantExpensive: boolean): string {
  const allData = COMMODITIES.map(c => { const pd = getPriceData(c); return { commodity: c, avgPrice: pd.avgPrice, trend: pd.trend, name: getCommodityName(c, lang) }; });

  if (wantCheapest) {
    const sorted = [...allData].sort((a, b) => a.avgPrice - b.avgPrice);
    const top3 = sorted.slice(0, 3).map(d => `${d.name} ₹${d.avgPrice}/${d.commodity.unit}`).join(', ');
    const replies: Record<Language, string> = {
      en: `💰 Cheapest today: ${top3}`,
      hi: `💰 आज सबसे सस्ता: ${top3}`,
      te: `💰 ఈరోజు చౌకైనవి: ${top3}`,
      ta: `💰 இன்று மலிவானவை: ${top3}`,
      bn: `💰 আজ সবচেয়ে সস্তা: ${top3}`,
    };
    return replies[lang];
  }

  if (wantExpensive) {
    const sorted = [...allData].sort((a, b) => b.avgPrice - a.avgPrice);
    const top3 = sorted.slice(0, 3).map(d => `${d.name} ₹${d.avgPrice}/${d.commodity.unit}`).join(', ');
    const replies: Record<Language, string> = {
      en: `💎 Most expensive today: ${top3}`,
      hi: `💎 आज सबसे महंगा: ${top3}`,
      te: `💎 ఈరోజు అత్యంత ఖరీదైనవి: ${top3}`,
      ta: `💎 இன்று மிக விலை உயர்ந்தவை: ${top3}`,
      bn: `💎 আজ সবচেয়ে দামী: ${top3}`,
    };
    return replies[lang];
  }

  // General trending
  const rising = allData.filter(d => d.trend === 'up').slice(0, 3).map(d => d.name).join(', ');
  const falling = allData.filter(d => d.trend === 'down').slice(0, 3).map(d => d.name).join(', ');
  const replies: Record<Language, string> = {
    en: `📈 Trending up: ${rising || 'None'}\n📉 Trending down: ${falling || 'None'}\nSay "cheapest" or "most expensive" for specific rankings!`,
    hi: `📈 बढ़ रहे: ${rising || 'कोई नहीं'}\n📉 गिर रहे: ${falling || 'कोई नहीं'}\n"सबसे सस्ता" या "सबसे महंगा" बोलें!`,
    te: `📈 పెరుగుతున్నవి: ${rising || 'ఏమీ లేదు'}\n📉 తగ్గుతున్నవి: ${falling || 'ఏమీ లేదు'}\n"చౌక" లేదా "ఖరీదైన" చెప్పండి!`,
    ta: `📈 ஏறுவது: ${rising || 'எதுவும் இல்லை'}\n📉 இறங்குவது: ${falling || 'எதுவும் இல்லை'}\n"மலிவான" அல்லது "விலை உயர்ந்த" சொல்லுங்கள்!`,
    bn: `📈 বাড়ছে: ${rising || 'কিছু নেই'}\n📉 কমছে: ${falling || 'কিছু নেই'}\n"সস্তা" বা "দামী" বলুন!`,
  };
  return replies[lang];
}

/** List all available commodities */
function getCommodityListReply(lang: Language): string {
  const list = COMMODITIES.map(c => `${c.emoji} ${getCommodityName(c, lang)}`).join(', ');
  const replies: Record<Language, string> = {
    en: `We track ${COMMODITIES.length} commodities:\n${list}\n\nSay any name to check its price!`,
    hi: `हम ${COMMODITIES.length} कमोडिटी ट्रैक करते हैं:\n${list}\n\nकिसी भी नाम बोलें भाव जानने के लिए!`,
    te: `మేము ${COMMODITIES.length} వస్తువులను ట్రాక్ చేస్తున్నాం:\n${list}\n\nధర తెలుసుకోవడానికి ఏదైనా పేరు చెప్పండి!`,
    ta: `நாங்கள் ${COMMODITIES.length} பொருட்களை கண்காணிக்கிறோம்:\n${list}\n\nவிலை தெரிய எந்த பெயரையும் சொல்லுங்கள்!`,
    bn: `আমরা ${COMMODITIES.length} পণ্য ট্র্যাক করি:\n${list}\n\nদাম জানতে যেকোনো নাম বলুন!`,
  };
  return replies[lang];
}

/** Seasonal farming advice */
function getSeasonalAdvice(lang: Language): string {
  const month = new Date().getMonth(); // 0-11
  let season: string;
  let crops: string;

  if (month >= 5 && month <= 9) {
    // Kharif season (June-October)
    season = lang === 'en' ? 'Kharif (Monsoon)' : lang === 'hi' ? 'खरीफ (मानसून)' : lang === 'te' ? 'ఖరీఫ్ (వర్షాకాలం)' : lang === 'ta' ? 'கரீப் (பருவமழை)' : 'খরিফ (বর্ষা)';
    crops = lang === 'en' ? 'Rice, Cotton, Sugarcane, Turmeric, Chili are ideal. Prices typically drop after harvest (Oct-Nov), so consider selling early or storing.'
      : lang === 'hi' ? 'चावल, कपास, गन्ना, हल्दी, मिर्च आदर्श हैं। कटाई (अक्टू-नवं) के बाद दाम गिरते हैं, इसलिए जल्दी बेचें या स्टोर करें।'
      : lang === 'te' ? 'బియ్యం, పత్తి, చెరకు, పసుపు, మిరపకాయ అనుకూలం. పంట తర్వాత (అక్టో-నవం) ధరలు తగ్గుతాయి.'
      : lang === 'ta' ? 'அரிசி, பருத்தி, கரும்பு, மஞ்சள், மிளகாய் சிறந்தவை. அறுவடைக்குப் பிறகு விலை குறையும்.'
      : 'চাল, তুলা, আখ, হলুদ, মরিচ আদর্শ। ফসল কাটার পর দাম কমে।';
  } else if (month >= 10 || month <= 1) {
    // Rabi season (November-February)
    season = lang === 'en' ? 'Rabi (Winter)' : lang === 'hi' ? 'रबी (सर्दी)' : lang === 'te' ? 'రబీ (శీతాకాలం)' : lang === 'ta' ? 'ரபி (குளிர்காலம்)' : 'রবি (শীতকাল)';
    crops = lang === 'en' ? 'Wheat, Lentils, Potatoes, Onions, Coriander are ideal. Winter crops fetch good prices in March-April after harvest.'
      : lang === 'hi' ? 'गेहूं, दाल, आलू, प्याज, धनिया आदर्श हैं। सर्दी की फसलों का मार्च-अप्रैल में अच्छा भाव मिलता है।'
      : lang === 'te' ? 'గోధుమ, పప్పు, బంగాళాదుంప, ఉల్లిపాయ, కొత్తిమీర అనుకూలం. మార్చి-ఏప్రిల్‌లో మంచి ధరలు.'
      : lang === 'ta' ? 'கோதுமை, பருப்பு, உருளைக்கிழங்கு, வெங்காயம், கொத்தமல்லி சிறந்தவை. மார்ச்-ஏப்ரல் நல்ல விலை.'
      : 'গম, ডাল, আলু, পেঁয়াজ, ধনে আদর্শ। মার্চ-এপ্রিলে ভালো দাম পাওয়া যায়।';
  } else {
    // Zaid season (March-May)
    season = lang === 'en' ? 'Zaid (Summer)' : lang === 'hi' ? 'जायद (गर्मी)' : lang === 'te' ? 'జాయద్ (వేసవి)' : lang === 'ta' ? 'ஜாய்த் (கோடைகாலம்)' : 'জায়েদ (গ্রীষ্মকাল)';
    crops = lang === 'en' ? 'Mangoes, Bananas, Tomatoes are in demand. Summer vegetables fetch premium prices due to heat-related supply drops.'
      : lang === 'hi' ? 'आम, केला, टमाटर की मांग है। गर्मी में सब्जियों का भाव बढ़ता है।'
      : lang === 'te' ? 'మామిడి, అరటి, టమోటా డిమాండ్‌లో ఉన్నాయి. వేసవిలో కూరగాయల ధరలు పెరుగుతాయి.'
      : lang === 'ta' ? 'மாம்பழம், வாழைப்பழம், தக்காளி தேவை அதிகம். கோடையில் காய்கறி விலை அதிகரிக்கும்.'
      : 'আম, কলা, টমেটো চাহিদায় আছে। গরমে সবজির দাম বাড়ে।';
  }

  const replies: Record<Language, string> = {
    en: `🌱 Current season: ${season}\n${crops}`,
    hi: `🌱 वर्तमान मौसम: ${season}\n${crops}`,
    te: `🌱 ప్రస్తుత సీజన్: ${season}\n${crops}`,
    ta: `🌱 தற்போதைய பருவம்: ${season}\n${crops}`,
    bn: `🌱 বর্তমান মৌসুম: ${season}\n${crops}`,
  };
  return replies[lang];
}

/** Weather impact on prices */
function getWeatherImpactReply(lang: Language): string {
  const month = new Date().getMonth();
  const isMonsoon = month >= 5 && month <= 9;

  const replies: Record<Language, string> = {
    en: isMonsoon
      ? `🌧️ Monsoon Impact:\n- Vegetable prices (tomatoes, onions) often spike due to transport disruptions and crop damage.\n- Rice benefits from good rainfall — expect stable or lower prices.\n- Store perishables carefully — spoilage increases costs.\n💡 Tip: Buy in bulk when prices dip between rain spells.`
      : `☀️ Current Weather Impact:\n- Dry weather is good for wheat and lentil harvests.\n- Onion and potato prices may fluctuate based on cold storage availability.\n- Mango and banana season approaching — prices will drop as supply increases.\n💡 Tip: Stock up on seasonal produce when prices are lowest.`,
    hi: isMonsoon
      ? `🌧️ मानसून प्रभाव:\n- सब्जियों (टमाटर, प्याज) के भाव बढ़ सकते हैं।\n- अच्छी बारिश से चावल के भाव स्थिर रहेंगे।\n💡 सुझाव: बारिश के बीच कम भाव में थोक खरीदारी करें।`
      : `☀️ मौसम प्रभाव:\n- सूखा मौसम गेहूं और दाल की कटाई के लिए अच्छा है।\n- आम और केले का सीजन आ रहा है।\n💡 सुझाव: मौसमी उपज सस्ती होने पर स्टॉक करें।`,
    te: isMonsoon
      ? `🌧️ రుతుపవనాల ప్రభావం:\n- కూరగాయల ధరలు (టమోటా, ఉల్లిపాయ) పెరగవచ్చు.\n- బియ్యం ధరలు స్థిరంగా ఉంటాయి.\n💡 చిట్కా: వర్షాల మధ్య తక్కువ ధరలో కొనండి.`
      : `☀️ వాతావరణ ప్రభావం:\n- పొడి వాతావరణం గోధుమ, పప్పు పంటకు మంచిది.\n- మామిడి సీజన్ వస్తోంది.\n💡 చిట్కా: సీజనల్ ఉత్పత్తులు చౌకగా ఉన్నప్పుడు కొనండి.`,
    ta: isMonsoon
      ? `🌧️ பருவமழை தாக்கம்:\n- காய்கறி விலைகள் (தக்காளி, வெங்காயம்) அதிகரிக்கலாம்.\n- அரிசி விலை நிலையாக இருக்கும்.\n💡 குறிப்பு: மழை இடைவேளையில் மொத்தமாக வாங்குங்கள்.`
      : `☀️ வானிலை தாக்கம்:\n- வறண்ட காலநிலை கோதுமை, பருப்பு அறுவடைக்கு நல்லது.\n- மாம்பழ பருவம் வருகிறது.\n💡 குறிப்பு: பருவ பொருட்கள் விலை குறையும்போது வாங்குங்கள்.`,
    bn: isMonsoon
      ? `🌧️ বর্ষার প্রভাব:\n- সবজির দাম (টমেটো, পেঁয়াজ) বাড়তে পারে।\n- চালের দাম স্থিতিশীল থাকবে।\n💡 পরামর্শ: বৃষ্টির মাঝে কম দামে বেশি কিনুন।`
      : `☀️ আবহাওয়া প্রভাব:\n- শুষ্ক আবহাওয়া গম ও ডাল কাটার জন্য ভালো।\n- আমের মৌসুম আসছে।\n💡 পরামর্শ: মৌসুমি পণ্য সস্তা হলে মজুদ করুন।`,
  };
  return replies[lang];
}
