/**
 * ResultsDisplay Component
 * Requirements: 9.1-9.30, 23.8-23.9
 * 
 * Displays quality grade, confidence score, and detailed attribute analysis
 * Organized by 6 categories with expandable sections
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GradingResult, QualityGrade } from '../types/cropGrading';

interface ResultsDisplayProps {
  result: GradingResult;
  language?: string;
}

const GRADE_COLORS: Record<QualityGrade, { bg: string; text: string; border: string }> = {
  [QualityGrade.A]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
  [QualityGrade.B]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
  [QualityGrade.C]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
};

const GRADE_LABELS = {
  [QualityGrade.A]: {
    en: 'Premium Quality',
    hi: 'उच्च गुणवत्ता',
    te: 'ప్రీమియం నాణ్యత',
    ta: 'உயர்தர தரம்',
  },
  [QualityGrade.B]: {
    en: 'Good Quality',
    hi: 'अच्छी गुणवत्ता',
    te: 'మంచి నాణ్యత',
    ta: 'நல்ல தரம்',
  },
  [QualityGrade.C]: {
    en: 'Fair Quality',
    hi: 'सामान्य गुणवत्ता',
    te: 'సాధారణ నాణ్యత',
    ta: 'சராசரி தரம்',
  },
};

const CATEGORY_LABELS = {
  physical: {
    en: 'Physical Attributes',
    hi: 'भौतिक गुण',
    te: 'భౌతిక లక్షణాలు',
    ta: 'உடல் பண்புகள்',
  },
  visual: {
    en: 'Visual Quality',
    hi: 'दृश्य गुणवत्ता',
    te: 'దృశ్య నాణ్యత',
    ta: 'காட்சி தரம்',
  },
  damage: {
    en: 'Damage Assessment',
    hi: 'क्षति मूल्यांकन',
    te: 'నష్టం అంచనా',
    ta: 'சேத மதிப்பீடு',
  },
  freshness: {
    en: 'Freshness Indicators',
    hi: 'ताजगी संकेतक',
    te: 'తాజాదనం సూచికలు',
    ta: 'புதுமை குறிகாட்டிகள்',
  },
  contamination: {
    en: 'Contamination Detection',
    hi: 'संदूषण पहचान',
    te: 'కలుషిత గుర్తింపు',
    ta: 'மாசுபாடு கண்டறிதல்',
  },
  cropSpecific: {
    en: 'Crop-Specific Attributes',
    hi: 'फसल-विशिष्ट गुण',
    te: 'పంట-నిర్దిష్ట లక్షణాలు',
    ta: 'பயிர்-குறிப்பிட்ட பண்புகள்',
  },
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  language = 'en',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const gradeColor = GRADE_COLORS[result.grade];
  const gradeLabel = GRADE_LABELS[result.grade][language as keyof typeof GRADE_LABELS[QualityGrade.A]] || GRADE_LABELS[result.grade].en;

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const categories = [
    { key: 'physical', score: result.attributeScores.physical },
    { key: 'visual', score: result.attributeScores.visual },
    { key: 'damage', score: result.attributeScores.damage },
    { key: 'freshness', score: result.attributeScores.freshness },
    { key: 'contamination', score: result.attributeScores.contamination },
    { key: 'cropSpecific', score: result.attributeScores.cropSpecific },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Grade Display */}
      <div className={`${gradeColor.bg} ${gradeColor.border} border-4 rounded-lg p-6 mb-6 text-center`}>
        <h2 className="text-sm font-medium text-gray-600 mb-2">
          {language === 'hi' && 'फसल गुणवत्ता ग्रेड'}
          {language === 'te' && 'పంట నాణ్యత గ్రేడ్'}
          {language === 'ta' && 'பயிர் தர தரம்'}
          {language === 'en' && 'Crop Quality Grade'}
        </h2>
        <div className={`text-6xl font-bold ${gradeColor.text} mb-2`}>
          {language === 'hi' && 'ग्रेड'} {result.grade}
        </div>
        <div className={`text-xl ${gradeColor.text} font-medium`}>
          {gradeLabel}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">
            {language === 'hi' && 'विश्वास स्कोर'}
            {language === 'te' && 'విశ్వాస స్కోరు'}
            {language === 'ta' && 'நம்பிக்கை மதிப்பெண்'}
            {language === 'en' && 'Confidence Score'}
          </span>
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(result.confidence)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-gray-700">
            {language === 'hi' && 'समग्र स्कोर'}
            {language === 'te' && 'మొత్తం స్కోరు'}
            {language === 'ta' && 'ஒட்டுமொத்த மதிப்பெண்'}
            {language === 'en' && 'Overall Score'}
          </span>
          <span className={`text-2xl font-bold ${getScoreColor(result.attributeScores.overall)}`}>
            {Math.round(result.attributeScores.overall)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getScoreBarColor(result.attributeScores.overall)} h-3 rounded-full transition-all`}
            style={{ width: `${result.attributeScores.overall}%` }}
          />
        </div>
      </div>

      {/* Attribute Categories */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {language === 'hi' && 'विस्तृत विश्लेषण'}
          {language === 'te' && 'వివరణాత్మక విశ్లేషణ'}
          {language === 'ta' && 'விரிவான பகுப்பாய்வு'}
          {language === 'en' && 'Detailed Analysis'}
        </h3>

        {categories.map(({ key, score }) => {
          const isExpanded = expandedCategories.has(key);
          const isInfluential = result.influentialCategories.includes(key);
          const categoryLabel = CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS][language as 'en' | 'hi' | 'te' | 'ta'] || 
                               CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS].en;

          return (
            <div
              key={key}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${
                isInfluential ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => toggleCategory(key)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-medium text-gray-800">{categoryLabel}</span>
                  {isInfluential && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {language === 'hi' && 'प्रभावशाली'}
                      {language === 'te' && 'ప్రభావశీలమైన'}
                      {language === 'ta' && 'செல்வாக்கு'}
                      {language === 'en' && 'Influential'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}
                  </span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`${getScoreBarColor(score)} h-2 rounded-full transition-all`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'hi' && 'विस्तृत विशेषताएं यहां प्रदर्शित की जाएंगी'}
                    {language === 'te' && 'వివరణాత్మక లక్షణాలు ఇక్కడ ప్రదర్శించబడతాయి'}
                    {language === 'ta' && 'விரிவான பண்புகள் இங்கே காட்டப்படும்'}
                    {language === 'en' && 'Detailed attributes will be displayed here'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsDisplay;
