/**
 * Bookmaker Configuration for The Odds API
 * 
 * The Odds API provides odds from various bookmakers across different regions.
 * You can filter by specific bookmakers or use regional groups.
 */

export interface BookmakerOption {
  key: string; // The key used in The Odds API
  title: string;
  region: 'uk' | 'eu' | 'us' | 'au';
  description: string;
  availability: 'high' | 'medium' | 'low';
  markets: string[]; // Markets typically offered
  logo?: string;
}

export interface RegionOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  bookmakerKeys: string[]; // API region parameter value
}

// Popular bookmakers available on The Odds API
export const BOOKMAKERS: BookmakerOption[] = [
  // UK Bookmakers
  {
    key: 'bet365',
    title: 'Bet365',
    region: 'uk',
    description: 'One of the world\'s leading online gambling groups',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'team_totals'],
  },
  {
    key: 'williamhill',
    title: 'William Hill',
    region: 'uk',
    description: 'Historic UK bookmaker with comprehensive markets',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'ladbrokes',
    title: 'Ladbrokes',
    region: 'uk',
    description: 'Major UK bookmaker with competitive odds',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'coral',
    title: 'Coral',
    region: 'uk',
    description: 'Well-established UK betting brand',
    availability: 'medium',
    markets: ['h2h', 'totals', 'btts'],
  },
  {
    key: 'skybet',
    title: 'Sky Bet',
    region: 'uk',
    description: 'Popular UK bookmaker with Sky Sports integration',
    availability: 'medium',
    markets: ['h2h', 'totals'],
  },
  
  // European Bookmakers
  {
    key: 'unibet_eu',
    title: 'Unibet',
    region: 'eu',
    description: 'Leading European online bookmaker',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'betfair',
    title: 'Betfair Exchange',
    region: 'eu',
    description: 'World\'s largest betting exchange with best prices',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'matchbook',
    title: 'Matchbook',
    region: 'eu',
    description: 'Low commission betting exchange',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'pinnacle',
    title: 'Pinnacle',
    region: 'eu',
    description: 'Sharp bookmaker known for high limits and best odds',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'sport888',
    title: '888sport',
    region: 'eu',
    description: 'Trusted European online bookmaker',
    availability: 'medium',
    markets: ['h2h', 'totals'],
  },
  
  // US Bookmakers
  {
    key: 'draftkings',
    title: 'DraftKings',
    region: 'us',
    description: 'Leading US sportsbook with extensive coverage',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'fanduel',
    title: 'FanDuel',
    region: 'us',
    description: 'Major US sportsbook with competitive lines',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'betmgm',
    title: 'BetMGM',
    region: 'us',
    description: 'MGM Resorts-backed US sportsbook',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'pointsbet',
    title: 'PointsBet',
    region: 'us',
    description: 'Innovative US sportsbook with unique bet types',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'wynnbet',
    title: 'WynnBET',
    region: 'us',
    description: 'Wynn Resorts-branded sportsbook',
    availability: 'medium',
    markets: ['h2h', 'totals'],
  },
  
  // Australian Bookmakers
  {
    key: 'tab',
    title: 'TAB',
    region: 'au',
    description: 'Australia\'s leading betting operator',
    availability: 'high',
    markets: ['h2h', 'totals'],
  },
  {
    key: 'sportsbet',
    title: 'Sportsbet',
    region: 'au',
    description: 'Australia\'s most popular online bookmaker',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'unibet',
    title: 'Unibet AU',
    region: 'au',
    description: 'Unibet\'s Australian operation',
    availability: 'medium',
    markets: ['h2h', 'totals'],
  },
];

// Regional groupings for easier selection
export const REGIONS: RegionOption[] = [
  {
    id: 'uk',
    label: 'United Kingdom',
    description: 'UK bookmakers (Bet365, William Hill, Ladbrokes, etc.)',
    icon: '🇬🇧',
    bookmakerKeys: ['uk'],
  },
  {
    id: 'eu',
    label: 'Europe',
    description: 'European bookmakers (Betfair, Pinnacle, Unibet, etc.)',
    icon: '🇪🇺',
    bookmakerKeys: ['eu'],
  },
  {
    id: 'us',
    label: 'United States',
    description: 'US sportsbooks (DraftKings, FanDuel, BetMGM, etc.)',
    icon: '🇺🇸',
    bookmakerKeys: ['us'],
  },
  {
    id: 'au',
    label: 'Australia',
    description: 'Australian bookmakers (TAB, Sportsbet, etc.)',
    icon: '🇦🇺',
    bookmakerKeys: ['au'],
  },
  {
    id: 'all',
    label: 'All Regions',
    description: 'Get odds from bookmakers worldwide',
    icon: '🌍',
    bookmakerKeys: ['uk', 'eu', 'us', 'au'],
  },
];

/**
 * Get bookmakers by region
 */
export function getBookmakersByRegion(region: 'uk' | 'eu' | 'us' | 'au' | 'all'): BookmakerOption[] {
  if (region === 'all') {
    return BOOKMAKERS;
  }
  return BOOKMAKERS.filter(bm => bm.region === region);
}

/**
 * Get bookmaker by key
 */
export function getBookmakerByKey(key: string): BookmakerOption | undefined {
  return BOOKMAKERS.find(bm => bm.key === key);
}

/**
 * Get region by ID
 */
export function getRegionById(id: string): RegionOption | undefined {
  return REGIONS.find(r => r.id === id);
}

/**
 * Convert bookmaker keys to API regions parameter
 */
export function getAPIRegionsParam(bookmakerKeys: string[]): string {
  // If specific bookmaker keys are provided, we need to use all regions
  // and filter on the frontend, or use the bookmakers parameter instead
  if (bookmakerKeys.length === 0) {
    return 'uk,eu,us,au'; // Default: all regions
  }
  
  // Get unique regions from selected bookmakers
  const regions = new Set<string>();
  bookmakerKeys.forEach(key => {
    const bookmaker = getBookmakerByKey(key);
    if (bookmaker) {
      regions.add(bookmaker.region);
    }
  });
  
  return Array.from(regions).join(',');
}

/**
 * Convert region IDs to API regions parameter
 */
export function convertRegionsToAPIParam(regionIds: string[]): string {
  if (regionIds.length === 0 || regionIds.includes('all')) {
    return 'uk,eu,us,au';
  }
  
  return regionIds.join(',');
}

/**
 * Get availability badge color
 */
export function getBookmakerAvailabilityColor(availability: BookmakerOption['availability']): string {
  switch (availability) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'medium':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'low':
      return 'bg-amber-100 text-amber-800 border-amber-300';
  }
}

/**
 * Get availability label
 */
export function getBookmakerAvailabilityLabel(availability: BookmakerOption['availability']): string {
  switch (availability) {
    case 'high':
      return 'Highly Available';
    case 'medium':
      return 'Commonly Available';
    case 'low':
      return 'Limited Availability';
  }
}

/**
 * Get region flag emoji
 */
export function getRegionFlag(region: string): string {
  const regionMap: Record<string, string> = {
    uk: '🇬🇧',
    eu: '🇪🇺',
    us: '🇺🇸',
    au: '🇦🇺',
    all: '🌍',
  };
  return regionMap[region] || '🌍';
}
