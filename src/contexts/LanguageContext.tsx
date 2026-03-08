/**
 * Language Context
 * Provides global language state management for the entire application
 * Supports persistence and translation integration
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language } from '../types';
import { translationService } from '../services/translationService';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  appLanguage: Language; // Backward compatibility
  setAppLanguage: (language: Language) => void; // Backward compatibility
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'ektamandi_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  console.log('LanguageProvider: Initializing');
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    console.log('LanguageProvider: Loaded language from storage:', stored);
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    // Set document language attribute
    console.log('LanguageProvider: Setting document language to', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    return translationService.getTranslation(key, language, params);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t,
      appLanguage: language, // Backward compatibility
      setAppLanguage: setLanguage // Backward compatibility
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
