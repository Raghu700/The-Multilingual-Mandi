/**
 * StrategyList Component
 * Displays AI-generated negotiation strategies with action points
 */

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { NegotiationStrategy } from '../services/negotiationService';
import { copyToClipboard } from '../utils/clipboard';

interface StrategyListProps {
  strategies: NegotiationStrategy[];
}

export function StrategyList({ strategies }: StrategyListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (strategy: NegotiationStrategy) => {
    const text = `${strategy.title}\n\n${strategy.description}\n\nAction Points:\n${strategy.actionPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}`;
    
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(strategy.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (strategies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-navy-blue mb-2">
          🤖 AI-Generated Strategies
        </h3>
        <p className="text-sm text-gray-600">
          {strategies.length} personalized negotiation strategies for your situation
        </p>
      </div>

      {/* Strategies */}
      <div className="space-y-4">
        {strategies.map((strategy, index) => (
          <div key={strategy.id} className="glass-card p-6 space-y-4">
            {/* Strategy Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="text-lg font-bold text-navy-blue">
                    {strategy.title}
                  </h4>
                </div>
                <p className="text-gray-700">{strategy.description}</p>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy(strategy)}
                className="glass-button p-3 rounded-lg hover:bg-glass-white-light transition-all"
                title="Copy strategy"
              >
                {copiedId === strategy.id ? (
                  <Check className="w-5 h-5 text-green" />
                ) : (
                  <Copy className="w-5 h-5 text-navy-blue" />
                )}
              </button>
            </div>

            {/* Action Points */}
            <div className="glass-card-light p-4 space-y-2">
              <h5 className="text-sm font-bold text-navy-blue mb-3">
                Action Points:
              </h5>
              <ul className="space-y-2">
                {strategy.actionPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
