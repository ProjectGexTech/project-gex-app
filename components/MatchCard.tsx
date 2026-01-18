'use client';

import { Match } from '@/lib/types';
import { useGextenStore } from '@/lib/store';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Brain, Loader2, ChevronDown, ChevronUp, Trophy, Target, BarChart3 } from 'lucide-react';
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
  const isSelected = selectedMatches.has(match.id);
  const detailedPrediction = getDetailedPrediction(match.id);
  const isLoading = isLoadingPrediction(match.id);
  
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
  
  const getResultColor = (result: 'H' | 'A' | 'D') => {
    if (result === 'H') return 'bg-green-600 text-white';
    if (result === 'A') return 'bg-red-600 text-white';
    return 'bg-slate-400 text-white';
  };
  
  const getResultLabel = (result: 'H' | 'A' | 'D') => {
    if (result === 'H') return 'W';
    if (result === 'A') return 'L';
    return 'D';
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
          <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
            {match.form.home.form}
          </span>
        </div>
        <div className="flex items-center justify-center text-slate-400 text-sm font-semibold my-3">
          VS
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-bold text-lg text-slate-900">{match.awayTeam.name}</span>
          </div>
          <span className="text-sm text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-md">
            {match.form.away.form}
          </span>
        </div>
      </div>
      
      {/* Odds - H2H */}
      {match.odds.h2h && (
        <div className="mb-5">
          <div className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            MATCH WINNER (1X2)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSelectOutcome('h2h', 'home', match.odds.h2h!.home)}
              className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-xs text-blue-700 font-bold mb-1">HOME</div>
              <div className="text-2xl font-bold text-blue-900">{match.odds.h2h.home.toFixed(2)}</div>
            </button>
            <button
              onClick={() => handleSelectOutcome('h2h', 'draw', match.odds.h2h!.draw)}
              className="bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-blue-600 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-xs text-slate-700 font-bold mb-1">DRAW</div>
              <div className="text-2xl font-bold text-slate-900">{match.odds.h2h.draw.toFixed(2)}</div>
            </button>
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
      
      {/* Prediction */}
      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              {getPredictionIcon()}
            </div>
            <span className="text-sm font-bold text-blue-900">AI Prediction</span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${getConfidenceBadge()}`}>
            {match.prediction.confidence.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div>
            <div className="text-xs text-slate-600 mb-1">Home</div>
            <div className="text-lg font-bold text-slate-900">{match.prediction.homeWin}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Draw</div>
            <div className="text-lg font-bold text-slate-900">{match.prediction.draw}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-600 mb-1">Away</div>
            <div className="text-lg font-bold text-slate-900">{match.prediction.awayWin}%</div>
          </div>
        </div>
        
        {/* Show AI Analysis Button */}
        <button
          onClick={handleShowAIAnalysis}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
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

          {/* Form Analysis (Last 10 Games) */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Recent Form (Last 10 Games)</h3>
            </div>
            
            {/* Home Team Form */}
            <div className="mb-4 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">{match.homeTeam.name}</span>
                <div className="flex gap-1">
                  {detailedPrediction.form.home.formString.split('').map((char, idx) => (
                    <span
                      key={idx}
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
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="text-green-800 font-bold">{detailedPrediction.form.home.wins}</div>
                  <div className="text-green-600 text-xs">Wins</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <div className="text-slate-800 font-bold">{detailedPrediction.form.home.draws}</div>
                  <div className="text-slate-600 text-xs">Draws</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <div className="text-red-800 font-bold">{detailedPrediction.form.home.losses}</div>
                  <div className="text-red-600 text-xs">Losses</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-blue-800 font-bold">{detailedPrediction.form.home.goalsScored}</div>
                  <div className="text-blue-600 text-xs">GF</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="text-orange-800 font-bold">{detailedPrediction.form.home.goalsConceded}</div>
                  <div className="text-orange-600 text-xs">GA</div>
                </div>
              </div>
            </div>
            
            {/* Away Team Form */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">{match.awayTeam.name}</span>
                <div className="flex gap-1">
                  {detailedPrediction.form.away.formString.split('').map((char, idx) => (
                    <span
                      key={idx}
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
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <div className="text-green-800 font-bold">{detailedPrediction.form.away.wins}</div>
                  <div className="text-green-600 text-xs">Wins</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                  <div className="text-slate-800 font-bold">{detailedPrediction.form.away.draws}</div>
                  <div className="text-slate-600 text-xs">Draws</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <div className="text-red-800 font-bold">{detailedPrediction.form.away.losses}</div>
                  <div className="text-red-600 text-xs">Losses</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-blue-800 font-bold">{detailedPrediction.form.away.goalsScored}</div>
                  <div className="text-blue-600 text-xs">GF</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div className="text-orange-800 font-bold">{detailedPrediction.form.away.goalsConceded}</div>
                  <div className="text-orange-600 text-xs">GA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Head-to-Head Analysis */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Head-to-Head (Last {detailedPrediction.h2h.totalGames} Meetings)</h3>
            </div>
            
            {/* H2H Summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-800">{detailedPrediction.h2h.homeWins}</div>
                <div className="text-xs text-green-600">Home Wins</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-slate-800">{detailedPrediction.h2h.draws}</div>
                <div className="text-xs text-slate-600">Draws</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-800">{detailedPrediction.h2h.awayWins}</div>
                <div className="text-xs text-red-600">Away Wins</div>
              </div>
            </div>
            
            {/* Goals Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="text-xl font-bold text-blue-900">{detailedPrediction.h2h.homeGoalsScored}</div>
                  <div className="text-xs text-blue-600">Goals Scored (Home)</div>
                </div>
                <div className="text-blue-400 font-bold">:</div>
                <div className="text-center flex-1">
                  <div className="text-xl font-bold text-blue-900">{detailedPrediction.h2h.awayGoalsScored}</div>
                  <div className="text-xs text-blue-600">Goals Scored (Away)</div>
                </div>
              </div>
            </div>
            
            {/* H2H Game History */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-700 mb-2">Match History:</div>
              {detailedPrediction.h2h.games.map((game, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getResultColor(game.result)}`}>
                        {getResultLabel(game.result)}
                      </span>
                      <span className="text-xs text-slate-500">{format(new Date(game.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {game.homeGoals} - {game.awayGoals}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {game.homeTeam} vs {game.awayTeam}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Breakdown */}
          <div className="bg-white rounded-xl p-5 border-2 border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">AI Computation Breakdown</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Form Score</span>
                  <span className="font-semibold text-slate-900">
                    {detailedPrediction.breakdown.formScore.home} - {detailedPrediction.breakdown.formScore.away}
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
                    {detailedPrediction.breakdown.h2hScore.home} - {detailedPrediction.breakdown.h2hScore.away}
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
                  <span className="text-slate-900 font-semibold">Final Score (60% Form + 40% H2H)</span>
                  <span className="font-bold text-blue-600">
                    {detailedPrediction.breakdown.finalScore.home} - {detailedPrediction.breakdown.finalScore.away}
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
