'use client';

import { useGextenStore } from '@/lib/store';
import { BettingSelection } from '@/lib/types';
import { useState } from 'react';
import { format } from 'date-fns';
import { ShoppingCart, Ticket, Copy, CheckCircle2, XCircle, Info } from 'lucide-react';

// Plain-text slip the user can paste into notes or a chat, or use as a checklist at their bookmaker
export function formatSlip(selections: BettingSelection[], totalOdds: number): string {
  const lines = selections.map((sel, i) => {
    const { match } = sel;
    const kickoff = format(new Date(match.date), 'EEE d MMM, HH:mm');
    return `${i + 1}. ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.league}, ${kickoff})\n   ${sel.outcome} @ ${sel.odds.toFixed(2)}`;
  });
  return [
    'Gexten bet slip',
    ...lines,
    `Combined odds: ${totalOdds.toFixed(2)} (average across bookmakers)`,
  ].join('\n');
}

export default function BetSlip() {
  const { selectedMatches, clearSelections } = useGextenStore();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const selections = Array.from(selectedMatches.values());
  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSlip(selections, totalOdds));
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyFailed(true);
    }
  };

  if (selections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No selections yet</h3>
          <p className="text-slate-600 text-sm">
            Select matches from the list to build your bet slip
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Bet Slip</h2>
      </div>

      {/* Selections */}
      <div className="space-y-3 mb-6">
        {selections.map((selection) => (
          <div key={selection.matchId} className="bg-slate-50 rounded-lg p-3 border-2 border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-slate-900">
                  {selection.match.homeTeam.shortName} vs {selection.match.awayTeam.shortName}
                </div>
                <div className="text-sm text-slate-600">
                  {selection.match.league}
                </div>
              </div>
              <button
                onClick={() => useGextenStore.getState().deselectMatch(selection.matchId)}
                className="text-red-500 hover:text-red-700"
                title="Remove selection"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{selection.outcome}</span>
              <span className="text-lg font-bold text-slate-900">{selection.odds.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Odds */}
      <div className="bg-blue-50 rounded-xl p-5 mb-4 border-2 border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-blue-900 font-bold">Combined Odds</span>
          <span className="text-4xl font-black text-blue-600">{totalOdds.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-xs text-blue-700 font-medium">
          {selections.length} selection{selections.length !== 1 ? 's' : ''} · average across bookmakers
        </div>
      </div>

      {/* What this slip is and isn't */}
      <div className="flex gap-2 bg-amber-50 border-2 border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-900">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Gexten can&apos;t place bets or create bookmaker booking codes. Add these selections on your
          bookmaker&apos;s site yourself; their prices may differ from these averages.
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
      >
        {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? 'Copied' : 'Copy Selections'}
      </button>
      {copyFailed && (
        <p className="mt-2 text-xs text-red-600">
          Your browser blocked copying. Select the matches above and copy them manually.
        </p>
      )}

      <button
        onClick={clearSelections}
        className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all border-2 border-slate-300"
      >
        Clear All
      </button>
    </div>
  );
}
