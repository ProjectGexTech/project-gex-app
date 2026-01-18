'use client';

import { useGextenStore } from '@/lib/store';
import { bookmakers, leagues } from '@/lib/dummyData';
import { SlidersHorizontal } from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';
import LeagueSelector from './LeagueSelector';
import MarketPicker from './MarketPicker';
import PrimaryBookmakerSelector from './PrimaryBookmakerSelector';

export default function FilterPanel() {
  const { filters, updateFilters } = useGextenStore();
  
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 mb-6 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <SlidersHorizontal className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Filters</h2>
      </div>
      
      {/* Date Range */}
      <DateRangeSelector />
      
      {/* League Selector */}
      <LeagueSelector />
      
      {/* Market Picker */}
      <MarketPicker />
      
      {/* Primary Bookmaker */}
      <PrimaryBookmakerSelector />
      
      {/* Odds Range */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Odds Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Min</label>
            <input
              type="number"
              min="1.01"
              max="5.00"
              step="0.01"
              value={filters.oddsMin}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 1.01 && value <= filters.oddsMax) {
                  updateFilters({ oddsMin: value });
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white mb-2"
            />
            <input
              type="range"
              min="1.01"
              max="5.00"
              step="0.1"
              value={filters.oddsMin}
              onChange={(e) => updateFilters({ oddsMin: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Max</label>
            <input
              type="number"
              min="1.01"
              max="10.00"
              step="0.01"
              value={filters.oddsMax}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= filters.oddsMin && value <= 10.00) {
                  updateFilters({ oddsMax: value });
                }
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white mb-2"
            />
            <input
              type="range"
              min="1.01"
              max="10.00"
              step="0.1"
              value={filters.oddsMax}
              onChange={(e) => updateFilters({ oddsMax: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Bookmakers */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bookmakers</label>
        <div className="flex flex-wrap gap-2">
          {bookmakers.map(bookmaker => (
            <button
              key={bookmaker}
              onClick={() => {
                const newBookmakers = filters.bookmakers.includes(bookmaker)
                  ? filters.bookmakers.filter(b => b !== bookmaker)
                  : [...filters.bookmakers, bookmaker];
                updateFilters({ bookmakers: newBookmakers });
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.bookmakers.includes(bookmaker)
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
              }`}
            >
              {bookmaker}
            </button>
          ))}
        </div>
      </div>
      
      {/* Leagues */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leagues</label>
        <div className="flex flex-wrap gap-2">
          {leagues.map(league => (
            <button
              key={league}
              onClick={() => {
                const newLeagues = filters.leagues.includes(league)
                  ? filters.leagues.filter(l => l !== league)
                  : [...filters.leagues, league];
                updateFilters({ leagues: newLeagues });
              }}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                filters.leagues.includes(league)
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
              }`}
            >
              {league}
            </button>
          ))}
        </div>
      </div>
      
      {/* Prediction Weights */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Form Weight: {filters.formWeight}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.formWeight}
            onChange={(e) => {
              const formWeight = parseInt(e.target.value);
              updateFilters({ formWeight, h2hWeight: 100 - formWeight });
            }}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            H2H Weight: {filters.h2hWeight}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.h2hWeight}
            onChange={(e) => {
              const h2hWeight = parseInt(e.target.value);
              updateFilters({ h2hWeight, formWeight: 100 - h2hWeight });
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
