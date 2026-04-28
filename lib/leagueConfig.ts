/**
 * Static League Configuration
 * Supports multiple sports with their respective leagues
 */

export type SportType =
  | 'football'
  | 'basketball'
  | 'americanfootball'
  | 'baseball'
  | 'icehockey'
  | 'mma'
  | 'rugby';

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
  { id: 'football',        label: 'Football',         icon: '⚽', description: 'Soccer leagues worldwide' },
  { id: 'basketball',      label: 'Basketball',       icon: '🏀', description: 'NBA, Euroleague & more' },
  { id: 'americanfootball',label: 'American Football', icon: '🏈', description: 'NFL & college football' },
  { id: 'baseball',        label: 'Baseball',         icon: '⚾', description: 'MLB & international baseball' },
  { id: 'icehockey',       label: 'Ice Hockey',       icon: '🏒', description: 'NHL & international hockey' },
  { id: 'mma',             label: 'MMA / UFC',        icon: '🥊', description: 'Mixed martial arts events' },
  { id: 'rugby',           label: 'Rugby',            icon: '🏉', description: 'Rugby league & union' },
];

export const LEAGUES_CONFIG: LeagueMetadata[] = [
  // ── Football / Soccer ──────────────────────────────────────────────────────
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
  {
    key: 'soccer_germany_bundesliga',
    name: 'Bundesliga',
    sport: 'football',
    country: 'Germany',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_italy_serie_a',
    name: 'Serie A',
    sport: 'football',
    country: 'Italy',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_france_ligue_one',
    name: 'Ligue 1',
    sport: 'football',
    country: 'France',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_uefa_champs_league',
    name: 'Champions League',
    sport: 'football',
    country: 'Europe',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_uefa_europa_league',
    name: 'Europa League',
    sport: 'football',
    country: 'Europe',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_efl_champ',
    name: 'Championship',
    sport: 'football',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_england_league1',
    name: 'League One',
    sport: 'football',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_england_league2',
    name: 'League Two',
    sport: 'football',
    country: 'England',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_netherlands_eredivisie',
    name: 'Eredivisie',
    sport: 'football',
    country: 'Netherlands',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_portugal_primeira_liga',
    name: 'Primeira Liga',
    sport: 'football',
    country: 'Portugal',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_scotland_premiership',
    name: 'Scottish Premiership',
    sport: 'football',
    country: 'Scotland',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_turkey_super_league',
    name: 'Süper Lig',
    sport: 'football',
    country: 'Turkey',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_belgium_first_div',
    name: 'First Division A',
    sport: 'football',
    country: 'Belgium',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_australia_aleague',
    name: 'A-League',
    sport: 'football',
    country: 'Australia',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_brazil_campeonato',
    name: 'Brasileirão Série A',
    sport: 'football',
    country: 'Brazil',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_mexico_ligamx',
    name: 'Liga MX',
    sport: 'football',
    country: 'Mexico',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_usa_mls',
    name: 'MLS',
    sport: 'football',
    country: 'USA',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },
  {
    key: 'soccer_argentina_primera_division',
    name: 'Primera División',
    sport: 'football',
    country: 'Argentina',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },

  // ── Basketball ─────────────────────────────────────────────────────────────
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
  {
    key: 'basketball_nbl',
    name: 'NBL',
    sport: 'basketball',
    country: 'Australia',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },

  // ── American Football ──────────────────────────────────────────────────────
  {
    key: 'americanfootball_nfl',
    name: 'NFL',
    sport: 'americanfootball',
    country: 'USA',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },
  {
    key: 'americanfootball_ncaaf',
    name: 'NCAAF',
    sport: 'americanfootball',
    country: 'USA',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },

  // ── Baseball ───────────────────────────────────────────────────────────────
  {
    key: 'baseball_mlb',
    name: 'MLB',
    sport: 'baseball',
    country: 'USA',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },

  // ── Ice Hockey ─────────────────────────────────────────────────────────────
  {
    key: 'icehockey_nhl',
    name: 'NHL',
    sport: 'icehockey',
    country: 'USA/Canada',
    currentSeason: '2025/26',
    seasons: ['2025/26', '2024/25', '2023/24'],
    supportsTeamFilter: true,
  },

  // ── MMA ────────────────────────────────────────────────────────────────────
  {
    key: 'mma_mixed_martial_arts',
    name: 'MMA / UFC',
    sport: 'mma',
    country: 'International',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: false,
  },

  // ── Rugby ──────────────────────────────────────────────────────────────────
  {
    key: 'rugbyleague_nrl',
    name: 'NRL',
    sport: 'rugby',
    country: 'Australia',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },
  {
    key: 'rugbyunion_super_rugby',
    name: 'Super Rugby',
    sport: 'rugby',
    country: 'International',
    currentSeason: '2025',
    seasons: ['2025', '2024', '2023'],
    supportsTeamFilter: true,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

export const getLeaguesBySport = (sport: SportType) =>
  LEAGUES_CONFIG.filter(league => league.sport === sport);

export const getAllLeagues = () => LEAGUES_CONFIG;

export const getLeagueByKey = (key: string) =>
  LEAGUES_CONFIG.find(league => league.key === key);

export const getLeagueByName = (name: string) =>
  LEAGUES_CONFIG.find(league => league.name === name);

export const getSportById = (id: SportType) =>
  SPORTS.find(sport => sport.id === id);
