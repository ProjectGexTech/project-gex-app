// API-Football Integration for Team Stats and Head-to-Head Data
// Documentation: https://www.api-football.com/documentation-v3
//
// Nothing here is ever invented: when data can't be fetched, callers get null / []
// and the reason is recorded with getDataSource() so the UI can say why.

import { DataSource } from './types';
import { useAPIKeysStore } from './apiKeysStore';
import { getLeagueByKey } from './leagueConfig';

// Get API key from store instead of hardcoded value
const getAPIKey = () => {
  return useAPIKeysStore.getState().footballApiKey;
};

export interface APIFootballTeamStats {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  form: string; // Season form, oldest → newest, e.g. "WWDLW"
  fixtures: {
    played: {
      home: number;
      away: number;
      total: number;
    };
    wins: {
      home: number;
      away: number;
      total: number;
    };
    draws: {
      home: number;
      away: number;
      total: number;
    };
    loses: {
      home: number;
      away: number;
      total: number;
    };
  };
  goals: {
    for: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
    against: {
      total: {
        home: number;
        away: number;
        total: number;
      };
      average: {
        home: string;
        away: string;
        total: string;
      };
    };
  };
}

export interface APIFootballH2H {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
      city: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    fulltime: {
      home: number;
      away: number;
    };
  };
}

const API_BASE_URL = 'https://v3.football.api-sports.io';

/**
 * API-Football season year for a match: the year the season started.
 * August-to-May leagues roll over in July; calendar-year leagues (MLS) use the match year.
 */
function getSeasonYear(matchDate: Date, calendarYearSeason?: boolean): number {
  const year = matchDate.getUTCFullYear();
  if (calendarYearSeason) return year;
  return matchDate.getUTCMonth() >= 6 ? year : year - 1;
}

/**
 * API-Football reports plan limits, bad keys and quota errors with HTTP 200 and an
 * `errors` field (an array or an object), so this must be checked on every response.
 */
function getAPIErrorMessage(data: any): string | null {
  const errors = data?.errors;
  if (!errors) return null;
  const messages = Array.isArray(errors) ? errors : Object.values(errors);
  return messages.length > 0 ? `API-Football: ${messages.join('; ')}` : null;
}

// API-Football requires authentication with x-apisports-key header
// Using real API calls with user-provided API key

export class FootballStatsService {
  private static instance: FootballStatsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private dataSourceCache: Map<string, { source: DataSource; reason?: string }> = new Map();
  private teamIdCache: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  private constructor() {}

  static getInstance(): FootballStatsService {
    if (!FootballStatsService.instance) {
      FootballStatsService.instance = new FootballStatsService();
    }
    return FootballStatsService.instance;
  }

  /**
   * Search for team ID by team name using API-Football
   */
  private async findTeamId(teamName: string): Promise<number | null> {
    // Check cache first
    const cached = this.teamIdCache.get(teamName);
    if (cached) {
      return cached;
    }

    const API_KEY = getAPIKey();
    if (!API_KEY) {
      return null;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/teams?search=${encodeURIComponent(teamName)}`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        console.error(`Team search: API returned status ${response.status} for "${teamName}"`);
        return null;
      }

      const data = await response.json();
      const apiError = getAPIErrorMessage(data);
      if (apiError) {
        console.error(`Team search for "${teamName}": ${apiError}`);
        return null;
      }

      if (data.response && data.response.length > 0) {
        // Get the first match (most relevant)
        const teamId = data.response[0].team.id;
        this.teamIdCache.set(teamName, teamId);
        return teamId;
      }

      console.warn(`Team search: No results found for "${teamName}" on API-Football`);
      return null;
    } catch (error) {
      console.error(`Team search: Error looking up "${teamName}":`, error);
      return null;
    }
  }

  /** Team ID found by an earlier lookup, to match API-Football fixtures to our team names */
  getKnownTeamId(teamName: string): number | undefined {
    return this.teamIdCache.get(teamName);
  }

  /**
   * Fetch a team's statistics for the season the match belongs to.
   * Returns null when unavailable; the reason is recorded under `stats_<teamName>`.
   */
  async fetchTeamStats(
    teamName: string,
    sportKey: string | undefined,
    matchDate: Date
  ): Promise<APIFootballTeamStats | null> {
    const cacheKey = `stats_${teamName}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const unavailable = (reason: string) => {
      this.dataSourceCache.set(cacheKey, { source: 'unavailable', reason });
      return null;
    };

    const league = sportKey ? getLeagueByKey(sportKey) : undefined;
    if (!league?.apiFootballId) {
      return unavailable('Team stats are not available for this league');
    }

    const API_KEY = getAPIKey();
    if (!API_KEY) {
      return unavailable('No API-Football key configured');
    }

    try {
      const teamId = await this.findTeamId(teamName);
      if (!teamId) {
        return unavailable(`Could not find "${teamName}" on API-Football`);
      }

      const season = getSeasonYear(matchDate, league.calendarYearSeason);
      const response = await fetch(
        `${API_BASE_URL}/teams/statistics?team=${teamId}&league=${league.apiFootballId}&season=${season}`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        return unavailable(`API-Football returned status ${response.status}`);
      }

      const data = await response.json();
      const apiError = getAPIErrorMessage(data);
      if (apiError) {
        return unavailable(apiError);
      }

      const stats: APIFootballTeamStats | undefined = data.response;
      if (!stats?.fixtures?.played?.total) {
        return unavailable(`No ${season} season games yet for ${teamName}`);
      }

      this.setCachedDataWithSource(cacheKey, stats, 'real');
      return stats;
    } catch (error) {
      console.error(`Error fetching team stats for ${teamName}:`, error);
      return unavailable('Could not reach API-Football');
    }
  }

  /**
   * Fetch head-to-head history between two teams.
   * Returns [] when unavailable; the reason is recorded under `h2h_<home>_<away>`.
   */
  async fetchH2H(homeTeam: string, awayTeam: string): Promise<APIFootballH2H[]> {
    const cacheKey = `h2h_${homeTeam}_${awayTeam}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    const unavailable = (reason: string): APIFootballH2H[] => {
      this.dataSourceCache.set(cacheKey, { source: 'unavailable', reason });
      return [];
    };

    try {
      // Validate API key first
      const API_KEY = getAPIKey();
      if (!API_KEY) {
        return unavailable('No API-Football key configured');
      }

      // Find team IDs
      const homeTeamId = await this.findTeamId(homeTeam);
      const awayTeamId = await this.findTeamId(awayTeam);

      if (!homeTeamId || !awayTeamId) {
        const missing = !homeTeamId ? homeTeam : awayTeam;
        return unavailable(`Could not find "${missing}" on API-Football`);
      }

      const response = await fetch(
        `${API_BASE_URL}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=10`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        return unavailable(`API-Football returned status ${response.status}`);
      }

      const data = await response.json();
      const apiError = getAPIErrorMessage(data);
      if (apiError) {
        return unavailable(apiError);
      }

      if (data.response && data.response.length > 0) {
        const h2hData = data.response.slice(0, 10); // Last 10 games
        this.setCachedDataWithSource(cacheKey, h2hData, 'real');
        return h2hData;
      }

      return unavailable('These teams have no previous meetings on record');
    } catch (error) {
      console.error(`Error fetching H2H data for ${homeTeam} vs ${awayTeam}:`, error);
      return unavailable('Could not reach API-Football');
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private setCachedDataWithSource(
    key: string,
    data: any,
    source: DataSource,
    reason?: string
  ): void {
    this.setCachedData(key, data);
    this.dataSourceCache.set(key, { source, reason });
  }

  getDataSource(key: string): { source: DataSource; reason?: string } | null {
    return this.dataSourceCache.get(key) ?? null;
  }

  clearCache(): void {
    this.cache.clear();
    this.dataSourceCache.clear();
  }
}

export const footballStatsService = FootballStatsService.getInstance();
