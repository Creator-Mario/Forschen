'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function AdminResetPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ email: string; oneTimePassword: string } | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Reset fehlgeschlagen.');
    } else {
      setResult({ email: data.email, oneTimePassword: data.oneTimePassword });
      setToken('');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-slate-400 text-sm mb-2">Notfall-Zugang</div>
          <h1 className="text-2xl font-bold text-white">Passwort zurücksetzen</h1>
          <p className="text-slate-400 text-sm mt-2">
            Gib den <code className="bg-slate-700 px-1 rounded text-slate-200">ADMIN_RESET_TOKEN</code> aus deinen Produktiv-Einstellungen ein.
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          {result ? (
            <div className="space-y-4">
              <div className="bg-green-900/40 border border-green-700 rounded-lg p-4">
                <p className="text-green-300 font-semibold mb-3">Passwort wurde zurückgesetzt!</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-400">E-Mail: </span>
                    <span className="text-white font-mono">{result.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Einmalpasswort: </span>
                    {revealed ? (
                      <span className="text-yellow-300 font-mono text-lg tracking-wider select-all">{result.oneTimePassword}</span>
                    ) : (
                      <button
                        onClick={() => setRevealed(true)}
                        className="text-yellow-400 text-sm underline hover:text-yellow-300"
                      >
                        Zum Anzeigen klicken
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-amber-300 text-sm">
                ⚠ Notiere dieses Passwort jetzt — es wird nicht erneut angezeigt. Ändere es sofort nach dem Login unter <strong>Mein Profil → Passwort ändern</strong>.
              </div>
              <Link
                href="/admin-login"
                className="block w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
              >
                Zum Admin-Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Reset-Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  required
                  placeholder="ADMIN_RESET_TOKEN eingeben"
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
                />
              </div>
              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-500 transition-colors disabled:opacity-60"
              >
                {loading ? 'Wird zurückgesetzt...' : 'Passwort zurücksetzen'}
              </button>
              <Link
                href="/admin-login"
                className="block text-center text-slate-400 text-sm hover:text-slate-300 transition-colors"
              >
                ← Zurück zum Admin-Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
