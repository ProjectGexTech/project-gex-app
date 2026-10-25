import { describe, expect, it } from 'vitest';
import { formatSlip } from '@/components/BetSlip';
import { BettingSelection } from '@/lib/types';

describe('formatSlip', () => {
  it('lists each pick with its odds and the combined odds', () => {
    const selection = {
      matchId: 'm1',
      market: 'h2h',
      outcome: 'Home Win',
      odds: 2.1,
      match: {
        homeTeam: { name: 'Arsenal' },
        awayTeam: { name: 'Chelsea' },
        league: 'Premier League',
        date: new Date(2026, 9, 26, 15, 0), // local time, as the slip prints it
      },
    } as unknown as BettingSelection;

    expect(formatSlip([selection], 2.1)).toBe([
      'Gexten bet slip',
      '1. Arsenal vs Chelsea (Premier League, Mon 26 Oct, 15:00)',
      '   Home Win @ 2.10',
      'Combined odds: 2.10 (average across bookmakers)',
    ].join('\n'));
  });
});
