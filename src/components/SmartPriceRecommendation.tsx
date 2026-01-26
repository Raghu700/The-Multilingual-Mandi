/**
 * SmartPriceRecommendation Component
 * Displays AI-powered pricing recommendations
 */

import { Lightbulb, Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { SmartPriceRecommendation } from '../services/aiService';
import { formatCurrency } from '../services/priceService';

interface SmartPriceRecommendationProps {
  recommendation: SmartPriceRecommendation;
  currentPrice?: number;
  loading?: boolean;
}

export function SmartPriceRecommendationComponent({ 
  recommendation, 
  currentPrice,
  loading = false 
}: SmartPriceRecommendationProps) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-saffron" />
          <h3 className="text-lg font-semibold text-gray-800">Smart Pricing</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const getMarketPositionColor = (position: string) => {
    switch (position) {
      case 'premium':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'competitive':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'budget':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const priceDifference = currentPrice ? recommendation.recommendedPrice - currentPrice : 0;
  const priceDifferencePercent = currentPrice ? (priceDifference / currentPrice) * 100 : 0;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-5 h-5 text-saffron" />
        <h3 className="text-lg font-semibold text-gray-800">Smart Pricing Recommendation</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          AI-Optimized
        </span>
      </div>

      {/* Recommended Price */}
      <div className="text-center mb-6 p-6 bg-gradient-to-r from-saffron/10 to-green/10 rounded-lg border border-saffron/20">
        <p className="text-sm text-gray-600 mb-2">Recommended Price</p>
        <p className="text-3xl font-bold text-gray-800 mb-2">
          {formatCurrency(recommendation.recommendedPrice)}
        </p>
        {currentPrice && (
          <div className="flex items-center justify-center gap-2 text-sm">
            {priceDifference > 0 ? (
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{priceDifferencePercent.toFixed(1)}% from current
              </span>
            ) : priceDifference < 0 ? (
              <span className="text-red-600 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 rotate-180" />
                {priceDifferencePercent.toFixed(1)}% from current
              </span>
            ) : (
              <span className="text-gray-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Matches current price
              </span>
            )}
          </div>
        )}
      </div>

      {/* Market Analysis */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-white/20 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Market Position</p>
          <span className={`text-sm font-medium px-2 py-1 rounded border ${getMarketPositionColor(recommendation.marketPosition)}`}>
            {recommendation.marketPosition}
          </span>
        </div>
        <div className="text-center p-3 bg-white/20 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Expected Demand</p>
          <span className={`text-sm font-medium ${getDemandColor(recommendation.expectedDemand)}`}>
            {recommendation.expectedDemand}
          </span>
        </div>
        <div className="text-center p-3 bg-white/20 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Risk Level</p>
          <span className={`text-sm font-medium px-2 py-1 rounded ${getRiskColor(recommendation.riskLevel)}`}>
            {recommendation.riskLevel}
          </span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Pricing Strategy
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed bg-white/20 p-4 rounded-lg">
          {recommendation.reasoning}
        </p>
      </div>

      {/* Risk Assessment */}
      {recommendation.riskLevel === 'high' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">High Risk Alert</span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            Market conditions suggest higher pricing risk. Consider more conservative approach.
          </p>
        </div>
      )}

      {/* Success Indicators */}
      {recommendation.expectedDemand === 'high' && recommendation.riskLevel === 'low' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Optimal Conditions</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            High demand and low risk create favorable conditions for this pricing strategy.
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-gray-500 text-center">
          Recommendation based on market analysis, demand patterns, and competitive positioning
        </p>
      </div>
    </div>
  );
}