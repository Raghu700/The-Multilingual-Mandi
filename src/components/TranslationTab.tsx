/**
 * TranslationTab Component
 * Main container for the Translation Module
 * Integrates all translation components with state management
 */

import { useState, useEffect } from 'react';
import { Language, MandiPhrase } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { TextInput } from './TextInput';
import { TranslateButton } from './TranslateButton';
import { TranslationOutput } from './TranslationOutput';
import { PhraseLibrary } from './PhraseLibrary';
import { TranslationHistory } from './TranslationHistory';
import { translate, saveToHistory, getHistory } from '../services/translationService';

export function TranslationTab() {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('hi');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory());

  // Load history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle translation
  const handleTranslate = async () => {
    // Validate input
    const trimmedInput = inputText.trim();
    if (!trimmedInput) {
      setError('Please enter text to translate');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Perform translation
      const result = await translate(trimmedInput, selectedLanguage);
      setTranslatedText(result);

      // Save to history
      const entry = saveToHistory({
        sourceText: trimmedInput,
        sourceLang: 'en',
        targetLang: selectedLanguage,
        translatedText: result,
      });

      // Update history state
      setHistory([entry, ...history]);
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle phrase selection
  const handlePhraseSelect = async (phrase: MandiPhrase) => {
    setInputText(phrase.en);
    setError('');
    setLoading(true);

    try {
      const result = phrase[selectedLanguage];
      setTranslatedText(result);

      // Save to history
      const entry = saveToHistory({
        sourceText: phrase.en,
        sourceLang: 'en',
        targetLang: selectedLanguage,
        translatedText: result,
      });

      // Update history state
      setHistory([entry, ...history]);
    } catch (err) {
      setError('Failed to load phrase. Please try again.');
      console.error('Phrase selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    // Clear translation when language changes
    setTranslatedText('');
  };

  // Handle Enter key in textarea (Ctrl+Enter to translate)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleTranslate();
    }
  };

  return (
    <div className="space-y-8">
      {/* Language Selector */}
      <LanguageSelector
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
      />

      {/* Translation Input/Output Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div onKeyDown={handleKeyDown}>
            <TextInput
              value={inputText}
              onChange={setInputText}
              placeholder="Type your message here... (Ctrl+Enter to translate)"
              error={error}
            />
          </div>
          <TranslateButton
            onClick={handleTranslate}
            disabled={!inputText.trim()}
            loading={loading}
          />
        </div>

        {/* Output Section */}
        <div>
          <TranslationOutput
            translatedText={translatedText}
            targetLanguage={selectedLanguage}
          />
        </div>
      </div>

      {/* Phrase Library */}
      <div className="glass-card p-6">
        <PhraseLibrary
          selectedLanguage={selectedLanguage}
          onPhraseSelect={handlePhraseSelect}
        />
      </div>

      {/* Translation History */}
      <div className="glass-card p-6">
        <TranslationHistory history={history} />
      </div>
    </div>
  );
}
