/**
 * Market Configuration for The Odds API
 * 
 * The Odds API supports various betting markets. Each market has different availability
 * depending on the bookmaker, league, and match timing.
 */

import { SportType } from './leagueConfig';

export interface MarketOption {
  id: string;
  apiKey: string; // The key used in The Odds API
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

const COMMON_MARKET_CATEGORIES: MarketCategoryOption[] = [
  {
    id: 'main',
    label: 'Main Markets',
    description: 'Core betting markets available for all matches',
    icon: '⭐',
  },
  {
    id: 'goals',
    label: 'Totals Markets',
    description: 'Markets focused on total team scoring',
    icon: '⚽',
  },
  {
    id: 'special',
    label: 'Special Markets',
    description: 'Advanced markets with limited availability',
    icon: '🎯',
  },
] as const;

const FOOTBALL_MARKET_CATEGORIES: MarketCategoryOption[] = [
  COMMON_MARKET_CATEGORIES[0],
  {
    id: 'goals',
    label: 'Goal Markets',
    description: 'Markets focused on goal scoring',
    icon: '⚽',
  },
  COMMON_MARKET_CATEGORIES[2],
];

const BASKETBALL_MARKET_CATEGORIES: MarketCategoryOption[] = [
  COMMON_MARKET_CATEGORIES[0],
  {
    id: 'goals',
    label: 'Points Markets',
    description: 'Markets focused on team and game points',
    icon: '🏀',
  },
  COMMON_MARKET_CATEGORIES[2],
];

const COMMON_MULTI_SPORT_MARKETS: MarketOption[] = [
  {
    id: 'h2h',
    apiKey: 'h2h',
    label: 'Match Winner (Moneyline)',
    shortLabel: 'Winner',
    description: 'Predict which team wins the match',
    icon: '🏆',
    availability: 'always',
    availabilityNote: 'Available for all matches',
    examples: ['Home Win', 'Away Win'],
    category: 'main',
  },
  {
    id: 'spreads',
    apiKey: 'spreads',
    label: 'Point Spread',
    shortLabel: 'Spread',
    description: 'Bet on a team with a handicap line (e.g., -3.5, +5.5)',
    icon: '⚖️',
    availability: 'always',
    availabilityNote: 'Available for most matches',
    examples: ['Home -3.5', 'Away +5.5'],
    category: 'main',
  },
  {
    id: 'totals',
    apiKey: 'totals',
    label: 'Over/Under Total',
    shortLabel: 'Over/Under',
    description: 'Predict if the total match score is over or under a line',
    icon: '📊',
    availability: 'always',
    availabilityNote: 'Available for all matches',
    examples: ['Over 2.5 / 210.5', 'Under 2.5 / 210.5'],
    category: 'goals',
  },
];

const FOOTBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h',
    apiKey: 'h2h',
    label: 'Match Winner (1X2)',
    shortLabel: 'Match Winner',
    description: 'Predict which team will win the match, or if it will end in a draw',
    icon: '🏆',
    availability: 'always',
    availabilityNote: 'Available for all matches',
    examples: ['Home Win', 'Draw', 'Away Win'],
    category: 'main',
  },
  {
    id: 'spreads',
    apiKey: 'spreads',
    label: 'Asian Handicap',
    shortLabel: 'Handicap',
    description: 'Bet on a team with a goal advantage or disadvantage (e.g., -1.5, +0.5)',
    icon: '⚖️',
    availability: 'common',
    availabilityNote: 'Available for most matches from major bookmakers',
    examples: ['Home -1.5', 'Away +0.5'],
    category: 'main',
  },
  {
    id: 'totals',
    apiKey: 'totals',
    label: 'Over/Under Goals',
    shortLabel: 'Over/Under',
    description: 'Predict if total goals will be over or under a specific number (usually 2.5)',
    icon: '⚽',
    availability: 'always',
    availabilityNote: 'Available for all matches',
    examples: ['Over 2.5', 'Under 2.5', 'Over 3.5'],
    category: 'goals',
  },
  {
    id: 'btts',
    apiKey: 'btts',
    label: 'Both Teams To Score (BTTS)',
    shortLabel: 'BTTS',
    description: 'Predict whether both teams score at least one goal in the match',
    icon: '⚽⚽',
    availability: 'common',
    availabilityNote: 'Available for most matches from selected bookmakers',
    examples: ['Yes', 'No'],
    category: 'goals',
  },
  {
    id: 'team_totals',
    apiKey: 'team_totals',
    label: 'Team Total Goals',
    shortLabel: 'Team Goals',
    description: 'Predict if a specific team scores over/under a goal line',
    icon: '🎯',
    availability: 'limited',
    availabilityNote: 'Limited availability - depends on bookmaker and league',
    examples: ['Home Over 1.5', 'Away Under 0.5'],
    category: 'goals',
  },
  {
    id: 'draw_no_bet',
    apiKey: 'draw_no_bet',
    label: 'Draw No Bet',
    shortLabel: 'DNB',
    description: 'Bet on a team to win. If the match is a draw, your stake is refunded',
    icon: '🔄',
    availability: 'limited',
    availabilityNote: 'Available from select bookmakers',
    examples: ['Home Win or Refund', 'Away Win or Refund'],
    category: 'special',
  },
  {
    id: 'double_chance',
    apiKey: 'double_chance',
    label: 'Double Chance',
    shortLabel: 'Double Chance',
    description: 'Cover two possible outcomes (Home/Draw, Home/Away, or Draw/Away)',
    icon: '🎲',
    availability: 'rare',
    availabilityNote: 'Rarely available - check per match',
    examples: ['Home or Draw', 'Home or Away', 'Draw or Away'],
    category: 'special',
  },
  {
    id: 'halftime_fulltime',
    apiKey: 'h2h_lay',
    label: 'Halftime/Fulltime Result',
    shortLabel: 'HT/FT',
    description: 'Predict the result at halftime and fulltime',
    icon: '⏱️',
    availability: 'rare',
    availabilityNote: 'Very limited - usually only from betting exchanges',
    examples: ['Home/Home', 'Draw/Away', 'Away/Draw'],
    category: 'special',
  },
];

const BASKETBALL_MARKETS: MarketOption[] = [
  {
    id: 'h2h',
    apiKey: 'h2h',
    label: 'Game Winner (Moneyline)',
    shortLabel: 'Moneyline',
    description: 'Predict which team will win the game',
    icon: '🏀',
    availability: 'always',
    availabilityNote: 'Available for all games',
    examples: ['Home Win', 'Away Win'],
    category: 'main',
  },
  {
    id: 'spreads',
    apiKey: 'spreads',
    label: 'Point Spread',
    shortLabel: 'Spread',
    description: 'Bet on a team with points handicap (e.g., -4.5, +6.5)',
    icon: '⚖️',
    availability: 'always',
    availabilityNote: 'Available for most games',
    examples: ['Home -4.5', 'Away +6.5'],
    category: 'main',
  },
  {
    id: 'totals',
    apiKey: 'totals',
    label: 'Over/Under Points',
    shortLabel: 'Total Points',
    description: 'Predict if total game points go over or under the line',
    icon: '📈',
    availability: 'always',
    availabilityNote: 'Available for all games',
    examples: ['Over 215.5', 'Under 215.5'],
    category: 'goals',
  },
  {
    id: 'team_totals',
    apiKey: 'team_totals',
    label: 'Team Total Points',
    shortLabel: 'Team Points',
    description: 'Predict if a specific team scores over/under a points line',
    icon: '🎯',
    availability: 'common',
    availabilityNote: 'Available for many games from major bookmakers',
    examples: ['Home Over 108.5', 'Away Under 103.5'],
    category: 'goals',
  },
];

const MARKET_OPTIONS_BY_SPORT: Record<SportType, MarketOption[]> = {
  football: FOOTBALL_MARKETS,
  basketball: BASKETBALL_MARKETS,
};

const MARKET_CATEGORIES_BY_SPORT: Record<SportType, MarketCategoryOption[]> = {
  football: FOOTBALL_MARKET_CATEGORIES,
  basketball: BASKETBALL_MARKET_CATEGORIES,
};

export const MARKET_OPTIONS = FOOTBALL_MARKETS;
export const MARKET_CATEGORIES = FOOTBALL_MARKET_CATEGORIES;

function getAllMarketsBySport(sport: SportType | null): MarketOption[] {
  if (!sport) {
    return COMMON_MULTI_SPORT_MARKETS;
  }
  return MARKET_OPTIONS_BY_SPORT[sport];
}

export function getMarketCategoriesBySport(sport: SportType | null): MarketCategoryOption[] {
  if (!sport) {
    return COMMON_MARKET_CATEGORIES;
  }
  return MARKET_CATEGORIES_BY_SPORT[sport];
}

export function getDefaultMarketIdsBySport(sport: SportType | null): string[] {
  const allMarkets = getAllMarketsBySport(sport);
  return allMarkets.filter(market => market.id === 'h2h' || market.id === 'totals').map(market => market.id);
}

export function getAvailableMarketIdsBySport(sport: SportType | null): string[] {
  return getAllMarketsBySport(sport).map(market => market.id);
}

/**
 * Get markets by category
 */
export function getMarketsByCategory(
  category: 'main' | 'goals' | 'special',
  sport: SportType | null = null
): MarketOption[] {
  return getAllMarketsBySport(sport).filter(market => market.category === category);
}

/**
 * Get market by ID
 */
export function getMarketById(id: string, sport: SportType | null = null): MarketOption | undefined {
  return getAllMarketsBySport(sport).find(market => market.id === id);
}

/**
 * Get market API keys from selected IDs
 */
export function getMarketAPIKeys(selectedIds: string[], sport: SportType | null = null): string[] {
  return selectedIds
    .map(id => getMarketById(id, sport)?.apiKey)
    .filter((key): key is string => key !== undefined);
}

/**
 * Get availability badge color
 */
export function getAvailabilityColor(availability: MarketOption['availability']): string {
  switch (availability) {
    case 'always':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'common':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'limited':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'rare':
      return 'bg-orange-100 text-orange-800 border-orange-300';
  }
}

/**
 * Get availability label
 */
export function getAvailabilityLabel(availability: MarketOption['availability']): string {
  switch (availability) {
    case 'always':
      return 'Always Available';
    case 'common':
      return 'Commonly Available';
    case 'limited':
      return 'Limited Availability';
    case 'rare':
      return 'Rarely Available';
  }
}
