'use client';

import { useEffect } from 'react';
import { useGextenStore } from '@/lib/store';
import FilterPanel from '@/components/FilterPanel';
import MatchCard from '@/components/MatchCard';
import BookingCodeGenerator from '@/components/BookingCodeGenerator';
import { Trophy, TrendingUp, Zap, RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const { 
    filteredMatches, 
    initializeMatches, 
    refreshMatches,
    isLoading, 
    error,
    lastUpdated 
  } = useGextenStore();
  
  useEffect(() => {
    // Initial load
    initializeMatches();

    // Auto-refresh every 5 minutes (300000ms)
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing matches...');
      initializeMatches();
    }, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [initializeMatches]);

  const handleManualRefresh = () => {
    refreshMatches();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gexten</h1>
                <p className="text-sm text-gray-600">Live Soccer Odds (Dec 20-31, 2025)</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">{filteredMatches.length} Matches</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-700">Live Odds</span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
          {lastUpdated && !error && (
            <div className="mt-2 text-xs text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh every 5 minutes
            </div>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error loading matches</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
              {error.includes('API key') && (
                <p className="text-xs text-red-700 mt-1">
                  Please check your .env.local file and ensure NEXT_PUBLIC_ODDS_API_KEY is set correctly.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Filters & Matches */}
          <div className="lg:col-span-2 space-y-6">
            <FilterPanel />
            
            {/* Matches Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Available Matches ({filteredMatches.length})
              </h2>
              
              {isLoading && filteredMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <RefreshCw className="w-16 h-16 mx-auto text-blue-500 animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Loading matches...
                  </h3>
                  <p className="text-gray-500">
                    Fetching live odds from The Odds API
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Check browser console (F12) for detailed logs
                  </p>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Trophy className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No matches found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {error ? 'Unable to load matches. Please check your API configuration.' : 'No upcoming matches available in the selected leagues.'}
                  </p>
                  {!error && (
                    <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                      <p className="font-medium mb-2">💡 Why no matches?</p>
                      <ul className="text-left space-y-1 text-xs">
                        <li>• Many leagues on winter break (Dec 20-25)</li>
                        <li>• Premier League resumes Dec 26 (Boxing Day) 🎄</li>
                        <li>• Try refreshing after December 26th</li>
                        <li>• Check browser console (F12) for details</li>
                        <li>• Your API key is working - just no games scheduled yet!</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Bet Slip */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingCodeGenerator />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2025 Gexten. Powered by The Odds API.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className={`w-2 h-2 ${error ? 'bg-red-500' : 'bg-green-500'} rounded-full`}></div>
                {error ? 'Connection error' : 'All systems operational'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
