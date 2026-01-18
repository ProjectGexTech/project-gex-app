// Utility to transform Odds API data into our app's format
import { Match, Team, Odds, Prediction, TeamForm, HeadToHead } from './types';
import { enhanceMatchesWithStats } from './statsEnhancer';

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

// Map sport keys to readable league names
const LEAGUE_NAME_MAP: Record<string, string> = {
  'soccer_epl': 'Premier League',
  'soccer_spain_la_liga': 'La Liga',
  'soccer_germany_bundesliga': 'Bundesliga',
  'soccer_italy_serie_a': 'Serie A',
  'soccer_france_ligue_one': 'Ligue 1',
  'soccer_uefa_champs_league': 'Champions League',
  'soccer_uefa_europa_league': 'Europa League',
  'soccer_england_league1': 'League One',
  'soccer_england_league2': 'League Two',
  'soccer_efl_champ': 'Championship',
  'soccer_australia_aleague': 'A-League',
  'soccer_brazil_campeonato': 'Brazilian Série A',
  'soccer_mexico_ligamx': 'Liga MX',
  'soccer_usa_mls': 'MLS',
};

/**
 * Generate a simple prediction based on available odds
 */
function generatePredictionFromOdds(odds: Odds): Prediction {
  const h2h = odds.h2h;
  
  if (!h2h) {
    return {
      homeWin: 33.33,
      draw: 33.33,
      awayWin: 33.33,
      confidence: 'low',
      breakdown: {
        form: { home: 50, away: 50 },
        h2h: { home: 50, away: 50 },
        weights: { form: 60, h2h: 40 },
      },
    };
  }

  // Convert odds to implied probabilities
  const homeProb = (1 / h2h.home) * 100;
  const drawProb = (1 / h2h.draw) * 100;
  const awayProb = (1 / h2h.away) * 100;
  
  // Normalize to 100%
  const total = homeProb + drawProb + awayProb;
  const normalizedHomeProb = (homeProb / total) * 100;
  const normalizedDrawProb = (drawProb / total) * 100;
  const normalizedAwayProb = (awayProb / total) * 100;

  // Determine confidence based on odds spread
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  const maxProb = Math.max(normalizedHomeProb, normalizedAwayProb);
  if (maxProb > 60) confidence = 'high';
  else if (maxProb < 40) confidence = 'low';

  return {
    homeWin: Number(normalizedHomeProb.toFixed(2)),
    draw: Number(normalizedDrawProb.toFixed(2)),
    awayWin: Number(normalizedAwayProb.toFixed(2)),
    confidence,
    breakdown: {
      form: { 
        home: normalizedHomeProb > normalizedAwayProb ? 55 : 45, 
        away: normalizedAwayProb > normalizedHomeProb ? 55 : 45 
      },
      h2h: { 
        home: normalizedHomeProb > normalizedAwayProb ? 55 : 45, 
        away: normalizedAwayProb > normalizedHomeProb ? 55 : 45 
      },
      weights: { form: 60, h2h: 40 },
    },
  };
}

/**
 * Generate placeholder team form (since The Odds API doesn't provide this)
 */
function generatePlaceholderForm(): TeamForm {
  return {
    form: 'N/A',
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsScored: 0,
    goalsConceded: 0,
  };
}

/**
 * Generate placeholder head-to-head data
 */
function generatePlaceholderH2H(): HeadToHead {
  return {
    totalMeetings: 0,
    homeWins: 0,
    awayWins: 0,
    draws: 0,
    lastResults: [],
    games: [],
  };
}

/**
 * Extract odds from bookmakers data
 */
function extractOdds(bookmakers: OddsAPIMatch['bookmakers']): Odds {
  if (!bookmakers || bookmakers.length === 0) {
    return {};
  }

  const odds: Odds = {};

  // Get the first bookmaker's odds (you could average across bookmakers if desired)
  const bookmaker = bookmakers[0];

  for (const market of bookmaker.markets) {
    if (market.key === 'h2h') {
      // Head-to-head odds
      const homeOutcome = market.outcomes.find(o => o.name === bookmaker.markets[0].outcomes[0].name);
      const awayOutcome = market.outcomes.find(o => o.name === bookmaker.markets[0].outcomes[2]?.name);
      const drawOutcome = market.outcomes.find(o => o.name === 'Draw');

      if (homeOutcome && awayOutcome) {
        odds.h2h = {
          home: homeOutcome.price,
          draw: drawOutcome?.price || 3.5,
          away: awayOutcome.price,
        };
      }
    } else if (market.key === 'totals') {
      // Over/Under 2.5 goals
      const overOutcome = market.outcomes.find(o => o.name === 'Over' && o.price);
      const underOutcome = market.outcomes.find(o => o.name === 'Under' && o.price);

      if (overOutcome && underOutcome) {
        odds.ou25 = {
          over: overOutcome.price,
          under: underOutcome.price,
        };
      }
    } else if (market.key === 'btts') {
      // Both teams to score
      const yesOutcome = market.outcomes.find(o => o.name === 'Yes');
      const noOutcome = market.outcomes.find(o => o.name === 'No');

      if (yesOutcome && noOutcome) {
        odds.btts = {
          yes: yesOutcome.price,
          no: noOutcome.price,
        };
      }
    }
  }

  return odds;
}

/**
 * Get average odds across all bookmakers for better accuracy
 */
function getAverageOdds(bookmakers: OddsAPIMatch['bookmakers']): Odds {
  if (!bookmakers || bookmakers.length === 0) {
    return {};
  }

  const oddsAccumulator: {
    h2h: { home: number[]; draw: number[]; away: number[] };
    ou25: { over: number[]; under: number[] };
    btts: { yes: number[]; no: number[] };
  } = {
    h2h: { home: [], draw: [], away: [] },
    ou25: { over: [], under: [] },
    btts: { yes: [], no: [] },
  };

  // Collect odds from all bookmakers
  for (const bookmaker of bookmakers) {
    for (const market of bookmaker.markets) {
      if (market.key === 'h2h' && market.outcomes.length >= 2) {
        const outcomes = market.outcomes;
        oddsAccumulator.h2h.home.push(outcomes[0].price);
        if (outcomes.length === 3) {
          // Has draw
          const drawOutcome = outcomes.find(o => o.name === 'Draw');
          if (drawOutcome) oddsAccumulator.h2h.draw.push(drawOutcome.price);
          const awayOutcome = outcomes.find(o => o.name !== 'Draw' && o.name !== outcomes[0].name);
          if (awayOutcome) oddsAccumulator.h2h.away.push(awayOutcome.price);
        } else {
          oddsAccumulator.h2h.away.push(outcomes[1].price);
        }
      } else if (market.key === 'totals') {
        const overOutcome = market.outcomes.find(o => o.name === 'Over');
        const underOutcome = market.outcomes.find(o => o.name === 'Under');
        if (overOutcome) oddsAccumulator.ou25.over.push(overOutcome.price);
        if (underOutcome) oddsAccumulator.ou25.under.push(underOutcome.price);
      } else if (market.key === 'btts') {
        const yesOutcome = market.outcomes.find(o => o.name === 'Yes');
        const noOutcome = market.outcomes.find(o => o.name === 'No');
        if (yesOutcome) oddsAccumulator.btts.yes.push(yesOutcome.price);
        if (noOutcome) oddsAccumulator.btts.no.push(noOutcome.price);
      }
    }
  }

  // Calculate averages
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const odds: Odds = {};

  if (oddsAccumulator.h2h.home.length > 0) {
    odds.h2h = {
      home: Number(avg(oddsAccumulator.h2h.home).toFixed(2)),
      draw: Number((avg(oddsAccumulator.h2h.draw) || 3.5).toFixed(2)),
      away: Number(avg(oddsAccumulator.h2h.away).toFixed(2)),
    };
  }

  if (oddsAccumulator.ou25.over.length > 0) {
    odds.ou25 = {
      over: Number(avg(oddsAccumulator.ou25.over).toFixed(2)),
      under: Number(avg(oddsAccumulator.ou25.under).toFixed(2)),
    };
  }

  if (oddsAccumulator.btts.yes.length > 0) {
    odds.btts = {
      yes: Number(avg(oddsAccumulator.btts.yes).toFixed(2)),
      no: Number(avg(oddsAccumulator.btts.no).toFixed(2)),
    };
  }

  return odds;
}

/**
 * Transform Odds API match data to our app's Match format
 */
export function transformOddsAPIMatch(apiMatch: OddsAPIMatch): Match {
  const homeTeam: Team = {
    id: `${apiMatch.id}-home`,
    name: apiMatch.home_team,
    shortName: apiMatch.home_team.substring(0, 3).toUpperCase(),
  };

  const awayTeam: Team = {
    id: `${apiMatch.id}-away`,
    name: apiMatch.away_team,
    shortName: apiMatch.away_team.substring(0, 3).toUpperCase(),
  };

  const odds = getAverageOdds(apiMatch.bookmakers);
  const prediction = generatePredictionFromOdds(odds);
  const bookmakers = apiMatch.bookmakers.map(b => b.title);

  return {
    id: apiMatch.id,
    homeTeam,
    awayTeam,
    date: new Date(apiMatch.commence_time),
    league: LEAGUE_NAME_MAP[apiMatch.sport_key] || apiMatch.sport_title,
    odds,
    bookmakers,
    prediction,
    form: {
      home: generatePlaceholderForm(),
      away: generatePlaceholderForm(),
    },
    h2h: generatePlaceholderH2H(),
  };
}

/**
 * Transform multiple matches
 */
export async function transformOddsAPIMatches(apiMatches: OddsAPIMatch[]): Promise<Match[]> {
  console.log(`🔄 Transforming ${apiMatches.length} API matches...`);
  
  // First transform basic match data
  const transformed = apiMatches.map(transformOddsAPIMatch);
  
  console.log(`✅ Successfully transformed ${transformed.length} matches`);
  if (transformed.length > 0) {
    console.log(`📅 Date range: ${transformed[0].date.toDateString()} to ${transformed[transformed.length - 1].date.toDateString()}`);
  }
  
  // TEMPORARILY DISABLED: Stats enhancement for debugging
  // TODO: Re-enable after confirming basic functionality works
  /*
  try {
    console.log(`🔍 Enhancing matches with team stats and H2H data...`);
    const enhancedMatches = await enhanceMatchesWithStats(transformed);
    console.log(`✨ Enhanced ${enhancedMatches.length} matches with real stats`);
    return enhancedMatches;
  } catch (error) {
    console.warn('⚠️ Stats enhancement failed, using basic match data:', error);
    return transformed;
  }
  */
  
  return transformed;
}
