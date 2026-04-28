// Utility to transform Odds API data into our app's format
import { Match, Team, Odds, Prediction, TeamForm, HeadToHead } from './types';

interface OddsAPIOutcome {
  name: string;
  price: number;
  point?: number;       // spreads, totals, team_totals
  description?: string; // team_totals: "Over" | "Under"
}

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
      outcomes: OddsAPIOutcome[];
    }>;
  }>;
}

// Map sport/league keys to readable display names
const LEAGUE_NAME_MAP: Record<string, string> = {
  // Football / Soccer
  'soccer_epl':                        'Premier League',
  'soccer_spain_la_liga':              'La Liga',
  'soccer_germany_bundesliga':         'Bundesliga',
  'soccer_italy_serie_a':              'Serie A',
  'soccer_france_ligue_one':           'Ligue 1',
  'soccer_uefa_champs_league':         'Champions League',
  'soccer_uefa_europa_league':         'Europa League',
  'soccer_efl_champ':                  'Championship',
  'soccer_england_league1':            'League One',
  'soccer_england_league2':            'League Two',
  'soccer_netherlands_eredivisie':     'Eredivisie',
  'soccer_portugal_primeira_liga':     'Primeira Liga',
  'soccer_scotland_premiership':       'Scottish Premiership',
  'soccer_turkey_super_league':        'Süper Lig',
  'soccer_belgium_first_div':          'First Division A',
  'soccer_australia_aleague':          'A-League',
  'soccer_brazil_campeonato':          'Brasileirão Série A',
  'soccer_mexico_ligamx':              'Liga MX',
  'soccer_usa_mls':                    'MLS',
  'soccer_argentina_primera_division': 'Primera División',
  // Basketball
  'basketball_nba':                    'NBA',
  'basketball_ncaab':                  'NCAA Basketball',
  'basketball_euroleague':             'Euroleague',
  'basketball_wnba':                   'WNBA',
  'basketball_nbl':                    'NBL',
  // American Football
  'americanfootball_nfl':              'NFL',
  'americanfootball_ncaaf':            'NCAAF',
  // Baseball
  'baseball_mlb':                      'MLB',
  // Ice Hockey
  'icehockey_nhl':                     'NHL',
  // MMA
  'mma_mixed_martial_arts':            'MMA / UFC',
  // Rugby
  'rugbyleague_nrl':                   'NRL',
  'rugbyunion_super_rugby':            'Super Rugby',
};

/**
 * Identify which double-chance bucket an outcome name belongs to.
 * The Odds API uses 1X / 12 / X2 notation universally.
 */
function classifyDoubleChance(
  name: string,
): 'homeOrDraw' | 'homeOrAway' | 'drawOrAway' | null {
  const n = name.toLowerCase().replace(/[\s/]/g, '');
  if (n === '1x' || n === 'homedraw' || n === 'homeordraw') return 'homeOrDraw';
  if (n === '12' || n === 'nodraw'   || n === 'homeoraway'  || n === 'homeaway') return 'homeOrAway';
  if (n === 'x2' || n === 'draworaway' || n === 'awayordraw' || n === 'awayDraw') return 'drawOrAway';
  return null;
}

/**
 * Average all bookmakers' odds to produce representative market prices.
 * Uses team names to identify home/away outcomes — never relies on array position.
 *
 * For line-based markets (totals, spreads, team_totals) we group odds by line
 * value and pick the most-offered line before averaging, so we never blend
 * e.g. 2.5 and 3.5 goal lines into a meaningless "3.0" midpoint.
 */
function getAverageOdds(
  bookmakers: OddsAPIMatch['bookmakers'],
  homeTeamName: string,
  awayTeamName: string,
): Odds {
  if (!bookmakers || bookmakers.length === 0) return {};

  type LineBucket = { over: number[]; under: number[] };

  const acc = {
    h2h: { home: [] as number[], draw: [] as number[], away: [] as number[] },
    // totals: keyed by the line value (e.g. 2.5, 215.5)
    ou25ByLine: {} as Record<number, LineBucket>,
    btts: { yes: [] as number[], no: [] as number[] },
    // spreads: keyed by the home handicap point (e.g. -4.5)
    spreadsByLine: {} as Record<number, { homePrice: number[]; awayPoint: number[]; awayPrice: number[] }>,
    // team_totals: keyed by line per team
    teamTotalsByLine: {
      home: {} as Record<number, LineBucket>,
      away: {} as Record<number, LineBucket>,
    },
    drawNoBet:    { home: [] as number[], away: [] as number[] },
    doubleChance: { homeOrDraw: [] as number[], homeOrAway: [] as number[], drawOrAway: [] as number[] },
  };

  for (const bookmaker of bookmakers) {
    for (const market of bookmaker.markets) {
      const outcomes = market.outcomes;

      if (market.key === 'h2h' && outcomes.length >= 2) {
        const homeO = outcomes.find(o => o.name === homeTeamName);
        const awayO = outcomes.find(o => o.name === awayTeamName);
        const drawO = outcomes.find(o => o.name === 'Draw');
        if (homeO) acc.h2h.home.push(homeO.price);
        if (awayO) acc.h2h.away.push(awayO.price);
        if (drawO) acc.h2h.draw.push(drawO.price);

      } else if (market.key === 'spreads' && outcomes.length >= 2) {
        const homeO = outcomes.find(o => o.name === homeTeamName);
        const awayO = outcomes.find(o => o.name === awayTeamName);
        if (homeO?.point !== undefined && awayO?.point !== undefined) {
          const key = homeO.point;
          acc.spreadsByLine[key] ??= { homePrice: [], awayPoint: [], awayPrice: [] };
          acc.spreadsByLine[key].homePrice.push(homeO.price);
          acc.spreadsByLine[key].awayPoint.push(awayO.point);
          acc.spreadsByLine[key].awayPrice.push(awayO.price);
        }

      } else if (market.key === 'totals') {
        const overO  = outcomes.find(o => o.name === 'Over');
        const underO = outcomes.find(o => o.name === 'Under');
        if (overO?.point !== undefined && underO) {
          const key = overO.point;
          acc.ou25ByLine[key] ??= { over: [], under: [] };
          acc.ou25ByLine[key].over.push(overO.price);
          acc.ou25ByLine[key].under.push(underO.price);
        }

      } else if (market.key === 'team_totals') {
        for (const o of outcomes) {
          const side = o.name === homeTeamName ? 'home' : o.name === awayTeamName ? 'away' : null;
          if (!side || o.point === undefined) continue;
          const dir = (o.description ?? '').toLowerCase();
          const key = o.point;
          acc.teamTotalsByLine[side][key] ??= { over: [], under: [] };
          if (dir === 'over')  acc.teamTotalsByLine[side][key].over.push(o.price);
          else if (dir === 'under') acc.teamTotalsByLine[side][key].under.push(o.price);
        }

      } else if (market.key === 'btts') {
        const yesO = outcomes.find(o => o.name === 'Yes');
        const noO  = outcomes.find(o => o.name === 'No');
        if (yesO) acc.btts.yes.push(yesO.price);
        if (noO)  acc.btts.no.push(noO.price);

      } else if (market.key === 'draw_no_bet') {
        const homeO = outcomes.find(o => o.name === homeTeamName);
        const awayO = outcomes.find(o => o.name === awayTeamName);
        if (homeO) acc.drawNoBet.home.push(homeO.price);
        if (awayO) acc.drawNoBet.away.push(awayO.price);

      } else if (market.key === 'double_chance') {
        for (const o of outcomes) {
          const bucket = classifyDoubleChance(o.name);
          if (bucket) acc.doubleChance[bucket].push(o.price);
        }
      }
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  // Pick the line offered by the most bookmakers (highest count wins)
  function mostPopularLine<T extends LineBucket>(byLine: Record<number, T>): [number, T] | null {
    const entries = Object.entries(byLine) as unknown as [number, T][];
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1].over.length - a[1].over.length)[0];
  }

  const odds: Odds = {};

  if (acc.h2h.home.length > 0) {
    odds.h2h = {
      home: +avg(acc.h2h.home).toFixed(2),
      draw: +(avg(acc.h2h.draw) || 3.5).toFixed(2),
      away: +avg(acc.h2h.away).toFixed(2),
    };
  }

  const bestTotals = mostPopularLine(acc.ou25ByLine);
  if (bestTotals) {
    const [line, { over, under }] = bestTotals;
    odds.ou25 = {
      point: +Number(line).toFixed(1),
      over:  +avg(over).toFixed(2),
      under: +avg(under).toFixed(2),
    };
  }

  if (acc.btts.yes.length > 0) {
    odds.btts = {
      yes: +avg(acc.btts.yes).toFixed(2),
      no:  +avg(acc.btts.no).toFixed(2),
    };
  }

  const bestSpreads = Object.entries(acc.spreadsByLine).sort(
    (a, b) => b[1].homePrice.length - a[1].homePrice.length,
  )[0];
  if (bestSpreads) {
    const [lineStr, data] = bestSpreads;
    odds.spreads = {
      home: { point: +Number(lineStr).toFixed(1), price: +avg(data.homePrice).toFixed(2) },
      away: { point: +avg(data.awayPoint).toFixed(1), price: +avg(data.awayPrice).toFixed(2) },
    };
  }

  const bestHomeTotal = mostPopularLine(acc.teamTotalsByLine.home);
  const bestAwayTotal = mostPopularLine(acc.teamTotalsByLine.away);
  if (bestHomeTotal && bestAwayTotal) {
    const [hLine, { over: hOver, under: hUnder }] = bestHomeTotal;
    const [aLine, { over: aOver, under: aUnder }] = bestAwayTotal;
    if (hOver.length > 0 && hUnder.length > 0 && aOver.length > 0 && aUnder.length > 0) {
      odds.teamTotals = {
        home: { point: +Number(hLine).toFixed(1), over: +avg(hOver).toFixed(2), under: +avg(hUnder).toFixed(2) },
        away: { point: +Number(aLine).toFixed(1), over: +avg(aOver).toFixed(2), under: +avg(aUnder).toFixed(2) },
      };
    }
  }

  if (acc.drawNoBet.home.length > 0) {
    odds.drawNoBet = {
      home: +avg(acc.drawNoBet.home).toFixed(2),
      away: +avg(acc.drawNoBet.away).toFixed(2),
    };
  }

  if (acc.doubleChance.homeOrDraw.length > 0) {
    odds.doubleChance = {
      homeOrDraw: +avg(acc.doubleChance.homeOrDraw).toFixed(2),
      homeOrAway: +avg(acc.doubleChance.homeOrAway).toFixed(2),
      drawOrAway: +avg(acc.doubleChance.drawOrAway).toFixed(2),
    };
  }

  return odds;
}

function generatePredictionFromOdds(odds: Odds): Prediction {
  const h2h = odds.h2h;

  if (!h2h) {
    return {
      homeWin: 33.33, draw: 33.33, awayWin: 33.33, confidence: 'low',
      breakdown: { form: { home: 50, away: 50 }, h2h: { home: 50, away: 50 }, weights: { form: 60, h2h: 40 } },
    };
  }

  const homeProb = (1 / h2h.home) * 100;
  const drawProb = (1 / h2h.draw) * 100;
  const awayProb = (1 / h2h.away) * 100;
  const total    = homeProb + drawProb + awayProb;

  const nHome = (homeProb / total) * 100;
  const nDraw = (drawProb / total) * 100;
  const nAway = (awayProb / total) * 100;

  const maxProb    = Math.max(nHome, nAway);
  const confidence = maxProb > 60 ? 'high' : maxProb < 40 ? 'low' : 'medium';

  return {
    homeWin:    +nHome.toFixed(2),
    draw:       +nDraw.toFixed(2),
    awayWin:    +nAway.toFixed(2),
    confidence,
    breakdown: {
      form: { home: nHome > nAway ? 55 : 45, away: nAway > nHome ? 55 : 45 },
      h2h:  { home: nHome > nAway ? 55 : 45, away: nAway > nHome ? 55 : 45 },
      weights: { form: 60, h2h: 40 },
    },
  };
}

function generatePlaceholderForm(): TeamForm {
  return { form: 'N/A', gamesPlayed: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0 };
}

function generatePlaceholderH2H(): HeadToHead {
  return { totalMeetings: 0, homeWins: 0, awayWins: 0, draws: 0, lastResults: [], games: [] };
}

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

  const odds       = getAverageOdds(apiMatch.bookmakers, apiMatch.home_team, apiMatch.away_team);
  const prediction = generatePredictionFromOdds(odds);
  const bookmakers = apiMatch.bookmakers.map(b => b.title);

  return {
    id: apiMatch.id,
    sportKey: apiMatch.sport_key,
    homeTeam,
    awayTeam,
    date: new Date(apiMatch.commence_time),
    league: LEAGUE_NAME_MAP[apiMatch.sport_key] ?? apiMatch.sport_title,
    odds,
    bookmakers,
    prediction,
    form: { home: generatePlaceholderForm(), away: generatePlaceholderForm() },
    h2h: generatePlaceholderH2H(),
  };
}

export async function transformOddsAPIMatches(apiMatches: OddsAPIMatch[]): Promise<Match[]> {
  console.log(`🔄 Transforming ${apiMatches.length} API matches...`);
  const transformed = apiMatches.map(transformOddsAPIMatch);
  console.log(`✅ Successfully transformed ${transformed.length} matches`);
  if (transformed.length > 0) {
    console.log(`📅 Date range: ${transformed[0].date.toDateString()} — ${transformed[transformed.length - 1].date.toDateString()}`);
  }
  return transformed;
}
