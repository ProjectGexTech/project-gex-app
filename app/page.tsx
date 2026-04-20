'use client';

import { useState, useEffect } from 'react';
import { useGextenStore } from '@/lib/store';
import { useAPIKeysStore } from '@/lib/apiKeysStore';
import MatchCard from '@/components/MatchCard';
import BookingCodeGenerator from '@/components/BookingCodeGenerator';
import APIKeysModal from '@/components/APIKeysModal';
import FilterWizard from '@/components/FilterWizard';
import { getLeagueByKey, SportType } from '@/lib/leagueConfig';
import { getMarketAPIKeys } from '@/lib/marketConfig';
import { resolveMaxMarketsForSelection } from '@/lib/marketOrchestration';
import { convertRegionsToAPIParam } from '@/lib/bookmakersConfig';
import { RefreshCw, AlertCircle, Filter, TrendingUp, Clock, Shield, CheckCircle2, XCircle, Settings, Trophy, Target, Calendar } from 'lucide-react';

export default function Home() {
  const { 
    filteredMatches, 
    fetchSelectedLeagues,
    isLoading, 
    error,
    lastUpdated,
    filters,
    updateFilters,
  } = useGextenStore();
  
  const { isConfigured, loadApiKeysFromStorage, clearApiKeys } = useAPIKeysStore();

  const [dataFetched, setDataFetched] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  
  // Load API keys on mount
  useEffect(() => {
    loadApiKeysFromStorage();
  }, [loadApiKeysFromStorage]);

  const handleFetchData = async (config: {
    leagues: string[];
    markets: string[];
    selectedSport: SportType | null;
    dateRange: { start: Date; days: number };
    regions: string[];
    bookmakers: string[];
    oddsMin: number;
    oddsMax: number;
    primaryBookmaker: string;
  }) => {
    // Convert league keys to league names for filtering
    const leagueNames = config.leagues
      .map(key => getLeagueByKey(key)?.name)
      .filter(Boolean) as string[];
    
    const marketResolution = resolveMaxMarketsForSelection({
      selectedSport: config.selectedSport,
      selectedLeagueKeys: config.leagues,
      selectedMarketIds: config.markets,
      selectedRegions: config.regions,
      selectedBookmakers: config.bookmakers,
    });

    const marketsByLeagueAPIKeys = Object.fromEntries(
      config.leagues.map((leagueKey) => {
        const leagueSport = getLeagueByKey(leagueKey)?.sport ?? config.selectedSport;
        const marketIdsForLeague = marketResolution.marketsByLeague[leagueKey] || marketResolution.requestedMarkets;
        return [leagueKey, getMarketAPIKeys(marketIdsForLeague, leagueSport)];
      })
    );

    const fallbackMarketsByLeagueAPIKeys = Object.fromEntries(
      config.leagues.map((leagueKey) => {
        const leagueSport = getLeagueByKey(leagueKey)?.sport ?? config.selectedSport;
        const fallbackForLeague = marketResolution.fallbackMarketsByLeague[leagueKey] || marketResolution.fallbackMarkets;
        return [leagueKey, getMarketAPIKeys(fallbackForLeague, leagueSport)];
      })
    );

    const marketAPIKeys = Array.from(
      new Set(Object.values(marketsByLeagueAPIKeys).flat())
    );
    
    // Convert regions to API parameter
    const regionsParam = convertRegionsToAPIParam(config.regions);
    
    console.log('🔍 Converting filters:', {
      leagueKeys: config.leagues,
      leagueNames: leagueNames,
      marketIDs: config.markets,
      marketAPIKeys: marketAPIKeys,
      marketResolution,
      marketsByLeagueAPIKeys,
      fallbackMarketsByLeagueAPIKeys,
      selectedRegions: config.regions,
      regionsAPIParam: regionsParam,
      selectedBookmakers: config.bookmakers
    });
    
    // Update filters in store with league NAMES (not keys)
    updateFilters({
      leagues: leagueNames,
      selectedMarkets: marketAPIKeys,
      dateRange: config.dateRange,
      oddsMin: config.oddsMin,
      oddsMax: config.oddsMax,
      primaryBookmaker: config.primaryBookmaker,
    });
    
    // Fetch data using the new optimized method (uses league KEYS, market API keys, and regions)
    await fetchSelectedLeagues({
      leagues: config.leagues,
      markets: marketAPIKeys,
      marketsByLeague: marketsByLeagueAPIKeys,
      fallbackMarketsByLeague: fallbackMarketsByLeagueAPIKeys,
      dateRange: config.dateRange,
      regions: regionsParam,
      bookmakers: config.bookmakers,
    });
    
    setDataFetched(true);
  };


  
  const handleReset = () => {
    setDataFetched(false);
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
              {/* <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <Shield className="w-4 h-4 text-blue-600" />
                <div className="text-sm">
                  <p className="text-slate-500 text-xs">Account Balance</p>
                  <p className="font-semibold text-slate-900">$1,250.00</p>
                </div>
              </div> */}
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
        
        {/* Filter Wizard - Only show before data is fetched */}
        {!dataFetched && (
          <FilterWizard onFetchData={handleFetchData} isLoading={isLoading} />
        )}
        
        {/* Results Section - Show after data is fetched */}
        {dataFetched && (
          <>
            {/* Results Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">
                    Match Results
                  </h2>
                  <p className="text-sm text-slate-500">
                    {filteredMatches.length} matches found
                    {lastUpdated && (
                      <span className="ml-2">
                        • Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Change Filters
                </button>
              </div>

              {/* Active Filters Display */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-700">Active Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Leagues */}
                  {filters.leagues.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <Trophy className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">
                        {filters.leagues.length} {filters.leagues.length === 1 ? 'League' : 'Leagues'}
                      </span>
                      <span className="text-xs text-blue-700">
                        ({filters.leagues.slice(0, 2).join(', ')}{filters.leagues.length > 2 ? ` +${filters.leagues.length - 2}` : ''})
                      </span>
                    </div>
                  )}
                  
                  {/* Markets */}
                  {filters.selectedMarkets.length > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <Target className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-900">
                        {filters.selectedMarkets.length} {filters.selectedMarkets.length === 1 ? 'Market' : 'Markets'}
                      </span>
                      <span className="text-xs text-green-700">
                        ({filters.selectedMarkets.slice(0, 2).join(', ')}{filters.selectedMarkets.length > 2 ? ` +${filters.selectedMarkets.length - 2}` : ''})
                      </span>
                    </div>
                  )}
                  
                  {/* Date Range */}
                  {filters.dateRange && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">
                        Next {filters.dateRange.days} {filters.dateRange.days === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>
                  )}
                  
                  {/* Odds Range */}
                  {(filters.oddsMin > 1.2 || filters.oddsMax < 3.0) && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-900">
                        Odds: {filters.oddsMin.toFixed(2)} - {filters.oddsMax.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Bookmaker */}
                  {filters.primaryBookmaker && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <Shield className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-900">
                        {filters.primaryBookmaker}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {!isLoading && filteredMatches.length === 0 ? (
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
                ) : isLoading ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-700">Loading matches...</p>
                    <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
          </>
        )}
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
