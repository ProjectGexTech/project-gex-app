// API-Football Integration for Team Stats and Head-to-Head Data
// Documentation: https://www.api-football.com/documentation-v3

import { DetailedAIPrediction, H2HGame, ConfidenceLevel } from './types';
import { useAPIKeysStore } from './apiKeysStore';

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
  form: string; // e.g., "WWDLW"
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

interface APIFootballFixture {
  fixture: {
    id: number;
    date: string;
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
}

const API_BASE_URL = 'https://v3.football.api-sports.io';

// API-Football requires authentication with x-apisports-key header
// Using real API calls with user-provided API key

export class FootballStatsService {
  private static instance: FootballStatsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private dataSourceCache: Map<string, { source: 'real' | 'mock'; reason?: string }> = new Map();
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
      console.log(`✅ Team ID cache hit for "${teamName}": ${cached}`);
      return cached;
    }

    const API_KEY = getAPIKey();
    if (!API_KEY) {
      console.warn(`⚠️ Team search: No API-Football key available for "${teamName}"`);
      return null;
    }

    try {
      console.log(`🔍 Team search: Looking up "${teamName}" on API-Football...`);
      const response = await fetch(
        `${API_BASE_URL}/teams?search=${encodeURIComponent(teamName)}`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ Team search: API returned status ${response.status} for "${teamName}"`);
        return null;
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        // Get the first match (most relevant)
        const teamId = data.response[0].team.id;
        const teamFound = data.response[0].team.name;
        this.teamIdCache.set(teamName, teamId);
        console.log(`✅ Team search: Found "${teamName}" → ID ${teamId} (matched: "${teamFound}")`);
        return teamId;
      }
      
      console.warn(`⚠️ Team search: No results found for "${teamName}" on API-Football`);
      return null;
    } catch (error) {
      console.error(`❌ Team search: Error looking up "${teamName}":`, error);
      return null;
    }
  }

  /**
   * Fetch team statistics for current season
   * In production: Use real API with team ID and league/season
   */
  async fetchTeamStats(teamName: string): Promise<APIFootballTeamStats | null> {
    const cacheKey = `stats_${teamName}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // For now, return mock data based on team name
      // In production, make actual API call:
      // const response = await fetch(`${API_BASE_URL}/teams/statistics?team=${teamId}&season=2025&league=${leagueId}`, {
      //   headers: { 'x-apisports-key': API_KEY }
      // });
      
      const mockStats = this.generateMockTeamStats(teamName);
      this.setCachedDataWithSource(cacheKey, mockStats, 'mock', `Fallback stats generated for ${teamName}`);
      return mockStats;
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  }

  /**
   * Fetch head-to-head history between two teams
   */
  async fetchH2H(homeTeam: string, awayTeam: string): Promise<APIFootballH2H[]> {
    const cacheKey = `h2h_${homeTeam}_${awayTeam}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      console.log(`✅ H2H: Using cached data for ${homeTeam} vs ${awayTeam}`);
      return cached;
    }

    try {
      // Validate API key first
      const API_KEY = getAPIKey();
      if (!API_KEY) {
        console.warn(`⚠️ H2H: No API-Football key configured for ${homeTeam} vs ${awayTeam}, using fallback data`);
        const mockH2H = this.generateMockH2H(homeTeam, awayTeam);
        this.setCachedDataWithSource(cacheKey, mockH2H, 'mock', 'Missing API key');
        return mockH2H;
      }

      // Find team IDs
      console.log(`🔍 H2H: Looking up team IDs for ${homeTeam} and ${awayTeam}...`);
      const homeTeamId = await this.findTeamId(homeTeam);
      const awayTeamId = await this.findTeamId(awayTeam);

      if (!homeTeamId || !awayTeamId) {
        console.warn(`⚠️ H2H: Could not find team IDs (home: ${homeTeamId}, away: ${awayTeamId}), using fallback data`);
        const mockH2H = this.generateMockH2H(homeTeam, awayTeam);
        this.setCachedDataWithSource(cacheKey, mockH2H, 'mock', 'Team ID lookup failed');
        return mockH2H;
      }

      console.log(`✅ H2H: Found team IDs (${homeTeam}: ${homeTeamId}, ${awayTeam}: ${awayTeamId})`);

      // Fetch real H2H data from API-Football
      console.log(`📡 H2H: Fetching real H2H data from API-Football...`);
      const response = await fetch(
        `${API_BASE_URL}/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=10`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        console.error(`❌ H2H: API request failed with status ${response.status} for ${homeTeam} vs ${awayTeam}`);
        const mockH2H = this.generateMockH2H(homeTeam, awayTeam);
        this.setCachedDataWithSource(cacheKey, mockH2H, 'mock', `API status ${response.status}`);
        return mockH2H;
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        const h2hData = data.response.slice(0, 10); // Last 10 games
        console.log(`✅ H2H: Retrieved ${h2hData.length} real H2H matches for ${homeTeam} vs ${awayTeam}`);
        this.setCachedDataWithSource(cacheKey, h2hData, 'real');
        return h2hData;
      }
      
      // No H2H data available, use mock
      console.warn(`ℹ️ H2H: No H2H data available on API for ${homeTeam} vs ${awayTeam}, using fallback data`);
      const mockH2H = this.generateMockH2H(homeTeam, awayTeam);
      this.setCachedDataWithSource(cacheKey, mockH2H, 'mock', 'Empty API response');
      return mockH2H;
    } catch (error) {
      console.error(`❌ H2H: Error fetching H2H data for ${homeTeam} vs ${awayTeam}:`, error);
      // Fallback to mock data on error
      const mockH2H = this.generateMockH2H(homeTeam, awayTeam);
      this.setCachedDataWithSource(cacheKey, mockH2H, 'mock', 'Fetch error');
      return mockH2H;
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
    source: 'real' | 'mock',
    reason?: string
  ): void {
    this.setCachedData(key, data);
    this.dataSourceCache.set(key, { source, reason });
  }

  getDataSource(key: string): { source: 'real' | 'mock'; reason?: string } | null {
    return this.dataSourceCache.get(key) ?? null;
  }

  /**
   * Generate realistic mock team statistics
   * Replace with real API call in production
   */
  private generateMockTeamStats(teamName: string): APIFootballTeamStats {
    // Generate deterministic stats based on team name hash
    const hash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 100;
    
    const homeGames = 10;
    const awayGames = 9;
    const totalGames = homeGames + awayGames;
    
    const homeWins = Math.floor((seed % 7) + 3);
    const awayWins = Math.floor((seed % 5) + 2);
    const homeDraws = Math.floor((seed % 3) + 1);
    const awayDraws = Math.floor((seed % 2) + 1);
    const homeLosses = homeGames - homeWins - homeDraws;
    const awayLosses = awayGames - awayWins - awayDraws;
    
    const homeGoalsFor = homeWins * 2 + homeDraws + homeLosses * 0.5;
    const awayGoalsFor = awayWins * 1.8 + awayDraws + awayLosses * 0.3;
    const homeGoalsAgainst = homeLosses * 2 + homeDraws;
    const awayGoalsAgainst = awayLosses * 2.2 + awayDraws;

    // Generate form string (last 5 games)
    const formChars = ['W', 'W', 'D', 'L', 'W'];
    const form = formChars.sort(() => (seed % 2) - 0.5).slice(0, 5).join('');

    return {
      team: {
        id: hash,
        name: teamName,
        logo: `https://via.placeholder.com/40?text=${teamName[0]}`,
      },
      form,
      fixtures: {
        played: { home: homeGames, away: awayGames, total: totalGames },
        wins: { home: homeWins, away: awayWins, total: homeWins + awayWins },
        draws: { home: homeDraws, away: awayDraws, total: homeDraws + awayDraws },
        loses: { home: homeLosses, away: awayLosses, total: homeLosses + awayLosses },
      },
      goals: {
        for: {
          total: {
            home: Math.floor(homeGoalsFor),
            away: Math.floor(awayGoalsFor),
            total: Math.floor(homeGoalsFor + awayGoalsFor),
          },
          average: {
            home: (homeGoalsFor / homeGames).toFixed(2),
            away: (awayGoalsFor / awayGames).toFixed(2),
            total: ((homeGoalsFor + awayGoalsFor) / totalGames).toFixed(2),
          },
        },
        against: {
          total: {
            home: Math.floor(homeGoalsAgainst),
            away: Math.floor(awayGoalsAgainst),
            total: Math.floor(homeGoalsAgainst + awayGoalsAgainst),
          },
          average: {
            home: (homeGoalsAgainst / homeGames).toFixed(2),
            away: (awayGoalsAgainst / awayGames).toFixed(2),
            total: ((homeGoalsAgainst + awayGoalsAgainst) / totalGames).toFixed(2),
          },
        },
      },
    };
  }

  /**
   * Deterministic seeded pseudo-random number generator (LCG).
   * Using both team names as the seed guarantees the same H2H results are
   * produced every time the same fixture is rendered — even across page
   * refreshes before the in-memory cache has been populated.
   */
  private makeLCG(seed: number): () => number {
    let s = seed >>> 0; // treat as unsigned 32-bit
    return () => {
      // Knuth's LCG constants
      s = Math.imul(1664525, s) + 1013904223 >>> 0;
      return s / 0x100000000; // 0..1
    };
  }

  /**
   * Generate deterministic mock H2H history.
   * Results are stable across renders/refreshes because the seed derives
   * entirely from the team names — no Math.random().
   */
  private generateMockH2H(homeTeam: string, awayTeam: string): APIFootballH2H[] {
    const seedStr = homeTeam + '|' + awayTeam;
    const seed = seedStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand = this.makeLCG(seed);

    const matches: APIFootballH2H[] = [];
    const numMatches = 5;

    for (let i = 0; i < numMatches; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (i + 1) * 2);

      const homeGoals = Math.floor(rand() * 4);
      const awayGoals = Math.floor(rand() * 4);

      matches.push({
        fixture: {
          id: seed + i,
          date: date.toISOString(),
          venue: { name: `${homeTeam} Stadium`, city: 'City' },
        },
        teams: {
          home: {
            id: seed,
            name: homeTeam,
            winner: homeGoals > awayGoals ? true : homeGoals < awayGoals ? false : null,
          },
          away: {
            id: seed + 1000,
            name: awayTeam,
            winner: awayGoals > homeGoals ? true : awayGoals < homeGoals ? false : null,
          },
        },
        goals: { home: homeGoals, away: awayGoals },
        score: { fulltime: { home: homeGoals, away: awayGoals } },
      });
    }

    return matches;
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Fetch comprehensive detailed prediction with H2H and form analysis
   */
  async fetchDetailedPrediction(
    homeTeam: string,
    awayTeam: string
  ): Promise<DetailedAIPrediction> {
    const cacheKey = `detailed_prediction_${homeTeam}_${awayTeam}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Fetch H2H data (last 10 games between the two teams)
      const h2hData = await this.fetchH2H(homeTeam, awayTeam);
      
      // Fetch recent form for home team (last 10 games)
      const homeFormData = await this.fetchTeamRecentForm(homeTeam);
      
      // Fetch recent form for away team (last 10 games)
      const awayFormData = await this.fetchTeamRecentForm(awayTeam);
      
      // Compute AI prediction
      const prediction = this.computeDetailedPrediction(
        homeTeam,
        awayTeam,
        h2hData,
        homeFormData,
        awayFormData
      );
      
      this.setCachedData(cacheKey, prediction);
      return prediction;
    } catch (error) {
      console.error('Error fetching detailed prediction:', error);
      throw error;
    }
  }

  /**
   * Fetch team's last 10 matches for form analysis
   */
  private async fetchTeamRecentForm(teamName: string): Promise<APIFootballFixture[]> {
    const cacheKey = `recent_form_${teamName}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Find team ID
      const teamId = await this.findTeamId(teamName);

      if (!teamId) {
        console.warn(`Could not find team ID for ${teamName}, using mock data`);
        const mockForm = this.generateMockRecentForm(teamName);
        this.setCachedDataWithSource(cacheKey, mockForm, 'mock', 'Team ID lookup failed');
        return mockForm;
      }

      const API_KEY = getAPIKey();
      if (!API_KEY) {
        console.warn('API-Football key not configured, using mock data');
        const mockForm = this.generateMockRecentForm(teamName);
        this.setCachedDataWithSource(cacheKey, mockForm, 'mock', 'Missing API key');
        return mockForm;
      }

      // Fetch real form data from API-Football
      const response = await fetch(
        `${API_BASE_URL}/fixtures?team=${teamId}&last=10&status=FT`,
        {
          headers: {
            'x-apisports-key': API_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        const formData = data.response.slice(0, 10); // Last 10 games
        this.setCachedDataWithSource(cacheKey, formData, 'real');
        return formData;
      }
      
      // No form data available, use mock
      console.warn(`No form data available for ${teamName}, using mock data`);
      const mockForm = this.generateMockRecentForm(teamName);
      this.setCachedDataWithSource(cacheKey, mockForm, 'mock', 'Empty API response');
      return mockForm;
    } catch (error) {
      console.error('Error fetching team recent form:', error);
      // Fallback to mock data on error
      const mockForm = this.generateMockRecentForm(teamName);
      this.setCachedDataWithSource(cacheKey, mockForm, 'mock', 'Fetch error');
      return mockForm;
    }
  }

  /**
   * Compute detailed AI prediction based on H2H and form data
   */
  private computeDetailedPrediction(
    homeTeam: string,
    awayTeam: string,
    h2hData: APIFootballH2H[],
    homeFormData: APIFootballFixture[],
    awayFormData: APIFootballFixture[]
  ): DetailedAIPrediction {
    // Process H2H data (last 10 games)
    const h2hGames: H2HGame[] = h2hData.slice(0, 10).map(match => {
      const isHomeTeamHome = match.teams.home.name === homeTeam;
      const homeGoals = match.goals.home;
      const awayGoals = match.goals.away;
      
      let result: 'H' | 'A' | 'D';
      if (homeGoals > awayGoals) {
        result = isHomeTeamHome ? 'H' : 'A';
      } else if (awayGoals > homeGoals) {
        result = isHomeTeamHome ? 'A' : 'H';
      } else {
        result = 'D';
      }
      
      return {
        date: match.fixture.date,
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        homeGoals: match.goals.home,
        awayGoals: match.goals.away,
        result
      };
    });

    const h2hHomeWins = h2hGames.filter(g => g.result === 'H').length;
    const h2hAwayWins = h2hGames.filter(g => g.result === 'A').length;
    const h2hDraws = h2hGames.filter(g => g.result === 'D').length;
    const h2hHomeGoals = h2hGames.reduce((sum, g) => {
      return sum + (g.homeTeam === homeTeam ? g.homeGoals : g.awayGoals);
    }, 0);
    const h2hAwayGoals = h2hGames.reduce((sum, g) => {
      return sum + (g.awayTeam === awayTeam ? g.awayGoals : g.homeGoals);
    }, 0);

    // Process home team form (last 10 games)
    const homeForm = this.analyzeTeamForm(homeTeam, homeFormData.slice(0, 10));
    
    // Process away team form (last 10 games)
    const awayForm = this.analyzeTeamForm(awayTeam, awayFormData.slice(0, 10));

    // Calculate form scores (0-100)
    const homeFormScore = this.calculateFormScore(homeForm);
    const awayFormScore = this.calculateFormScore(awayForm);

    // Calculate H2H scores (0-100)
    const h2hTotal = h2hGames.length || 1;
    const homeH2HScore = ((h2hHomeWins / h2hTotal) * 60 + (h2hDraws / h2hTotal) * 20) * 100 / 80;
    const awayH2HScore = ((h2hAwayWins / h2hTotal) * 60 + (h2hDraws / h2hTotal) * 20) * 100 / 80;

    // Weighted final score (60% form, 40% H2H)
    const homeFinalScore = (homeFormScore * 0.6) + (homeH2HScore * 0.4);
    const awayFinalScore = (awayFormScore * 0.6) + (awayH2HScore * 0.4);

    // Convert scores to probabilities
    const totalScore = homeFinalScore + awayFinalScore;
    const homeWinProb = totalScore > 0 ? (homeFinalScore / totalScore) * 100 : 50;
    const awayWinProb = totalScore > 0 ? (awayFinalScore / totalScore) * 100 : 50;
    
    // Draw probability (inverse of dominance)
    const dominance = Math.abs(homeFinalScore - awayFinalScore);
    const drawProb = Math.max(10, Math.min(35, 35 - (dominance / 3)));
    
    // Normalize probabilities
    const totalProb = homeWinProb + awayWinProb + drawProb;
    const normalizedHomeWin = (homeWinProb / totalProb) * 100;
    const normalizedDraw = (drawProb / totalProb) * 100;
    const normalizedAwayWin = (awayWinProb / totalProb) * 100;

    // Determine predicted winner and confidence
    const maxProb = Math.max(normalizedHomeWin, normalizedDraw, normalizedAwayWin);
    let predictedWinner: 'home' | 'away' | 'draw';
    let confidence: ConfidenceLevel;
    
    if (normalizedHomeWin === maxProb) {
      predictedWinner = 'home';
    } else if (normalizedAwayWin === maxProb) {
      predictedWinner = 'away';
    } else {
      predictedWinner = 'draw';
    }
    
    if (maxProb >= 55) {
      confidence = 'high';
    } else if (maxProb >= 45) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    return {
      homeWin: Math.round(normalizedHomeWin * 10) / 10,
      draw: Math.round(normalizedDraw * 10) / 10,
      awayWin: Math.round(normalizedAwayWin * 10) / 10,
      confidence,
      predictedWinner,
      form: {
        home: {
          wins: homeForm.wins,
          draws: homeForm.draws,
          losses: homeForm.losses,
          goalsScored: homeForm.goalsScored,
          goalsConceded: homeForm.goalsConceded,
          formString: homeForm.formString
        },
        away: {
          wins: awayForm.wins,
          draws: awayForm.draws,
          losses: awayForm.losses,
          goalsScored: awayForm.goalsScored,
          goalsConceded: awayForm.goalsConceded,
          formString: awayForm.formString
        }
      },
      h2h: {
        totalGames: h2hGames.length,
        homeWins: h2hHomeWins,
        awayWins: h2hAwayWins,
        draws: h2hDraws,
        homeGoalsScored: h2hHomeGoals,
        awayGoalsScored: h2hAwayGoals,
        games: h2hGames
      },
      breakdown: {
        formScore: {
          home: Math.round(homeFormScore * 10) / 10,
          away: Math.round(awayFormScore * 10) / 10
        },
        h2hScore: {
          home: Math.round(homeH2HScore * 10) / 10,
          away: Math.round(awayH2HScore * 10) / 10
        },
        finalScore: {
          home: Math.round(homeFinalScore * 10) / 10,
          away: Math.round(awayFinalScore * 10) / 10
        }
      }
    };
  }

  /**
   * Analyze team form from recent fixtures
   */
  private analyzeTeamForm(teamName: string, fixtures: APIFootballFixture[]) {
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;
    const formChars: string[] = [];

    fixtures.forEach(fixture => {
      const isHome = fixture.teams.home.name === teamName;
      const teamGoals = isHome ? fixture.goals.home : fixture.goals.away;
      const opponentGoals = isHome ? fixture.goals.away : fixture.goals.home;
      
      goalsScored += teamGoals;
      goalsConceded += opponentGoals;
      
      if (teamGoals > opponentGoals) {
        wins++;
        formChars.push('W');
      } else if (teamGoals < opponentGoals) {
        losses++;
        formChars.push('L');
      } else {
        draws++;
        formChars.push('D');
      }
    });

    return {
      wins,
      draws,
      losses,
      goalsScored,
      goalsConceded,
      formString: formChars.join('')
    };
  }

  /**
   * Calculate form score (0-100) based on W/D/L record
   */
  private calculateFormScore(form: {
    wins: number;
    draws: number;
    losses: number;
    goalsScored: number;
    goalsConceded: number;
  }): number {
    const totalGames = form.wins + form.draws + form.losses || 1;
    const winRate = (form.wins / totalGames) * 100;
    const drawRate = (form.draws / totalGames) * 30;
    const goalDiff = form.goalsScored - form.goalsConceded;
    const goalDiffBonus = Math.min(20, Math.max(-20, goalDiff * 2));
    
    return Math.max(0, Math.min(100, winRate + drawRate + goalDiffBonus));
  }

  /**
   * Generate mock recent form data for development
   */
  private generateMockRecentForm(teamName: string): APIFootballFixture[] {
    const fixtures: APIFootballFixture[] = [];
    const hash = teamName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1) * 4);
      
      const seed = (hash + i) % 100;
      const isHome = i % 2 === 0;
      const teamGoals = Math.floor((seed % 4) + (isHome ? 1 : 0));
      const opponentGoals = Math.floor(((seed * 7) % 4));
      
      fixtures.push({
        fixture: {
          id: Date.now() + i,
          date: date.toISOString()
        },
        teams: {
          home: {
            id: isHome ? hash : hash + 1000,
            name: isHome ? teamName : `Opponent ${i}`,
            winner: isHome ? (teamGoals > opponentGoals ? true : teamGoals < opponentGoals ? false : null) : (opponentGoals > teamGoals ? true : opponentGoals < teamGoals ? false : null)
          },
          away: {
            id: isHome ? hash + 1000 : hash,
            name: isHome ? `Opponent ${i}` : teamName,
            winner: isHome ? (opponentGoals > teamGoals ? true : opponentGoals < teamGoals ? false : null) : (teamGoals > opponentGoals ? true : teamGoals < opponentGoals ? false : null)
          }
        },
        goals: {
          home: isHome ? teamGoals : opponentGoals,
          away: isHome ? opponentGoals : teamGoals
        }
      });
    }
    
    return fixtures;
  }
}

export const footballStatsService = FootballStatsService.getInstance();
