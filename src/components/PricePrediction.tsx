/**
 * PricePrediction Component
 * Displays AI-powered price predictions with confidence levels
 */

import { TrendingUp, TrendingDown, Brain, Clock, AlertTriangle } from 'lucide-react';
import { PricePrediction } from '../services/aiService';
import { formatCurrency } from '../services/priceService';

interface PricePredictionProps {
  prediction: PricePrediction;
  loading?: boolean;
}

export function PricePredictionComponent({ prediction, loading = false }: PricePredictionProps) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-saffron" />
          <h3 className="text-lg font-semibold text-gray-800">Price Prediction</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const isIncrease = prediction.priceChange > 0;
  const changeColor = isIncrease ? 'text-green-600' : prediction.priceChange < 0 ? 'text-red-600' : 'text-gray-600';
  const TrendIcon = isIncrease ? TrendingUp : TrendingDown;

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return { level: 'High', color: 'text-green-600 bg-green-50' };
    if (confidence >= 60) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', color: 'text-red-600 bg-red-50' };
  };

  const confidenceInfo = getConfidenceLevel(prediction.confidence);

  const getTimeframeLabel = (timeframe: string) => {
    switch (timeframe) {
      case '1day': return 'Next 24 Hours';
      case '1week': return 'Next Week';
      case '1month': return 'Next Month';
      default: return timeframe;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-5 h-5 text-saffron" />
        <h3 className="text-lg font-semibold text-gray-800">AI Price Prediction</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {getTimeframeLabel(prediction.timeframe)}
        </span>
      </div>

      {/* Current vs Predicted Price */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Price</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(prediction.currentPrice)}
          </p>
          <p className="text-xs text-gray-500">per {prediction.commodity.unit}</p>
        </div>
        <div className="text-center p-4 bg-white/20 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(prediction.predictedPrice)}
          </p>
          <div className={`flex items-center justify-center gap-1 text-sm ${changeColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span>
              {isIncrease ? '+' : ''}{prediction.priceChangePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Price Change Details */}
      <div className="mb-6 p-4 bg-white/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Expected Change</span>
          <span className={`text-lg font-bold ${changeColor}`}>
            {isIncrease ? '+' : ''}{formatCurrency(Math.abs(prediction.priceChange))}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Confidence Level</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${confidenceInfo.color}`}>
            {confidenceInfo.level} ({prediction.confidence}%)
          </span>
        </div>
      </div>

      {/* Prediction Factors */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Key Factors
        </h4>
        <div className="space-y-2">
          {prediction.factors.map((factor, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-saffron rounded-full flex-shrink-0"></div>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Warning */}
      {prediction.confidence < 70 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Low Confidence Warning</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            This prediction has lower confidence due to market volatility. Use as guidance only.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          Prediction generated using AI analysis of market trends and historical data
        </p>
      </div>
    </div>
  );
}