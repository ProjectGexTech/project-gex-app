'use client';

import { useGextenStore } from '@/lib/store';
import { bookmakers } from '@/lib/dummyData';
import { Star } from 'lucide-react';

export default function PrimaryBookmakerSelector() {
  const { filters, updateFilters } = useGextenStore();
  
  const handleBookmakerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ primaryBookmaker: e.target.value });
  };
  
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Star className="w-4 h-4" />
        Primary Bookmaker
      </label>
      
      <select
        value={filters.primaryBookmaker}
        onChange={handleBookmakerChange}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
      >
        {bookmakers.map(bookmaker => (
          <option key={bookmaker} value={bookmaker}>
            {bookmaker}
          </option>
        ))}
      </select>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        This will be pre-selected when generating booking codes
      </p>
    </div>
  );
}
