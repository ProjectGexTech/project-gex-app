'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

const STORAGE_KEY = 'gexten_age_confirmed';

/**
 * Asks once whether the visitor is 18 or over; the answer is remembered in this browser.
 * Anyone who says no sees a blocking notice instead of the app.
 */
export default function AgeGate() {
  const [status, setStatus] = useState<'checking' | 'ask' | 'confirmed' | 'underage'>('checking');

  useEffect(() => {
    try {
      setStatus(localStorage.getItem(STORAGE_KEY) === 'yes' ? 'confirmed' : 'ask');
    } catch {
      setStatus('ask');
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'yes');
    } catch {
      // Storage blocked: ask again next visit
    }
    setStatus('confirmed');
  };

  if (status === 'checking' || status === 'confirmed') return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6 text-amber-700" />
        </div>
        {status === 'ask' ? (
          <>
            <h2 id="age-gate-title" className="text-xl font-bold text-slate-900 mb-2">Are you 18 or over?</h2>
            <p className="text-sm text-slate-600 mb-6">
              Gexten shows betting odds and is only for adults. It gives information, not betting
              advice, and it can&apos;t place bets.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
              >
                Yes, I&apos;m 18 or over
              </button>
              <button
                onClick={() => setStatus('underage')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all border-2 border-slate-300"
              >
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="text-xl font-bold text-slate-900 mb-2">Gexten is for adults only</h2>
            <p className="text-sm text-slate-600">
              You need to be 18 or over to use this site. If gambling is affecting you or someone you
              know, free and confidential help is available at{' '}
              <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                BeGambleAware
              </a>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
