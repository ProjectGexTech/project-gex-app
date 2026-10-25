import { Match, MLPrediction } from './types';

/**
 * Send a fixture to the Python ML server (via Next.js proxy) and return
 * calibrated predictions for 1X2, Over/Under 2.5, and BTTS markets.
 *
 * Only the fixture and its odds are sent — the server computes form, goals,
 * shots, Elo and H2H from its own match history (python_model/features.py),
 * so training and prediction share one definition. Unknown odds are sent as null.
 */
export async function getMLPrediction(match: Match): Promise<MLPrediction> {
  const { odds } = match;
  const isOU25 = odds.ou25 && (odds.ou25.point ?? 2.5) === 2.5;

  const payload = {
    sport_key:       match.sportKey ?? '',
    home_team:       match.homeTeam.name,
    away_team:       match.awayTeam.name,
    commence_time:   new Date(match.date).toISOString(),
    odds_home:       odds.h2h?.home ?? null,
    odds_draw:       odds.h2h?.draw ?? null,
    odds_away:       odds.h2h?.away ?? null,
    odds_ou25_over:  isOU25 ? odds.ou25!.over : null,
    odds_ou25_under: isOU25 ? odds.ou25!.under : null,
  };

  const response = await fetch('/api/ml-predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      (err as Record<string, string>).error ?? `ML prediction failed (${response.status})`
    );
  }

  return response.json() as Promise<MLPrediction>;
}
