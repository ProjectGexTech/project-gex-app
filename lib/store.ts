import { create } from 'zustand';
import { Match, BettingSelection, BookingCode, SearchFilters, DetailedAIPrediction } from './types';
import { filterMatches } from './dummyData';
import { oddsAPIService } from './oddsAPI';
import { transformOddsAPIMatches } from './oddsTransformer';
import { footballStatsService } from './footballStatsAPI';

interface GextenStore {
  // State
  allMatches: Match[];
  filteredMatches: Match[];
  selectedMatches: Map<string, BettingSelection>;
  bookingCode: BookingCode | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  aiPredictionCache: Map<string, DetailedAIPrediction>; // Cache AI predictions by match ID
  loadingPredictions: Set<string>; // Track which predictions are being loaded
  filters: {
    oddsMin: number;
    oddsMax: number;
    bookmakers: string[];
    leagues: string[];
    formWeight: number;
    h2hWeight: number;
    dateRange: {
      start: Date;
      days: number; // 1 for single day, 7 for week, etc.
    };
    selectedMarkets: string[]; // 'h2h', 'totals'
    primaryBookmaker: string;
  };
  
  // Actions
  initializeMatches: () => Promise<void>;
  refreshMatches: () => Promise<void>;
  applyFilters: () => void;
  updateFilters: (filters: Partial<GextenStore['filters']>) => void;
  selectMatch: (selection: BettingSelection) => void;
  deselectMatch: (matchId: string) => void;
  clearSelections: () => void;
  generateBookingCode: (bookmaker: string) => void;
  clearBookingCode: () => void;
  loadSavedFilters: () => void;
  fetchDetailedPrediction: (matchId: string) => Promise<void>;
  getDetailedPrediction: (matchId: string) => DetailedAIPrediction | undefined;
  isLoadingPrediction: (matchId: string) => boolean;
}

// Load saved filters from localStorage
const loadFiltersFromStorage = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('gexten_filters');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading saved filters:', error);
    return null;
  }
};

// Save filters to localStorage
const saveFiltersToStorage = (filters: GextenStore['filters']) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('gexten_filters', JSON.stringify({
      oddsMin: filters.oddsMin,
      oddsMax: filters.oddsMax,
      primaryBookmaker: filters.primaryBookmaker,
    }));
  } catch (error) {
    console.error('Error saving filters:', error);
  }
};

export const useGextenStore = create<GextenStore>((set, get) => ({
  allMatches: [],
  filteredMatches: [],
  selectedMatches: new Map(),
  bookingCode: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  aiPredictionCache: new Map(),
  loadingPredictions: new Set(),
  filters: {
    oddsMin: 1.2,
    oddsMax: 3.0,
    bookmakers: [],
    leagues: [],
    formWeight: 60,
    h2hWeight: 40,
    dateRange: {
      start: new Date(),
      days: 7, // Default to 7-day window
    },
    selectedMarkets: ['h2h', 'totals'], // Default to all available markets
    primaryBookmaker: 'Bet365',
  },
  
  initializeMatches: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('🚀 Fetching matches from Odds API...');
      const apiMatches = await oddsAPIService.fetchSoccerOdds();
      console.log(`📦 Received ${apiMatches.length} matches from API`);
      
      console.log('🔄 Transforming and enhancing matches...');
      // transformOddsAPIMatches is now async and includes stats enhancement
      const matches = await transformOddsAPIMatches(apiMatches);
      console.log(`🎯 Transformed ${matches.length} matches`);
      
      set({ 
        allMatches: matches, 
        filteredMatches: matches,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
      
      console.log(`✅ Loaded ${matches.length} matches with enhanced stats`);
      console.log(`📊 Sample match:`, matches[0] ? {
        homeTeam: matches[0].homeTeam.name,
        awayTeam: matches[0].awayTeam.name,
        league: matches[0].league,
        date: matches[0].date
      } : 'No matches');
      
      // Apply filters after loading
      console.log('🔍 Applying filters...');
      get().applyFilters();
      
      const { filteredMatches, filters } = get();
      console.log(`🎯 After filtering: ${filteredMatches.length} matches`);
      console.log(`📋 Current filters:`, {
        oddsMin: filters.oddsMin,
        oddsMax: filters.oddsMax,
        leagues: filters.leagues,
        dateRange: filters.dateRange,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch matches';
      set({ 
        isLoading: false, 
        error: errorMessage,
        allMatches: [],
        filteredMatches: [],
      });
      console.error('❌ Error initializing matches:', error);
    }
  },

  refreshMatches: async () => {
    // Clear cache and fetch fresh data
    oddsAPIService.clearCache();
    await get().initializeMatches();
  },
  
  applyFilters: () => {
    const { allMatches, filters } = get();
    console.log(`🔍 Applying filters to ${allMatches.length} matches...`);
    console.log(`📋 Filters:`, {
      oddsMin: filters.oddsMin,
      oddsMax: filters.oddsMax,
      leagues: filters.leagues,
      dateRange: filters.dateRange,
    });
    
    const filtered = filterMatches(allMatches, {
      oddsMin: filters.oddsMin,
      oddsMax: filters.oddsMax,
      bookmakers: filters.bookmakers.length > 0 ? filters.bookmakers : undefined,
      leagues: filters.leagues.length > 0 ? filters.leagues : undefined,
      dateRange: filters.dateRange,
    });
    
    console.log(`✅ Filtered to ${filtered.length} matches`);
    
    if (filtered.length === 0 && allMatches.length > 0) {
      console.warn('⚠️ Filter resulted in 0 matches! Check filter criteria:');
      console.warn('   - Date range:', filters.dateRange);
      console.warn('   - Odds range:', filters.oddsMin, '-', filters.oddsMax);
      console.warn('   - Leagues:', filters.leagues);
      console.warn('   - Available leagues in data:', [...new Set(allMatches.map(m => m.league))]);
    }
    
    set({ filteredMatches: filtered });
  },
  
  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    
    // Save to localStorage
    const currentFilters = get().filters;
    saveFiltersToStorage({ ...currentFilters, ...newFilters });
    
    get().applyFilters();
  },
  
  selectMatch: (selection) => {
    set(state => {
      const newSelections = new Map(state.selectedMatches);
      newSelections.set(selection.matchId, selection);
      return { selectedMatches: newSelections };
    });
  },
  
  deselectMatch: (matchId) => {
    set(state => {
      const newSelections = new Map(state.selectedMatches);
      newSelections.delete(matchId);
      return { selectedMatches: newSelections };
    });
  },
  
  clearSelections: () => {
    set({ selectedMatches: new Map() });
  },
  
  generateBookingCode: (bookmaker) => {
    const { selectedMatches } = get();
    const selections = Array.from(selectedMatches.values());
    
    if (selections.length === 0) return;
    
    // Calculate total odds
    const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
    
    // Generate booking code
    const code = `BET-${bookmaker.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
    
    set({
      bookingCode: {
        code,
        bookmaker,
        selections,
        totalOdds: +totalOdds.toFixed(2),
        createdAt: new Date(),
      }
    });
  },
  
  clearBookingCode: () => {
    set({ bookingCode: null });
  },
  
  loadSavedFilters: () => {
    const saved = loadFiltersFromStorage();
    if (saved) {
      set(state => ({
        filters: {
          ...state.filters,
          oddsMin: saved.oddsMin ?? state.filters.oddsMin,
          oddsMax: saved.oddsMax ?? state.filters.oddsMax,
          primaryBookmaker: saved.primaryBookmaker ?? state.filters.primaryBookmaker,
        }
      }));
    }
  },

  fetchDetailedPrediction: async (matchId: string) => {
    // Check if already cached
    const cached = get().aiPredictionCache.get(matchId);
    if (cached) return;

    // Check if already loading
    if (get().loadingPredictions.has(matchId)) return;

    // Mark as loading
    set(state => ({
      loadingPredictions: new Set(state.loadingPredictions).add(matchId)
    }));

    try {
      // Find the match
      const match = get().allMatches.find(m => m.id === matchId);
      if (!match) {
        throw new Error('Match not found');
      }

      // Fetch detailed prediction data
      const prediction = await footballStatsService.fetchDetailedPrediction(
        match.homeTeam.name,
        match.awayTeam.name
      );

      // Cache the prediction
      set(state => {
        const newCache = new Map(state.aiPredictionCache);
        newCache.set(matchId, prediction);
        const newLoading = new Set(state.loadingPredictions);
        newLoading.delete(matchId);
        
        return {
          aiPredictionCache: newCache,
          loadingPredictions: newLoading
        };
      });

      console.log(`✅ Loaded detailed prediction for match ${matchId}`);
    } catch (error) {
      console.error('Error fetching detailed prediction:', error);
      
      // Remove from loading set on error
      set(state => {
        const newLoading = new Set(state.loadingPredictions);
        newLoading.delete(matchId);
        return { loadingPredictions: newLoading };
      });
    }
  },

  getDetailedPrediction: (matchId: string) => {
    return get().aiPredictionCache.get(matchId);
  },

  isLoadingPrediction: (matchId: string) => {
    return get().loadingPredictions.has(matchId);
  },
}));
