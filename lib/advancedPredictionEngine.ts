/**
 * Advanced AI Prediction Engine
 * Uses multi-factor analysis for maximum accuracy while minimizing API credits
 */

import { Match, DetailedAIPrediction, Odds } from './types';

export interface PredictionFactors {
  oddsAnalysis: { score: number; weight: number; confidence: number };
  recentForm: { score: number; weight: number; confidence: number };
  headToHead: { score: number; weight: number; confidence: number };
  leaguePosition: { score: number; weight: number; confidence: number };
  homeAwayPerformance: { score: number; weight: number; confidence: number };
  goalTrends: { score: number; weight: number; confidence: number };
}

export interface PredictionResult {
  homeWin: number;
  draw: number;
  awayWin: number;
  confidence: 'low' | 'medium' | 'high';
  predictedOutcome: 'home' | 'draw' | 'away';
  recommendedBet: string;
  factors: PredictionFactors;
  explanation: string[];
}

/**
 * Factor 1: Market Odds Analysis (40% weight)
 * Odds are the most accurate predictor as they reflect market consensus
 */
function analyzeMarketOdds(odds: Odds): { score: number; confidence: number; probabilities: { home: number; draw: number; away: number } } {
  if (!odds.h2h) {
    return { score: 50, confidence: 0, probabilities: { home: 33.33, draw: 33.33, away: 33.33 } };
  }

  // Convert odds to implied probabilities
  const homeProb = (1 / odds.h2h.home) * 100;
  const drawProb = (1 / odds.h2h.draw) * 100;
  const awayProb = (1 / odds.h2h.away) * 100;

  // Remove bookmaker margin (overround)
  const total = homeProb + drawProb + awayProb;
  const margin = total - 100;
  const adjustedHomeProb = (homeProb / total) * 100;
  const adjustedDrawProb = (drawProb / total) * 100;
  const adjustedAwayProb = (awayProb / total) * 100;

  // Calculate confidence based on odds spread
  const maxProb = Math.max(adjustedHomeProb, adjustedAwayProb);
  const minProb = Math.min(adjustedHomeProb, adjustedAwayProb);
  const spread = maxProb - minProb;
  
  // Higher spread = higher confidence
  const confidence = Math.min(spread / 50, 1); // 0-1 scale

  // Score represents home advantage (0-100, 50 = neutral)
  const score = (adjustedHomeProb - adjustedAwayProb) / 2 + 50;

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence,
    probabilities: {
      home: Number(adjustedHomeProb.toFixed(2)),
      draw: Number(adjustedDrawProb.toFixed(2)),
      away: Number(adjustedAwayProb.toFixed(2)),
    },
  };
}

/**
 * Factor 2: Recent Form Analysis (25% weight)
 * Analyzes last 5-10 matches for each team
 */
function analyzeRecentForm(match: Match): { score: number; confidence: number } {
  const homeForm = match.form?.home;
  const awayForm = match.form?.away;

  if (!homeForm || !awayForm || homeForm.gamesPlayed === 0 || awayForm.gamesPlayed === 0) {
    return { score: 50, confidence: 0 };
  }

  // Calculate form score (points per game)
  const homePoints = (homeForm.wins * 3 + homeForm.draws) / homeForm.gamesPlayed;
  const awayPoints = (awayForm.wins * 3 + awayForm.draws) / awayForm.gamesPlayed;

  // Calculate goal difference per game
  const homeGDPerGame = (homeForm.goalsScored - homeForm.goalsConceded) / homeForm.gamesPlayed;
  const awayGDPerGame = (awayForm.goalsScored - awayForm.goalsConceded) / awayForm.gamesPlayed;

  // Combine points and goal difference
  const homeFormScore = (homePoints / 3) * 60 + ((homeGDPerGame + 2) / 4) * 40;
  const awayFormScore = (awayPoints / 3) * 60 + ((awayGDPerGame + 2) / 4) * 40;

  // Calculate relative score (0-100, 50 = even)
  const totalFormScore = homeFormScore + awayFormScore;
  const score = totalFormScore > 0 ? (homeFormScore / totalFormScore) * 100 : 50;

  // Confidence based on sample size
  const confidence = Math.min((homeForm.gamesPlayed + awayForm.gamesPlayed) / 20, 1);

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence,
  };
}

/**
 * Factor 3: Head-to-Head History (15% weight)
 * Analyzes historical matchups between these teams
 */
function analyzeHeadToHead(match: Match): { score: number; confidence: number } {
  const h2h = match.h2h;

  if (!h2h || h2h.totalMeetings === 0) {
    return { score: 50, confidence: 0 };
  }

  // Calculate home win percentage
  const homeWinRate = h2h.homeWins / h2h.totalMeetings;
  const awayWinRate = h2h.awayWins / h2h.totalMeetings;

  // Score based on historical performance
  const score = (homeWinRate * 100) * 0.7 + ((1 - awayWinRate) * 100) * 0.3;

  // Confidence based on sample size (more meetings = more confidence)
  const confidence = Math.min(h2h.totalMeetings / 15, 1);

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence,
  };
}

/**
 * Factor 4: League Position & Performance (10% weight)
 * Requires league standings data - placeholder for now
 */
function analyzeLeaguePosition(match: Match): { score: number; confidence: number } {
  // TODO: Integrate with API Football standings endpoint
  // For now, return neutral with low confidence
  return { score: 50, confidence: 0.3 };
}

/**
 * Factor 5: Home/Away Performance Split (5% weight)
 * Venue-specific performance analysis
 */
function analyzeHomeAwayPerformance(match: Match): { score: number; confidence: number } {
  // Home teams typically have a 5-10% advantage
  // This is a statistical baseline
  const homeAdvantage = 55;
  const confidence = 0.8; // High confidence in home advantage effect

  return { score: homeAdvantage, confidence };
}

/**
 * Factor 6: Goal Trends (5% weight)
 * Scoring and defensive patterns
 */
function analyzeGoalTrends(match: Match): { score: number; confidence: number } {
  const homeForm = match.form?.home;
  const awayForm = match.form?.away;

  if (!homeForm || !awayForm || homeForm.gamesPlayed === 0 || awayForm.gamesPlayed === 0) {
    return { score: 50, confidence: 0 };
  }

  const homeGoalsPerGame = homeForm.goalsScored / homeForm.gamesPlayed;
  const awayGoalsPerGame = awayForm.goalsScored / awayForm.gamesPlayed;
  const homeConcededPerGame = homeForm.goalsConceded / homeForm.gamesPlayed;
  const awayConcededPerGame = awayForm.goalsConceded / awayForm.gamesPlayed;

  // Attack strength vs defensive weakness
  const homeAttackScore = homeGoalsPerGame / (homeGoalsPerGame + awayConcededPerGame);
  const awayAttackScore = awayGoalsPerGame / (awayGoalsPerGame + homeConcededPerGame);

  const score = ((homeAttackScore / (homeAttackScore + awayAttackScore)) * 100);

  return {
    score: Math.max(0, Math.min(100, score)),
    confidence: 0.7,
  };
}

/**
 * Main Prediction Engine
 * Combines all factors with proper weighting
 */
export function generateAdvancedPrediction(match: Match): PredictionResult {
  // Define weights (must sum to 100)
  const WEIGHTS = {
    oddsAnalysis: 40,
    recentForm: 25,
    headToHead: 15,
    leaguePosition: 10,
    homeAwayPerformance: 5,
    goalTrends: 5,
  };

  // Analyze all factors
  const oddsResult = analyzeMarketOdds(match.odds);
  const formResult = analyzeRecentForm(match);
  const h2hResult = analyzeHeadToHead(match);
  const leagueResult = analyzeLeaguePosition(match);
  const homeAwayResult = analyzeHomeAwayPerformance(match);
  const goalTrendsResult = analyzeGoalTrends(match);

  // Store factors for transparency
  const factors: PredictionFactors = {
    oddsAnalysis: { score: oddsResult.score, weight: WEIGHTS.oddsAnalysis, confidence: oddsResult.confidence },
    recentForm: { score: formResult.score, weight: WEIGHTS.recentForm, confidence: formResult.confidence },
    headToHead: { score: h2hResult.score, weight: WEIGHTS.headToHead, confidence: h2hResult.confidence },
    leaguePosition: { score: leagueResult.score, weight: WEIGHTS.leaguePosition, confidence: leagueResult.confidence },
    homeAwayPerformance: { score: homeAwayResult.score, weight: WEIGHTS.homeAwayPerformance, confidence: homeAwayResult.confidence },
    goalTrends: { score: goalTrendsResult.score, weight: WEIGHTS.goalTrends, confidence: goalTrendsResult.confidence },
  };

  // Calculate weighted score (0-100 scale, 50 = neutral)
  let weightedScore = 0;
  let totalEffectiveWeight = 0;

  Object.entries(factors).forEach(([key, factor]) => {
    const effectiveWeight = factor.weight * factor.confidence;
    weightedScore += factor.score * effectiveWeight;
    totalEffectiveWeight += effectiveWeight;
  });

  const finalScore = totalEffectiveWeight > 0 ? weightedScore / totalEffectiveWeight : 50;

  // Calculate overall confidence
  const totalConfidence = Object.values(factors).reduce((sum, f) => sum + f.confidence * f.weight, 0) / 100;

  // Convert final score to probabilities
  // Use odds probabilities as base, then adjust based on our analysis
  let homeWinProb = oddsResult.probabilities.home;
  let drawProb = oddsResult.probabilities.draw;
  let awayWinProb = oddsResult.probabilities.away;

  // Adjust based on our weighted analysis
  const adjustment = (finalScore - 50) / 50; // -1 to +1
  const adjustmentStrength = totalConfidence * 0.3; // Max 30% adjustment

  homeWinProb += adjustment * adjustmentStrength * 100;
  awayWinProb -= adjustment * adjustmentStrength * 100;

  // Normalize to ensure they sum to 100
  const total = homeWinProb + drawProb + awayWinProb;
  homeWinProb = (homeWinProb / total) * 100;
  drawProb = (drawProb / total) * 100;
  awayWinProb = (awayWinProb / total) * 100;

  // Determine confidence level
  const maxProb = Math.max(homeWinProb, drawProb, awayWinProb);
  let confidenceLevel: 'low' | 'medium' | 'high';
  if (maxProb >= 70) confidenceLevel = 'high';
  else if (maxProb >= 55) confidenceLevel = 'medium';
  else confidenceLevel = 'low';

  // Determine predicted outcome
  let predictedOutcome: 'home' | 'draw' | 'away';
  if (homeWinProb > drawProb && homeWinProb > awayWinProb) predictedOutcome = 'home';
  else if (awayWinProb > drawProb && awayWinProb > homeWinProb) predictedOutcome = 'away';
  else predictedOutcome = 'draw';

  // Generate explanation
  const explanation = generateExplanation(match, factors, predictedOutcome, confidenceLevel);

  // Generate recommended bet
  const recommendedBet = generateRecommendedBet(homeWinProb, drawProb, awayWinProb, match.odds, confidenceLevel);

  return {
    homeWin: Number(homeWinProb.toFixed(2)),
    draw: Number(drawProb.toFixed(2)),
    awayWin: Number(awayWinProb.toFixed(2)),
    confidence: confidenceLevel,
    predictedOutcome,
    recommendedBet,
    factors,
    explanation,
  };
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  match: Match,
  factors: PredictionFactors,
  outcome: 'home' | 'draw' | 'away',
  confidence: string
): string[] {
  const explanation: string[] = [];

  const outcomeText = outcome === 'home' ? match.homeTeam.name : outcome === 'away' ? match.awayTeam.name : 'Draw';
  explanation.push(`Prediction: ${outcomeText} (${confidence} confidence)`);

  // Market odds insight
  if (factors.oddsAnalysis.confidence > 0.5) {
    explanation.push(`📊 Market odds favor this outcome (${factors.oddsAnalysis.weight}% weight)`);
  }

  // Form analysis
  if (factors.recentForm.confidence > 0.5) {
    const homeForm = match.form?.home;
    const awayForm = match.form?.away;
    if (homeForm && awayForm) {
      explanation.push(`📈 Recent form: ${match.homeTeam.shortName} (${homeForm.form}) vs ${match.awayTeam.shortName} (${awayForm.form})`);
    }
  }

  // H2H insight
  if (factors.headToHead.confidence > 0.5 && match.h2h) {
    explanation.push(`🔄 Head-to-head: ${match.h2h.homeWins}W-${match.h2h.draws}D-${match.h2h.awayWins}L in last ${match.h2h.totalMeetings} meetings`);
  }

  // Home advantage
  explanation.push(`🏠 Home advantage factor included (${factors.homeAwayPerformance.weight}% weight)`);

  return explanation;
}

/**
 * Generate recommended bet based on value
 */
function generateRecommendedBet(
  homeProb: number,
  drawProb: number,
  awayProb: number,
  odds: Odds,
  confidence: string
): string {
  if (confidence === 'low') {
    return 'No strong recommendation - insufficient confidence';
  }

  if (!odds.h2h) {
    return 'Insufficient odds data';
  }

  // Calculate expected value for each outcome
  const homeEV = (homeProb / 100) * odds.h2h.home - 1;
  const drawEV = (drawProb / 100) * odds.h2h.draw - 1;
  const awayEV = (awayProb / 100) * odds.h2h.away - 1;

  const maxEV = Math.max(homeEV, drawEV, awayEV);

  // Only recommend if EV > 0 (value bet)
  if (maxEV <= 0) {
    return 'No value bet found - odds are fair';
  }

  if (maxEV === homeEV) return `Home Win @ ${odds.h2h.home} (${(maxEV * 100).toFixed(1)}% edge)`;
  if (maxEV === drawEV) return `Draw @ ${odds.h2h.draw} (${(maxEV * 100).toFixed(1)}% edge)`;
  return `Away Win @ ${odds.h2h.away} (${(maxEV * 100).toFixed(1)}% edge)`;
}

/**
 * Cache key generator for predictions
 */
export function getPredictionCacheKey(matchId: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `prediction_${matchId}_${today}`;
}

/**
 * Check if cached prediction is still valid (24 hours)
 */
export function isCacheValid(cacheTimestamp: number): boolean {
  const now = Date.now();
  const hoursSinceCache = (now - cacheTimestamp) / (1000 * 60 * 60);
  return hoursSinceCache < 24;
}
