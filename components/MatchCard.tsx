'use client';

import { Match } from '@/lib/types';
import { MarketType } from '@/lib/types';
import { useGextenStore } from '@/lib/store';
import { format } from 'date-fns';
import {
  TrendingUp, TrendingDown, Minus, Calendar, Activity, Brain,
  Loader2, ChevronDown, ChevronUp, Trophy, Target, BarChart3, AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

interface MatchCardProps {
  match: Match;
}

// ── Sport detection helpers ───────────────────────────────────────────────────

function getSportFlags(sportKey?: string, league?: string) {
  const key = sportKey ?? '';
  const lgr = league?.toLowerCase() ?? '';

  const isSoccer          = key.startsWith('soccer_')
    || /premier league|la liga|bundesliga|serie a|ligue|champions|europa|eredivisie|primeira|süper lig|brasileirão|liga mx|mls|primera/i.test(lgr);
  const isBasketball      = key.startsWith('basketball_')
    || /nba|wnba|ncaa basketball|euroleague|nbl/i.test(lgr);
  const isAmericanFootball = key.startsWith('americanfootball_') || /nfl|ncaaf/i.test(lgr);
  const isBaseball         = key.startsWith('baseball_')         || /mlb/i.test(lgr);
  const isIceHockey        = key.startsWith('icehockey_')        || /nhl/i.test(lgr);
  const isMMA              = key.startsWith('mma_')              || /mma|ufc/i.test(lgr);
  const isRugby            = key.startsWith('rugby')             || /nrl|super rugby/i.test(lgr);

  // Only soccer / rugby union support three-way (1X2) markets
  const isRugbyUnion = key.startsWith('rugbyunion_');
  const supportsDraw = isSoccer || isRugbyUnion;

  return { isSoccer, isBasketball, isAmericanFootball, isBaseball, isIceHockey, isMMA, isRugby, supportsDraw };
}

function getWinnerLabel(flags: ReturnType<typeof getSportFlags>): string {
  if (flags.isSoccer)           return 'MATCH WINNER (1X2)';
  if (flags.isBasketball)       return 'GAME WINNER (MONEYLINE)';
  if (flags.isAmericanFootball) return 'GAME WINNER (MONEYLINE)';
  if (flags.isBaseball)         return 'GAME WINNER (MONEYLINE)';
  if (flags.isIceHockey)        return 'GAME WINNER (MONEYLINE)';
  if (flags.isMMA)              return 'FIGHT WINNER (MONEYLINE)';
  if (flags.isRugby)            return 'MATCH WINNER';
  return 'WINNER (MONEYLINE)';
}

function getSpreadLabel(flags: ReturnType<typeof getSportFlags>): string {
  if (flags.isSoccer)           return 'ASIAN HANDICAP';
  if (flags.isBasketball)       return 'POINT SPREAD';
  if (flags.isAmericanFootball) return 'POINT SPREAD';
  if (flags.isBaseball)         return 'RUN LINE';
  if (flags.isIceHockey)        return 'PUCK LINE';
  if (flags.isRugby)            return 'HANDICAP';
  return 'SPREAD / HANDICAP';
}

function getTotalsLabel(flags: ReturnType<typeof getSportFlags>): string {
  if (flags.isSoccer)           return 'OVER/UNDER GOALS';
  if (flags.isBasketball)       return 'OVER/UNDER TOTAL POINTS';
  if (flags.isAmericanFootball) return 'OVER/UNDER TOTAL POINTS';
  if (flags.isBaseball)         return 'OVER/UNDER TOTAL RUNS';
  if (flags.isIceHockey)        return 'OVER/UNDER TOTAL GOALS';
  if (flags.isRugby)            return 'OVER/UNDER TOTAL POINTS';
  return 'OVER/UNDER';
}

function getGameLabel(flags: ReturnType<typeof getSportFlags>): string {
  if (flags.isMMA)      return 'Bout';
  if (flags.isSoccer)   return 'Match';
  return 'Game';
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatPoint(point: number): string {
  return point > 0 ? `+${point}` : `${point}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MatchCard({ match }: MatchCardProps) {
  const {
    selectedMatches, selectMatch, deselectMatch,
    fetchDetailedPrediction, getDetailedPrediction, isLoadingPrediction,
  } = useGextenStore();

  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const flags             = getSportFlags(match.sportKey, match.league);
  const { supportsDraw }  = flags;
  const isSelected        = selectedMatches.has(match.id);
  const detailedPrediction = getDetailedPrediction(match.id);
  const dataQuality        = detailedPrediction?.dataQuality ?? match.dataQuality;
  const showRealForm       = dataQuality?.form === 'real';
  const showRealH2H        = dataQuality?.h2h  === 'real';
  const isLoading          = isLoadingPrediction(match.id);

  const normalizeResultChar = (result: string): 'W' | 'L' | 'D' => {
    const n = result.toUpperCase();
    if (n === 'W') return 'W';
    if (n === 'D') return supportsDraw ? 'D' : 'L';
    return 'L';
  };

  const extractLastFiveForm = (formString?: string): Array<'W' | 'L' | 'D'> => {
    if (!formString || formString === 'N/A') return [];
    return formString.split('').map(normalizeResultChar).slice(0, 5);
  };

  const getTeamH2HResult = (game: any, teamName: string): 'W' | 'L' | 'D' => {
    if (game.homeGoals === game.awayGoals) return supportsDraw ? 'D' : 'L';
    const teamIsHome = game.homeTeam === teamName;
    const teamWon    = teamIsHome ? game.homeGoals > game.awayGoals : game.awayGoals > game.homeGoals;
    return teamWon ? 'W' : 'L';
  };

  const homeFormLastFive = showRealForm ? extractLastFiveForm(detailedPrediction?.form.home.formString) : [];
  const awayFormLastFive = showRealForm ? extractLastFiveForm(detailedPrediction?.form.away.formString) : [];
  const hasRealFormSection = homeFormLastFive.length > 0 || awayFormLastFive.length > 0;

  const h2hGamesLastFive = showRealH2H ? (detailedPrediction?.h2h.games || []).slice(0, 5) : [];
  const homeH2HLastFive  = h2hGamesLastFive.map(g => getTeamH2HResult(g, match.homeTeam.name));
  const awayH2HLastFive  = h2hGamesLastFive.map(g => getTeamH2HResult(g, match.awayTeam.name));
  const hasRealH2HSection = h2hGamesLastFive.length > 0;

  const explanationLines = (detailedPrediction?.explanation || []).filter(line => {
    if (!dataQuality) return true;
    if (dataQuality.form === 'mock' && /recent form/i.test(line)) return false;
    if (dataQuality.h2h  === 'mock' && /head-to-head/i.test(line)) return false;
    return true;
  });

  const handleShowAIAnalysis = async () => {
    if (!showAIAnalysis && !detailedPrediction) {
      await fetchDetailedPrediction(match.id);
    }
    setShowAIAnalysis(!showAIAnalysis);
  };

  const handleSelectOutcome = (market: MarketType, outcome: string, odds: number) => {
    if (isSelected) {
      deselectMatch(match.id);
    } else {
      selectMatch({ matchId: match.id, match, market, outcome, odds });
    }
  };

  const getConfidenceBadge = () => {
    const colors = {
      high:   'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low:    'bg-red-100 text-red-800',
    };
    return colors[match.prediction.confidence];
  };

  const getPredictionIcon = () => {
    if (match.prediction.homeWin > match.prediction.awayWin && match.prediction.homeWin > match.prediction.draw)
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (match.prediction.awayWin > match.prediction.homeWin && match.prediction.awayWin > match.prediction.draw)
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const formDot = (char: 'W' | 'L' | 'D') => (
    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
      char === 'W' ? 'bg-green-600 text-white' :
      char === 'D' ? 'bg-slate-400 text-white' :
                     'bg-red-600 text-white'
    }`}>{char}</span>
  );

  const { odds } = match;

  return (
    <div className={`bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 ${
      isSelected ? 'border-blue-600 shadow-xl shadow-blue-600/20' : 'border-slate-200 shadow-sm hover:border-blue-300'
    }`}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-900 block">{format(match.date, 'MMM dd, yyyy')}</span>
            <span className="text-xs text-slate-500">{format(match.date, 'HH:mm')}</span>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 bg-blue-600 text-white rounded-lg">
          {match.league}
        </span>
      </div>

      {/* ── Teams ──────────────────────────────────────────────────────────── */}
      <div className="mb-5 pb-5 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-lg text-slate-900">{match.homeTeam.name}</span>
          {showRealForm && match.form?.home?.form && match.form.home.form !== 'N/A' && (
            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
              {match.form.home.form}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center text-slate-400 text-sm font-semibold my-3">VS</div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-slate-900">{match.awayTeam.name}</span>
          {showRealForm && match.form?.away?.form && match.form.away.form !== 'N/A' && (
            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
              {match.form.away.form}
            </span>
          )}
        </div>
      </div>

      {/* ── Available Markets ───────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* 1 ── Match / Game Winner (H2H / Moneyline) */}
        {odds.h2h && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              {getWinnerLabel(flags)}
            </div>
            <div className={`grid ${supportsDraw ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
              <button
                onClick={() => handleSelectOutcome('h2h', `${match.homeTeam.name} Win`, odds.h2h!.home)}
                className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-blue-700 font-bold mb-1">HOME</div>
                <div className="text-2xl font-bold text-blue-900">{odds.h2h.home.toFixed(2)}</div>
              </button>
              {supportsDraw && (
                <button
                  onClick={() => handleSelectOutcome('h2h', 'Draw', odds.h2h!.draw)}
                  className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
                >
                  <div className="text-xs text-slate-700 font-bold mb-1">DRAW</div>
                  <div className="text-2xl font-bold text-slate-900">{odds.h2h.draw.toFixed(2)}</div>
                </button>
              )}
              <button
                onClick={() => handleSelectOutcome('h2h', `${match.awayTeam.name} Win`, odds.h2h!.away)}
                className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-blue-700 font-bold mb-1">AWAY</div>
                <div className="text-2xl font-bold text-blue-900">{odds.h2h.away.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* 2 ── Spread / Handicap */}
        {odds.spreads && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              {getSpreadLabel(flags)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('spreads', `${match.homeTeam.name} ${formatPoint(odds.spreads!.home.point)}`, odds.spreads!.home.price)}
                className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-purple-700 font-bold mb-1">HOME</div>
                <div className="text-lg font-bold text-purple-600">{formatPoint(odds.spreads.home.point)}</div>
                <div className="text-2xl font-bold text-purple-900">{odds.spreads.home.price.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('spreads', `${match.awayTeam.name} ${formatPoint(odds.spreads!.away.point)}`, odds.spreads!.away.price)}
                className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-purple-700 font-bold mb-1">AWAY</div>
                <div className="text-lg font-bold text-purple-600">{formatPoint(odds.spreads.away.point)}</div>
                <div className="text-2xl font-bold text-purple-900">{odds.spreads.away.price.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* 3 ── Over / Under Total */}
        {odds.ou25 && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              {getTotalsLabel(flags)}
              {odds.ou25.point !== undefined && (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                  Line: {odds.ou25.point}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('ou25', `Over ${odds.ou25!.point ?? ''}`.trim(), odds.ou25!.over)}
                className="bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-green-700 font-bold mb-1">
                  OVER{odds.ou25.point !== undefined ? ` ${odds.ou25.point}` : ''}
                </div>
                <div className="text-2xl font-bold text-green-900">{odds.ou25.over.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('ou25', `Under ${odds.ou25!.point ?? ''}`.trim(), odds.ou25!.under)}
                className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-orange-700 font-bold mb-1">
                  UNDER{odds.ou25.point !== undefined ? ` ${odds.ou25.point}` : ''}
                </div>
                <div className="text-2xl font-bold text-orange-900">{odds.ou25.under.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* 4 ── Team Totals (home and away) */}
        {odds.teamTotals && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" />
              TEAM TOTALS
            </div>
            <div className="space-y-2">
              {/* Home team totals */}
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {match.homeTeam.name}
                  <span className="text-slate-400 font-normal ml-1">(line: {odds.teamTotals.home.point})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectOutcome('teamTotals', `${match.homeTeam.name} Over ${odds.teamTotals!.home.point}`, odds.teamTotals!.home.over)}
                    className="bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-600 rounded-xl p-3 text-center transition-all"
                  >
                    <div className="text-xs text-teal-700 font-bold mb-0.5">OVER {odds.teamTotals.home.point}</div>
                    <div className="text-xl font-bold text-teal-900">{odds.teamTotals.home.over.toFixed(2)}</div>
                  </button>
                  <button
                    onClick={() => handleSelectOutcome('teamTotals', `${match.homeTeam.name} Under ${odds.teamTotals!.home.point}`, odds.teamTotals!.home.under)}
                    className="bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-600 rounded-xl p-3 text-center transition-all"
                  >
                    <div className="text-xs text-teal-700 font-bold mb-0.5">UNDER {odds.teamTotals.home.point}</div>
                    <div className="text-xl font-bold text-teal-900">{odds.teamTotals.home.under.toFixed(2)}</div>
                  </button>
                </div>
              </div>
              {/* Away team totals */}
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  {match.awayTeam.name}
                  <span className="text-slate-400 font-normal ml-1">(line: {odds.teamTotals.away.point})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSelectOutcome('teamTotals', `${match.awayTeam.name} Over ${odds.teamTotals!.away.point}`, odds.teamTotals!.away.over)}
                    className="bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-600 rounded-xl p-3 text-center transition-all"
                  >
                    <div className="text-xs text-teal-700 font-bold mb-0.5">OVER {odds.teamTotals.away.point}</div>
                    <div className="text-xl font-bold text-teal-900">{odds.teamTotals.away.over.toFixed(2)}</div>
                  </button>
                  <button
                    onClick={() => handleSelectOutcome('teamTotals', `${match.awayTeam.name} Under ${odds.teamTotals!.away.point}`, odds.teamTotals!.away.under)}
                    className="bg-teal-50 hover:bg-teal-100 border-2 border-teal-200 hover:border-teal-600 rounded-xl p-3 text-center transition-all"
                  >
                    <div className="text-xs text-teal-700 font-bold mb-0.5">UNDER {odds.teamTotals.away.point}</div>
                    <div className="text-xl font-bold text-teal-900">{odds.teamTotals.away.under.toFixed(2)}</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5 ── Both Teams To Score (soccer only) */}
        {odds.btts && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              BOTH TEAMS TO SCORE (BTTS)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('btts', 'BTTS Yes', odds.btts!.yes)}
                className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-purple-700 font-bold mb-1">YES</div>
                <div className="text-2xl font-bold text-purple-900">{odds.btts.yes.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('btts', 'BTTS No', odds.btts!.no)}
                className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-slate-700 font-bold mb-1">NO</div>
                <div className="text-2xl font-bold text-slate-900">{odds.btts.no.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* 6 ── Draw No Bet */}
        {odds.drawNoBet && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600" />
              DRAW NO BET (DNB)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('drawNoBet', `DNB ${match.homeTeam.name}`, odds.drawNoBet!.home)}
                className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-amber-700 font-bold mb-1">HOME WIN OR REFUND</div>
                <div className="text-2xl font-bold text-amber-900">{odds.drawNoBet.home.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('drawNoBet', `DNB ${match.awayTeam.name}`, odds.drawNoBet!.away)}
                className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 hover:border-amber-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-amber-700 font-bold mb-1">AWAY WIN OR REFUND</div>
                <div className="text-2xl font-bold text-amber-900">{odds.drawNoBet.away.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* 7 ── Double Chance */}
        {odds.doubleChance && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              DOUBLE CHANCE
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleSelectOutcome('doubleChance', '1X — Home or Draw', odds.doubleChance!.homeOrDraw)}
                className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-indigo-700 font-bold mb-1">1X</div>
                <div className="text-xs text-indigo-600 mb-1">Home or Draw</div>
                <div className="text-xl font-bold text-indigo-900">{odds.doubleChance.homeOrDraw.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('doubleChance', '12 — No Draw', odds.doubleChance!.homeOrAway)}
                className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-indigo-700 font-bold mb-1">12</div>
                <div className="text-xs text-indigo-600 mb-1">No Draw</div>
                <div className="text-xl font-bold text-indigo-900">{odds.doubleChance.homeOrAway.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('doubleChance', 'X2 — Away or Draw', odds.doubleChance!.drawOrAway)}
                className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-indigo-700 font-bold mb-1">X2</div>
                <div className="text-xs text-indigo-600 mb-1">Away or Draw</div>
                <div className="text-xl font-bold text-indigo-900">{odds.doubleChance.drawOrAway.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}

        {/* No market data notice */}
        {!odds.h2h && !odds.ou25 && !odds.btts && !odds.spreads && !odds.teamTotals && !odds.drawNoBet && !odds.doubleChance && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>Limited data available.</strong> None of the requested markets are available for this match from the selected bookmakers.
            </div>
          </div>
        )}
      </div>

      {/* ── Show AI Analysis button ─────────────────────────────────────────── */}
      <div className="mt-4">
        <button
          onClick={handleShowAIAnalysis}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Loading Analysis...</span></>
          ) : (
            <><Brain className="w-4 h-4" /><span>{showAIAnalysis ? 'Hide' : 'Show'} AI Analysis</span>
              {showAIAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>

      {/* ── Detailed AI Analysis ─────────────────────────────────────────────── */}
      {showAIAnalysis && detailedPrediction && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">

          {/* Predicted Outcome */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              <h3 className="font-bold text-lg">Predicted Outcome</h3>
            </div>
            <div className={`grid ${supportsDraw ? 'grid-cols-3' : 'grid-cols-2'} gap-4 text-center`}>
              <div className={`p-3 rounded-lg ${detailedPrediction.predictedWinner === 'home' ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
                <div className="text-sm opacity-90 mb-1">Home Win</div>
                <div className="text-2xl font-bold">{detailedPrediction.homeWin}%</div>
              </div>
              {supportsDraw && (
                <div className={`p-3 rounded-lg ${detailedPrediction.predictedWinner === 'draw' ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
                  <div className="text-sm opacity-90 mb-1">Draw</div>
                  <div className="text-2xl font-bold">{detailedPrediction.draw}%</div>
                </div>
              )}
              <div className={`p-3 rounded-lg ${detailedPrediction.predictedWinner === 'away' ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
                <div className="text-sm opacity-90 mb-1">Away Win</div>
                <div className="text-2xl font-bold">{detailedPrediction.awayWin}%</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <span className="text-sm opacity-90">Confidence Level</span>
              <span className="font-bold text-lg capitalize">{detailedPrediction.confidence}</span>
            </div>
          </div>

          {/* Recent Form */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">
                Recent Form (Last 5 {getGameLabel(flags)}s)
              </h3>
            </div>
            {hasRealFormSection ? (
              <div className="space-y-3">
                {homeFormLastFive.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{match.homeTeam.name}</span>
                    <div className="flex gap-1">{homeFormLastFive.map((c, i) => <span key={i}>{formDot(c)}</span>)}</div>
                  </div>
                )}
                {awayFormLastFive.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{match.awayTeam.name}</span>
                    <div className="flex gap-1">{awayFormLastFive.map((c, i) => <span key={i}>{formDot(c)}</span>)}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Not available</div>
            )}
          </div>

          {/* Head-to-Head */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">
                Head-to-Head (Last 5 {getGameLabel(flags)}s)
              </h3>
            </div>
            {hasRealH2HSection ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{match.homeTeam.name}</span>
                  <div className="flex gap-1">{homeH2HLastFive.map((c, i) => <span key={i}>{formDot(c)}</span>)}</div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{match.awayTeam.name}</span>
                  <div className="flex gap-1">{awayH2HLastFive.map((c, i) => <span key={i}>{formDot(c)}</span>)}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Not available</div>
            )}
          </div>

          {/* Recommended Bet */}
          {detailedPrediction.recommendedBet && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-slate-900">Recommended Bet</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-lg font-semibold text-green-700">{detailedPrediction.recommendedBet}</p>
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {explanationLines.length > 0 && (
            <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">AI Analysis</h3>
              </div>
              <ul className="space-y-2">
                {explanationLines.map((line, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advanced Factors */}
          {detailedPrediction.factors && (
            <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Prediction Factors</h3>
              </div>
              <div className="space-y-3">
                {Object.entries(detailedPrediction.factors).map(([key, factor]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">{factor.weight}% weight</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {(factor.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.score > 60 ? 'bg-green-600' : factor.score > 40 ? 'bg-yellow-500' : 'bg-red-600'}`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">How to read:</span> Bars show home team advantage (0–100, 50 = neutral).
                  Higher confidence factors carry more weight in the final prediction.
                </p>
              </div>
            </div>
          )}

          {/* Probability Breakdown */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Prediction Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Form Score</span>
                  <span className="font-semibold text-slate-900">
                    {detailedPrediction.breakdown.formScore.home.toFixed(1)} — {detailedPrediction.breakdown.formScore.away.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-green-600" style={{ width: `${(detailedPrediction.breakdown.formScore.home / (detailedPrediction.breakdown.formScore.home + detailedPrediction.breakdown.formScore.away)) * 100}%` }} />
                  <div className="bg-red-600"   style={{ width: `${(detailedPrediction.breakdown.formScore.away / (detailedPrediction.breakdown.formScore.home + detailedPrediction.breakdown.formScore.away)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">H2H Score</span>
                  <span className="font-semibold text-slate-900">
                    {detailedPrediction.breakdown.h2hScore.home.toFixed(1)} — {detailedPrediction.breakdown.h2hScore.away.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-green-600" style={{ width: `${(detailedPrediction.breakdown.h2hScore.home / (detailedPrediction.breakdown.h2hScore.home + detailedPrediction.breakdown.h2hScore.away)) * 100}%` }} />
                  <div className="bg-red-600"   style={{ width: `${(detailedPrediction.breakdown.h2hScore.away / (detailedPrediction.breakdown.h2hScore.home + detailedPrediction.breakdown.h2hScore.away)) * 100}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-900 font-semibold">Final Probabilities</span>
                  <span className="font-bold text-blue-600">
                    {detailedPrediction.breakdown.finalScore.home.toFixed(1)}% — {detailedPrediction.breakdown.finalScore.away.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-blue-600"   style={{ width: `${(detailedPrediction.breakdown.finalScore.home / (detailedPrediction.breakdown.finalScore.home + detailedPrediction.breakdown.finalScore.away)) * 100}%` }} />
                  <div className="bg-blue-800"   style={{ width: `${(detailedPrediction.breakdown.finalScore.away / (detailedPrediction.breakdown.finalScore.home + detailedPrediction.breakdown.finalScore.away)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
