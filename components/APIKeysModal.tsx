'use client';

import { useState, useEffect } from 'react';
import { useAPIKeysStore } from '@/lib/apiKeysStore';
import { Key, Lock, AlertCircle, ExternalLink, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function APIKeysModal() {
  const { isConfigured, setApiKeys, loadApiKeysFromStorage } = useAPIKeysStore();
  const [oddsApiKey, setOddsApiKey] = useState('');
  const [footballApiKey, setFootballApiKey] = useState('');
  const [showOddsApiKey, setShowOddsApiKey] = useState(false);
  const [showFootballApiKey, setShowFootballApiKey] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load keys from storage on mount
    loadApiKeysFromStorage();
    
    // Show modal if not configured
    const timer = setTimeout(() => {
      setShowModal(!isConfigured);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isConfigured, loadApiKeysFromStorage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!oddsApiKey.trim()) {
      setError('Please enter The Odds API key');
      return;
    }

    if (!footballApiKey.trim()) {
      setError('Please enter the API-Football key');
      return;
    }

    // Basic validation (check if they look like valid API keys)
    if (oddsApiKey.trim().length < 20) {
      setError('The Odds API key seems too short. Please check and try again.');
      return;
    }

    if (footballApiKey.trim().length < 20) {
      setError('API-Football key seems too short. Please check and try again.');
      return;
    }

    // Save the keys
    console.log('🔑 Saving API keys to store...');
    console.log('📊 Odds API key length:', oddsApiKey.trim().length);
    console.log('⚽ Football API key length:', footballApiKey.trim().length);
    setApiKeys(oddsApiKey.trim(), footballApiKey.trim());
    console.log('✅ Keys saved to store');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Enter your API keys</h2>
              <p className="text-blue-100 text-sm">Enter your API keys to start using Gexten</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Two API keys are required:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li><strong>The Odds API</strong> - For fetching live betting odds</li>
                  <li><strong>API-Football</strong> - For team stats and predictions</li>
                </ul>
                <p className="mt-2 text-xs text-blue-700">
                  Your keys are stored securely in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* The Odds API Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-900">
                  The Odds API Key
                </label>
                <a
                  href="https://the-odds-api.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showOddsApiKey ? 'text' : 'password'}
                  value={oddsApiKey}
                  onChange={(e) => setOddsApiKey(e.target.value)}
                  placeholder="Enter your Odds API key"
                  className="w-full pl-12 pr-12 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowOddsApiKey((current) => !current)}
                  aria-label={showOddsApiKey ? 'Hide The Odds API key' : 'Show The Odds API key'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showOddsApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Free tier: 500 requests/month • Paid plans from $10/month
              </p>
            </div>

            {/* API-Football Key */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-900">
                  API-Football Key
                </label>
                <a
                  href="https://dashboard.api-football.com/register"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showFootballApiKey ? 'text' : 'password'}
                  value={footballApiKey}
                  onChange={(e) => setFootballApiKey(e.target.value)}
                  placeholder="Enter your API-Football key"
                  className="w-full pl-12 pr-12 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowFootballApiKey((current) => !current)}
                  aria-label={showFootballApiKey ? 'Hide API-Football key' : 'Show API-Football key'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showFootballApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Free tier: 100 requests/day • Paid plans from $15/month
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <CheckCircle2 className="w-5 h-5" />
              Save API Keys & Continue
            </button>
          </form>

          {/* Help Text */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              Need help? Both services offer free tiers to get started.
              <br />
              Your API keys can be changed later from the settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
