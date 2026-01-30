'use client';

import { useFilterWizardStore } from '@/lib/filterWizardStore';
import { LEAGUE_CATEGORIES, LEAGUES_CONFIG, getLeaguesByCategory, getLeagueByKey } from '@/lib/leagueConfig';
import { MARKET_OPTIONS, MARKET_CATEGORIES, getMarketsByCategory, getAvailabilityColor, getAvailabilityLabel } from '@/lib/marketConfig';
import { REGIONS, BOOKMAKERS, getBookmakersByRegion, getBookmakerAvailabilityColor, getBookmakerAvailabilityLabel } from '@/lib/bookmakersConfig';
import { Trophy, Calendar, Target, TrendingUp, CheckCircle2, ChevronRight, Info, AlertCircle, Building2 } from 'lucide-react';
import { useState } from 'react';

interface FilterWizardProps {
  onFetchData: (config: {
    leagues: string[];
    markets: string[];
    dateRange: { start: Date; days: number };
    regions: string[];
    bookmakers: string[];
    oddsMin: number;
    oddsMax: number;
    primaryBookmaker: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function FilterWizard({ onFetchData, isLoading = false }: FilterWizardProps) {
  const [expandedMarketCategory, setExpandedMarketCategory] = useState<string | null>('main');
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [bookmakerViewMode, setBookmakerViewMode] = useState<'regions' | 'list'>('regions');
  
  const {
    sport,
    leagueCategory,
    selectedLeagues,
    season,
    dateRange,
    selectedMarkets,
    selectedRegions,
    selectedBookmakers,
    oddsMin,
    oddsMax,
    primaryBookmaker,
    isValidToFetch,
    setLeagueCategory,
    toggleLeague,
    setSelectedLeagues,
    setSeason,
    setDateRange,
    toggleMarket,
    toggleRegion,
    toggleBookmaker,
    setOddsRange,
    setPrimaryBookmaker,
    resetFilters,
    getFilterSummary,
  } = useFilterWizardStore();

  const dateRangeOptions = [
    { label: 'Today', days: 1 },
    { label: 'Next 3 Days', days: 3 },
    { label: 'Next 7 Days', days: 7 },
    { label: 'Next 14 Days', days: 14 },
    { label: 'Next 30 Days', days: 30 },
  ];

  const handleFetchData = async () => {
    if (!isValidToFetch) return;

    await onFetchData({
      leagues: selectedLeagues,
      markets: selectedMarkets,
      dateRange,
      regions: selectedRegions,
      bookmakers: selectedBookmakers,
      oddsMin,
      oddsMax,
      primaryBookmaker,
    });
  };

  const leaguesInCategory = leagueCategory ? getLeaguesByCategory(leagueCategory) : [];
  const selectedLeagueNames = selectedLeagues
    .map(key => getLeagueByKey(key)?.name)
    .filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Configure Your Search
        </h2>
        <p className="text-sm text-slate-600">
          Select all filters before fetching data to avoid wasting API credits
        </p>
      </div>

      {/* Step 1: Sport (Auto-selected to Football) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 1: Sport
          </h3>
        </div>
        <div className="ml-8 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Football ⚽</span>
            <span className="text-xs">(Pre-selected)</span>
          </div>
        </div>
      </div>

      {/* Step 2: League Category */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            leagueCategory 
              ? 'bg-green-500 text-white' 
              : 'bg-slate-300 text-slate-600'
          }`}>
            {leagueCategory ? <CheckCircle2 className="w-4 h-4" /> : '2'}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 2: League Type
          </h3>
        </div>
        <div className="ml-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {LEAGUE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setLeagueCategory(cat.id as any)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                leagueCategory === cat.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-semibold text-slate-900 mb-1">
                {cat.label}
              </div>
              <div className="text-xs text-slate-600">
                {cat.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Select Specific Leagues */}
      {leagueCategory && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              selectedLeagues.length > 0
                ? 'bg-green-500 text-white'
                : 'bg-slate-300 text-slate-600'
            }`}>
              {selectedLeagues.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Step 3: Select Leagues
            </h3>
            {selectedLeagues.length > 0 && (
              <span className="text-xs text-slate-500">
                ({selectedLeagues.length} selected)
              </span>
            )}
          </div>
          <div className="ml-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">
                Select one or more leagues
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLeagues(leaguesInCategory.map(l => l.key))}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedLeagues([])}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {leaguesInCategory.map((league) => (
                <button
                  key={league.key}
                  onClick={() => toggleLeague(league.key)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedLeagues.includes(league.key)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-slate-900">
                        {league.name}
                      </div>
                      {league.country && (
                        <div className="text-xs text-slate-500">
                          {league.country}
                        </div>
                      )}
                    </div>
                    {selectedLeagues.includes(league.key) && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Date Range & Markets */}
      {selectedLeagues.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              selectedMarkets.length > 0
                ? 'bg-green-500 text-white'
                : 'bg-slate-300 text-slate-600'
            }`}>
              {selectedMarkets.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              Step 4: Additional Filters
            </h3>
          </div>
          <div className="ml-8 space-y-4">
            {/* Date Range */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setDateRange({ start: new Date(), days: option.days })}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
                      dateRange.days === option.days
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Markets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="w-4 h-4" />
                  Betting Markets
                </label>
                {selectedMarkets.length > 0 && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {selectedMarkets.length} selected
                  </span>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>Select the markets you want to analyze.</strong> Market availability depends on the bookmaker and league. 
                  If a market isn't available for a match, it will be skipped automatically.
                </div>
              </div>

              {/* Market Categories */}
              <div className="space-y-3">
                {MARKET_CATEGORIES.map((category) => {
                  const marketsInCategory = getMarketsByCategory(category.id);
                  const selectedInCategory = marketsInCategory.filter(m => selectedMarkets.includes(m.id)).length;
                  const isExpanded = expandedMarketCategory === category.id;
                  
                  return (
                    <div key={category.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <button
                        onClick={() => setExpandedMarketCategory(isExpanded ? null : category.id)}
                        className="w-full bg-slate-50 hover:bg-slate-100 p-3 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          <div className="text-left">
                            <div className="text-sm font-semibold text-slate-900">{category.label}</div>
                            <div className="text-xs text-slate-600">{category.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedInCategory > 0 && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              {selectedInCategory}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </button>

                      {/* Markets in Category */}
                      {isExpanded && (
                        <div className="p-3 space-y-2 bg-white">
                          {marketsInCategory.map((market) => {
                            const isSelected = selectedMarkets.includes(market.id);
                            
                            return (
                              <button
                                key={market.id}
                                onClick={() => toggleMarket(market.id)}
                                className={`w-full text-left border-2 rounded-lg p-3 transition-all ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2 flex-1">
                                    <span className="text-2xl">{market.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                          {market.label}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-600 mb-2">
                                        {market.description}
                                      </p>
                                      
                                      {/* Availability Badge */}
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getAvailabilityColor(market.availability)}`}>
                                          {getAvailabilityLabel(market.availability)}
                                        </span>
                                        {market.availability !== 'always' && (
                                          <span className="text-xs text-slate-500 italic">
                                            {market.availabilityNote}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Examples */}
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {market.examples.map((example, idx) => (
                                          <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                            {example}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* No Markets Selected Warning */}
              {selectedLeagues.length > 0 && selectedMarkets.length === 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <strong>No markets selected.</strong> Please select at least one betting market to analyze.
                  </div>
                </div>
              )}
            </div>

            {/* Bookmakers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Building2 className="w-4 h-4" />
                  Bookmakers & Regions
                </label>
                {(selectedRegions.length > 0 || selectedBookmakers.length > 0) && (
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {selectedBookmakers.length > 0 ? `${selectedBookmakers.length} bookmakers` : `${selectedRegions.length} regions`}
                  </span>
                )}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <strong>Choose how to select bookmakers.</strong> Pick entire regions for broad coverage, 
                  or select specific bookmakers for targeted odds comparison.
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBookmakerViewMode('regions')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    bookmakerViewMode === 'regions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  By Region
                </button>
                <button
                  onClick={() => setBookmakerViewMode('list')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    bookmakerViewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  By Bookmaker
                </button>
              </div>

              {/* Regional Selection View */}
              {bookmakerViewMode === 'regions' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600 mb-2">Select Regions:</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {REGIONS.map((region) => {
                      const isSelected = selectedRegions.includes(region.id);
                      
                      return (
                        <button
                          key={region.id}
                          onClick={() => toggleRegion(region.id)}
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xl">{region.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                  {region.label}
                                </div>
                                <div className="text-xs text-slate-600 truncate">
                                  {region.description.split('(')[0].trim()}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bookmaker List View */}
              {bookmakerViewMode === 'list' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-slate-600">Select Bookmakers:</div>
                    {selectedBookmakers.length > 0 && (
                      <button
                        onClick={() => selectedBookmakers.forEach(bm => toggleBookmaker(bm))}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear all ({selectedBookmakers.length})
                      </button>
                    )}
                  </div>
                  
                  {/* Bookmakers grouped by region */}
                  <div className="space-y-3">
                    {REGIONS.filter(r => r.id !== 'all').map((region) => {
                      const bookmakers = getBookmakersByRegion(region.id as any);
                      const selectedInRegion = bookmakers.filter(bm => selectedBookmakers.includes(bm.key)).length;
                      
                      return (
                        <div key={region.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          {/* Region Header */}
                          <div className="bg-slate-50 p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{region.icon}</span>
                              <div>
                                <div className="text-xs font-semibold text-slate-900">{region.label}</div>
                                <div className="text-xs text-slate-500">{bookmakers.length} available</div>
                              </div>
                            </div>
                            {selectedInRegion > 0 && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                {selectedInRegion} selected
                              </span>
                            )}
                          </div>

                          {/* Bookmakers Grid */}
                          <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-white">
                            {bookmakers.map((bookmaker) => {
                              const isSelected = selectedBookmakers.includes(bookmaker.key);
                              
                              return (
                                <button
                                  key={bookmaker.key}
                                  onClick={() => toggleBookmaker(bookmaker.key)}
                                  className={`text-left border-2 rounded-lg p-3 transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                                        {bookmaker.title}
                                      </div>
                                      <div className="text-xs text-slate-600 mb-2 line-clamp-2">
                                        {bookmaker.description}
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getBookmakerAvailabilityColor(bookmaker.availability)}`}>
                                          {getBookmakerAvailabilityLabel(bookmaker.availability)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {bookmaker.markets.length} markets
                                        </span>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Regions/Bookmakers Warning */}
              {selectedRegions.length === 0 && selectedBookmakers.length === 0 && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-800">
                    <strong>No bookmakers selected.</strong> Please select at least one region or bookmaker to get odds data.
                  </div>
                </div>
              )}
            </div>

            {/* Odds Range Filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Target className="w-4 h-4" />
                  Odds Range Filter
                </label>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  {oddsMin.toFixed(2)} - {oddsMax.toFixed(2)}
                </span>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-purple-800">
                  <strong>Filter matches by odds value.</strong> Only show matches where odds fall within your selected range. 
                  Lower odds = favorites, higher odds = underdogs.
                </div>
              </div>

              <div className="space-y-4">
                {/* Odds Input Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Minimum Odds */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">Minimum Odds</label>
                    <input
                      type="number"
                      min="1.01"
                      max="10.00"
                      step="0.01"
                      value={oddsMin}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 1.01 && value <= 10.00) {
                          setOddsRange(value, oddsMax);
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-semibold text-slate-900"
                      placeholder="1.01"
                    />
                    <div className="text-xs text-slate-500 mt-1">Range: 1.01 - 10.00</div>
                  </div>

                  {/* Maximum Odds */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-2 block">Maximum Odds</label>
                    <input
                      type="number"
                      min="1.01"
                      max="10.00"
                      step="0.01"
                      value={oddsMax}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 1.01 && value <= 10.00) {
                          setOddsRange(oddsMin, value);
                        }
                      }}
                      className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-semibold text-slate-900"
                      placeholder="10.00"
                    />
                    <div className="text-xs text-slate-500 mt-1">Range: 1.01 - 10.00</div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">Quick Presets:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => setOddsRange(1.01, 2.00)}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900">Favorites</div>
                      <div className="text-slate-600">1.01 - 2.00</div>
                    </button>
                    <button
                      onClick={() => setOddsRange(2.00, 3.50)}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900">Balanced</div>
                      <div className="text-slate-600">2.00 - 3.50</div>
                    </button>
                    <button
                      onClick={() => setOddsRange(3.50, 5.00)}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900">Underdogs</div>
                      <div className="text-slate-600">3.50 - 5.00</div>
                    </button>
                    <button
                      onClick={() => setOddsRange(1.01, 10.00)}
                      className="p-2 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900">All Odds</div>
                      <div className="text-slate-600">1.01 - 10.00</div>
                    </button>
                  </div>
                </div>

                {/* Visual Range Indicator */}
                <div className="bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-center">
                      <div className="font-bold text-green-800">Strong Favorites</div>
                      <div className="text-green-600">1.01 - 1.50</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-800">Favorites</div>
                      <div className="text-blue-600">1.50 - 2.50</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-amber-800">Balanced</div>
                      <div className="text-amber-600">2.50 - 4.00</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-800">Underdogs</div>
                      <div className="text-red-600">4.00+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary & Action Bar */}
      {isValidToFetch && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900 mb-1">
                  Ready to Fetch
                </div>
                <div className="text-sm text-slate-700 font-mono">
                  {getFilterSummary()}
                </div>
                <div className="text-xs text-slate-600 mt-2">
                  This will make <span className="font-bold text-blue-600">
                    {selectedLeagues.length} API request{selectedLeagues.length !== 1 ? 's' : ''}
                  </span> (one per selected league)
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleFetchData}
              disabled={!isValidToFetch || isLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isValidToFetch && !isLoading
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  Fetch Matches
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
            <button
              onClick={resetFilters}
              disabled={isLoading}
              className="px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Helpful Message */}
      {!isValidToFetch && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="text-center text-sm text-slate-500">
            Complete all required steps to fetch data
          </div>
        </div>
      )}
    </div>
  );
}
