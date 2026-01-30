/**
 * Static League Configuration
 * No API calls needed - all league metadata is defined here
 */

export type LeagueCategory = 'domestic' | 'cup' | 'international';

export interface LeagueMetadata {
  key: string;
  name: string;
  category: LeagueCategory;
  country?: string;
  currentSeason: string;
  seasons: string[];
  supportsTeamFilter: boolean;
}

export const LEAGUE_CATEGORIES = [
  { id: 'domestic', label: 'Domestic Leagues', description: 'Top national leagues' },
  { id: 'cup', label: 'Cup Competitions', description: 'Knockout tournaments' },
  { id: 'international', label: 'International Competitions', description: 'European tournaments' },
] as const;

export const LEAGUES_CONFIG: LeagueMetadata[] = [
  // Domestic Leagues
  {
    key: 'soccer_epl',
    name: 'Premier League',
    category: 'domestic',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_spain_la_liga',
    name: 'La Liga',
    category: 'domestic',
    country: 'Spain',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_germany_bundesliga',
    name: 'Bundesliga',
    category: 'domestic',
    country: 'Germany',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_italy_serie_a',
    name: 'Serie A',
    category: 'domestic',
    country: 'Italy',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_france_ligue_one',
    name: 'Ligue 1',
    category: 'domestic',
    country: 'France',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_efl_champ',
    name: 'Championship',
    category: 'domestic',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  // International Competitions
  {
    key: 'soccer_uefa_champs_league',
    name: 'Champions League',
    category: 'international',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: false,
  },
  {
    key: 'soccer_uefa_europa_league',
    name: 'Europa League',
    category: 'international',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: false,
  },
];

// Helper functions
export const getLeaguesByCategory = (category: LeagueCategory) => {
  return LEAGUES_CONFIG.filter(league => league.category === category);
};

export const getLeagueByKey = (key: string) => {
  return LEAGUES_CONFIG.find(league => league.key === key);
};

export const getLeagueByName = (name: string) => {
  return LEAGUES_CONFIG.find(league => league.name === name);
};
