/**
 * Market Configuration for The Odds API
 *
 * Markets per sport reflect what The Odds API actually provides on the
 * sports/odds v4 endpoint. Availability tiers are conservative estimates
 * based on typical bookmaker coverage.
 */

import { SportType } from './leagueConfig';

export interface MarketOption {
  id: string;
  apiKey: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  availability: 'always' | 'common' | 'limited' | 'rare';
  availabilityNote: string;
  examples: string[];
  category: 'main' | 'goals' | 'special';
}

export interface MarketCategoryOption {
  id: 'main' | 'goals' | 'special';
  label: string;
  description: string;
  icon: string;
}

// ── Category templates ────────────────────────────────────────────────────────

const CAT_MAIN: MarketCategoryOption       = { id: 'main',    label: 'Main Markets',    description: 'Core betting markets',                    icon: '⭐' };
const CAT_GOALS_SOCCER: MarketCategoryOption = { id: 'goals', label: 'Goal Markets',    description: 'Markets focused on goal scoring',         icon: '⚽' };
const CAT_POINTS: MarketCategoryOption     = { id: 'goals',   label: 'Points Markets',  description: 'Markets focused on scoring / totals',     icon: '📊' };
const CAT_RUNS: MarketCategoryOption       = { id: 'goals',   label: 'Run Markets',     description: 'Markets focused on run scoring',          icon: '⚾' };
const CAT_SPECIAL: MarketCategoryOption    = { id: 'special', label: 'Special Markets', description: 'Advanced markets with limited availability', icon: '🎯' };

// ── Football (Soccer) ─────────────────────────────────────────────────────────

const FOOTBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Match Winner (1X2)', shortLabel: 'Match Winner',
    description: 'Predict which team wins, or if the match ends in a draw',
    icon: '🏆', availability: 'always', availabilityNote: 'Available for all matches',
    examples: ['Home Win', 'Draw', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Asian Handicap', shortLabel: 'Handicap',
    description: 'Bet on a team with a goal advantage or disadvantage (e.g., −1.5, +0.5)',
    icon: '⚖️', availability: 'common', availabilityNote: 'Available from most major bookmakers',
    examples: ['Home −1.5', 'Away +0.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Goals', shortLabel: 'Over/Under',
    description: 'Predict if total goals will be over or under the line (typically 2.5)',
    icon: '⚽', availability: 'always', availabilityNote: 'Available for all matches',
    examples: ['Over 2.5', 'Under 2.5'], category: 'goals',
  },
  {
    id: 'btts', apiKey: 'btts',
    label: 'Both Teams To Score (BTTS)', shortLabel: 'BTTS',
    description: 'Predict whether both teams score at least one goal',
    icon: '🎯', availability: 'common', availabilityNote: 'Available from most bookmakers',
    examples: ['Yes', 'No'], category: 'goals',
  },
  {
    id: 'team_totals', apiKey: 'team_totals',
    label: 'Team Goal Totals', shortLabel: 'Team Goals',
    description: 'Predict if a specific team scores over or under a goal line',
    icon: '📊', availability: 'limited', availabilityNote: 'Limited — depends on bookmaker & match',
    examples: ['Home Over 1.5', 'Away Under 0.5'], category: 'goals',
  },
  {
    id: 'draw_no_bet', apiKey: 'draw_no_bet',
    label: 'Draw No Bet', shortLabel: 'DNB',
    description: 'Bet on a team to win; stake refunded if the match ends in a draw',
    icon: '🔄', availability: 'limited', availabilityNote: 'Available from select bookmakers',
    examples: ['Home Win or Refund', 'Away Win or Refund'], category: 'special',
  },
  {
    id: 'double_chance', apiKey: 'double_chance',
    label: 'Double Chance', shortLabel: 'Double Chance',
    description: 'Cover two of the three possible outcomes in a single bet',
    icon: '🎲', availability: 'limited', availabilityNote: 'Available from select bookmakers',
    examples: ['Home or Draw (1X)', 'No Draw (12)', 'Away or Draw (X2)'], category: 'special',
  },
];

// ── Basketball ────────────────────────────────────────────────────────────────

const BASKETBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Game Winner (Moneyline)', shortLabel: 'Moneyline',
    description: 'Predict which team wins the game',
    icon: '🏀', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Point Spread', shortLabel: 'Spread',
    description: 'Bet on a team with a points handicap (e.g., −4.5, +6.5)',
    icon: '⚖️', availability: 'always', availabilityNote: 'Available for most games',
    examples: ['Home −4.5', 'Away +6.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total Points', shortLabel: 'Total Points',
    description: 'Predict if total game points go over or under the line',
    icon: '📈', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Over 215.5', 'Under 215.5'], category: 'goals',
  },
  {
    id: 'team_totals', apiKey: 'team_totals',
    label: 'Team Total Points', shortLabel: 'Team Points',
    description: 'Predict if a specific team scores over or under a points line',
    icon: '🎯', availability: 'common', availabilityNote: 'Available from major bookmakers',
    examples: ['Home Over 108.5', 'Away Under 103.5'], category: 'goals',
  },
];

// ── American Football ─────────────────────────────────────────────────────────

const AMERICANFOOTBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Game Winner (Moneyline)', shortLabel: 'Moneyline',
    description: 'Predict which team wins the game outright',
    icon: '🏈', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Point Spread', shortLabel: 'Spread',
    description: 'Bet on a team against the spread (e.g., −6.5, +3)',
    icon: '⚖️', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home −6.5', 'Away +6.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total Points', shortLabel: 'Total Points',
    description: 'Predict if combined scoring goes over or under the line',
    icon: '📊', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Over 48.5', 'Under 48.5'], category: 'goals',
  },
  {
    id: 'team_totals', apiKey: 'team_totals',
    label: 'Team Total Points', shortLabel: 'Team Points',
    description: 'Predict if a specific team scores over or under a points line',
    icon: '🎯', availability: 'common', availabilityNote: 'Available from major US sportsbooks',
    examples: ['Home Over 24.5', 'Away Under 21.5'], category: 'goals',
  },
];

// ── Baseball ──────────────────────────────────────────────────────────────────

const BASEBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Game Winner (Moneyline)', shortLabel: 'Moneyline',
    description: 'Predict which team wins the game',
    icon: '⚾', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Run Line', shortLabel: 'Run Line',
    description: 'Standard MLB spread — typically Home −1.5 / Away +1.5',
    icon: '⚖️', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home −1.5', 'Away +1.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total Runs', shortLabel: 'Total Runs',
    description: 'Predict if total runs scored go over or under the line',
    icon: '📊', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Over 8.5', 'Under 8.5'], category: 'goals',
  },
  {
    id: 'team_totals', apiKey: 'team_totals',
    label: 'Team Total Runs', shortLabel: 'Team Runs',
    description: 'Predict if a specific team scores over or under a runs line',
    icon: '🎯', availability: 'common', availabilityNote: 'Available from major sportsbooks',
    examples: ['Home Over 4.5', 'Away Under 3.5'], category: 'goals',
  },
];

// ── Ice Hockey ────────────────────────────────────────────────────────────────

const ICEHOCKEY_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Game Winner (Moneyline)', shortLabel: 'Moneyline',
    description: 'Predict which team wins (includes OT/SO result)',
    icon: '🏒', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Puck Line', shortLabel: 'Puck Line',
    description: 'Standard NHL spread — typically Home −1.5 / Away +1.5',
    icon: '⚖️', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Home −1.5', 'Away +1.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total Goals', shortLabel: 'Total Goals',
    description: 'Predict if total goals scored go over or under the line',
    icon: '📊', availability: 'always', availabilityNote: 'Available for all games',
    examples: ['Over 5.5', 'Under 5.5'], category: 'goals',
  },
  {
    id: 'team_totals', apiKey: 'team_totals',
    label: 'Team Total Goals', shortLabel: 'Team Goals',
    description: 'Predict if a specific team scores over or under a goals line',
    icon: '🎯', availability: 'common', availabilityNote: 'Available from major sportsbooks',
    examples: ['Home Over 2.5', 'Away Under 2.5'], category: 'goals',
  },
];

// ── MMA ───────────────────────────────────────────────────────────────────────

const MMA_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Fight Winner (Moneyline)', shortLabel: 'Fight Winner',
    description: 'Predict which fighter wins the bout',
    icon: '🥊', availability: 'always', availabilityNote: 'Available for all events',
    examples: ['Fighter A Win', 'Fighter B Win'], category: 'main',
  },
];

// ── Rugby ─────────────────────────────────────────────────────────────────────

const RUGBY_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Match Winner', shortLabel: 'Winner',
    description: 'Predict which team wins the match',
    icon: '🏉', availability: 'always', availabilityNote: 'Available for all matches',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Handicap', shortLabel: 'Handicap',
    description: 'Bet on a team with a points advantage or disadvantage',
    icon: '⚖️', availability: 'common', availabilityNote: 'Available from most bookmakers',
    examples: ['Home −5.5', 'Away +5.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total Points', shortLabel: 'Total Points',
    description: 'Predict if total match points go over or under the line',
    icon: '📊', availability: 'common', availabilityNote: 'Available from most bookmakers',
    examples: ['Over 39.5', 'Under 39.5'], category: 'goals',
  },
];

// ── Category maps per sport ───────────────────────────────────────────────────

const MARKET_CATEGORIES: Record<SportType, MarketCategoryOption[]> = {
  football:         [CAT_MAIN, CAT_GOALS_SOCCER, CAT_SPECIAL],
  basketball:       [CAT_MAIN, CAT_POINTS,       CAT_SPECIAL],
  americanfootball: [CAT_MAIN, CAT_POINTS,       CAT_SPECIAL],
  baseball:         [CAT_MAIN, CAT_RUNS,         CAT_SPECIAL],
  icehockey:        [CAT_MAIN, CAT_POINTS,       CAT_SPECIAL],
  mma:              [CAT_MAIN, CAT_SPECIAL,      CAT_SPECIAL],
  rugby:            [CAT_MAIN, CAT_POINTS,       CAT_SPECIAL],
};

const MARKET_OPTIONS_BY_SPORT: Record<SportType, MarketOption[]> = {
  football:         FOOTBALL_MARKETS,
  basketball:       BASKETBALL_MARKETS,
  americanfootball: AMERICANFOOTBALL_MARKETS,
  baseball:         BASEBALL_MARKETS,
  icehockey:        ICEHOCKEY_MARKETS,
  mma:              MMA_MARKETS,
  rugby:            RUGBY_MARKETS,
};

// Common multi-sport defaults (when no sport is explicitly selected)
const COMMON_MULTI_SPORT_MARKETS: MarketOption[] = [
  {
    id: 'h2h', apiKey: 'h2h',
    label: 'Match / Game Winner', shortLabel: 'Winner',
    description: 'Predict which team or fighter wins',
    icon: '🏆', availability: 'always', availabilityNote: 'Available for all events',
    examples: ['Home Win', 'Away Win'], category: 'main',
  },
  {
    id: 'spreads', apiKey: 'spreads',
    label: 'Spread / Handicap', shortLabel: 'Spread',
    description: 'Bet on a team with a handicap line',
    icon: '⚖️', availability: 'always', availabilityNote: 'Available for most events',
    examples: ['Home −3.5', 'Away +3.5'], category: 'main',
  },
  {
    id: 'totals', apiKey: 'totals',
    label: 'Over/Under Total', shortLabel: 'Over/Under',
    description: 'Predict if combined scoring goes over or under the line',
    icon: '📊', availability: 'always', availabilityNote: 'Available for most events',
    examples: ['Over 2.5', 'Under 210.5'], category: 'goals',
  },
];

const COMMON_CATEGORIES: MarketCategoryOption[] = [
  { id: 'main',    label: 'Main Markets',    description: 'Core betting markets',         icon: '⭐' },
  { id: 'goals',   label: 'Totals Markets',  description: 'Markets focused on scoring',   icon: '📊' },
  { id: 'special', label: 'Special Markets', description: 'Advanced / prop markets',      icon: '🎯' },
];

// ── Legacy exports (kept for backward compatibility) ──────────────────────────
export const MARKET_OPTIONS    = FOOTBALL_MARKETS;
export const MARKET_CATEGORIES_EXPORT = MARKET_CATEGORIES;

// ── Public API ────────────────────────────────────────────────────────────────

function getAllMarketsBySport(sport: SportType | null): MarketOption[] {
  if (!sport) return COMMON_MULTI_SPORT_MARKETS;
  return MARKET_OPTIONS_BY_SPORT[sport] ?? COMMON_MULTI_SPORT_MARKETS;
}

export function getMarketCategoriesBySport(sport: SportType | null): MarketCategoryOption[] {
  if (!sport) return COMMON_CATEGORIES;
  // Deduplicate categories (mma reuses CAT_SPECIAL twice)
  const cats = MARKET_CATEGORIES[sport] ?? COMMON_CATEGORIES;
  return cats.filter((c, i, arr) => arr.findIndex(x => x.id === c.id && x.label === c.label) === i);
}

export function getDefaultMarketIdsBySport(sport: SportType | null): string[] {
  return getAllMarketsBySport(sport)
    .filter(m => m.id === 'h2h' || m.id === 'totals')
    .map(m => m.id);
}

export function getAvailableMarketIdsBySport(sport: SportType | null): string[] {
  return getAllMarketsBySport(sport).map(m => m.id);
}

export function getMarketsByCategory(
  category: 'main' | 'goals' | 'special',
  sport: SportType | null = null,
): MarketOption[] {
  return getAllMarketsBySport(sport).filter(m => m.category === category);
}

export function getMarketById(id: string, sport: SportType | null = null): MarketOption | undefined {
  return getAllMarketsBySport(sport).find(m => m.id === id);
}

export function getMarketAPIKeys(selectedIds: string[], sport: SportType | null = null): string[] {
  return selectedIds
    .map(id => getMarketById(id, sport)?.apiKey)
    .filter((key): key is string => key !== undefined);
}

export function getAvailabilityColor(availability: MarketOption['availability']): string {
  switch (availability) {
    case 'always':  return 'bg-green-100 text-green-800 border-green-300';
    case 'common':  return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'limited': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'rare':    return 'bg-orange-100 text-orange-800 border-orange-300';
  }
}

export function getAvailabilityLabel(availability: MarketOption['availability']): string {
  switch (availability) {
    case 'always':  return 'Always Available';
    case 'common':  return 'Commonly Available';
    case 'limited': return 'Limited Availability';
    case 'rare':    return 'Rarely Available';
  }
}
