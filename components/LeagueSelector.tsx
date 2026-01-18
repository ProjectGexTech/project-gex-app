'use client';

import { useGextenStore } from '@/lib/store';
import { LEAGUE_KEYS } from '@/lib/oddsAPI';
import { Trophy } from 'lucide-react';

const AVAILABLE_LEAGUES = [
  { key: 'soccer_epl', name: 'Premier League' },
  { key: 'soccer_spain_la_liga', name: 'La Liga' },
  { key: 'soccer_germany_bundesliga', name: 'Bundesliga' },
  { key: 'soccer_italy_serie_a', name: 'Serie A' },
  { key: 'soccer_france_ligue_one', name: 'Ligue 1' },
  { key: 'soccer_uefa_champs_league', name: 'Champions League' },
  { key: 'soccer_uefa_europa_league', name: 'Europa League' },
  { key: 'soccer_efl_champ', name: 'Championship' },
];

export default function LeagueSelector() {
  const { filters, updateFilters } = useGextenStore();
  
  const handleLeagueToggle = (leagueName: string) => {
    const newLeagues = filters.leagues.includes(leagueName)
      ? filters.leagues.filter(l => l !== leagueName)
      : [...filters.leagues, leagueName];
    updateFilters({ leagues: newLeagues });
  };
  
  const selectAll = () => {
    updateFilters({ leagues: AVAILABLE_LEAGUES.map(l => l.name) });
  };
  
  const clearAll = () => {
    updateFilters({ leagues: [] });
  };
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <Trophy className="w-4 h-4" />
          Leagues
        </label>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
          >
            All
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_LEAGUES.map(league => (
          <button
            key={league.key}
            onClick={() => handleLeagueToggle(league.name)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              filters.leagues.includes(league.name) || filters.leagues.length === 0
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
            }`}
          >
            {league.name}
          </button>
        ))}
      </div>
      
      {filters.leagues.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Showing all leagues
        </p>
      )}
    </div>
  );
}
