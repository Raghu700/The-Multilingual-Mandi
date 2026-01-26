/**
 * CommoditySelector Component
 * Displays dropdown/list of 18 commodities with multilingual names
 */

import { Language } from '../types';
import { Commodity, getCommodityName } from '../data/commodities';
import { t } from '../data/translations';

interface CommoditySelectorProps {
  commodities: Commodity[];
  selectedCommodity: Commodity | null;
  onCommoditySelect: (commodity: Commodity) => void;
  language: Language;
}

export function CommoditySelector({
  commodities,
  selectedCommodity,
  onCommoditySelect,
  language,
}: CommoditySelectorProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h3 className="text-xl font-bold text-navy-blue text-center lg:text-left">
        {t('price.selectCommodity', language)}
      </h3>

      {/* Commodity List - Grid on mobile, List on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
        {commodities.map((commodity) => {
          const isSelected = selectedCommodity?.id === commodity.id;
          const commodityName = getCommodityName(commodity, language);

          return (
            <button
              key={commodity.id}
              onClick={() => onCommoditySelect(commodity)}
              className={`
                glass-card p-4 transition-all duration-300
                hover:scale-105 hover:shadow-lg
                flex items-center gap-3
                text-left
                ${
                  isSelected
                    ? 'ring-2 ring-saffron bg-saffron/10'
                    : 'hover:bg-glass-white-light'
                }
              `}
            >
              <div className="text-3xl flex-shrink-0">{commodity.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-navy-blue truncate">
                  {commodityName}
                </div>
                <div className="text-xs text-gray-600">
                  {t('price.per', language)} {commodity.unit}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
