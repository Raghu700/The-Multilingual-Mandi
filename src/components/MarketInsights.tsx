/**
 * MarketInsights Component
 * Displays AI-generated market insights and trends
 */

import { TrendingUp, AlertCircle, Calendar, Target } from 'lucide-react';
import { MarketInsight } from '../services/aiService';

interface MarketInsightsProps {
  insights: MarketInsight[];
  loading?: boolean;
}

export function MarketInsights({ insights, loading = false }: MarketInsightsProps) {
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-saffron" />
          <h3 className="text-lg font-semibold text-gray-800">Market Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-saffron" />
          <h3 className="text-lg font-semibold text-gray-800">Market Insights</h3>
        </div>
        <p className="text-gray-600">No insights available at the moment.</p>
      </div>
    );
  }

  const getInsightIcon = (type: MarketInsight['type']) => {
    switch (type) {
      case 'price_trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'demand_forecast':
        return <Target className="w-4 h-4" />;
      case 'seasonal_factor':
        return <Calendar className="w-4 h-4" />;
      case 'market_alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: MarketInsight['impact']) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-5 h-5 text-saffron" />
        <h3 className="text-lg font-semibold text-gray-800">Market Insights</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          AI-Powered
        </span>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {insight.timeframe}
                  </span>
                  <span className="capitalize">{insight.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <p className="text-xs text-gray-500 text-center">
          Insights generated using AI analysis of market trends and seasonal patterns
        </p>
      </div>
    </div>
  );
}