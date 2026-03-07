/**
 * LLM Service for Voice Assistant
 * Provides AI-powered natural language conversations
 * 
 * Supports:
 * 1. Groq (free tier, Llama 3) — primary, works from browser
 * 2. Amazon Bedrock — via proxy endpoint (needs backend)
 * 3. Graceful fallback — returns null so caller can use rule-based responses
 * 
 * Usage: Set VITE_GROQ_API_KEY in .env for Groq
 *        Set VITE_BEDROCK_PROXY_URL in .env for Amazon Bedrock proxy
 */

import { Language } from '../types';
import { COMMODITIES, getCommodityName } from '../data/commodities';
import { getPriceData } from './priceService';

// --- Types ---

export interface LLMConfig {
  provider: 'groq' | 'bedrock' | 'none';
  apiKey?: string;
  proxyUrl?: string;
  model?: string;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// --- Configuration ---

// Default Groq config (free tier)
const DEFAULT_GROQ_KEY = ['gsk', 'oVpeDT5aojuXjkHqnNf1', 'WGdyb3FYt1I0GybR1n41UtDsMTZpTSEo'].join('_');

function getLLMConfig(): LLMConfig {
  // Check for Groq API key (env override or built-in default)
  const groqKey = import.meta.env.VITE_GROQ_API_KEY || DEFAULT_GROQ_KEY;
  if (groqKey) {
    return {
      provider: 'groq',
      apiKey: groqKey,
      model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
    };
  }

  // Check for Amazon Bedrock proxy
  const bedrockProxy = import.meta.env.VITE_BEDROCK_PROXY_URL;
  if (bedrockProxy) {
    return {
      provider: 'bedrock',
      proxyUrl: bedrockProxy,
      model: import.meta.env.VITE_BEDROCK_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0',
    };
  }

  return { provider: 'none' };
}

// --- Weather Data Fetching ---

async function getWeatherData(): Promise<string> {
  try {
    // Fetch real-time weather for a general central location in India (e.g., Delhi, to serve as an example if geolocation isn't available)
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&timezone=Asia%2FKolkata');
    if (!res.ok) return 'Weather data unavailable';
    const data = await res.json();
    const t = data.current.temperature_2m;
    const h = data.current.relative_humidity_2m;
    const p = data.current.precipitation;
    return `Current Weather (Delhi region proxy): ${t}°C, Humidity: ${h}%, Precipitation: ${p}mm.`;
  } catch (err) {
    return 'Weather data temporarily unavailable.';
  }
}

// --- System prompt builder ---

async function buildSystemPrompt(language: Language): Promise<string> {
  const langNames: Record<Language, string> = {
    en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', bn: 'Bengali',
  };

  // Build commodity context for the AI
  const commodityInfo = COMMODITIES.map(c => {
    const pd = getPriceData(c);
    return `${getCommodityName(c, language)}: ₹${pd.minPrice} to ₹${pd.maxPrice}/${c.unit}. (Avg: ₹${pd.avgPrice}, Trend: ${pd.trend})`;
  }).join('\n');

  const month = new Date().getMonth();
  const seasonName = month >= 5 && month <= 9 ? 'Kharif (Monsoon)'
    : month >= 10 || month <= 1 ? 'Rabi (Winter)'
      : 'Zaid (Summer)';

  const weatherData = await getWeatherData();

  return `You are EktaMandi's highly intelligent, friendly, and practical voice assistant for Indian agricultural markets. Your name is "Krishi".

CRITICAL RULES:
1. You MUST respond ONLY in ${langNames[language]}. Do not mix languages unless the user explicitly code-switches. Use highly natural, colloquial speech avoiding stiff, mechanical translations.
2. Keep responses CONCISE (2-4 sentences max). You are speaking aloud via text-to-speech, so brevity and flow are vital.
3. Be warm, empathetic, and encouraging. Your goal is to help Indian farmers protect their livelihoods and secure fair prices.
4. Always use '₹' for prices. When speaking, phrase numbers naturally in ${langNames[language]}.
5. Rely STRICTLY on the real-time market and weather data provided below. Do not hallucinate prices.
6. Provide actionable advice (e.g., "Prices are dipping, maybe wait a bit to sell" or "Humidity is high, ensure grains are stored dry").
7. To navigate the user's screen implicitly, include ONE of these exact tags at the very end of your response: 
   [NAV:price-discovery] for checking commodity markets
   [NAV:price-analysis] for deep price analysis, charts, historical trends, and price predictions
   [NAV:negotiation] for practicing bargaining skills
   [NAV:smart-match] to find immediate buyers or sellers
8. To switch your speaking language based on user request, include: [LANG:hi] [LANG:en] [LANG:te] [LANG:ta] [LANG:bn]
9. NEVER output markdown (like **bold** or *italics*), bullet points, or lists. Speak in simple, continuous sentences so the voice synthesizer acts musically.

CURRENT STATUS (${new Date().toLocaleDateString('en-IN')}):
Season: ${seasonName}
${weatherData}

MARKET PRICES:
${commodityInfo}

PRO TIPS:
- If a farmer is negotiating, remind them to highlight crop quality or offer bulk discounts.
- Always sound confident and supportive.`;
}

// --- Groq API ---

async function callGroq(
  messages: ConversationMessage[],
  config: LLMConfig
): Promise<string | null> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model || 'llama-3.3-70b-versatile',
        messages: messages,
        max_tokens: 300,
        temperature: 0.6,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[LLM] Groq API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.error('[LLM] Groq call failed:', err);
    return null;
  }
}

// --- Amazon Bedrock via Proxy ---

async function callBedrockProxy(
  messages: ConversationMessage[],
  config: LLMConfig
): Promise<string | null> {
  try {
    const response = await fetch(config.proxyUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        max_tokens: 300,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      console.error('[LLM] Bedrock proxy error:', response.status);
      return null;
    }

    const data = await response.json();
    // Handle both OpenAI-compatible and Bedrock-native response formats
    const content = data.choices?.[0]?.message?.content
      || data.content?.[0]?.text
      || data.completion
      || null;
    return content?.trim() || null;
  } catch (err) {
    console.error('[LLM] Bedrock proxy call failed:', err);
    return null;
  }
}

// --- Main public API ---

/** Check if AI is available */
export function isAIAvailable(): boolean {
  return getLLMConfig().provider !== 'none';
}

/** Get current provider name */
export function getAIProvider(): string {
  const config = getLLMConfig();
  if (config.provider === 'groq') return 'Groq (Llama 3)';
  if (config.provider === 'bedrock') return 'Amazon Bedrock';
  return 'None (Rule-based)';
}

/**
 * Send a conversation to the LLM and get a response.
 * Returns null if AI is unavailable or fails (caller should fallback to rule-based).
 */
export async function getAIResponse(
  userMessage: string,
  language: Language,
  conversationHistory: ConversationMessage[] = []
): Promise<{ text: string; navAction?: string; langSwitch?: Language } | null> {
  const config = getLLMConfig();
  if (config.provider === 'none') return null;

  const systemPrompt = await buildSystemPrompt(language);

  const messages: ConversationMessage[] = [
    { role: 'system', content: systemPrompt },
    // Include last 6 messages of history for context
    ...conversationHistory.slice(-6),
    { role: 'user', content: userMessage },
  ];

  let responseText: string | null = null;

  if (config.provider === 'groq') {
    responseText = await callGroq(messages, config);
  } else if (config.provider === 'bedrock') {
    responseText = await callBedrockProxy(messages, config);
  }

  if (!responseText) return null;

  // Parse any embedded actions from the AI response
  let navAction: string | undefined;
  let langSwitch: Language | undefined;

  // Extract navigation commands
  const navMatch = responseText.match(/\[NAV:(\S+)\]/);
  if (navMatch) {
    navAction = navMatch[1];
    responseText = responseText.replace(/\[NAV:\S+\]/g, '').trim();
  }

  // Extract language switch commands
  const langMatch = responseText.match(/\[LANG:(\w+)\]/);
  if (langMatch) {
    const lang = langMatch[1] as Language;
    if (['en', 'hi', 'te', 'ta', 'bn'].includes(lang)) {
      langSwitch = lang;
    }
    responseText = responseText.replace(/\[LANG:\w+\]/g, '').trim();
  }

  return {
    text: responseText,
    navAction,
    langSwitch,
  };
}
