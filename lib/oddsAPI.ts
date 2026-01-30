// The Odds API Service
// Documentation: https://the-odds-api.com/liveapi/guides/v4/

interface OddsAPIMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

import { useAPIKeysStore } from './apiKeysStore';

const API_BASE_URL = 'https://api.the-odds-api.com/v4';

// Get API key from store instead of environment variable
const getAPIKey = () => {
  return useAPIKeysStore.getState().oddsApiKey;
};

// Soccer sports available on The Odds API
// All major leagues supported
const SOCCER_SPORTS = [
  'soccer_epl',           // English Premier League
  'soccer_spain_la_liga', // Spanish La Liga
  'soccer_germany_bundesliga', // German Bundesliga
  'soccer_italy_serie_a', // Italian Serie A
  'soccer_france_ligue_one', // French Ligue 1
  'soccer_uefa_champs_league', // UEFA Champions League
  'soccer_uefa_europa_league', // UEFA Europa League
  'soccer_efl_champ',     // English Championship
];

// League display names mapping
export const LEAGUE_KEYS = {
  'soccer_epl': 'Premier League',
  'soccer_spain_la_liga': 'La Liga',
  'soccer_germany_bundesliga': 'Bundesliga',
  'soccer_italy_serie_a': 'Serie A',
  'soccer_france_ligue_one': 'Ligue 1',
  'soccer_uefa_champs_league': 'Champions League',
  'soccer_uefa_europa_league': 'Europa League',
  'soccer_efl_champ': 'Championship',
} as const;

export class OddsAPIService {
  private static instance: OddsAPIService;
  private lastFetchTime: number = 0;
  private cachedData: OddsAPIMatch[] = [];
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private queryCache: Map<string, { data: OddsAPIMatch[]; timestamp: number }> = new Map();

  private constructor() {}

  static getInstance(): OddsAPIService {
    if (!OddsAPIService.instance) {
      OddsAPIService.instance = new OddsAPIService();
    }
    return OddsAPIService.instance;
  }

  /**
   * Fetch odds for specific leagues only (OPTIMIZED - prevents wasting API credits)
   * @param leagueKeys - Array of league keys to fetch (e.g., ['soccer_epl', 'soccer_spain_la_liga'])
   * @param markets - Markets to fetch (e.g., ['h2h', 'totals'])
   * @param dateRangeDays - Number of days to fetch (default 7)
   * @param regions - Regions to fetch from (e.g., 'uk,eu,us')
   * @param bookmakers - Specific bookmaker keys (optional)
   */
  async fetchSelectedLeagues(
    leagueKeys: string[],
    markets: string[] = ['h2h', 'totals'],
    dateRangeDays: number = 7,
    regions: string = 'uk,eu',
    bookmakers: string[] = []
  ): Promise<OddsAPIMatch[]> {
    if (leagueKeys.length === 0) {
      throw new Error('No leagues selected');
    }

    const API_KEY = getAPIKey();
    if (!API_KEY) {
      throw new Error('Please configure your Odds API key to fetch matches');
    }

    console.log(`🎯 Fetching ${leagueKeys.length} selected league(s):`, leagueKeys);
    console.log(`📊 Markets: ${markets.join(', ')}`);
    console.log(`🌍 Regions: ${regions}`);
    if (bookmakers.length > 0) {
      console.log(`🏢 Bookmakers: ${bookmakers.join(', ')}`);
    }
    console.log(`📅 Date range: Next ${dateRangeDays} days`);

    try {
      // Create a cache key for this specific query
      const bookmakersKey = bookmakers.length > 0 ? bookmakers.sort().join(',') : 'all';
      const cacheKey = `${leagueKeys.sort().join(',')}_${markets.sort().join(',')}_${dateRangeDays}_${regions}_${bookmakersKey}`;
      const cached = this.queryCache.get(cacheKey);
      
      // Check if we have cached data for this exact query
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('✅ Returning cached data for this query');
        return cached.data;
      }

      // Fetch only the selected leagues (one request per league)
      const promises = leagueKeys.map(leagueKey => 
        this.fetchOddsForSport(leagueKey, markets, dateRangeDays, regions, bookmakers)
      );

      const results = await Promise.allSettled(promises);
      
      // Combine all successful results
      const allMatches: OddsAPIMatch[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ ${leagueKeys[index]}: ${result.value.length} matches`);
          allMatches.push(...result.value);
        } else {
          console.warn(`❌ Failed to fetch ${leagueKeys[index]}:`, result.reason);
        }
      });

      // Cache the results for this specific query
      this.queryCache.set(cacheKey, {
        data: allMatches,
        timestamp: Date.now(),
      });

      console.log(`✅ Total: ${allMatches.length} matches fetched for selected leagues`);
      return allMatches;
    } catch (error) {
      console.error('❌ Error fetching selected leagues:', error);
      throw error;
    }
  }

  /**
   * Fetch odds for all soccer leagues (LEGACY - uses more API credits)
   */
  async fetchSoccerOdds(): Promise<OddsAPIMatch[]> {
    // Check cache first
    const now = Date.now();
    if (this.cachedData.length > 0 && now - this.lastFetchTime < this.CACHE_DURATION) {
      // console.log('✅ Returning cached soccer odds data');
      return this.cachedData;
    }

    const API_KEY = getAPIKey();
    console.log('🔑 Odds API - Retrieved key from store:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'null');

    if (!API_KEY) {
      console.error('❌ Odds API key not configured');
      throw new Error('Please configure your Odds API key to fetch matches');
    }

    try {
      // console.log('🔄 Fetching fresh soccer odds from The Odds API...');
      // console.log(`🔑 Using API key: ${API_KEY?.substring(0, 8)}...`);
      // console.log(`📅 Will filter to: Next 14 days`);
      // console.log(`� Fetching ${SOCCER_SPORTS.length} leagues:`, SOCCER_SPORTS);
      
      // Fetch odds for all soccer leagues in parallel
      const promises = SOCCER_SPORTS.map(sport => 
        this.fetchOddsForSport(sport)
      );

      const results = await Promise.allSettled(promises);
      
      // Combine all successful results
      const allMatches: OddsAPIMatch[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          // console.log(`✅ ${SOCCER_SPORTS[index]}: ${result.value.length} matches`);
          allMatches.push(...result.value);
        } else {
          console.warn(`❌ Failed to fetch ${SOCCER_SPORTS[index]}:`, result.reason);
        }
      });

      // Update cache
      this.cachedData = allMatches;
      this.lastFetchTime = now;

      if (allMatches.length === 0) {
        console.warn('⚠️ No matches found in any league. This might be normal if no games are scheduled.');
      } else {
        // console.log(`✅ Successfully fetched ${allMatches.length} soccer matches total`);
      }
      
      return allMatches;
    } catch (error) {
      console.error('❌ Error fetching soccer odds:', error);
      
      // Return cached data if available, even if expired
      if (this.cachedData.length > 0) {
        // console.log('⚠️ Returning stale cached data due to API error');
        return this.cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Fetch odds for a specific sport
   */
  private async fetchOddsForSport(
    sportKey: string, 
    markets: string[] = ['h2h', 'totals'],
    dateRangeDays: number = 7,
    regions: string = 'uk,eu',
    bookmakers: string[] = []
  ): Promise<OddsAPIMatch[]> {
    const API_KEY = getAPIKey();
    if (!API_KEY) {
      throw new Error('API key not configured');
    }
    
    const params = new URLSearchParams({
      apiKey: API_KEY,
      regions: regions,
      markets: markets.join(','),
      oddsFormat: 'decimal',
      dateFormat: 'iso',
    });

    // Add bookmakers parameter if specific bookmakers are selected
    if (bookmakers.length > 0) {
      params.append('bookmakers', bookmakers.join(','));
    }

    const url = `${API_BASE_URL}/sports/${sportKey}/odds?${params}`;
    
    // console.log(`📡 Fetching ${sportKey}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`Response:`, response);

    if (!response.ok) {
      const errorText = await response.text();
      // console.error(`❌ API Error for ${sportKey}:`);
      // console.error(`   Status: ${response.status} ${response.statusText}`);
      // console.error(`   Response: ${errorText}`);
      // console.error(`   URL: ${url}`);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your .env.local file');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait before trying again');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OddsAPIMatch[] = await response.json();
    console.log(`Data for ${sportKey}:`, data);
    // console.log(`   ${sportKey}: ${data.length} matches found`);
    
    // Filter matches to only show those in the specified date range
    const now = new Date();
    const endDate = new Date(now.getTime() + (dateRangeDays * 24 * 60 * 60 * 1000));
    const filtered = data.filter(match => {
      const matchDate = new Date(match.commence_time);
      return matchDate >= now && matchDate <= endDate;
    });
    
    if (filtered.length < data.length) {
      console.log(`   Filtered to ${filtered.length} matches (next ${dateRangeDays} days)`);
    }
    
    return filtered;
  }

  /**
   * Clear the cache to force a fresh fetch
   */
  clearCache(): void {
    this.cachedData = [];
    this.queryCache.clear();
    this.lastFetchTime = 0;
    // console.log('Cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheInfo(): { isCached: boolean; age: number; matchCount: number } {
    const age = Date.now() - this.lastFetchTime;
    return {
      isCached: this.cachedData.length > 0 && age < this.CACHE_DURATION,
      age,
      matchCount: this.cachedData.length,
    };
  }
}

export const oddsAPIService = OddsAPIService.getInstance();
