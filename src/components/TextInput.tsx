/**
 * TextInput Component
 * Textarea for entering text to be translated
 */

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function TextInput({ value, onChange, placeholder, error }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="translation-input" className="block text-sm font-semibold text-navy-blue">
        Enter text to translate
      </label>
      <textarea
        id="translation-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Type your message here...'}
        rows={5}
        className={`
          w-full glass-input resize-none
          focus:ring-2 focus:ring-saffron focus:border-saffron
          transition-all duration-300
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
      />
      {error && (
        <p className="text-red-500 text-sm font-medium flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
