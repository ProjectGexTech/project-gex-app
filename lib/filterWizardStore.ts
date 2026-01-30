import { create } from 'zustand';
import { LeagueCategory, LeagueMetadata } from './leagueConfig';

export interface DateRangeFilter {
  start: Date;
  days: number;
}

export interface FilterWizardState {
  // Step 1: Sport (defaulted to Football)
  sport: 'football';
  
  // Step 2: League Category
  leagueCategory: LeagueCategory | null;
  
  // Step 3: Specific Leagues
  selectedLeagues: string[]; // League keys (e.g., 'soccer_epl')
  
  // Step 4: Dependent Filters
  season: string | null;
  dateRange: DateRangeFilter;
  selectedMarkets: string[];
  selectedRegions: string[]; // Region IDs (e.g., ['uk', 'eu'])
  selectedBookmakers: string[]; // Specific bookmaker keys
  
  // Step 5: Advanced Options (optional)
  oddsMin: number;
  oddsMax: number;
  primaryBookmaker: string;
  
  // UI State
  currentStep: number;
  isValidToFetch: boolean;
  
  // Actions
  setLeagueCategory: (category: LeagueCategory | null) => void;
  toggleLeague: (leagueKey: string) => void;
  setSelectedLeagues: (leagues: string[]) => void;
  setSeason: (season: string) => void;
  setDateRange: (dateRange: DateRangeFilter) => void;
  toggleMarket: (marketId: string) => void;
  toggleRegion: (regionId: string) => void;
  toggleBookmaker: (bookmakerKey: string) => void;
  setOddsRange: (min: number, max: number) => void;
  setPrimaryBookmaker: (bookmaker: string) => void;
  resetFilters: () => void;
  resetDependentFilters: () => void;
  validateFilters: () => void;
  getFilterSummary: () => string;
}

const DEFAULT_DATE_RANGE: DateRangeFilter = {
  start: new Date(),
  days: 7,
};

export const useFilterWizardStore = create<FilterWizardState>((set, get) => ({
  // Initial State
  sport: 'football',
  leagueCategory: null,
  selectedLeagues: [],
  season: null,
  dateRange: DEFAULT_DATE_RANGE,
  selectedMarkets: ['h2h', 'totals'],
  selectedRegions: ['uk', 'eu'], // Default to UK and EU bookmakers
  selectedBookmakers: [],
  oddsMin: 1.2,
  oddsMax: 3.0,
  primaryBookmaker: 'Bet365',
  currentStep: 1,
  isValidToFetch: false,
  
  // Actions
  setLeagueCategory: (category) => {
    set({ leagueCategory: category });
    // Reset selected leagues when category changes
    if (category !== get().leagueCategory) {
      set({ selectedLeagues: [] });
    }
    get().validateFilters();
  },
  
  toggleLeague: (leagueKey) => {
    const current = get().selectedLeagues;
    const newLeagues = current.includes(leagueKey)
      ? current.filter(k => k !== leagueKey)
      : [...current, leagueKey];
    set({ selectedLeagues: newLeagues });
    get().validateFilters();
  },
  
  setSelectedLeagues: (leagues) => {
    set({ selectedLeagues: leagues });
    get().validateFilters();
  },
  
  setSeason: (season) => {
    set({ season });
    get().validateFilters();
  },
  
  setDateRange: (dateRange) => {
    set({ dateRange });
    get().validateFilters();
  },
  
  toggleMarket: (marketId) => {
    const current = get().selectedMarkets;
    const newMarkets = current.includes(marketId)
      ? current.filter(m => m !== marketId)
      : [...current, marketId];
    set({ selectedMarkets: newMarkets });
    get().validateFilters();
  },
  
  toggleRegion: (regionId) => {
    const current = get().selectedRegions;
    const newRegions = current.includes(regionId)
      ? current.filter(r => r !== regionId)
      : [...current, regionId];
    set({ selectedRegions: newRegions });
    get().validateFilters();
  },
  
  toggleBookmaker: (bookmakerKey) => {
    const current = get().selectedBookmakers;
    const newBookmakers = current.includes(bookmakerKey)
      ? current.filter(b => b !== bookmakerKey)
      : [...current, bookmakerKey];
    set({ selectedBookmakers: newBookmakers });
    get().validateFilters();
  },
  
  setOddsRange: (min, max) => {
    set({ oddsMin: min, oddsMax: max });
  },
  
  setPrimaryBookmaker: (bookmaker) => {
    set({ primaryBookmaker: bookmaker });
  },
  
  resetFilters: () => {
    set({
      leagueCategory: null,
      selectedLeagues: [],
      season: null,
      dateRange: DEFAULT_DATE_RANGE,
      selectedMarkets: ['h2h', 'totals'],
      selectedRegions: ['uk', 'eu'],
      selectedBookmakers: [],
      oddsMin: 1.2,
      oddsMax: 3.0,
      isValidToFetch: false,
    });
  },
  
  resetDependentFilters: () => {
    // Keep "safe" filters like date range and markets
    // Only reset league-specific ones
    set({
      season: null,
    });
    get().validateFilters();
  },
  
  validateFilters: () => {
    const state = get();
    const isValid = 
      state.sport === 'football' &&
      state.leagueCategory !== null &&
      state.selectedLeagues.length > 0 &&
      state.selectedMarkets.length > 0;
    
    set({ isValidToFetch: isValid });
  },
  
  getFilterSummary: () => {
    const state = get();
    const parts: string[] = [];
    
    parts.push('Football');
    
    if (state.leagueCategory) {
      const categoryLabels: Record<LeagueCategory, string> = {
        domestic: 'Domestic League',
        cup: 'Cup',
        international: 'International',
      };
      parts.push(categoryLabels[state.leagueCategory]);
    }
    
    if (state.selectedLeagues.length === 1) {
      // Will need to get league name from config
      parts.push('1 League');
    } else if (state.selectedLeagues.length > 1) {
      parts.push(`${state.selectedLeagues.length} Leagues`);
    }
    
    if (state.season) {
      parts.push(`Season ${state.season}`);
    }
    
    parts.push(`Next ${state.dateRange.days} days`);
    
    if (state.selectedMarkets.length > 0) {
      parts.push(`${state.selectedMarkets.length} markets`);
    }
    
    return parts.join(' → ');
  },
}));
