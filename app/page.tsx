'use client';

import { useState, useEffect } from 'react';
import { useGextenStore } from '@/lib/store';
import { useAPIKeysStore } from '@/lib/apiKeysStore';
import MatchCard from '@/components/MatchCard';
import BookingCodeGenerator from '@/components/BookingCodeGenerator';
import APIKeysModal from '@/components/APIKeysModal';
import { RefreshCw, AlertCircle, Filter, TrendingUp, Clock, Shield, CheckCircle2, XCircle, Settings } from 'lucide-react';

export default function Home() {
  const { 
    filteredMatches, 
    initializeMatches,
    isLoading, 
    error,
    lastUpdated,
    filters,
    updateFilters,
  } = useGextenStore();
  
  const { isConfigured, loadApiKeysFromStorage, clearApiKeys } = useAPIKeysStore();

  const [dataFetched, setDataFetched] = useState(false);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<number>(7);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  // Load API keys on mount
  useEffect(() => {
    loadApiKeysFromStorage();
  }, [loadApiKeysFromStorage]);
  
  // Available options
  const availableLeagues = [
    'Premier League',
    'La Liga',
    'Bundesliga',
    'Serie A',
    'Ligue 1',
    'UEFA Champions League',
  ];
  
  const dateRangeOptions = [
    { label: 'Today', days: 1 },
    { label: 'Next 3 Days', days: 3 },
    { label: 'Next 7 Days', days: 7 },
    { label: 'Next 14 Days', days: 14 },
  ];
  
  const marketOptions = [
    { id: 'h2h', label: 'Match Winner (1X2)', icon: '🏆' },
    { id: 'totals', label: 'Over/Under 2.5', icon: '⚽' },
  ];

  // Check if all required filters are selected
  const canFetchData = selectedLeagues.length > 0 && selectedMarkets.length > 0;

  const handleFetchData = async () => {
    // Update filters in store
    updateFilters({
      leagues: selectedLeagues,
      selectedMarkets: selectedMarkets,
      dateRange: {
        start: new Date(),
        days: selectedDateRange,
      },
    });
    
    // Fetch data
    await initializeMatches();
    setDataFetched(true);
  };

  const handleReset = () => {
    setSelectedLeagues([]);
    setSelectedMarkets([]);
    setSelectedDateRange(7);
    setDataFetched(false);
  };

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev => 
      prev.includes(league) 
        ? prev.filter(l => l !== league)
        : [...prev, league]
    );
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(m => m !== marketId)
        : [...prev, marketId]
    );
  };
  
  const handleReconfigureKeys = () => {
    clearApiKeys();
    setDataFetched(false);
    setShowSettingsMenu(false);
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* API Keys Configuration Modal */}
      <APIKeysModal />
      
      {/* Overlay when API keys not configured */}
      {!isConfigured && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}
      
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gexten</h1>
                <p className="text-xs text-slate-500">Professional Odds Platform</p>
              </div>
            </div>

            {/* Right Side - Account Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <p className="text-slate-500 text-xs">Account Balance</p>
                  <p className="font-semibold text-slate-900">$1,250.00</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Settings className="w-5 h-5 text-slate-600" />
                </button>
                {showSettingsMenu && (
                  <div className="absolute right-0 top-12 bg-white border-2 border-slate-200 rounded-xl shadow-xl w-56 overflow-hidden z-50">
                    <button
                      onClick={handleReconfigureKeys}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm text-slate-700"
                    >
                      <Settings className="w-4 h-4" />
                      Reconfigure API Keys
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-[1400px] mx-auto px-8 py-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-900">Error loading matches</p>
              <p className="text-xs text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SECTION - FILTERS (Wider) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter Selection Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Filter Settings</h2>
                    <p className="text-sm text-slate-500">Select your preferences before fetching odds</p>
                  </div>
                </div>
                {dataFetched && (
                  <button
                    onClick={handleReset}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>

              {/* Step 1: League Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedLeagues.length > 0 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    1
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Select Leagues</h3>
                  {selectedLeagues.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      ({selectedLeagues.length} selected)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {availableLeagues.map(league => (
                    <button
                      key={league}
                      onClick={() => toggleLeague(league)}
                      disabled={dataFetched}
                      className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all text-left ${
                        selectedLeagues.includes(league)
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                      } ${dataFetched ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {selectedLeagues.includes(league) && (
                        <CheckCircle2 className="w-4 h-4 inline-block mr-2 text-blue-600" />
                      )}
                      {league}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Date Range */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedLeagues.length > 0 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    2
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Select Date Range</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {dateRangeOptions.map(option => (
                    <button
                      key={option.days}
                      onClick={() => setSelectedDateRange(option.days)}
                      disabled={dataFetched}
                      className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all ${
                        selectedDateRange === option.days
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                      } ${dataFetched ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Clock className="w-4 h-4 mx-auto mb-1" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Market Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedMarkets.length > 0 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    3
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">Select Markets</h3>
                  {selectedMarkets.length > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      ({selectedMarkets.length} selected)
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {marketOptions.map(market => (
                    <button
                      key={market.id}
                      onClick={() => toggleMarket(market.id)}
                      disabled={dataFetched}
                      className={`px-4 py-4 text-sm font-medium rounded-xl border-2 transition-all text-left ${
                        selectedMarkets.includes(market.id)
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                      } ${dataFetched ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-2xl mb-2">{market.icon}</div>
                      {selectedMarkets.includes(market.id) && (
                        <CheckCircle2 className="w-4 h-4 inline-block mr-2 text-blue-600" />
                      )}
                      {market.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Odds Range Filter */}
              <div className="mb-8 pb-8 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Odds Range (Optional)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Minimum Odds</label>
                    <input
                      type="number"
                      min="1.01"
                      max="10.00"
                      step="0.1"
                      value={filters.oddsMin}
                      onChange={(e) => updateFilters({ oddsMin: parseFloat(e.target.value) || 1.2 })}
                      disabled={dataFetched}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Maximum Odds</label>
                    <input
                      type="number"
                      min="1.01"
                      max="10.00"
                      step="0.1"
                      value={filters.oddsMax}
                      onChange={(e) => updateFilters({ oddsMax: parseFloat(e.target.value) || 3.0 })}
                      disabled={dataFetched}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {!dataFetched ? (
                  <button
                    onClick={handleFetchData}
                    disabled={!canFetchData || isLoading}
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                      canFetchData && !isLoading
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Fetching Odds...
                      </span>
                    ) : !canFetchData ? (
                      'Complete All Required Filters'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Fetch Odds
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="bg-green-50 border-2 border-green-600 rounded-xl p-4 text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-green-900">
                      {filteredMatches.length} matches loaded
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {lastUpdated && `Updated at ${lastUpdated.toLocaleTimeString()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Area */}
            {!dataFetched ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Find Odds</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    Select your preferred leagues, date range, and markets above, then click "Fetch Odds" to load real-time betting data.
                  </p>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 text-left">
                    <p className="text-xs font-semibold text-slate-700 mb-2">💡 Why filter-first?</p>
                    <p className="text-xs text-slate-600">
                      This approach prevents unnecessary API calls, saves credits, and gives you full control over the data you want to see.
                    </p>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-700">Loading matches...</p>
                <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">⚽</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">No Matches Found</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    No matches found for your selected criteria. Try adjusting your filters or selecting a wider date range.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {filteredMatches.length} Matches Available
                  </h3>
                  {lastUpdated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Updated {lastUpdated.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                {filteredMatches.map(match => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
          
          {/* RIGHT SECTION - BET SLIP (Narrower, Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingCodeGenerator />
            </div>
          </div>
        </div>
      </main>
      
      {/* Premium Footer */}
      <footer className="border-t border-slate-200 mt-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">© 2026 Gexten</p>
                <p className="text-slate-500">Professional Odds Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-slate-600 hover:text-blue-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
