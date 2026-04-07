'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function NeuesGebetPage() {
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/gebet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, anonymous }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
    } else {
      router.push('/meine-gebete');
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Gebet einreichen</h1>
        <p className="text-gray-500 mb-8">Dein Gebet wird moderiert und im Gebetsraum geteilt.</p>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dein Gebet</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Bitte, danke, Klage, Lobpreis – bringe dein Herz vor Gott und die Gemeinschaft…"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Anonym einreichen (dein Name erscheint nicht)
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird eingereicht…' : 'Gebet einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
