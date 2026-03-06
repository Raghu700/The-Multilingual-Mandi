/**
 * VoiceAssistant Component
 * Floating voice assistant with microphone button and chat panel
 * Supports multilingual speech recognition and synthesis
 */

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Trash2, Volume2, MessageCircle, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceAssistant, VoiceMessage } from '../hooks/useVoiceAssistant';
import { Language } from '../types';

interface VoiceAssistantProps {
  onNavigate?: (tab: string) => void;
}

const LANG_FLAG_LABELS: Record<Language, { short: string; native: string }> = {
  en: { short: 'EN', native: 'English' },
  hi: { short: 'हि', native: 'हिन्दी' },
  te: { short: 'తె', native: 'తెలుగు' },
  ta: { short: 'த', native: 'தமிழ்' },
  bn: { short: 'বা', native: 'বাংলা' },
};

const PANEL_TITLE: Record<Language, string> = {
  en: 'Voice Assistant',
  hi: 'वॉइस असिस्टेंट',
  te: 'వాయిస్ అసిస్టెంట్',
  ta: 'குரல் உதவியாளர்',
  bn: 'ভয়েস অ্যাসিস্ট্যান্ট',
};

const LISTENING_LABEL: Record<Language, string> = {
  en: 'Listening...',
  hi: 'सुन रहा हूँ...',
  te: 'వింటున్నాను...',
  ta: 'கேட்கிறேன்...',
  bn: 'শুনছি...',
};

const TAP_TO_SPEAK: Record<Language, string> = {
  en: 'Tap mic to speak',
  hi: 'बोलने के लिए माइक दबाएं',
  te: 'మాట్లాడటానికి మైక్ నొక్కండి',
  ta: 'பேச மைக் அழுத்தவும்',
  bn: 'কথা বলতে মাইক চাপুন',
};

const NOT_SUPPORTED: Record<Language, string> = {
  en: 'Voice not supported in this browser. Please use Chrome or Edge.',
  hi: 'इस ब्राउज़र में वॉइस सपोर्ट नहीं है। Chrome या Edge इस्तेमाल करें।',
  te: 'ఈ బ్రౌజర్‌లో వాయిస్ మద్దతు లేదు. Chrome లేదా Edge వాడండి.',
  ta: 'இந்த உலாவியில் குரல் ஆதரவு இல்லை. Chrome அல்லது Edge பயன்படுத்தவும்.',
  bn: 'এই ব্রাউজারে ভয়েস সাপোর্ট নেই। Chrome বা Edge ব্যবহার করুন।',
};

export function VoiceAssistant({ onNavigate }: VoiceAssistantProps) {
  const { appLanguage, setAppLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (lang: Language) => {
    setAppLanguage(lang);
  };

  const {
    status,
    messages,
    isSupported,
    errorMessage,
    voiceLang,
    startListening,
    stopListening,
    greet,
    clearMessages,
    switchVoiceLanguage,
  } = useVoiceAssistant({ language: appLanguage, onNavigate, onLanguageChange: handleLanguageChange });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Greet when panel opens for first time
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      // Small delay so panel renders first
      const timer = setTimeout(() => greet(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasGreeted, greet]);

  // Reset greeting state when language changes
  useEffect(() => {
    setHasGreeted(false);
  }, [appLanguage]);

  const handleTogglePanel = () => {
    if (isOpen) {
      stopListening();
    }
    setIsOpen(!isOpen);
  };

  const handleMicClick = () => {
    if (status === 'listening') {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleClear = () => {
    clearMessages();
    setHasGreeted(false);
  };

  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isProcessing = status === 'processing';

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleTogglePanel}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-slate-700 hover:bg-slate-800 text-white scale-90'
            : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white voice-fab-pulse'
        }`}
        title={isOpen ? 'Close assistant' : 'Voice Assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 voice-panel-enter">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-emerald-500 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ${isSpeaking ? 'voice-speaking-ring' : ''}`}>
                    <Volume2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm leading-tight">
                      {PANEL_TITLE[voiceLang]}
                    </h3>
                    <span className="text-white/80 text-[10px]">
                      {isListening
                        ? `${LISTENING_LABEL[voiceLang]} (${LANG_FLAG_LABELS[voiceLang].native})`
                        : isSpeaking
                          ? '🔊'
                          : isProcessing
                            ? '...'
                            : LANG_FLAG_LABELS[voiceLang].native}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    className={`p-1.5 rounded-lg transition-colors ${showLangPicker ? 'bg-white/30' : 'hover:bg-white/20'}`}
                    title="Switch language"
                  >
                    <Languages className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4 text-white/80" />
                  </button>
                </div>
              </div>

              {/* Language Quick-Switch Bar */}
              {showLangPicker && (
                <div className="flex gap-1 mt-2 pt-2 border-t border-white/20">
                  {(['en', 'hi', 'te', 'ta', 'bn'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        switchVoiceLanguage(lang);
                        setShowLangPicker(false);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        voiceLang === lang
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                      title={LANG_FLAG_LABELS[lang].native}
                    >
                      <span className="block text-xs">{LANG_FLAG_LABELS[lang].short}</span>
                      <span className="block opacity-80 leading-tight">{LANG_FLAG_LABELS[lang].native}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50" style={{ minHeight: '200px', maxHeight: '50vh' }}>
              {!isSupported && (
                <div className="text-center py-4 px-3">
                  <MicOff className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">{NOT_SUPPORTED[appLanguage]}</p>
                </div>
              )}

              {isSupported && messages.length === 0 && (
                <div className="text-center py-8 px-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-6 h-6 text-orange-500" />
                  </div>
                  <p className="text-sm text-slate-500">{TAP_TO_SPEAK[voiceLang]}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    🌐 {LANG_FLAG_LABELS[voiceLang].native}
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {isListening && (
                <div className="flex justify-center py-2">
                  <div className="voice-listening-dots flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span className="w-2 h-2 rounded-full bg-orange-300"></span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600">
                  {errorMessage}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Mic Button Footer */}
            {isSupported && (
              <div className="p-3 bg-white border-t border-slate-100">
                <div className="flex items-center justify-center gap-3">
                  {/* Language badge */}
                  <button
                    onClick={() => setShowLangPicker(!showLangPicker)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-[10px] font-bold text-slate-600"
                    title="Switch voice language"
                  >
                    🌐 {LANG_FLAG_LABELS[voiceLang].short}
                  </button>

                  {/* Mic button */}
                  <button
                    onClick={handleMicClick}
                    disabled={isSpeaking || isProcessing}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 voice-mic-listening'
                        : isSpeaking || isProcessing
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-200 hover:scale-105'
                    }`}
                    title={isListening ? 'Stop' : `Speak (${LANG_FLAG_LABELS[voiceLang].native})`}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>

                  {/* Current language label */}
                  <span className="text-[10px] text-slate-400 font-medium w-10 text-center">
                    {LANG_FLAG_LABELS[voiceLang].native}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// --- Message Bubble ---
function MessageBubble({ message }: { message: VoiceMessage }) {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md shadow-sm'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
