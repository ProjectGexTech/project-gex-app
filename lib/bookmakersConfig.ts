/**
 * Bookmaker Configuration for The Odds API
 *
 * The `markets` array reflects what each bookmaker typically provides on the
 * Odds API v4 sports/odds endpoint. Availability tiers are conservative.
 */

export interface BookmakerOption {
  key: string;
  title: string;
  region: 'uk' | 'eu' | 'us' | 'au';
  description: string;
  availability: 'high' | 'medium' | 'low';
  markets: string[];
  logo?: string;
}

export interface RegionOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  bookmakerKeys: string[];
}

export const BOOKMAKERS: BookmakerOption[] = [
  // ── UK ─────────────────────────────────────────────────────────────────────
  {
    key: 'bet365',
    title: 'Bet365',
    region: 'uk',
    description: "One of the world's leading online gambling groups",
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'team_totals', 'draw_no_bet', 'double_chance'],
  },
  {
    key: 'williamhill',
    title: 'William Hill',
    region: 'uk',
    description: 'Historic UK bookmaker with comprehensive markets',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet', 'double_chance'],
  },
  {
    key: 'ladbrokes_uk',
    title: 'Ladbrokes',
    region: 'uk',
    description: 'Major UK bookmaker with competitive odds',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet'],
  },
  {
    key: 'coral',
    title: 'Coral',
    region: 'uk',
    description: 'Well-established UK betting brand',
    availability: 'medium',
    markets: ['h2h', 'totals', 'btts', 'draw_no_bet'],
  },
  {
    key: 'skybet',
    title: 'Sky Bet',
    region: 'uk',
    description: 'Popular UK bookmaker with Sky Sports integration',
    availability: 'medium',
    markets: ['h2h', 'totals', 'btts'],
  },
  {
    key: 'paddypower',
    title: 'Paddy Power',
    region: 'uk',
    description: 'Irish-UK bookmaker known for competitive soccer markets',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet', 'double_chance'],
  },
  {
    key: 'betfair_ex_uk',
    title: 'Betfair Exchange (UK)',
    region: 'uk',
    description: "World's largest betting exchange — best available prices",
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'virginbet',
    title: 'Virgin Bet',
    region: 'uk',
    description: 'UK bookmaker backed by Virgin Group',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'livescorebet',
    title: 'LiveScore Bet',
    region: 'uk',
    description: 'Bookmaker integrated with LiveScore platform',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  // ── EU ─────────────────────────────────────────────────────────────────────
  {
    key: 'unibet_eu',
    title: 'Unibet',
    region: 'eu',
    description: 'Leading European online bookmaker',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts', 'draw_no_bet', 'double_chance'],
  },
  {
    key: 'betfair_ex_eu',
    title: 'Betfair Exchange (EU)',
    region: 'eu',
    description: 'EU-facing Betfair exchange',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'pinnacle',
    title: 'Pinnacle',
    region: 'eu',
    description: 'Sharp bookmaker — highest limits, best closing lines',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'leovegas',
    title: 'LeoVegas',
    region: 'eu',
    description: 'Mobile-first EU bookmaker',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'betsson',
    title: 'Betsson',
    region: 'eu',
    description: 'Swedish-origin bookmaker with broad EU coverage',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'nordicbet',
    title: 'Nordic Bet',
    region: 'eu',
    description: 'Scandinavian sportsbook',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'coolbet',
    title: 'Coolbet',
    region: 'eu',
    description: 'Baltic-region sportsbook',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'casumo',
    title: 'Casumo',
    region: 'eu',
    description: 'EU casino and sportsbook brand',
    availability: 'medium',
    markets: ['h2h', 'totals', 'btts'],
  },
  {
    key: 'unibet_se',
    title: 'Unibet (SE)',
    region: 'eu',
    description: 'Swedish-licensed Unibet',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'leovegas_se',
    title: 'LeoVegas (SE)',
    region: 'eu',
    description: 'Swedish-licensed LeoVegas',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'unibet_nl',
    title: 'Unibet (NL)',
    region: 'eu',
    description: 'Netherlands-licensed Unibet',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals', 'btts'],
  },
  {
    key: 'pmu_fr',
    title: 'PMU (FR)',
    region: 'eu',
    description: 'French state-backed pari-mutuel operator',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'grosvenor',
    title: 'Grosvenor',
    region: 'eu',
    description: 'UK/EU casino-backed sportsbook',
    availability: 'medium',
    markets: ['h2h', 'totals'],
  },
  // ── US ─────────────────────────────────────────────────────────────────────
  {
    key: 'draftkings',
    title: 'DraftKings',
    region: 'us',
    description: 'Leading US sportsbook with extensive market coverage',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'fanduel',
    title: 'FanDuel',
    region: 'us',
    description: 'Major US sportsbook with competitive lines',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'betmgm',
    title: 'BetMGM',
    region: 'us',
    description: 'MGM Resorts-backed US sportsbook',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'caesars',
    title: 'Caesars',
    region: 'us',
    description: 'Caesars Entertainment-backed US sportsbook',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'betonlineag',
    title: 'BetOnline.ag',
    region: 'us',
    description: 'International sportsbook widely used in the US',
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'pointsbetus',
    title: 'PointsBet',
    region: 'us',
    description: 'Innovative US sportsbook',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  // ── AU ─────────────────────────────────────────────────────────────────────
  {
    key: 'tab',
    title: 'TAB',
    region: 'au',
    description: "Australia's leading betting operator",
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'sportsbet',
    title: 'Sportsbet',
    region: 'au',
    description: "Australia's most popular online bookmaker",
    availability: 'high',
    markets: ['h2h', 'spreads', 'totals', 'team_totals'],
  },
  {
    key: 'unibet',
    title: 'Unibet AU',
    region: 'au',
    description: "Unibet's Australian operation",
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
  {
    key: 'neds',
    title: 'Neds',
    region: 'au',
    description: 'Australian bookmaker with competitive racing & sports',
    availability: 'medium',
    markets: ['h2h', 'spreads', 'totals'],
  },
];

export const REGIONS: RegionOption[] = [
  { id: 'uk',  label: 'United Kingdom', description: 'UK bookmakers (Bet365, Sky Bet, Paddy Power, etc.)',    icon: '🇬🇧', bookmakerKeys: ['uk'] },
  { id: 'eu',  label: 'Europe',         description: 'European bookmakers (Pinnacle, Betfair, Unibet, etc.)', icon: '🇪🇺', bookmakerKeys: ['eu'] },
  { id: 'us',  label: 'United States',  description: 'US sportsbooks (DraftKings, FanDuel, BetMGM, etc.)',   icon: '🇺🇸', bookmakerKeys: ['us'] },
  { id: 'au',  label: 'Australia',      description: 'Australian bookmakers (TAB, Sportsbet, etc.)',          icon: '🇦🇺', bookmakerKeys: ['au'] },
  { id: 'all', label: 'All Regions',    description: 'Odds from bookmakers worldwide',                        icon: '🌍', bookmakerKeys: ['uk', 'eu', 'us', 'au'] },
];

export function getBookmakersByRegion(region: 'uk' | 'eu' | 'us' | 'au' | 'all'): BookmakerOption[] {
  if (region === 'all') return BOOKMAKERS;
  return BOOKMAKERS.filter(bm => bm.region === region);
}

export function getBookmakerByKey(key: string): BookmakerOption | undefined {
  return BOOKMAKERS.find(bm => bm.key === key);
}

export function getRegionById(id: string): RegionOption | undefined {
  return REGIONS.find(r => r.id === id);
}

export function getAPIRegionsParam(bookmakerKeys: string[]): string {
  if (bookmakerKeys.length === 0) return 'uk,eu,us,au';
  const regions = new Set<string>();
  bookmakerKeys.forEach(key => {
    const bm = getBookmakerByKey(key);
    if (bm) regions.add(bm.region);
  });
  return Array.from(regions).join(',');
}

export function convertRegionsToAPIParam(regionIds: string[]): string {
  if (regionIds.length === 0 || regionIds.includes('all')) return 'uk,eu,us,au';
  return regionIds.join(',');
}

export function getBookmakerAvailabilityColor(availability: BookmakerOption['availability']): string {
  switch (availability) {
    case 'high':   return 'bg-green-100 text-green-800 border-green-300';
    case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'low':    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
}

export function getBookmakerAvailabilityLabel(availability: BookmakerOption['availability']): string {
  switch (availability) {
    case 'high':   return 'Highly Available';
    case 'medium': return 'Commonly Available';
    case 'low':    return 'Limited Availability';
  }
}

export function getRegionFlag(region: string): string {
  const map: Record<string, string> = { uk: '🇬🇧', eu: '🇪🇺', us: '🇺🇸', au: '🇦🇺', all: '🌍' };
  return map[region] ?? '🌍';
}
