/**
 * CropGradingDemo Component
 * Demo page showcasing the AI Crop Quality Grading workflow
 */

import React, { useState } from 'react';
import { CropType, Photo, GradingResult, QualityGrade } from '../types/cropGrading';
import CropSelector from './CropSelector';
import PhotoCapture from './PhotoCapture';
import ResultsDisplay from './ResultsDisplay';
import { CropGradingService } from '../services/cropGradingService';

type Step = 'crop-selection' | 'photo-upload' | 'results';

export const CropGradingDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('crop-selection');
  const [selectedCrop, setSelectedCrop] = useState<CropType | undefined>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [language, setLanguage] = useState<string>('en');
  const [result, setResult] = useState<GradingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock grading result for demo
  const mockResult: GradingResult = {
    sessionId: 'demo-session-1',
    grade: QualityGrade.A,
    confidence: 92,
    attributes: {
      physical: {
        sizeUniformity: 88,
        shapeRegularity: 90,
        weightConsistency: 85,
        textureQuality: 92,
        firmnessLevel: 87,
        maturityLevel: 90,
      },
      visual: {
        colorConsistency: 95,
        colorIntensity: 90,
        glossLevel: 88,
        surfaceBlemishes: 2,
        discolorationPatterns: 5,
        bruisingIndicators: 3,
      },
      damage: {
        physicalDamage: 2,
        insectDamage: 1,
        diseaseSymptoms: 0,
        mechanicalDamage: 3,
        weatherDamage: 0,
        storageDamage: 1,
        totalDamagePercentage: 3,
      },
      freshness: {
        moistureContent: 92,
        wiltingIndicators: 5,
        stemLeafFreshness: 90,
        skinIntegrity: 95,
        estimatedShelfLife: 7,
        freshnessScore: 93,
      },
      contamination: {
        foreignMatter: 1,
        pestInfestation: 0,
        chemicalResidueIndicators: 2,
        moldFungalGrowth: 0,
        contaminationLevel: 1,
      },
      cropSpecific: {
        tomatoFirmness: 90,
        tomatoStemAttachment: 88,
        tomatoColorUniformity: 95,
      },
    },
    attributeScores: {
      physical: 88,
      visual: 92,
      damage: 97,
      freshness: 93,
      contamination: 99,
      cropSpecific: 91,
      overall: 92,
    },
    influentialCategories: ['visual', 'freshness', 'cropSpecific'],
    processingTime: 2500,
    timestamp: new Date(),
  };

  const handleCropSelect = (crop: CropType) => {
    setSelectedCrop(crop);
    setCurrentStep('photo-upload');
  };

  const handlePhotosChange = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
  };

  const handleAnalyze = async () => {
    if (!selectedCrop) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Call the backend API
      const sessionId = `session-${Date.now()}`;
      const gradingResult = await CropGradingService.gradeImages(
        photos,
        selectedCrop,
        sessionId
      );
      
      setResult(gradingResult);
      setCurrentStep('results');
    } catch (err) {
      console.error('Grading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to grade crop');
      
      // Fallback to mock result if API fails
      setResult(mockResult);
      setCurrentStep('results');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('crop-selection');
    setSelectedCrop(undefined);
    setPhotos([]);
    setResult(null);
    setError(null);
  };

  const canAnalyze = photos.length >= 2 && photos.length <= 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {language === 'hi' && 'एआई फसल गुणवत्ता ग्रेडिंग'}
            {language === 'te' && 'AI పంట నాణ్యత గ్రేడింగ్'}
            {language === 'ta' && 'AI பயிர் தர மதிப்பீடு'}
            {language === 'en' && 'AI Crop Quality Grading'}
          </h1>
          <p className="text-gray-600">
            {language === 'hi' && 'अपनी फसल की गुणवत्ता का आकलन करें'}
            {language === 'te' && 'మీ పంట నాణ్యతను అంచనా వేయండి'}
            {language === 'ta' && 'உங்கள் பயிர் தரத்தை மதிப்பிடுங்கள்'}
            {language === 'en' && 'Assess your crop quality'}
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {['en', 'hi', 'te', 'ta'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                language === lang
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lang === 'en' && 'English'}
              {lang === 'hi' && 'हिंदी'}
              {lang === 'te' && 'తెలుగు'}
              {lang === 'ta' && 'தமிழ்'}
            </button>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep === 'crop-selection' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            1
          </div>
          <div className="w-16 h-1 bg-gray-300" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep === 'photo-upload' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <div className="w-16 h-1 bg-gray-300" />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {currentStep === 'crop-selection' && (
            <CropSelector
              onSelectCrop={handleCropSelect}
              selectedCrop={selectedCrop}
              language={language}
            />
          )}

          {currentStep === 'photo-upload' && (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              <PhotoCapture
                onPhotosChange={handlePhotosChange}
                photos={photos}
                language={language}
              />
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  {language === 'hi' && 'वापस'}
                  {language === 'te' && 'వెనుకకు'}
                  {language === 'ta' && 'பின்செல்'}
                  {language === 'en' && 'Back'}
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || isProcessing}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    canAnalyze && !isProcessing
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      {language === 'hi' && 'विश्लेषण हो रहा है...'}
                      {language === 'te' && 'విశ్లేషిస్తోంది...'}
                      {language === 'ta' && 'பகுப்பாய்வு செய்கிறது...'}
                      {language === 'en' && 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      {language === 'hi' && 'विश्लेषण करें'}
                      {language === 'te' && 'విశ్లేషించండి'}
                      {language === 'ta' && 'பகுப்பாய்வு செய்'}
                      {language === 'en' && 'Analyze'}
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {currentStep === 'results' && result && (
            <>
              {result.warning && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">
                        {language === 'hi' && 'चेतावनी'}
                        {language === 'te' && 'హెచ్చరిక'}
                        {language === 'ta' && 'எச்சரிக்கை'}
                        {language === 'en' && 'Warning'}
                      </h3>
                      <p className="text-yellow-800">{result.warning}</p>
                    </div>
                  </div>
                </div>
              )}
              <ResultsDisplay result={result} language={language} />
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {language === 'hi' && 'नया विश्लेषण शुरू करें'}
                  {language === 'te' && 'కొత్త విశ్లేషణ ప్రారంభించండి'}
                  {language === 'ta' && 'புதிய பகுப்பாய்வு தொடங்கு'}
                  {language === 'en' && 'Start New Analysis'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropGradingDemo;
