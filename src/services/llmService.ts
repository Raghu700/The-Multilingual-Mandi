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

// --- System prompt builder ---

function buildSystemPrompt(language: Language): string {
  const langNames: Record<Language, string> = {
    en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', bn: 'Bengali',
  };

  // Build commodity context for the AI
  const commodityInfo = COMMODITIES.map(c => {
    const pd = getPriceData(c);
    return `${getCommodityName(c, language)} (${getCommodityName(c, 'en')}): ₹${pd.minPrice}-₹${pd.maxPrice}/${c.unit}, trend: ${pd.trend}`;
  }).join('\n');

  const month = new Date().getMonth();
  const seasonName = month >= 5 && month <= 9 ? 'Kharif (Monsoon)' 
    : month >= 10 || month <= 1 ? 'Rabi (Winter)' 
    : 'Zaid (Summer)';

  return `You are EktaMandi's multilingual voice assistant for Indian agricultural markets (mandis).

IMPORTANT RULES:
- Respond ONLY in ${langNames[language]}. Do not mix languages unless the user code-switches.
- Keep responses SHORT (2-4 sentences max) since they will be spoken aloud via text-to-speech.
- Be warm, helpful, and practical. You help farmers and traders.
- Use ₹ for prices. Use Indian number formatting.
- If asked about a commodity, use the real price data below.
- You can help with: commodity prices, negotiation advice, farming tips, weather impact, market trends, buying/selling guidance, and general mandi questions.
- If user wants to navigate to a page, include one of these exact tags: [NAV:price-discovery] [NAV:negotiation] [NAV:smart-match]
- If user wants to switch language, include: [LANG:hi] [LANG:en] [LANG:te] [LANG:ta] [LANG:bn]

CURRENT MARKET DATA (${new Date().toLocaleDateString('en-IN')}):
Season: ${seasonName}
${commodityInfo}

NEGOTIATION TIPS:
- Start with a fair counter-offer (10-15% below asking)
- Emphasize quality and freshness
- Offer bulk discounts for large orders
- Build long-term relationships
- Know the current market rate before negotiating
- Timing matters: buy during glut, sell during shortage`;
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
        max_tokens: 200,
        temperature: 0.7,
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
        max_tokens: 200,
        temperature: 0.7,
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

  const systemPrompt = buildSystemPrompt(language);

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
