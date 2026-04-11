'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import BibleVerseCard from '@/components/BibleVerseCard';
import { useEffect, useState } from 'react';
import type { Tageswort } from '@/types';
import Link from 'next/link';

export default function MeinTageswortPage() {
  const [tageswort, setTageswort] = useState<Tageswort | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/tageswort').then(r => r.json()).then(setTageswort);
    const stored = localStorage.getItem('tageswort-note');
    if (stored) setNote(stored);
  }, []);

  function handleSave() {
    localStorage.setItem('tageswort-note', note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Mein Tageswort</h1>
          <Link href="/tageswort/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
            Archiv →
          </Link>
        </div>

        {tageswort && (
          <div className="mb-6">
            <BibleVerseCard tageswort={tageswort} showQuestions />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Meine Notizen</h2>
          <p className="text-sm text-gray-500 mb-3">
            Was bewegt dich bei diesem Vers? Welche Fragen tauchen auf? Deine Notizen bleiben lokal gespeichert.
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={8}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Deine Gedanken zum heutigen Vers…"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleSave}
              className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Notiz speichern
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
