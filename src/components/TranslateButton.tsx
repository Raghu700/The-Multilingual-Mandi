/**
 * TranslateButton Component
 * Button to trigger translation with saffron styling
 */

import { Languages } from 'lucide-react';

interface TranslateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function TranslateButton({ onClick, disabled, loading }: TranslateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full sm:w-auto px-8 py-3 rounded-lg font-semibold
        flex items-center justify-center gap-2
        transition-all duration-300
        ${
          disabled || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-saffron text-white hover:bg-saffron-light hover:shadow-lg hover:scale-105'
        }
      `}
    >
      <Languages className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Translating...' : 'Translate'}
    </button>
  );
}
