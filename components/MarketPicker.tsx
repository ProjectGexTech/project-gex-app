'use client';

import { useGextenStore } from '@/lib/store';
import { BarChart3, AlertCircle } from 'lucide-react';

const AVAILABLE_MARKETS = [
  { key: 'h2h', name: 'Match Winner (H2H)', available: true },
  { key: 'totals', name: 'Over/Under Goals', available: true },
  { key: 'btts', name: 'Both Teams To Score', available: false },
  { key: 'double_chance', name: 'Double Chance', available: false },
];

export default function MarketPicker() {
  const { filters, updateFilters } = useGextenStore();
  
  const handleMarketToggle = (marketKey: string) => {
    const newMarkets = filters.selectedMarkets.includes(marketKey)
      ? filters.selectedMarkets.filter(m => m !== marketKey)
      : [...filters.selectedMarkets, marketKey];
    
    // Ensure at least one market is selected
    if (newMarkets.length > 0) {
      updateFilters({ selectedMarkets: newMarkets });
    }
  };
  
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <BarChart3 className="w-4 h-4" />
        Markets
      </label>
      
      <div className="space-y-2">
        {AVAILABLE_MARKETS.map(market => (
          <div key={market.key}>
            <label
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                market.available
                  ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'cursor-not-allowed opacity-50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={filters.selectedMarkets.includes(market.key)}
                onChange={() => handleMarketToggle(market.key)}
                disabled={!market.available}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-900 dark:text-gray-100">
                  {market.name}
                </span>
                {!market.available && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Not available from API
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {filters.selectedMarkets.length} market{filters.selectedMarkets.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
}
