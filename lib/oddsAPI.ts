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

const API_BASE_URL = 'https://api.the-odds-api.com/v4';
const API_KEY = process.env.NEXT_PUBLIC_ODDS_API_KEY;

// Soccer sports available on The Odds API
// Start with just Premier League for faster loading
const SOCCER_SPORTS = [
  'soccer_epl',           // English Premier League
  // Uncomment below to add more leagues:
  // 'soccer_spain_la_liga', // Spanish La Liga
  // 'soccer_germany_bundesliga', // German Bundesliga
  // 'soccer_italy_serie_a', // Italian Serie A
  // 'soccer_france_ligue_one', // French Ligue 1
  // 'soccer_uefa_champs_league', // UEFA Champions League
  // 'soccer_uefa_europa_league', // UEFA Europa League
  // 'soccer_england_league1', // English League 1
  // 'soccer_england_league2', // English League 2
  // 'soccer_efl_champ',     // English Championship
  // 'soccer_australia_aleague', // Australian A-League
  // 'soccer_brazil_campeonato', // Brazilian Série A
  // 'soccer_mexico_ligamx', // Mexican Liga MX
  // 'soccer_usa_mls',       // US MLS
];

export class OddsAPIService {
  private static instance: OddsAPIService;
  private lastFetchTime: number = 0;
  private cachedData: OddsAPIMatch[] = [];
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): OddsAPIService {
    if (!OddsAPIService.instance) {
      OddsAPIService.instance = new OddsAPIService();
    }
    return OddsAPIService.instance;
  }

  /**
   * Fetch odds for all soccer leagues
   */
  async fetchSoccerOdds(): Promise<OddsAPIMatch[]> {
    // Check cache first
    const now = Date.now();
    if (this.cachedData.length > 0 && now - this.lastFetchTime < this.CACHE_DURATION) {
      console.log('✅ Returning cached soccer odds data');
      return this.cachedData;
    }

    if (!API_KEY || API_KEY === 'your_api_key_here') {
      console.error('❌ Odds API key not configured');
      throw new Error('Please set up your Odds API key in .env.local');
    }

    try {
      console.log('🔄 Fetching fresh soccer odds from The Odds API...');
      console.log(`🔑 Using API key: ${API_KEY?.substring(0, 8)}...`);
      console.log(`📅 Will filter to: Dec 20-31, 2025`);
      console.log(`� Fetching ${SOCCER_SPORTS.length} leagues:`, SOCCER_SPORTS);
      
      // Fetch odds for all soccer leagues in parallel
      const promises = SOCCER_SPORTS.map(sport => 
        this.fetchOddsForSport(sport)
      );

      const results = await Promise.allSettled(promises);
      
      // Combine all successful results
      const allMatches: OddsAPIMatch[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          console.log(`✅ ${SOCCER_SPORTS[index]}: ${result.value.length} matches`);
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
        console.log(`✅ Successfully fetched ${allMatches.length} soccer matches total`);
      }
      
      return allMatches;
    } catch (error) {
      console.error('❌ Error fetching soccer odds:', error);
      
      // Return cached data if available, even if expired
      if (this.cachedData.length > 0) {
        console.log('⚠️ Returning stale cached data due to API error');
        return this.cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Fetch odds for a specific sport
   */
  private async fetchOddsForSport(sportKey: string): Promise<OddsAPIMatch[]> {
    const params = new URLSearchParams({
      apiKey: API_KEY!,
      regions: 'eu,us', // European and US bookmakers (simplified from uk,eu,us)
      markets: 'h2h,totals', // Head-to-head and totals (removed btts - not supported)
      oddsFormat: 'decimal', // Use decimal odds format
      dateFormat: 'iso', // ISO date format
    });

    const url = `${API_BASE_URL}/sports/${sportKey}/odds?${params}`;
    
    console.log(`📡 Fetching ${sportKey}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error for ${sportKey}:`);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Response: ${errorText}`);
      console.error(`   URL: ${url}`);
      
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your .env.local file');
      } else if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait before trying again');
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    // Log remaining requests (useful for monitoring usage)
    const remainingRequests = response.headers.get('x-requests-remaining');
    const usedRequests = response.headers.get('x-requests-used');
    if (remainingRequests) {
      console.log(`📊 API Requests - Used: ${usedRequests}, Remaining: ${remainingRequests}`);
    }

    const data: OddsAPIMatch[] = await response.json();
    console.log(`   ${sportKey}: ${data.length} matches found`);
    
    // Filter matches to only show those in the next 11 days (Dec 20-31)
    const now = new Date();
    const endDate = new Date('2025-12-31T23:59:59Z');
    const filtered = data.filter(match => {
      const matchDate = new Date(match.commence_time);
      return matchDate >= now && matchDate <= endDate;
    });
    
    if (filtered.length < data.length) {
      console.log(`   Filtered to ${filtered.length} matches (Dec 20-31 range)`);
    }
    
    return filtered;
  }

  /**
   * Clear the cache to force a fresh fetch
   */
  clearCache(): void {
    this.cachedData = [];
    this.lastFetchTime = 0;
    console.log('Cache cleared');
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
