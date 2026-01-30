/**
 * Market Configuration for The Odds API
 * 
 * The Odds API supports various betting markets. Each market has different availability
 * depending on the bookmaker, league, and match timing.
 */

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

export const MARKET_OPTIONS: MarketOption[] = [
  // Main Markets
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
    examples: ['Home -1.5', 'Away +0.5', 'Draw +1.0'],
    category: 'main',
  },
  
  // Goals Markets
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
    description: 'Predict whether both teams will score at least one goal in the match',
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
    description: 'Predict if a specific team will score over/under a certain number of goals',
    icon: '🎯',
    availability: 'limited',
    availabilityNote: 'Limited availability - depends on bookmaker and league',
    examples: ['Home Over 1.5', 'Away Under 0.5'],
    category: 'goals',
  },
  
  // Special Markets
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
    description: 'Cover two of three possible outcomes (Home/Draw, Home/Away, or Draw/Away)',
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
    description: 'Predict the result at halftime and fulltime (e.g., Home/Home, Draw/Away)',
    icon: '⏱️',
    availability: 'rare',
    availabilityNote: 'Very limited - usually only from betting exchanges',
    examples: ['Home/Home', 'Draw/Away', 'Away/Draw'],
    category: 'special',
  },
];

export const MARKET_CATEGORIES = [
  {
    id: 'main',
    label: 'Main Markets',
    description: 'Core betting markets available for all matches',
    icon: '⭐',
  },
  {
    id: 'goals',
    label: 'Goal Markets',
    description: 'Markets focused on goal scoring',
    icon: '⚽',
  },
  {
    id: 'special',
    label: 'Special Markets',
    description: 'Advanced markets with limited availability',
    icon: '🎯',
  },
] as const;

/**
 * Get markets by category
 */
export function getMarketsByCategory(category: 'main' | 'goals' | 'special'): MarketOption[] {
  return MARKET_OPTIONS.filter(market => market.category === category);
}

/**
 * Get market by ID
 */
export function getMarketById(id: string): MarketOption | undefined {
  return MARKET_OPTIONS.find(market => market.id === id);
}

/**
 * Get market API keys from selected IDs
 */
export function getMarketAPIKeys(selectedIds: string[]): string[] {
  return selectedIds
    .map(id => getMarketById(id)?.apiKey)
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
