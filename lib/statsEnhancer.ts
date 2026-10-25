// Enhanced Odds Transformer with Real Stats Integration
import { footballStatsService, APIFootballTeamStats, APIFootballH2H } from './footballStatsAPI';
import { Match, TeamForm, HeadToHead, H2HGame, Prediction, ConfidenceLevel, DataQualityInfo } from './types';

// Shown when stats can't be fetched: zero games played, so every prediction factor that
// uses them is skipped instead of being fed invented numbers
const EMPTY_FORM: TeamForm = { form: 'N/A', gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 };
const EMPTY_H2H: HeadToHead = { totalMeetings: 0, homeWins: 0, awayWins: 0, draws: 0, lastResults: [], games: [] };

/**
 * Transform API-Football stats to our TeamForm format
 */
function transformTeamStats(
  stats: APIFootballTeamStats | null,
  isHome: boolean
): TeamForm {
  if (!stats) {
    return { ...EMPTY_FORM };
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
 * Transform API-Football H2H to our HeadToHead format.
 * Fixtures are matched to our teams by API-Football team ID, because the odds feed and
 * API-Football spell some names differently ("Wolves" vs "Wolverhampton Wanderers").
 * Games are sorted most recent first; each game's `result` is from that fixture's
 * home side, while homeWins/awayWins/lastResults are from OUR home and away team.
 */
function transformH2H(
  h2hMatches: APIFootballH2H[],
  homeTeam: string,
  awayTeam: string
): HeadToHead {
  if (!h2hMatches.length) {
    return { ...EMPTY_H2H, lastResults: [], games: [] };
  }

  const homeTeamId = footballStatsService.getKnownTeamId(homeTeam);
  const ourName = (team: { id: number; name: string }) =>
    team.id === homeTeamId ? homeTeam : awayTeam;

  const sorted = [...h2hMatches].sort(
    (a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime()
  );

  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;
  const lastResults: string[] = [];
  const games: H2HGame[] = [];

  sorted.forEach((match) => {
    const isHomeWinner = match.teams.home.winner;
    const fixtureHome = ourName(match.teams.home);

    games.push({
      date: match.fixture.date,
      homeTeam: fixtureHome,
      awayTeam: ourName(match.teams.away),
      homeGoals: match.goals.home,
      awayGoals: match.goals.away,
      result: isHomeWinner === null ? 'D' : (isHomeWinner ? 'H' : 'A'),
    });

    if (isHomeWinner === null) {
      draws++;
      lastResults.push('D');
    } else if (isHomeWinner === (fixtureHome === homeTeam)) {
      homeWins++;
      lastResults.push('H');
    } else {
      awayWins++;
      lastResults.push('A');
    }
  });

  return {
    totalMeetings: sorted.length,
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
 * Enhance a single match with real stats data.
 * When stats or H2H can't be fetched they stay empty and dataQuality says why;
 * the odds-based prediction is only replaced when both form and H2H are real.
 */
export async function enhanceMatchWithStats(match: Partial<Match>): Promise<Match> {
  const homeTeamName = match.homeTeam?.name || '';
  const awayTeamName = match.awayTeam?.name || '';
  const matchDate = match.date ? new Date(match.date) : new Date();

  try {
    // Fetch real stats in parallel
    const [homeStats, awayStats, h2hData] = await Promise.all([
      footballStatsService.fetchTeamStats(homeTeamName, match.sportKey, matchDate),
      footballStatsService.fetchTeamStats(awayTeamName, match.sportKey, matchDate),
      footballStatsService.fetchH2H(homeTeamName, awayTeamName),
    ]);

    const formIsReal = homeStats !== null && awayStats !== null;
    const h2hIsReal = h2hData.length > 0;

    // Form needs both teams; with only one side there's nothing to compare
    const homeForm = formIsReal ? transformTeamStats(homeStats, true) : { ...EMPTY_FORM };
    const awayForm = formIsReal ? transformTeamStats(awayStats, false) : { ...EMPTY_FORM };
    const h2h = transformH2H(h2hData, homeTeamName, awayTeamName);

    const statsReason = [
      footballStatsService.getDataSource(`stats_${homeTeamName}`)?.reason,
      footballStatsService.getDataSource(`stats_${awayTeamName}`)?.reason,
    ].filter(Boolean);
    const h2hReason = footballStatsService.getDataSource(`h2h_${homeTeamName}_${awayTeamName}`)?.reason;

    const dataQuality: DataQualityInfo = {
      form: formIsReal ? 'real' : 'unavailable',
      h2h: h2hIsReal ? 'real' : 'unavailable',
      overall: formIsReal && h2hIsReal ? 'real' : 'unavailable',
      formReason: formIsReal ? undefined : [...new Set(statsReason)].join(' | ') || 'Team stats unavailable',
      h2hReason: h2hIsReal ? undefined : h2hReason || 'Head-to-head data unavailable',
      overallReason: formIsReal && h2hIsReal
        ? 'All analysis inputs came from live API data'
        : 'Some analysis inputs were unavailable and were left out',
    };

    // Without real form and H2H, keep the odds-based prediction from the transformer
    const prediction = formIsReal && h2hIsReal
      ? calculateEnhancedPrediction(homeForm, awayForm, h2h)
      : match.prediction;

    return {
      ...match,
      form: {
        home: homeForm,
        away: awayForm,
      },
      h2h,
      dataQuality,
      prediction,
    } as Match;
  } catch (error) {
    console.warn(`[${homeTeamName} vs ${awayTeamName}] Stats enhancement failed:`, error);
    return {
      ...match,
      form: { home: { ...EMPTY_FORM }, away: { ...EMPTY_FORM } },
      h2h: { ...EMPTY_H2H, lastResults: [], games: [] },
      dataQuality: {
        form: 'unavailable',
        h2h: 'unavailable',
        overall: 'unavailable',
        formReason: 'Stats could not be loaded',
        h2hReason: 'Stats could not be loaded',
      },
    } as Match;
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
