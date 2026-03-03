/**
 * useVoiceAssistant Hook
 * Provides speech recognition and text-to-speech via Web Speech API
 * Supports multilingual voice input/output for EktaMandi
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

export interface VoiceMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number;
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
}

export function useVoiceAssistant({ language, onNavigate }: UseVoiceAssistantProps) {
  const [status, setStatus] = useState<VoiceAssistantStatus>('idle');
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messageIdRef = useRef(0);
  // Use refs to avoid stale closures in recognition callbacks
  const statusRef = useRef<VoiceAssistantStatus>('idle');
  const languageRef = useRef<Language>(language);
  const onNavigateRef = useRef(onNavigate);

  // Keep refs in sync
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

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

  // Text-to-Speech
  const speak = useCallback((text: string) => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_CODES[languageRef.current];
      utterance.rate = 0.95;
      utterance.pitch = 1;

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

  // Process voice commands (uses refs to always read current language/navigate)
  const processCommand = useCallback((transcript: string) => {
    const lower = transcript.toLowerCase().trim();
    const lang = languageRef.current;
    const navigate = onNavigateRef.current;
    console.log('[VoiceAssistant] Processing command:', lower);
    updateStatus('processing');

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

    // --- Commodity price lookup (check before navigation to catch "rice price" etc.) ---
    const matchedCommodity = findCommodityInText(lower);
    if (matchedCommodity) {
      const priceData = getPriceData(matchedCommodity);
      const name = getCommodityName(matchedCommodity, lang);
      const reply = getPriceReply(name, priceData.minPrice, priceData.avgPrice, priceData.maxPrice, matchedCommodity.unit, lang);
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
  }, [addMessage, speak, updateStatus]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage('Voice not supported in this browser.');
      return;
    }

    console.log('[VoiceAssistant] Starting speech recognition...');
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
    recognition.lang = LANG_CODES[languageRef.current];
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      console.log('[VoiceAssistant] Recognition started — listening');
      updateStatus('listening');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log('[VoiceAssistant] Transcript:', transcript, '| Confidence:', confidence);
      addMessage(transcript, 'user');
      processCommand(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VoiceAssistant] Recognition error:', event.error);
      const lang = languageRef.current;
      if (event.error === 'no-speech') {
        setErrorMessage(lang === 'en' ? 'No speech detected. Please try again.' : 'कोई आवाज़ नहीं मिली। फिर से कोशिश करें।');
      } else if (event.error === 'not-allowed') {
        setErrorMessage(lang === 'en' ? 'Microphone access denied. Please allow microphone in browser settings.' : 'माइक्रोफोन की अनुमति दें।');
      } else if (event.error === 'aborted') {
        // User or code aborted — not an error
      } else {
        setErrorMessage(lang === 'en' ? `Error: ${event.error}. Please try again.` : `त्रुटि: ${event.error}`);
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
    const greeting = GREETINGS[languageRef.current];
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
    startListening,
    stopListening,
    greet,
    clearMessages,
    speak,
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
    en: 'I\'m your mandi assistant! I can help you with:\n- Check prices: say a commodity name like "rice", "tomatoes"\n- Navigate: say "prices", "negotiate", or "smart match"\n- Get tips: say "tips" or "advice"\n- Buy/sell: say "I want to buy rice"\nWhat would you like?',
    hi: 'मैं आपका मंडी सहायक हूँ! मैं मदद कर सकता हूँ:\n- भाव देखें: "चावल", "टमाटर" जैसा नाम बोलें\n- पेज पर जाएं: "भाव", "बातचीत", "स्मार्ट मैच" बोलें\n- टिप्स: "सुझाव" बोलें\n- खरीद/बिक्री: "चावल खरीदना है" बोलें\nक्या चाहिए?',
    te: 'నేను మీ మండీ సహాయకుడిని! నేను సహాయం చేయగలను:\n- ధరలు: "బియ్యం", "టమోటా" వంటి పేరు చెప్పండి\n- నావిగేట్: "ధరలు", "చర్చ", "స్మార్ట్ మ్యాచ్" చెప్పండి\n- చిట్కాలు: "సలహా" చెప్పండి\nఏం కావాలి?',
    ta: 'நான் உங்கள் மண்டி உதவியாளர்! உதவ முடியும்:\n- விலை: "அரிசி", "தக்காளி" போன்ற பெயர் சொல்லுங்கள்\n- செல்ல: "விலை", "பேச்சு", "ஸ்மார்ட் மேட்ச்" சொல்லுங்கள்\n- குறிப்புகள்: "ஆலோசனை" சொல்லுங்கள்\nஎன்ன வேண்டும்?',
    bn: 'আমি আপনার মণ্ডি সহায়ক! সাহায্য করতে পারি:\n- দাম: "চাল", "টমেটো" বলুন\n- যেতে: "দাম", "আলোচনা", "স্মার্ট ম্যাচ" বলুন\n- টিপস: "পরামর্শ" বলুন\n- কিনতে/বিক্রি: "চাল কিনতে চাই" বলুন\nকী চান?',
  };
  return replies[lang];
}
