import { describe, expect, it } from 'vitest';
import { formFromHistory, h2hFromHistory } from '@/lib/statsEnhancer';

describe('formFromHistory', () => {
  it('counts results from the form string and keeps season goal totals', () => {
    const form = formFromHistory({
      form: 'WWDLW', games_played: 5, goals_scored: 9, goals_conceded: 4, last_match: '2026-10-18',
    });
    expect(form).toEqual({
      form: 'WWDLW', gamesPlayed: 5, wins: 3, draws: 1, losses: 1, goalsScored: 9, goalsConceded: 4,
    });
  });
});

describe('h2hFromHistory', () => {
  const meeting = (home_team: string, away_team: string, home_goals: number, away_goals: number) =>
    ({ date: null, home_team, away_team, home_goals, away_goals });

  it("credits wins to today's teams even when they played at the other ground", () => {
    // Today Arsenal are at home; the meetings alternate venues
    const h2h = h2hFromHistory([
      meeting('Tottenham Hotspur', 'Arsenal', 1, 4), // Arsenal won away
      meeting('Arsenal', 'Tottenham Hotspur', 0, 2), // Tottenham won away
      meeting('Arsenal', 'Tottenham Hotspur', 1, 1),
    ], 'Arsenal');

    expect(h2h.homeWins).toBe(1);
    expect(h2h.awayWins).toBe(1);
    expect(h2h.draws).toBe(1);
    expect(h2h.lastResults).toEqual(['H', 'A', 'D']);
  });

  it("keeps each game's result from that fixture's home side", () => {
    const h2h = h2hFromHistory([meeting('Tottenham Hotspur', 'Arsenal', 1, 4)], 'Arsenal');
    expect(h2h.games[0]).toMatchObject({ homeTeam: 'Tottenham Hotspur', result: 'A' });
  });

  it('returns an empty record for teams that have never met', () => {
    expect(h2hFromHistory([], 'Arsenal')).toMatchObject({ totalMeetings: 0, games: [] });
  });
});
