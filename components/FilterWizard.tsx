'use client';

import { useFilterWizardStore } from '@/lib/filterWizardStore';
import { SPORTS, LEAGUES_CONFIG, getLeaguesBySport, getAllLeagues, getLeagueByKey, SportType } from '@/lib/leagueConfig';
import { MARKET_OPTIONS, MARKET_CATEGORIES, getMarketsByCategory, getAvailabilityColor, getAvailabilityLabel } from '@/lib/marketConfig';
import { REGIONS, BOOKMAKERS, getBookmakersByRegion, getBookmakerAvailabilityColor, getBookmakerAvailabilityLabel } from '@/lib/bookmakersConfig';
import { Trophy, Calendar, Target, TrendingUp, CheckCircle2, ChevronRight, Info, AlertCircle, Building2 } from 'lucide-react';
import { useState } from 'react';
import React from 'react';

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
  const [minOddsInput, setMinOddsInput] = useState<string>('');
  const [maxOddsInput, setMaxOddsInput] = useState<string>('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  const {
    oddsMin,
    oddsMax,
    primaryBookmaker,
    selectedSport,
    selectedLeagues,
    season,
    dateRange,
    selectedMarkets,
    selectedRegions,
    selectedBookmakers,
    isValidToFetch,
    setOddsRange,
    setPrimaryBookmaker,
    setSelectedSport,
    toggleLeague,
    setSelectedLeagues,
    setSeason,
    setDateRange,
    toggleMarket,
    toggleRegion,
    toggleBookmaker,
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

  // Initialize odds inputs from store
  React.useEffect(() => {
    if (minOddsInput === '') setMinOddsInput(oddsMin.toString());
    if (maxOddsInput === '') setMaxOddsInput(oddsMax.toString());
  }, [oddsMin, oddsMax]);

  const handleCustomDateRange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setDateRange({ start, days });
      setShowCustomDatePicker(false);
    }
  };

  const handleFetchData = async () => {
    if (!isValidToFetch) return;

    // If no specific leagues selected, get all available leagues based on sport selection
    let leaguesToFetch = selectedLeagues;
    if (leaguesToFetch.length === 0) {
      leaguesToFetch = selectedSport 
        ? getLeaguesBySport(selectedSport).map(l => l.key)
        : getAllLeagues().map(l => l.key);
    }

    await onFetchData({
      leagues: leaguesToFetch,
      markets: selectedMarkets,
      dateRange,
      regions: selectedRegions,
      bookmakers: selectedBookmakers,
      oddsMin,
      oddsMax,
      primaryBookmaker,
    });
  };

  // Get leagues to display based on selected sport
  const leaguesToDisplay = selectedSport 
    ? getLeaguesBySport(selectedSport)
    : getAllLeagues();

  // Group leagues by sport if no sport is selected
  const groupedLeagues = !selectedSport 
    ? SPORTS.map(sport => ({
        sport,
        leagues: getLeaguesBySport(sport.id)
      }))
    : null;

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
          Odds range is required. All other filters are optional and act as progressive constraints.
        </p>
      </div>

      {/* Step 1: Odds Range (REQUIRED - Root Filter) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 1: Odds Range <span className="text-red-500">*</span>
          </h3>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
            {oddsMin.toFixed(2)} - {oddsMax.toFixed(2)}
          </span>
        </div>
        
        <div className="ml-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-800">
              <strong>Odds are the root filter.</strong> Select your desired odds range. 
              All matches will be filtered by this range across all selected sports and leagues.
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
                  max="100.00"
                  step="any"
                  value={minOddsInput}
                  onChange={(e) => setMinOddsInput(e.target.value)}
                  onBlur={() => {
                    const value = parseFloat(minOddsInput);
                    if (isNaN(value) || value <= 0) {
                      setMinOddsInput('1.5');
                      setOddsRange(1.5, oddsMax);
                    } else {
                      setOddsRange(value, oddsMax);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-semibold text-slate-900"
                  placeholder="1.01"
                />
                <div className="text-xs text-slate-500 mt-1">Range: 1.01 - 100.00</div>
              </div>

              {/* Maximum Odds */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Maximum Odds</label>
                <input
                  type="number"
                  min="1.01"
                  max="100.00"
                  step="any"
                  value={maxOddsInput}
                  onChange={(e) => setMaxOddsInput(e.target.value)}
                  onBlur={() => {
                    const value = parseFloat(maxOddsInput);
                    if (isNaN(value) || value <= 0) {
                      setMaxOddsInput('3.0');
                      setOddsRange(oddsMin, 3.0);
                    } else {
                      setOddsRange(oddsMin, value);
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm font-semibold text-slate-900"
                  placeholder="100.00"
                />
                <div className="text-xs text-slate-500 mt-1">Range: 1.01 - 100.00</div>
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
                  onClick={() => setOddsRange(1.01, 100.00)}
                  className="p-2 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900">All Odds</div>
                  <div className="text-slate-600">1.01 - 100.00</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Primary Bookmaker */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 2: Primary Bookmaker
          </h3>
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {primaryBookmaker}
          </span>
        </div>
        <div className="ml-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <div className="text-xs text-green-800">
              <strong>Select your primary bookmaker.</strong> This is the bookmaker whose odds will be used for the primary odds column in your results.
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {BOOKMAKERS.filter(bm => bm.availability === 'high').map((bookmaker) => (
              <button
                key={bookmaker.key}
                onClick={() => setPrimaryBookmaker(bookmaker.title)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  primaryBookmaker === bookmaker.title
                    ? 'border-green-500 bg-green-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${
                      primaryBookmaker === bookmaker.title ? 'text-green-900' : 'text-slate-900'
                    }`}>
                      {bookmaker.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {bookmaker.region.toUpperCase()}
                    </div>
                  </div>
                  {primaryBookmaker === bookmaker.title && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Sport Type (Optional) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            selectedSport 
              ? 'bg-blue-500 text-white' 
              : 'bg-slate-300 text-slate-600'
          }`}>
            {selectedSport ? <CheckCircle2 className="w-4 h-4" /> : '3'}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 3: Sport Type (Optional)
          </h3>
          {!selectedSport && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              All Sports Selected
            </span>
          )}
        </div>
        <div className="ml-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>Optional filter.</strong> If no sport is selected, all sports will be searched. 
              Select a sport to narrow down your search.
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SPORTS.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedSport === sport.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{sport.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">
                        {sport.label}
                      </div>
                      <div className="text-xs text-slate-600">
                        {sport.description}
                      </div>
                    </div>
                  </div>
                  {selectedSport === sport.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4: Select Specific Leagues (Optional) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            selectedLeagues.length > 0
              ? 'bg-blue-500 text-white'
              : 'bg-slate-300 text-slate-600'
          }`}>
            {selectedLeagues.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 4: Select Leagues (Optional)
          </h3>
          {selectedLeagues.length === 0 && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              All Leagues Selected
            </span>
          )}
          {selectedLeagues.length > 0 && (
            <span className="text-xs text-slate-500">
              ({selectedLeagues.length} selected)
            </span>
          )}
        </div>
        <div className="ml-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <strong>Optional filter.</strong> If no leagues are selected, all available leagues will be searched. 
              Select specific leagues to narrow your search.
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-600">
              {selectedSport 
                ? `Showing ${leaguesToDisplay.length} leagues for ${selectedSport}`
                : `Showing all ${leaguesToDisplay.length} available leagues`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLeagues(leaguesToDisplay.map(l => l.key))}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Select All
              </button>
              {selectedLeagues.length > 0 && (
                <button
                  onClick={() => setSelectedLeagues([])}
                  className="text-xs text-gray-600 hover:underline font-medium"
                >
                  Clear ({selectedLeagues.length})
                </button>
              )}
            </div>
          </div>

          {/* Display leagues grouped by sport if no sport selected */}
          {!selectedSport && groupedLeagues ? (
            <div className="space-y-4">
              {groupedLeagues.map(({ sport, leagues }) => (
                <div key={sport.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 flex items-center gap-2">
                    <span className="text-xl">{sport.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900">{sport.label}</div>
                      <div className="text-xs text-slate-600">{leagues.length} leagues</div>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {leagues.map((league) => (
                      <button
                        key={league.key}
                        onClick={() => toggleLeague(league.key)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedLeagues.includes(league.key)
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
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
                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Display leagues for selected sport */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {leaguesToDisplay.map((league) => (
                <button
                  key={league.key}
                  onClick={() => toggleLeague(league.key)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedLeagues.includes(league.key)
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
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
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step 5: Additional Filters (Date Range & Markets) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            selectedMarkets.length > 0
              ? 'bg-green-500 text-white'
              : 'bg-slate-300 text-slate-600'
          }`}>
            {selectedMarkets.length > 0 ? <CheckCircle2 className="w-4 h-4" /> : '5'}
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            Step 5: Additional Filters
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
                    dateRange.days === option.days && !showCustomDatePicker
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Custom Date Range */}
            <div className="mt-3">
              <button
                onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
                className={`w-full p-2 rounded-lg border-2 transition-all text-sm ${
                  showCustomDatePicker
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Custom Date Range
                </div>
              </button>
              
              {showCustomDatePicker && (
                <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={customStartDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCustomDateRange}
                    disabled={!customStartDate || !customEndDate}
                    className="mt-3 w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm"
                  >
                    Apply Custom Range
                  </button>
                </div>
              )}
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
          </div>
        </div>

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
                  This will search across{' '}
                  <span className="font-bold text-blue-600">
                    {selectedLeagues.length === 0 
                      ? `all ${selectedSport ? getLeaguesBySport(selectedSport).length : getAllLeagues().length} available leagues`
                      : `${selectedLeagues.length} selected league${selectedLeagues.length !== 1 ? 's' : ''}`}
                  </span>
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
