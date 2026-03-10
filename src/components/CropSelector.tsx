/**
 * CropSelector Component
 * Requirements: 1.1-1.5, 15.5, 19.1-19.5
 * 
 * Displays 8 crop options in grid layout with icons and labels
 * Supports multilingual crop names and audio instructions
 */

import React from 'react';
import { CropType } from '../types/cropGrading';

interface CropSelectorProps {
  onSelectCrop: (crop: CropType) => void;
  selectedCrop?: CropType;
  language?: string;
}

const CROP_ICONS: Record<CropType, string> = {
  [CropType.WHEAT]: '🌾',
  [CropType.TOMATO]: '🍅',
  [CropType.ONION]: '🧅',
  [CropType.CHILLI]: '🌶️',
  [CropType.CARDAMOM]: '🌿',
  [CropType.POTATO]: '🥔',
  [CropType.RICE]: '🌾',
  [CropType.COTTON]: '☁️',
};

const CROP_LABELS: Record<CropType, Record<string, string>> = {
  [CropType.WHEAT]: {
    en: 'Wheat',
    hi: 'गेहूं',
    te: 'గోధుమ',
    ta: 'கோதுமை',
  },
  [CropType.TOMATO]: {
    en: 'Tomato',
    hi: 'टमाटर',
    te: 'టమాటా',
    ta: 'தக்காளி',
  },
  [CropType.ONION]: {
    en: 'Onion',
    hi: 'प्याज',
    te: 'ఉల్లిపాయ',
    ta: 'வெங்காயம்',
  },
  [CropType.CHILLI]: {
    en: 'Chilli',
    hi: 'मिर्च',
    te: 'మిరపకాయ',
    ta: 'மிளகாய்',
  },
  [CropType.CARDAMOM]: {
    en: 'Cardamom',
    hi: 'इलायची',
    te: 'ఏలకులు',
    ta: 'ஏலக்காய்',
  },
  [CropType.POTATO]: {
    en: 'Potato',
    hi: 'आलू',
    te: 'బంగాళాదుంప',
    ta: 'உருளைக்கிழங்கு',
  },
  [CropType.RICE]: {
    en: 'Rice',
    hi: 'चावल',
    te: 'బియ్యం',
    ta: 'அரிசி',
  },
  [CropType.COTTON]: {
    en: 'Cotton',
    hi: 'कपास',
    te: 'పత్తి',
    ta: 'பருத்தி',
  },
};

export const CropSelector: React.FC<CropSelectorProps> = ({
  onSelectCrop,
  selectedCrop,
  language = 'en',
}) => {
  const crops = Object.values(CropType);

  const getCropLabel = (crop: CropType): string => {
    return CROP_LABELS[crop][language] || CROP_LABELS[crop]['en'];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {language === 'hi' && 'फसल चुनें'}
        {language === 'te' && 'పంటను ఎంచుకోండి'}
        {language === 'ta' && 'பயிரைத் தேர்ந்தெடுக்கவும்'}
        {language === 'en' && 'Select Crop'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {crops.map((crop) => (
          <button
            key={crop}
            onClick={() => onSelectCrop(crop)}
            className={`
              flex flex-col items-center justify-center
              min-h-[120px] p-4 rounded-lg
              border-2 transition-all
              ${
                selectedCrop === crop
                  ? 'border-green-600 bg-green-50 shadow-lg'
                  : 'border-gray-300 bg-white hover:border-green-400 hover:shadow-md'
              }
            `}
            style={{ minWidth: '48px', minHeight: '48px' }}
            aria-label={getCropLabel(crop)}
          >
            <span className="text-5xl mb-2" role="img" aria-hidden="true">
              {CROP_ICONS[crop]}
            </span>
            <span className="text-base font-medium text-center text-gray-800">
              {getCropLabel(crop)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CropSelector;
