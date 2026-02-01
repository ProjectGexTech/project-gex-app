import { create } from 'zustand';
import { SportType, LeagueMetadata } from './leagueConfig';

export interface DateRangeFilter {
  start: Date;
  days: number;
}

export interface FilterWizardState {
  // Step 1: Odds Range (Required - Root Filter)
  oddsMin: number;
  oddsMax: number;
  oddsSelected: boolean; // Track if user has selected odds
  
  // Step 2: Primary Bookmaker (comes after odds, before sport)
  primaryBookmaker: string;
  
  // Step 3: Sport Type (Optional)
  selectedSport: SportType | null; // null means ALL sports
  
  // Step 4: Specific Leagues (Optional)
  selectedLeagues: string[]; // League keys (e.g., 'soccer_epl'). Empty means ALL leagues
  
  // Additional Filters
  season: string | null;
  dateRange: DateRangeFilter;
  selectedMarkets: string[];
  selectedRegions: string[]; // Region IDs (e.g., ['uk', 'eu'])
  selectedBookmakers: string[]; // Specific bookmaker keys
  
  // UI State
  currentStep: number;
  isValidToFetch: boolean;
  
  // Actions
  setOddsRange: (min: number, max: number) => void;
  setPrimaryBookmaker: (bookmaker: string) => void;
  setSelectedSport: (sport: SportType | null) => void;
  toggleLeague: (leagueKey: string) => void;
  setSelectedLeagues: (leagues: string[]) => void;
  setSeason: (season: string) => void;
  setDateRange: (dateRange: DateRangeFilter) => void;
  toggleMarket: (marketId: string) => void;
  toggleRegion: (regionId: string) => void;
  toggleBookmaker: (bookmakerKey: string) => void;
  resetFilters: () => void;
  validateFilters: () => void;
  getFilterSummary: () => string;
}

const DEFAULT_DATE_RANGE: DateRangeFilter = {
  start: new Date(),
  days: 7,
};

export const useFilterWizardStore = create<FilterWizardState>((set, get) => ({
  // Initial State - Odds must be selected first
  oddsMin: 1.5,
  oddsMax: 3.0,
  oddsSelected: true, // Default to true for now
  primaryBookmaker: 'Pinnacle',
  selectedSport: null, // null = ALL sports
  selectedLeagues: [], // empty = ALL leagues
  season: null,
  dateRange: DEFAULT_DATE_RANGE,
  selectedMarkets: ['h2h', 'totals'],
  selectedRegions: ['uk', 'eu'], // Default to UK and EU bookmakers
  selectedBookmakers: [],
  currentStep: 1,
  isValidToFetch: true, // Can fetch with just odds selected
  
  // Actions
  setOddsRange: (min, max) => {
    set({ oddsMin: min, oddsMax: max, oddsSelected: true });
    get().validateFilters();
  },
  
  setPrimaryBookmaker: (bookmaker) => {
    set({ primaryBookmaker: bookmaker });
    get().validateFilters();
  },
  
  setSelectedSport: (sport) => {
    set({ selectedSport: sport });
    // Reset selected leagues when sport changes
    if (sport !== get().selectedSport) {
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
  
  resetFilters: () => {
    set({
      oddsMin: 1.5,
      oddsMax: 3.0,
      oddsSelected: true,
      primaryBookmaker: 'Pinnacle',
      selectedSport: null,
      selectedLeagues: [],
      season: null,
      dateRange: DEFAULT_DATE_RANGE,
      selectedMarkets: ['h2h', 'totals'],
      selectedRegions: ['uk', 'eu'],
      selectedBookmakers: [],
      isValidToFetch: true,
    });
  },
  
  validateFilters: () => {
    const state = get();
    // Only odds selection is required
    const isValid = 
      state.oddsSelected &&
      state.selectedMarkets.length > 0;
    
    set({ isValidToFetch: isValid });
  },
  
  getFilterSummary: () => {
    const state = get();
    const parts: string[] = [];
    
    parts.push(`Odds: ${state.oddsMin.toFixed(2)}-${state.oddsMax.toFixed(2)}`);
    
    if (state.selectedSport) {
      const sportLabels: Record<SportType, string> = {
        football: 'Football',
        basketball: 'Basketball',
      };
      parts.push(sportLabels[state.selectedSport]);
    } else {
      parts.push('All Sports');
    }
    
    if (state.selectedLeagues.length === 0) {
      parts.push('All Leagues');
    } else if (state.selectedLeagues.length === 1) {
      parts.push('1 League');
    } else {
      parts.push(`${state.selectedLeagues.length} Leagues`);
    }
    
    parts.push(`Next ${state.dateRange.days} days`);
    
    if (state.selectedMarkets.length > 0) {
      parts.push(`${state.selectedMarkets.length} markets`);
    }
    
    return parts.join(' → ');
  },
}));
