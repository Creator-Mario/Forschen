'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.info('[passwort-zuruecksetzen] Token from URL present:', !!token);
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || 'Passwort-Reset fehlgeschlagen.');
      }
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">Ungültiger Link</h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Reset-Link an.
          </p>
          <Link
            href="/passwort-vergessen"
            className="inline-block bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Neuen Link anfordern →
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-green-600 text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">Passwort geändert</h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-800 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Zur Anmeldung →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Neues Passwort vergeben</h1>
          <p className="text-gray-500 text-sm">Bitte gib dein neues Passwort ein.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Neues Passwort <span className="text-gray-400 font-normal">(min. 8 Zeichen)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird gespeichert…' : 'Passwort speichern'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PasswortZuruecksetzenPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
