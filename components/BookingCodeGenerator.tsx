'use client';

import { useGextenStore } from '@/lib/store';
import { bookmakers } from '@/lib/dummyData';
import { useState, useEffect } from 'react';
import { ShoppingCart, Ticket, Copy, CheckCircle2, XCircle } from 'lucide-react';

export default function BookingCodeGenerator() {
  const { selectedMatches, bookingCode, generateBookingCode, clearBookingCode, clearSelections, filters } = useGextenStore();
  const [selectedBookmaker, setSelectedBookmaker] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Initialize with primary bookmaker from filters
  useEffect(() => {
    if (!selectedBookmaker && filters.primaryBookmaker) {
      setSelectedBookmaker(filters.primaryBookmaker);
    }
  }, [filters.primaryBookmaker, selectedBookmaker]);
  
  const selections = Array.from(selectedMatches.values());
  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  
  const handleGenerate = () => {
    generateBookingCode(selectedBookmaker);
  };
  
  const handleCopyCode = () => {
    if (bookingCode) {
      navigator.clipboard.writeText(bookingCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleNewBet = () => {
    clearBookingCode();
    clearSelections();
  };
  
  if (bookingCode) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Code Generated!</h2>
          <p className="text-slate-600">Your bet slip is ready</p>
        </div>
        
        {/* Booking Code */}
        <div className="bg-blue-600 rounded-2xl p-6 mb-6 text-white">
          <div className="text-sm opacity-90 mb-2 font-medium">Booking Code</div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold font-mono tracking-wider">
              {bookingCode.code}
            </div>
            <button
              onClick={handleCopyCode}
              className="bg-white/20 hover:bg-white/30 rounded-xl p-3 transition-all"
              title="Copy code"
            >
              {copied ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Copy className="w-6 h-6" />
              )}
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">Bookmaker</span>
              <span className="font-bold">{bookingCode.bookmaker}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm opacity-90">Total Odds</span>
              <span className="text-2xl font-bold">{bookingCode.totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm opacity-90">Selections</span>
              <span className="font-bold">{bookingCode.selections.length}</span>
            </div>
          </div>
        </div>
        
        {/* Selections */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-slate-900">Your Selections</h3>
          {bookingCode.selections.map((selection) => (
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
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">{selection.odds.toFixed(2)}</div>
                  <div className="text-xs text-slate-600">{selection.outcome}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">How to Use</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Copy the booking code above</li>
            <li>Visit {bookingCode.bookmaker} website</li>
            <li>Go to the bet slip section</li>
            <li>Enter the booking code</li>
            <li>Confirm your stake and place bet</li>
          </ol>
        </div>
        
        
        <button
          onClick={handleNewBet}
          className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl transition-all"
        >
          Create New Bet
        </button>
      </div>
    );
  }
  
  if (selections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No selections yet</h3>
          <p className="text-slate-600 text-sm">
            Select matches from the list to create your bet slip
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
      
      {/* Total Odds */}
      <div className="bg-blue-50 rounded-xl p-5 mb-6 border-2 border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-blue-900 font-bold">Total Odds</span>
          <span className="text-4xl font-black text-blue-600">{totalOdds.toFixed(2)}</span>
        </div>
        <div className="mt-2 text-xs text-blue-700 font-medium">
          {selections.length} selection{selections.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Bookmaker Selection */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-slate-900 mb-2">
          Select Bookmaker
        </label>
        <select
          value={selectedBookmaker}
          onChange={(e) => setSelectedBookmaker(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-300 bg-white text-slate-900 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
        >
          {bookmakers.map(bookmaker => (
            <option key={bookmaker} value={bookmaker}>
              {bookmaker}
            </option>
          ))}
        </select>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30"
      >
        Generate Booking Code
      </button>
      
      <button
        onClick={clearSelections}
        className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all border-2 border-slate-300"
      >
        Clear All
      </button>
    </div>
  );
}
