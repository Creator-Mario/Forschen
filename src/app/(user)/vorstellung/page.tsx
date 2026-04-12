'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { INTRO_MAX_LENGTH, INTRO_MIN_LENGTH, getIntroLengthError } from '@/lib/intro-validation';

function VorstellungForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const userId = searchParams.get('userId') || '';
  const verified = searchParams.get('verified') === '1';
  const introIdentity = token || userId || (verified ? 'verified' : '');

  const [motivation, setMotivation] = useState('');
  const [vorstellung, setVorstellung] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const motivationError = getIntroLengthError('Motivationsfeld', motivation);
    if (motivationError) return setError(`${motivationError} (Aktuell: ${motivation.trim().length})`);
    const vorstellungError = getIntroLengthError('Vorstellungsfeld', vorstellung);
    if (vorstellungError) return setError(`${vorstellungError} (Aktuell: ${vorstellung.trim().length})`);

    setLoading(true);
    const res = await fetch('/api/user/intro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token || undefined, userId: userId || undefined, motivation, vorstellung }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
    } else {
      setSuccess(true);
    }
  }

  if (!introIdentity) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600">Ungültiger Aufruf – kein Nutzerkonto gefunden.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Vorstellung eingereicht!</h1>
          <p className="text-gray-600 leading-relaxed mb-4">
            Vielen Dank. Deine Vorstellung und Motivation wurden übermittelt.
            Der Administrator wird dein Konto in Kürze prüfen und freischalten.
          </p>
          <p className="text-gray-500 text-sm">
            Du erhältst eine Benachrichtigung, sobald dein Konto freigeschaltet wurde.
            Dann kannst du dich mit deinen Zugangsdaten anmelden.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
            <span className="text-2xl">✍️</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Willkommen bei Der Fluss des Lebens</h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Bevor du der Gemeinschaft beitreten kannst, möchten wir dich kennenlernen.
            Bitte beantworte die folgenden zwei Fragen. <strong>Beide Felder sind Pflicht</strong> (mindestens {INTRO_MIN_LENGTH}, höchstens {INTRO_MAX_LENGTH} Zeichen).
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
          ❗ Ohne das Ausfüllen dieses Formulars ist kein Login möglich. Dein Konto wird erst nach
          Admin-Prüfung freigeschaltet.
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              1. Warum möchtest du auf der Plattform <em>Der Fluss des Lebens</em> mitmachen?
            </label>
            <p className="text-xs text-gray-500 mb-2">Zwischen {INTRO_MIN_LENGTH} und {INTRO_MAX_LENGTH} Zeichen. Aktuell: {motivation.trim().length}</p>
            <textarea
              value={motivation}
              onChange={e => setMotivation(e.target.value)}
              required
              rows={6}
              maxLength={INTRO_MAX_LENGTH}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Beschreibe deine Motivation, warum du dieser Gemeinschaft beitreten möchtest…"
            />
            {motivation.trim().length > 0 && motivation.trim().length < INTRO_MIN_LENGTH && (
              <p className="text-xs text-orange-600 mt-1">
                Noch {INTRO_MIN_LENGTH - motivation.trim().length} Zeichen erforderlich
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              2. Stelle dich bitte den anderen Mitgliedern kurz vor.
            </label>
            <p className="text-xs text-gray-500 mb-2">Zwischen {INTRO_MIN_LENGTH} und {INTRO_MAX_LENGTH} Zeichen. Aktuell: {vorstellung.trim().length}</p>
            <textarea
              value={vorstellung}
              onChange={e => setVorstellung(e.target.value)}
              required
              rows={6}
              maxLength={INTRO_MAX_LENGTH}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Erzähle etwas über dich – deinen Hintergrund, deine Interessen, wie du zum Glauben gekommen bist…"
            />
            {vorstellung.trim().length > 0 && vorstellung.trim().length < INTRO_MIN_LENGTH && (
              <p className="text-xs text-orange-600 mt-1">
                Noch {INTRO_MIN_LENGTH - vorstellung.trim().length} Zeichen erforderlich
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              motivation.trim().length < INTRO_MIN_LENGTH ||
              motivation.trim().length > INTRO_MAX_LENGTH ||
              vorstellung.trim().length < INTRO_MIN_LENGTH ||
              vorstellung.trim().length > INTRO_MAX_LENGTH
            }
            className="w-full bg-blue-800 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Wird gespeichert…' : 'Vorstellung einreichen'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VorstellungPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-64 text-gray-400">Laden…</div>}>
      <VorstellungForm />
    </Suspense>
  );
}
