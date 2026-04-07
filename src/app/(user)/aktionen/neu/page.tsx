'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function NeueAktionPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateEvent, setDateEvent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/aktionen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, location, dateEvent, contactInfo }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
    } else {
      router.push('/aktionen');
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Aktion erstellen</h1>
        <p className="text-gray-500 mb-8">Organisiere eine Gemeinschaftsaktivität oder ein Treffen.</p>

        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name der Aktion" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Was ist geplant? Wer ist eingeladen? Was wird benötigt?" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ort <span className="text-gray-400">(optional)</span></label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Online oder Adresse" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum <span className="text-gray-400">(optional)</span></label>
                <input type="datetime-local" value={dateEvent} onChange={e => setDateEvent(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kontakt <span className="text-gray-400">(optional)</span></label>
              <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="E-Mail oder andere Kontaktmöglichkeit" />
            </div>

            {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? 'Wird eingereicht…' : 'Aktion einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
