'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function ForschungBeitraegePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bibleReference, setBibleReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/forschung', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, bibleReference }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
    } else {
      router.push('/meine-forschung');
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Forschungsbeitrag verfassen</h1>
        <p className="text-gray-500 mb-8">Dein Beitrag wird nach der Einreichung moderiert.</p>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Titel deines Forschungsbeitrags"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Dein Forschungsbeitrag – gehe tief in die Texte, historischen Kontexte und theologischen Fragen ein…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bibelstelle <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                value={bibleReference}
                onChange={e => setBibleReference(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Römer 8,1-17"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird eingereicht…' : 'Beitrag einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
