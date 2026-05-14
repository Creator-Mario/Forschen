'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy';

export default function RegisterFormCard() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weeklyFaithEmailEnabled, setWeeklyFaithEmailEnabled] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, weeklyFaithEmailEnabled }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen.');
        return;
      }

      setRegistered(true);
    } catch (submitError) {
      console.error('Registration request failed:', submitError);
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="rounded-[1.75rem] border border-white/70 bg-white p-7 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">✉️</div>
        <h2 className="mt-5 text-2xl font-bold text-blue-950">Fast geschafft!</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Wir haben dir eine E-Mail mit dem Bestätigungslink gesendet. Bitte prüfe auch deinen Spam-Ordner.
        </p>
        <Link
          href="/genealogie/login"
          className="mt-6 inline-flex rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-white/70 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)] sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Registrierung</p>
        <h2 className="mt-2 text-2xl font-bold text-blue-950">Dein kostenloses Konto</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Erstelle jetzt deinen Zugang für die Genealogie-Funktion – ohne versteckte Kosten und mit geschütztem Mitgliederbereich.
        </p>
      </div>

      <div className="mb-6 space-y-3 text-sm">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-950">
          Deine Daten bleiben geschützt. Neue Konten werden erst nach dem vollständigen Registrierungsprozess freigeschaltet.
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-amber-900">
          Im Vorstellungsbereich können freigeschaltete Mitglieder sehen, wer Teil der Gemeinschaft ist.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Vollständiger Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            autoComplete="name"
            required
            placeholder="Max Mustermann"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            E-Mail-Adresse
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="deine@email.de"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
            Passwort <span className="font-normal text-slate-400">(min. {PASSWORD_MIN_LENGTH} Zeichen)</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={weeklyFaithEmailEnabled}
            onChange={event => setWeeklyFaithEmailEnabled(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
          />
          <span>
            Ich möchte einmal pro Woche einen persönlichen geistlichen Impuls mit Bibelgeschichte, Glaubensfragen und Segenswunsch erhalten.
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={event => setAcceptedPrivacy(event.target.checked)}
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-500"
          />
          <span>
            Ich habe die{' '}
            <Link href="/datenschutz" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              Datenschutzerklärung
            </Link>{' '}
            gelesen und stimme der Verarbeitung meiner Daten zu.
          </span>
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            Komplett kostenlos
          </span>
          <span className="text-slate-500">Keine versteckten Kosten</span>
        </div>

        <button
          type="submit"
          disabled={loading || !acceptedPrivacy}
          className="w-full rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Wird registriert…' : 'Konto erstellen'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Bereits registriert?{' '}
        <Link href="/genealogie/login" className="font-semibold text-blue-700 transition hover:text-blue-900">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
