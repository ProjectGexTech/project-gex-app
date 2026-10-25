import { describe, expect, it } from 'vitest';
import { generateAdvancedPrediction } from '@/lib/advancedPredictionEngine';
import { Match, TeamForm } from '@/lib/types';

const form = (results: string): TeamForm => ({
  form: results,
  gamesPlayed: results.length,
  wins: [...results].filter(r => r === 'W').length,
  draws: [...results].filter(r => r === 'D').length,
  losses: [...results].filter(r => r === 'L').length,
  goalsScored: 10,
  goalsConceded: 10,
});

const match = (homeForm: string, awayForm: string): Match => ({
  id: 'm1',
  sportKey: 'soccer_epl',
  homeTeam: { id: 'h', name: 'Home FC', shortName: 'HOM' },
  awayTeam: { id: 'a', name: 'Away FC', shortName: 'AWA' },
  date: new Date('2026-10-26T15:00:00Z'),
  league: 'Premier League',
  odds: { h2h: { home: 2.5, draw: 3.2, away: 2.9 } },
  bookmakers: [],
  form: { home: form(homeForm), away: form(awayForm) },
  h2h: { totalMeetings: 0, homeWins: 0, awayWins: 0, draws: 0, lastResults: [], games: [] },
} as unknown as Match);

describe('generateAdvancedPrediction', () => {
  it('reads form strings oldest to newest, so recent results count most', () => {
    // Same 5 wins and 5 losses each; home won the latest five, away lost them
    const prediction = generateAdvancedPrediction(match('LLLLLWWWWW', 'WWWWWLLLLL'));
    expect(prediction.factors.recentForm.score).toBeGreaterThan(50);
  });

  it('leaves out form and head-to-head when there is no data', () => {
    const prediction = generateAdvancedPrediction(match('', ''));
    expect(prediction.factors.recentForm.confidence).toBe(0);
    expect(prediction.factors.headToHead.confidence).toBe(0);
  });

  it('returns probabilities that sum to 100', () => {
    const p = generateAdvancedPrediction(match('WWDLW', 'LDLWD'));
    expect(p.homeWin + p.draw + p.awayWin).toBeCloseTo(100, 1);
  });
});
