// Type definitions for the Gexten app

export type MarketType = 'h2h' | 'ou25' | 'btts' | 'dc';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface Team {
  id: string;
  name: string;
  shortName: string;
}

export interface Odds {
  h2h?: {
    home: number;
    draw: number;
    away: number;
  };
  ou25?: {
    over: number;
    under: number;
  };
  btts?: {
    yes: number;
    no: number;
  };
}

export interface TeamForm {
  form: string; // e.g., "WWDLW"
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface H2HGame {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  result: 'H' | 'A' | 'D'; // Home win, Away win, Draw
}

export interface HeadToHead {
  totalMeetings: number;
  homeWins: number;
  awayWins: number;
  draws: number;
  lastResults: string[]; // e.g., ["H", "A", "D"]
  games: H2HGame[]; // Last 10 H2H games with details
}

export interface DetailedAIPrediction {
  // Overall prediction
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: ConfidenceLevel;
  predictedWinner: 'home' | 'away' | 'draw';
  
  // Form analysis (last 10 games for each team)
  form: {
    home: {
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      formString: string; // "WWDLW..."
    };
    away: {
      wins: number;
      draws: number;
      losses: number;
      goalsScored: number;
      goalsConceded: number;
      formString: string;
    };
  };
  
  // Head-to-Head analysis (last 10 H2H games)
  h2h: {
    totalGames: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    homeGoalsScored: number;
    awayGoalsScored: number;
    games: H2HGame[];
  };
  
  // Breakdown of factors
  breakdown: {
    formScore: { home: number; away: number };
    h2hScore: { home: number; away: number };
    finalScore: { home: number; away: number };
  };

  // NEW: Advanced prediction fields
  recommendedBet?: string;
  explanation?: string[];
  factors?: {
    oddsAnalysis: { score: number; weight: number; confidence: number };
    recentForm: { score: number; weight: number; confidence: number };
    headToHead: { score: number; weight: number; confidence: number };
    leaguePosition: { score: number; weight: number; confidence: number };
    homeAwayPerformance: { score: number; weight: number; confidence: number };
    goalTrends: { score: number; weight: number; confidence: number };
  };
}

export interface Prediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: ConfidenceLevel;
  breakdown: {
    form: { home: number; away: number };
    h2h: { home: number; away: number };
    weights: { form: number; h2h: number };
  };
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  league: string;
  odds: Odds;
  bookmakers: string[];
  prediction: Prediction;
  detailedPrediction?: DetailedAIPrediction; // Loaded on-demand
  form: {
    home: TeamForm;
    away: TeamForm;
  };
  h2h: HeadToHead;
}

export interface SearchFilters {
  oddsRange: { min: number; max: number };
  markets: MarketType[];
  bookmakers: string[];
  dateRange: { start: Date; end?: Date };
  leagues: string[];
  formWeight: number;
  h2hWeight: number;
}

export interface BettingSelection {
  matchId: string;
  match: Match;
  market: MarketType;
  outcome: string;
  odds: number;
}

export interface BookingCode {
  code: string;
  bookmaker: string;
  selections: BettingSelection[];
  totalOdds: number;
  createdAt: Date;
}
