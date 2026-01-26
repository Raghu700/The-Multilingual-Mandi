import { Language, TranslationEntry, MandiPhrase } from '../types';
import { MANDI_PHRASES } from '../data/mandiPhrases';
import { saveTranslation as saveToStorage, getTranslationHistory } from '../utils/storage';

/**
 * Translation Service
 * Handles text translation, phrase lookup, and history management
 */

/**
 * Simple translation map for common words and phrases
 * For a production app, this would use a translation API
 */
const TRANSLATION_MAP: Record<string, Record<Language, string>> = {
  'hello': {
    en: 'hello',
    hi: 'नमस्ते',
    te: 'హలో',
    ta: 'வணக்கம்',
    bn: 'হ্যালো'
  },
  'thank you': {
    en: 'thank you',
    hi: 'धन्यवाद',
    te: 'ధన్యవాదాలు',
    ta: 'நன்றி',
    bn: 'ধন্যবাদ'
  },
  'yes': {
    en: 'yes',
    hi: 'हाँ',
    te: 'అవును',
    ta: 'ஆம்',
    bn: 'হ্যাঁ'
  },
  'no': {
    en: 'no',
    hi: 'नहीं',
    te: 'కాదు',
    ta: 'இல்லை',
    bn: 'না'
  },
  'price': {
    en: 'price',
    hi: 'कीमत',
    te: 'ధర',
    ta: 'விலை',
    bn: 'দাম'
  },
  'quality': {
    en: 'quality',
    hi: 'गुणवत्ता',
    te: 'నాణ్యత',
    ta: 'தரம்',
    bn: 'মান'
  },
  'fresh': {
    en: 'fresh',
    hi: 'ताजा',
    te: 'తాజా',
    ta: 'புதிய',
    bn: 'তাজা'
  },
  'good': {
    en: 'good',
    hi: 'अच्छा',
    te: 'మంచి',
    ta: 'நல்ல',
    bn: 'ভাল'
  },
  'discount': {
    en: 'discount',
    hi: 'छूट',
    te: 'తగ్గింపు',
    ta: 'தள்ளுபடி',
    bn: 'ছাড়'
  },
  'delivery': {
    en: 'delivery',
    hi: 'डिलीवरी',
    te: 'డెలివరీ',
    ta: 'டெலிவரி',
    bn: 'ডেলিভারি'
  }
};

/**
 * Translate text to target language
 * For demo purposes, uses a simple translation map and word-by-word translation
 * In production, this would call a translation API like Google Translate or LibreTranslate
 */
export async function translate(text: string, targetLang: Language): Promise<string> {
  // If target is English, return as-is
  if (targetLang === 'en') {
    return text;
  }

  // Normalize text for lookup
  const normalizedText = text.toLowerCase().trim();

  // Check if we have a direct translation
  if (TRANSLATION_MAP[normalizedText]) {
    return TRANSLATION_MAP[normalizedText][targetLang];
  }

  // Check if it matches any mandi phrase
  const phrase = MANDI_PHRASES.find(p => p.en.toLowerCase() === normalizedText);
  if (phrase) {
    return phrase[targetLang];
  }

  // Try word-by-word translation for longer text
  const words = text.split(/\s+/);
  const translatedWords: string[] = [];
  let hasTranslations = false;

  for (const word of words) {
    const normalizedWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    
    // Check if word exists in translation map
    if (TRANSLATION_MAP[normalizedWord]) {
      translatedWords.push(TRANSLATION_MAP[normalizedWord][targetLang]);
      hasTranslations = true;
    } else {
      // Keep original word if no translation found
      translatedWords.push(word);
    }
  }

  // If we found at least some translations, return the result
  if (hasTranslations) {
    return translatedWords.join(' ');
  }

  // For demo purposes, return a placeholder translation
  // In production, this would call a real translation API
  const languageNames: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    bn: 'Bengali'
  };

  return `[${languageNames[targetLang]} translation of: "${text}"]`;
}

/**
 * Get a pre-translated mandi phrase by ID and language
 */
export function getMandiPhrase(phraseId: string, targetLang: Language): string {
  const phrase = MANDI_PHRASES.find(p => p.id === phraseId);
  
  if (!phrase) {
    throw new Error(`Phrase with id "${phraseId}" not found`);
  }

  return phrase[targetLang];
}

/**
 * Get all mandi phrases
 */
export function getAllMandiPhrases(): MandiPhrase[] {
  return MANDI_PHRASES;
}

/**
 * Save translation to history
 */
export function saveToHistory(entry: Omit<TranslationEntry, 'id' | 'timestamp'>): TranslationEntry {
  const fullEntry: TranslationEntry = {
    ...entry,
    id: generateId(),
    timestamp: Date.now()
  };

  saveToStorage(fullEntry);
  return fullEntry;
}

/**
 * Get translation history (newest first)
 */
export function getHistory(): TranslationEntry[] {
  const history = getTranslationHistory();
  return history.entries;
}

/**
 * Generate a unique ID for translation entries
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback to execCommand for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
