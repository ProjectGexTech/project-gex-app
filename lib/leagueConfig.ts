/**
 * Static League Configuration
 * Supports multiple sports with their respective leagues
 */

export type SportType = 'football' | 'basketball';

export interface LeagueMetadata {
  key: string;
  name: string;
  sport: SportType;
  country?: string;
  currentSeason: string;
  seasons: string[];
  supportsTeamFilter: boolean;
}

export interface SportMetadata {
  id: SportType;
  label: string;
  icon: string;
  description: string;
}

export const SPORTS: SportMetadata[] = [
  { id: 'football', label: 'Football', icon: '⚽', description: 'Soccer leagues worldwide' },
  { id: 'basketball', label: 'Basketball', icon: '🏀', description: 'Professional basketball leagues' },
];

export const LEAGUES_CONFIG: LeagueMetadata[] = [
  // Football Leagues
  {
    key: 'soccer_epl',
    name: 'Premier League',
    sport: 'football',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_spain_la_liga',
    name: 'La Liga',
    sport: 'football',
    country: 'Spain',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  
  // Basketball Leagues
  {
    key: 'basketball_nba',
    name: 'NBA',
    sport: 'basketball',
    country: 'USA',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'basketball_ncaab',
    name: 'NCAA Basketball',
    sport: 'basketball',
    country: 'USA',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'basketball_euroleague',
    name: 'Euroleague',
    sport: 'basketball',
    country: 'Europe',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'basketball_wnba',
    name: 'WNBA',
    sport: 'basketball',
    country: 'USA',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },
];

// Helper functions
export const getLeaguesBySport = (sport: SportType) => {
  return LEAGUES_CONFIG.filter(league => league.sport === sport);
};

export const getAllLeagues = () => {
  return LEAGUES_CONFIG;
};

export const getLeagueByKey = (key: string) => {
  return LEAGUES_CONFIG.find(league => league.key === key);
};

export const getLeagueByName = (name: string) => {
  return LEAGUES_CONFIG.find(league => league.name === name);
};

export const getSportById = (id: SportType) => {
  return SPORTS.find(sport => sport.id === id);
};
