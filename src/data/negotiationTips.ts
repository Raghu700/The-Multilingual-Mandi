/**
 * Negotiation Tips Database
 * Hardcoded quick tips for negotiation fallback
 */

import { Language } from '../types';
import { t } from './translations';

export interface NegotiationTip {
  id: string;
  title: string;
  description: string;
}

/**
 * Get all negotiation tips in the specified language
 */
export function getAllTips(language: Language = 'en'): NegotiationTip[] {
  return [
    {
      id: 'counter-offer',
      title: t('tip.counterOffer.title', language),
      description: t('tip.counterOffer.desc', language),
    },
    {
      id: 'quality-emphasis',
      title: t('tip.quality.title', language),
      description: t('tip.quality.desc', language),
    },
    {
      id: 'bulk-discount',
      title: t('tip.bulk.title', language),
      description: t('tip.bulk.desc', language),
    },
    {
      id: 'market-rate',
      title: t('tip.market.title', language),
      description: t('tip.market.desc', language),
    },
    {
      id: 'relationship-building',
      title: t('tip.relationship.title', language),
      description: t('tip.relationship.desc', language),
    },
    {
      id: 'timing-advantage',
      title: t('tip.timing.title', language),
      description: t('tip.timing.desc', language),
    },
  ];
}

/**
 * Get tip by ID in the specified language
 */
export function getTipById(id: string, language: Language = 'en'): NegotiationTip | undefined {
  return getAllTips(language).find((tip) => tip.id === id);
}
