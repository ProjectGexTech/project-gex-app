'use client';

import { useGextenStore } from '@/lib/store';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function DateRangeSelector() {
  const { filters, updateFilters } = useGextenStore();
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        start: newDate,
      },
    });
  };
  
  const handleDaysChange = (days: number) => {
    updateFilters({
      dateRange: {
        ...filters.dateRange,
        days,
      },
    });
  };
  
  // Format date for input[type="date"]
  const dateString = format(filters.dateRange.start, 'yyyy-MM-dd');
  
  // Calculate end date for display
  const endDate = new Date(filters.dateRange.start);
  endDate.setDate(endDate.getDate() + filters.dateRange.days - 1);
  
  return (
    <div className="mb-4">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Calendar className="w-4 h-4" />
        Date Range
      </label>
      
      {/* Start Date Input */}
      <div className="mb-3">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Start Date
        </label>
        <input
          type="date"
          value={dateString}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
        />
      </div>
      
      {/* Days Selector */}
      <div className="mb-2">
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Window
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleDaysChange(1)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
              filters.dateRange.days === 1
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleDaysChange(3)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
              filters.dateRange.days === 3
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
            }`}
          >
            3 Days
          </button>
          <button
            onClick={() => handleDaysChange(7)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
              filters.dateRange.days === 7
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500'
            }`}
          >
            7 Days
          </button>
        </div>
      </div>
      
      {/* Date Range Display */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        Showing matches from <span className="font-medium text-gray-700 dark:text-gray-300">{format(filters.dateRange.start, 'MMM dd, yyyy')}</span>
        {filters.dateRange.days > 1 && (
          <> to <span className="font-medium text-gray-700 dark:text-gray-300">{format(endDate, 'MMM dd, yyyy')}</span></>
        )}
      </div>
    </div>
  );
}
