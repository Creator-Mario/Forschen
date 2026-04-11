'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NeueBuchempfehlungPage() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [themeReference, setThemeReference] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/buchempfehlungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, author, themeReference, description }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
      return;
    }

    router.push('/meine-buchempfehlungen');
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Buchempfehlung hinzufügen</h1>
        <p className="text-gray-500 mb-8">Deine Empfehlung wird vor der Veröffentlichung vom Admin geprüft.</p>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buchtitel</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Nachfolge"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Dietrich Bonhoeffer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zu welchem Thema empfiehlst du dieses Buch?</label>
              <input
                type="text"
                value={themeReference}
                onChange={e => setThemeReference(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Glauben heute: Wahrheit in polarisierten Zeiten"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warum empfiehlst du dieses Buch?</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Beschreibe kurz den Mehrwert des Buches und warum es zum Thema passt…"
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
              {loading ? 'Wird eingereicht…' : 'Buchempfehlung einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
