'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';

export default function RegistrierenPageClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weeklyFaithEmailEnabled, setWeeklyFaithEmailEnabled] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, weeklyFaithEmailEnabled }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen.');
      } else {
        setRegistered(true);
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-blue-600 text-4xl mb-4">✉️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-3">Fast geschafft!</h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Wir haben dir eine E‑Mail mit dem Bestätigungslink gesendet. Bitte prüfe auch deinen Spam‑Ordner.
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
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Konto erstellen</h1>
          <p className="text-gray-500 text-sm">Kostenlos und ohne versteckte Kosten</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6 space-y-3 text-sm">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-blue-900">
              Wir geben deine Daten nicht an Dritte weiter. Diese Webseite ist ein geschützter Bereich für Personen,
              die durch den Admin bestätigt wurden und den Registrierungsprozess vollständig durchlaufen haben.
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-amber-900">
              Bitte beachte: Im Vorstellungsbereich können alle freigeschalteten Mitglieder sehen, wer Teil der
              Gemeinschaft ist.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Vollständiger Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="deine@email.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort <span className="text-gray-400 font-normal">(min. {PASSWORD_MIN_LENGTH} Zeichen)</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={weeklyFaithEmailEnabled}
                onChange={e => setWeeklyFaithEmailEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
              />
              <span className="text-gray-600">
                Ich möchte einmal pro Woche eine E-Mail mit christlichen Inhalten erhalten – mit persönlicher Ansprache,
                einem Glaubensthema, einer biblischen Geschichte, Erklärungen, Reflexionsfragen und einem Segenswunsch.
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-400">
              Mit der Registrierung stimmst du unserer{' '}
              <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>{' '}
              zu.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird registriert…' : 'Konto erstellen'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Bereits registriert?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
