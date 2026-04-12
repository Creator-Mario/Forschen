'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NeueFragestellungPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/fragestellungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
      return;
    }

    router.push('/fragestellungen');
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Frage an die Gemeinschaft stellen</h1>
        <p className="text-gray-500 mb-8">
          Formuliere deine Fragestellung klar, damit andere Mitglieder gezielt und hilfreich darauf eingehen können.
        </p>

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
          <h2 className="font-semibold text-blue-900 mb-2">Hinweise für eine gute Frage</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Nenne das eigentliche Anliegen möglichst präzise.</li>
            <li>• Beschreibe den Hintergrund nur so ausführlich wie nötig.</li>
            <li>• Wenn es passt, füge einen Bibelbezug oder eine konkrete Beobachtung hinzu.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel der Frage</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z. B. Wie ist dieser Vers im Zusammenhang zu verstehen?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deine Fragestellung</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Beschreibe deine Frage, den Kontext und was du von der Gemeinschaft hören möchtest…"
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
              {loading ? 'Wird eingereicht…' : 'Frage einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
