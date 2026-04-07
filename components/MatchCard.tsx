'use client';

import { Match } from '@/lib/types';
import { useGextenStore } from '@/lib/store';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Brain, Loader2, ChevronDown, ChevronUp, Trophy, Target, BarChart3, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const { 
    selectedMatches, 
    selectMatch, 
    deselectMatch, 
    fetchDetailedPrediction, 
    getDetailedPrediction,
    isLoadingPrediction 
  } = useGextenStore();
  
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const isBasketball =
    match.sportKey?.startsWith('basketball_') ||
    /nba|wnba|ncaa|euroleague|basketball/i.test(match.league);
  const isSelected = selectedMatches.has(match.id);
  const detailedPrediction = getDetailedPrediction(match.id);
  const dataQuality = detailedPrediction?.dataQuality ?? match.dataQuality;
  const showRealForm = dataQuality?.form === 'real';
  const showRealH2H = dataQuality?.h2h === 'real';
  const isLoading = isLoadingPrediction(match.id);
  const supportsDraw = !isBasketball;

  const normalizeResultChar = (result: string): 'W' | 'L' | 'D' => {
    const normalized = result.toUpperCase();
    if (normalized === 'W') return 'W';
    if (normalized === 'D') return supportsDraw ? 'D' : 'L';
    return 'L';
  };

  const extractLastFiveForm = (formString?: string): Array<'W' | 'L' | 'D'> => {
    if (!formString || formString === 'N/A') return [];
    return formString
      .split('')
      .map(normalizeResultChar)
      .slice(0, 5);
  };

  const getTeamH2HResult = (game: any, teamName: string): 'W' | 'L' | 'D' => {
    if (game.homeGoals === game.awayGoals) return supportsDraw ? 'D' : 'L';
    const teamIsHome = game.homeTeam === teamName;
    const teamWon = teamIsHome ? game.homeGoals > game.awayGoals : game.awayGoals > game.homeGoals;
    return teamWon ? 'W' : 'L';
  };

  const homeFormLastFive = showRealForm ? extractLastFiveForm(detailedPrediction?.form.home.formString) : [];
  const awayFormLastFive = showRealForm ? extractLastFiveForm(detailedPrediction?.form.away.formString) : [];
  const hasRealFormSection = homeFormLastFive.length > 0 || awayFormLastFive.length > 0;

  const h2hGamesLastFive = showRealH2H
    ? (detailedPrediction?.h2h.games || []).slice(0, 5)
    : [];
  const homeH2HLastFive = h2hGamesLastFive.map((game) => getTeamH2HResult(game, match.homeTeam.name));
  const awayH2HLastFive = h2hGamesLastFive.map((game) => getTeamH2HResult(game, match.awayTeam.name));
  const hasRealH2HSection = h2hGamesLastFive.length > 0;
  const explanationLines = (detailedPrediction?.explanation || []).filter((line) => {
    if (!dataQuality) return true;
    if (dataQuality.form === 'mock' && /recent form/i.test(line)) return false;
    if (dataQuality.h2h === 'mock' && /head-to-head/i.test(line)) return false;
    return true;
  });
  
  const handleShowAIAnalysis = async () => {
    if (!showAIAnalysis && !detailedPrediction) {
      // Fetch prediction data when opening for the first time
      await fetchDetailedPrediction(match.id);
    }
    setShowAIAnalysis(!showAIAnalysis);
  };
  
  const handleSelectOutcome = (market: 'h2h', outcome: 'home' | 'draw' | 'away', odds: number) => {
    if (isSelected) {
      deselectMatch(match.id);
    } else {
      selectMatch({
        matchId: match.id,
        match,
        market,
        outcome,
        odds,
      });
    }
  };
  
  const getConfidenceBadge = () => {
    const colors = {
      high: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800',
    };
    return colors[match.prediction.confidence];
  };
  
  const getPredictionIcon = () => {
    if (match.prediction.homeWin > match.prediction.awayWin && match.prediction.homeWin > match.prediction.draw) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (match.prediction.awayWin > match.prediction.homeWin && match.prediction.awayWin > match.prediction.draw) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <Minus className="w-4 h-4 text-gray-600" />;
  };
  
  return (
    <div className={`bg-white rounded-2xl border-2 p-6 hover:shadow-xl transition-all duration-300 ${
      isSelected ? 'border-blue-600 shadow-xl shadow-blue-600/20' : 'border-slate-200 shadow-sm hover:border-blue-300'
    }`}>
      {/* Header */}
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
      
      {/* Teams */}
      <div className="mb-5 pb-5 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-lg text-slate-900">{match.homeTeam.name}</span>
          </div>
          {showRealForm && match.form?.home?.form && match.form.home.form !== 'N/A' && (
            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
              {match.form.home.form}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center text-slate-400 text-sm font-semibold my-3">
          VS
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-lg text-slate-900">{match.awayTeam.name}</span>
          </div>
          {showRealForm && match.form?.away?.form && match.form.away.form !== 'N/A' && (
            <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
              {match.form.away.form}
            </span>
          )}
        </div>
      </div>
      
      {/* Available Markets */}
      <div className="space-y-3">
        {/* Match Winner (H2H) */}
        {match.odds.h2h && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              {isBasketball ? 'GAME WINNER (MONEYLINE)' : 'MATCH WINNER (1X2)'}
            </div>
            <div className={`grid ${isBasketball ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
              <button
                onClick={() => handleSelectOutcome('h2h', 'home', match.odds.h2h!.home)}
                className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-blue-700 font-bold mb-1">HOME</div>
                <div className="text-2xl font-bold text-blue-900">{match.odds.h2h.home.toFixed(2)}</div>
              </button>
              {!isBasketball && (
                <button
                  onClick={() => handleSelectOutcome('h2h', 'draw', match.odds.h2h!.draw)}
                  className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
                >
                  <div className="text-xs text-slate-700 font-bold mb-1">DRAW</div>
                  <div className="text-2xl font-bold text-slate-900">{match.odds.h2h.draw.toFixed(2)}</div>
                </button>
              )}
              <button
                onClick={() => handleSelectOutcome('h2h', 'away', match.odds.h2h!.away)}
                className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-blue-700 font-bold mb-1">AWAY</div>
                <div className="text-2xl font-bold text-blue-900">{match.odds.h2h.away.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}
        
        {/* Over/Under 2.5 */}
        {match.odds.ou25 && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              {isBasketball ? 'OVER/UNDER TOTAL POINTS' : 'OVER/UNDER 2.5 GOALS'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('h2h', 'home', match.odds.ou25!.over)}
                className="bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-green-700 font-bold mb-1">{isBasketball ? 'OVER' : 'OVER 2.5'}</div>
                <div className="text-2xl font-bold text-green-900">{match.odds.ou25.over.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('h2h', 'away', match.odds.ou25!.under)}
                className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-orange-700 font-bold mb-1">{isBasketball ? 'UNDER' : 'UNDER 2.5'}</div>
                <div className="text-2xl font-bold text-orange-900">{match.odds.ou25.under.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}
        
        {/* Both Teams To Score */}
        {match.odds.btts && (
          <div>
            <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              BOTH TEAMS TO SCORE
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectOutcome('h2h', 'home', match.odds.btts!.yes)}
                className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-purple-700 font-bold mb-1">YES</div>
                <div className="text-2xl font-bold text-purple-900">{match.odds.btts.yes.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSelectOutcome('h2h', 'away', match.odds.btts!.no)}
                className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
              >
                <div className="text-xs text-slate-700 font-bold mb-1">NO</div>
                <div className="text-2xl font-bold text-slate-900">{match.odds.btts.no.toFixed(2)}</div>
              </button>
            </div>
          </div>
        )}
        
        {/* Unavailable Markets Notice */}
        {!match.odds.h2h && !match.odds.ou25 && !match.odds.btts && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <strong>Limited data available.</strong> Some requested markets are not available for this match from the current bookmaker.
            </div>
          </div>
        )}
      </div>
      
      {/* Show AI Analysis Button */}
      <div className="mt-4">
        <button
          onClick={handleShowAIAnalysis}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading Analysis...</span>
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              <span>{showAIAnalysis ? 'Hide' : 'Show'} AI Analysis</span>
              {showAIAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </>
          )}
        </button>
      </div>
      
      {/* Detailed AI Analysis */}
      {showAIAnalysis && detailedPrediction && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Updated Prediction with computed data */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              <h3 className="font-bold text-lg">Predicted Outcome</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className={`p-3 rounded-lg ${detailedPrediction.predictedWinner === 'home' ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
                <div className="text-sm opacity-90 mb-1">Home Win</div>
                <div className="text-2xl font-bold">{detailedPrediction.homeWin}%</div>
              </div>
              <div className={`p-3 rounded-lg ${detailedPrediction.predictedWinner === 'draw' ? 'bg-white/20 ring-2 ring-white' : 'bg-white/10'}`}>
                <div className="text-sm opacity-90 mb-1">Draw</div>
                <div className="text-2xl font-bold">{detailedPrediction.draw}%</div>
              </div>
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

          {/* Form Analysis (Last 5 Games) */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Recent Form (Last 5 {isBasketball ? 'Games' : 'Matches'})</h3>
            </div>
            {hasRealFormSection ? (
              <div className="space-y-3">
                {homeFormLastFive.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{match.homeTeam.name}</span>
                    <div className="flex gap-1">
                      {homeFormLastFive.map((char, idx) => (
                        <span
                          key={`home-form-${idx}`}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            char === 'W' ? 'bg-green-600 text-white' :
                            char === 'D' ? 'bg-slate-400 text-white' :
                            'bg-red-600 text-white'
                          }`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {awayFormLastFive.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{match.awayTeam.name}</span>
                    <div className="flex gap-1">
                      {awayFormLastFive.map((char, idx) => (
                        <span
                          key={`away-form-${idx}`}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            char === 'W' ? 'bg-green-600 text-white' :
                            char === 'D' ? 'bg-slate-400 text-white' :
                            'bg-red-600 text-white'
                          }`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500">Not available</div>
            )}
          </div>

          {/* Head-to-Head Analysis (Last 5) */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Head-to-Head Results (Last 5 {isBasketball ? 'Games' : 'Meetings'})</h3>
            </div>

            {hasRealH2HSection ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{match.homeTeam.name}</span>
                  <div className="flex gap-1">
                    {homeH2HLastFive.map((char, idx) => (
                      <span
                        key={`home-h2h-${idx}`}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          char === 'W' ? 'bg-green-600 text-white' :
                          char === 'D' ? 'bg-slate-400 text-white' :
                          'bg-red-600 text-white'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{match.awayTeam.name}</span>
                  <div className="flex gap-1">
                    {awayH2HLastFive.map((char, idx) => (
                      <span
                        key={`away-h2h-${idx}`}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          char === 'W' ? 'bg-green-600 text-white' :
                          char === 'D' ? 'bg-slate-400 text-white' :
                          'bg-red-600 text-white'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Not available</div>
            )}
          </div>

          {/* Recommended Bet (if available) */}
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
                <h3 className="font-bold text-slate-900">AI Analysis Explanation</h3>
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

          {/* Prediction Factors Breakdown (Advanced) */}
          {detailedPrediction.factors && (
            <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Prediction Factors (Weighted)</h3>
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
                        className={`h-full ${
                          factor.score > 60 ? 'bg-green-600' : 
                          factor.score > 40 ? 'bg-yellow-500' : 
                          'bg-red-600'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">How to read:</span> Bars show home team advantage (0-100 scale, 50 = neutral). 
                  Higher confidence factors have more influence on final prediction.
                </p>
              </div>
            </div>
          )}

          {/* Legacy Prediction Breakdown */}
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
                    {detailedPrediction.breakdown.formScore.home.toFixed(1)} - {detailedPrediction.breakdown.formScore.away.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-600" 
                    style={{ width: `${(detailedPrediction.breakdown.formScore.home / (detailedPrediction.breakdown.formScore.home + detailedPrediction.breakdown.formScore.away)) * 100}%` }}
                  />
                  <div 
                    className="bg-red-600" 
                    style={{ width: `${(detailedPrediction.breakdown.formScore.away / (detailedPrediction.breakdown.formScore.home + detailedPrediction.breakdown.formScore.away)) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">H2H Score</span>
                  <span className="font-semibold text-slate-900">
                    {detailedPrediction.breakdown.h2hScore.home.toFixed(1)} - {detailedPrediction.breakdown.h2hScore.away.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-green-600" 
                    style={{ width: `${(detailedPrediction.breakdown.h2hScore.home / (detailedPrediction.breakdown.h2hScore.home + detailedPrediction.breakdown.h2hScore.away)) * 100}%` }}
                  />
                  <div 
                    className="bg-red-600" 
                    style={{ width: `${(detailedPrediction.breakdown.h2hScore.away / (detailedPrediction.breakdown.h2hScore.home + detailedPrediction.breakdown.h2hScore.away)) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-900 font-semibold">Final Probabilities</span>
                  <span className="font-bold text-blue-600">
                    {detailedPrediction.breakdown.finalScore.home.toFixed(1)}% - {detailedPrediction.breakdown.finalScore.away.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-blue-600" 
                    style={{ width: `${(detailedPrediction.breakdown.finalScore.home / (detailedPrediction.breakdown.finalScore.home + detailedPrediction.breakdown.finalScore.away)) * 100}%` }}
                  />
                  <div 
                    className="bg-blue-800" 
                    style={{ width: `${(detailedPrediction.breakdown.finalScore.away / (detailedPrediction.breakdown.finalScore.home + detailedPrediction.breakdown.finalScore.away)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
