/**
 * TranslationOutput Component
 * Displays translated text with copy-to-clipboard functionality
 */

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../services/translationService';

interface TranslationOutputProps {
  translatedText: string;
  targetLanguage: string;
}

export function TranslationOutput({ translatedText, targetLanguage }: TranslationOutputProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(translatedText);
    
    if (success) {
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  if (!translatedText) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-navy-blue">
          Translation
        </label>
        <span className="text-xs text-gray-500 font-medium">
          Target: {targetLanguage}
        </span>
      </div>

      <div className="glass-card-green p-4 relative">
        <p className="text-lg text-gray-800 leading-relaxed min-h-[80px] whitespace-pre-wrap">
          {translatedText}
        </p>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`
            absolute top-3 right-3 p-2 rounded-lg
            transition-all duration-300
            ${
              copied
                ? 'bg-green text-white'
                : copyError
                ? 'bg-red-500 text-white'
                : 'glass-button hover:bg-glass-white-light'
            }
          `}
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Copy Confirmation Message */}
      {copied && (
        <div className="glass-badge-green text-green font-medium px-3 py-2 text-sm animate-fadeIn flex items-center gap-2">
          <Check className="w-4 h-4" />
          Copied to clipboard!
        </div>
      )}

      {/* Copy Error Message */}
      {copyError && (
        <div className="bg-red-100 text-red-700 font-medium px-3 py-2 rounded-lg text-sm animate-fadeIn flex items-center gap-2">
          <span>⚠️</span>
          Failed to copy. Please try again.
        </div>
      )}
    </div>
  );
}
