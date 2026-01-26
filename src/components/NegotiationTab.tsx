/**
 * NegotiationTab Component - Minimal Header
 */

import { NegotiationRoom } from './NegotiationRoom';
import { useLanguage } from '../contexts/LanguageContext';
import { Scale, Sparkles } from 'lucide-react';

export function NegotiationTab() {
  const { appLanguage } = useLanguage();

  const titles: Record<string, { main: string; sub: string }> = {
    en: { main: 'Live Trading', sub: 'Negotiate with AI' },
    hi: { main: 'लाइव ट्रेडिंग', sub: 'AI के साथ बातचीत' },
    te: { main: 'లైవ్ ట్రేడింగ్', sub: 'AI తో చర్చ' },
    ta: { main: 'நேரடி வர்த்தகம்', sub: 'AI உடன் பேச்சு' },
    bn: { main: 'লাইভ ট্রেডিং', sub: 'AI এর সাথে আলোচনা' }
  };

  const lang = titles[appLanguage] || titles.en;

  return (
    <div>
      {/* Minimal Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <Scale className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-slate-800">{lang.main}</h2>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-sm text-slate-500">{lang.sub}</p>
      </div>

      <NegotiationRoom />
    </div>
  );
}
