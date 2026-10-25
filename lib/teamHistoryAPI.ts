import { Match } from './types';

export interface HistoryTeamRecord {
  form: string; // This season, oldest → newest
  games_played: number;
  goals_scored: number;
  goals_conceded: number;
  last_match: string | null;
}

export interface HistoryMeeting {
  date: string | null;
  home_team: string; // The app's own team names
  away_team: string;
  home_goals: number;
  away_goals: number;
}

export interface TeamHistoryStats {
  season: string;
  data_through: string | null;
  home: HistoryTeamRecord;
  away: HistoryTeamRecord;
  h2h: HistoryMeeting[]; // Most recent first
}

/**
 * This season's form and past meetings from the ML server's match history
 * (football-data.co.uk results for 13 leagues), via the Next.js proxy.
 */
export async function getTeamHistory(
  match: Pick<Match, 'sportKey' | 'homeTeam' | 'awayTeam'>
): Promise<{ data: TeamHistoryStats } | { error: string }> {
  try {
    const response = await fetch('/api/team-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sport_key: match.sportKey,
        home_team: match.homeTeam.name,
        away_team: match.awayTeam.name,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { error: (body as Record<string, string>).error ?? `Match history unavailable (${response.status})` };
    }
    return { data: body as TeamHistoryStats };
  } catch {
    return { error: 'Match history unavailable' };
  }
}
