'use client';

import { useEffect, useState } from 'react';
import { useAPIKeysStore } from '@/lib/apiKeysStore';
import { oddsAPIService } from '@/lib/oddsAPI';
import { footballStatsService } from '@/lib/footballStatsAPI';
import { Key, Lock, AlertCircle, ExternalLink, CheckCircle2, Eye, EyeOff, X } from 'lucide-react';

interface ServerKeys {
  odds: boolean;
  football: boolean;
}

/**
 * Asks for the API keys when the app opens (unless the server already has them in
 * .env.local) and whenever the user opens it from the header's API keys button.
 */
export default function APIKeysModal() {
  const { oddsApiKey, footballApiKey, remember, loaded, isModalOpen, load, save, clear, openModal, closeModal } =
    useAPIKeysStore();
  const [serverKeys, setServerKeys] = useState<ServerKeys | null>(null);
  const [oddsInput, setOddsInput] = useState('');
  const [footballInput, setFootballInput] = useState('');
  const [rememberInput, setRememberInput] = useState(false);
  const [showOdds, setShowOdds] = useState(false);
  const [showFootball, setShowFootball] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
    fetch('/api/keys-status')
      .then(r => r.json())
      .then(setServerKeys)
      .catch(() => setServerKeys({ odds: false, football: false }));
  }, [load]);

  // On load: ask when there's no Odds API key here or on the server
  useEffect(() => {
    if (loaded && serverKeys && !oddsApiKey && !serverKeys.odds) openModal();
  }, [loaded, serverKeys, oddsApiKey, openModal]);

  // Fill the form with the current keys each time it opens
  useEffect(() => {
    if (isModalOpen) {
      setOddsInput(oddsApiKey);
      setFootballInput(footballApiKey);
      setRememberInput(remember);
      setError('');
    }
  }, [isModalOpen, oddsApiKey, footballApiKey, remember]);

  if (!isModalOpen) return null;

  const oddsRequired = !serverKeys?.odds;
  const canClose = Boolean(oddsApiKey) || !oddsRequired;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const odds = oddsInput.trim();
    const football = footballInput.trim();

    if (oddsRequired && !odds) {
      setError('Enter your Odds API key to load matches.');
      return;
    }
    const looksValid = (key: string) => key === '' || /^[A-Za-z0-9_-]{8,128}$/.test(key);
    if (!looksValid(odds) || !looksValid(football)) {
      setError('A key can only contain letters, numbers, - and _. Check for spaces or missing characters.');
      return;
    }

    // Responses fetched with the old keys shouldn't be reused
    oddsAPIService.clearCache();
    footballStatsService.clearCache();
    save({ oddsApiKey: odds, footballApiKey: football }, rememberInput);
  };

  const handleForget = () => {
    clear();
    oddsAPIService.clearCache();
    footballStatsService.clearCache();
    setOddsInput('');
    setFootballInput('');
    setRememberInput(false);
  };

  const keyField = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    visible: boolean,
    toggle: () => void,
    signUpUrl: string,
    note: string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={id} className="block text-sm font-bold text-slate-900">{label}</label>
        <a href={signUpUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
          Get a key <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="relative">
        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="w-full pl-12 pr-12 py-3 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all text-slate-900 placeholder:text-slate-400"
        />
        <button type="button" onClick={toggle} aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <p className="mt-1.5 text-xs text-slate-600">{note}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[55] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog" aria-modal="true" aria-labelledby="api-keys-title">
        <div className="bg-blue-600 text-white p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 id="api-keys-title" className="text-2xl font-bold">API keys</h2>
              <p className="text-blue-100 text-sm">Gexten uses your own keys to fetch odds and stats</p>
            </div>
          </div>
          {canClose && (
            <button onClick={closeModal} aria-label="Close" className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {keyField('odds-api-key', 'The Odds API key', oddsInput, setOddsInput, showOdds, () => setShowOdds(v => !v),
            'https://the-odds-api.com/',
            serverKeys?.odds
              ? 'Optional: the server already has one. Enter yours to use it instead.'
              : 'Required for live odds. Free tier: 500 requests a month.')}

          {keyField('football-api-key', 'API-Football key (optional)', footballInput, setFootballInput, showFootball,
            () => setShowFootball(v => !v),
            'https://dashboard.api-football.com/register',
            'Only used for leagues our match history doesn’t cover. Free tier: 100 requests a day, no current-season stats.')}

          <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
            <input id="remember-keys" type="checkbox" checked={rememberInput}
              onChange={(e) => setRememberInput(e.target.checked)} className="mt-0.5 w-4 h-4" />
            <span>
              Remember on this device
              <span className="block text-xs text-slate-500">
                Otherwise the keys are forgotten when you close this tab. Don&apos;t tick this on a shared computer.
              </span>
            </span>
          </label>

          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-xs text-slate-600">
            Your keys stay in this browser and are sent only to this app&apos;s own server, which uses them
            to call the odds and stats services. They are never saved on the server or put in a URL.
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          <button type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            Save keys
          </button>

          {(oddsApiKey || footballApiKey) && (
            <button type="button" onClick={handleForget}
              className="w-full text-sm text-slate-600 hover:text-red-600 transition-colors">
              Forget my keys on this device
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
