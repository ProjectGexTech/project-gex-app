// Enhanced Odds Transformer with Real Stats Integration
import { footballStatsService, APIFootballTeamStats, APIFootballH2H } from './footballStatsAPI';
import { Match, TeamForm, HeadToHead, Prediction, ConfidenceLevel } from './types';

interface OddsAPIMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: Array<{
      key: string;
      last_update: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

/**
 * Transform API-Football stats to our TeamForm format
 */
function transformTeamStats(
  stats: APIFootballTeamStats | null,
  isHome: boolean
): TeamForm {
  if (!stats) {
    // Return fallback data if stats unavailable
    return {
      form: 'WWDLW',
      gamesPlayed: 10,
      wins: 6,
      draws: 2,
      losses: 2,
      goalsScored: 18,
      goalsConceded: 10,
    };
  }

  const venue = isHome ? 'home' : 'away';
  
  return {
    form: stats.form,
    gamesPlayed: stats.fixtures.played[venue],
    wins: stats.fixtures.wins[venue],
    draws: stats.fixtures.draws[venue],
    losses: stats.fixtures.loses[venue],
    goalsScored: stats.goals.for.total[venue],
    goalsConceded: stats.goals.against.total[venue],
  };
}

/**
 * Transform API-Football H2H to our HeadToHead format
 */

function transformH2H(
  h2hMatches: APIFootballH2H[],
  homeTeam: string,
  awayTeam: string
): HeadToHead {
  if (!h2hMatches.length) {
    // Return fallback data if H2H unavailable
    return {
      totalMeetings: 5,
      homeWins: 2,
      awayWins: 2,
      draws: 1,
      lastResults: ['H', 'A', 'D', 'H', 'A'],
      games: [],
    };
  }

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  const lastResults: string[] = [];
  const games: any[] = [];

  h2hMatches.forEach((match) => {
    const homeTeamInMatch = match.teams.home.name;
    const awayTeamInMatch = match.teams.away.name;
    const isHomeWinner = match.teams.home.winner;
    const isAwayWinner = match.teams.away.winner;

    // Add game to history
    games.push({
      date: match.fixture.date,
      homeTeam: homeTeamInMatch,
      awayTeam: awayTeamInMatch,
      homeGoals: match.goals.home,
      awayGoals: match.goals.away,
      result: isHomeWinner === null ? 'D' : (isHomeWinner ? 'H' : 'A'),
    });

    if (isHomeWinner === null) {
      draws++;
      lastResults.push('D');
    } else if (homeTeamInMatch === homeTeam) {
      // Match where our home team was actually home
      if (isHomeWinner) {
        homeWins++;
        lastResults.push('H');
      } else {
        awayWins++;
        lastResults.push('A');
      }
    } else {
      // Match where our home team was away
      if (isAwayWinner) {
        homeWins++;
        lastResults.push('H');
      } else {
        awayWins++;
        lastResults.push('A');
      }
    }
  });

  return {
    totalMeetings: h2hMatches.length,
    homeWins,
    awayWins,
    draws,
    lastResults: lastResults.slice(0, 5),
    games: games.slice(0, 10),
  };
}

/**
 * Calculate enhanced prediction using real stats
 */
function calculateEnhancedPrediction(
  homeForm: TeamForm,
  awayForm: TeamForm,
  h2h: HeadToHead,
  formWeight: number = 60,
  h2hWeight: number = 40
): Prediction {
  // Calculate form scores (0-100)
  const homeFormScore = homeForm.gamesPlayed > 0
    ? ((homeForm.wins * 3 + homeForm.draws) / (homeForm.gamesPlayed * 3)) * 100
    : 50;
  
  const awayFormScore = awayForm.gamesPlayed > 0
    ? ((awayForm.wins * 3 + awayForm.draws) / (awayForm.gamesPlayed * 3)) * 100
    : 50;

  // Calculate H2H scores (0-100)
  const homeH2HScore = h2h.totalMeetings > 0
    ? ((h2h.homeWins * 3 + h2h.draws) / (h2h.totalMeetings * 3)) * 100
    : 50;
  
  const awayH2HScore = h2h.totalMeetings > 0
    ? ((h2h.awayWins * 3 + h2h.draws) / (h2h.totalMeetings * 3)) * 100
    : 50;

  // Weighted combination
  const homeScore = (homeFormScore * formWeight + homeH2HScore * h2hWeight) / 100;
  const awayScore = (awayFormScore * formWeight + awayH2HScore * h2hWeight) / 100;
  
  // Add home advantage (5%)
  const homeAdvantage = 5;
  const adjustedHomeScore = homeScore + homeAdvantage;
  
  // Convert to probabilities
  const totalScore = adjustedHomeScore + awayScore + 50; // 50 for draw baseline
  const homeWinProb = Math.round((adjustedHomeScore / totalScore) * 100);
  const awayWinProb = Math.round((awayScore / totalScore) * 100);
  const drawProb = Math.max(0, 100 - homeWinProb - awayWinProb);

  // Determine confidence level based on data quality and score difference
  let confidence: ConfidenceLevel = 'medium';
  const scoreDiff = Math.abs(homeScore - awayScore);
  
  if (homeForm.gamesPlayed >= 8 && h2h.totalMeetings >= 3 && scoreDiff > 20) {
    confidence = 'high';
  } else if (homeForm.gamesPlayed < 5 || h2h.totalMeetings < 2 || scoreDiff < 10) {
    confidence = 'low';
  }

  return {
    homeWin: homeWinProb,
    draw: drawProb,
    awayWin: awayWinProb,
    confidence,
    breakdown: {
      form: {
        home: Math.round(homeFormScore),
        away: Math.round(awayFormScore),
      },
      h2h: {
        home: Math.round(homeH2HScore),
        away: Math.round(awayH2HScore),
      },
      weights: {
        form: formWeight,
        h2h: h2hWeight,
      },
    },
  };
}

/**
 * Enhance a single match with real stats data
 */
export async function enhanceMatchWithStats(match: Partial<Match>): Promise<Match> {
  try {
    const homeTeamName = match.homeTeam?.name || '';
    const awayTeamName = match.awayTeam?.name || '';

    // Fetch real stats in parallel
    const [homeStats, awayStats, h2hData] = await Promise.all([
      footballStatsService.fetchTeamStats(homeTeamName),
      footballStatsService.fetchTeamStats(awayTeamName),
      footballStatsService.fetchH2H(homeTeamName, awayTeamName),
    ]);

    // Transform to our format
    const homeForm = transformTeamStats(homeStats, true);
    const awayForm = transformTeamStats(awayStats, false);
    const h2h = transformH2H(h2hData, homeTeamName, awayTeamName);

    // Calculate enhanced prediction
    const prediction = calculateEnhancedPrediction(homeForm, awayForm, h2h);

    return {
      ...match,
      form: {
        home: homeForm,
        away: awayForm,
      },
      h2h,
      prediction,
    } as Match;
  } catch (error) {
    console.warn('Failed to enhance match, using original data:', error);
    // Return match as-is if enhancement fails
    return match as Match;
  }
}

/**
 * Enhance multiple matches with real stats
 */
export async function enhanceMatchesWithStats(matches: Partial<Match>[]): Promise<Match[]> {
  console.log(`🔄 Enhancing ${matches.length} matches with real team stats and H2H data...`);
  
  try {
    const enhanced = await Promise.all(
      matches.map(match => enhanceMatchWithStats(match))
    );
    
    console.log(`✅ Enhanced ${enhanced.length} matches with real data`);
    return enhanced;
  } catch (error) {
    console.error('Error enhancing matches, returning original data:', error);
    // If enhancement fails completely, return matches as-is
    return matches as Match[];
  }
}

export { transformTeamStats, transformH2H, calculateEnhancedPrediction };
