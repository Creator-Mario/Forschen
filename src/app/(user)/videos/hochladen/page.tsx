'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Wochenthema } from '@/types';

export default function VideoHochladenPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [themes, setThemes] = useState<Wochenthema[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [themesLoading, setThemesLoading] = useState(true);
  const [themeLoadError, setThemeLoadError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function loadThemes() {
      try {
        setThemeLoadError('');
        const [currentResponse, allResponse] = await Promise.all([
          fetch('/api/wochenthema', { cache: 'no-store' }),
          fetch('/api/wochenthema?all=1', { cache: 'no-store' }),
        ]);

        const [currentTheme, allThemes] = await Promise.all([
          currentResponse.ok ? currentResponse.json() : Promise.resolve(null),
          allResponse.ok ? allResponse.json() : Promise.resolve([]),
        ]);

        if (!active) return;

        const publishedThemes = Array.isArray(allThemes)
          ? allThemes.filter((theme): theme is Wochenthema => theme?.status === 'published')
          : [];

        setThemes(publishedThemes);

        if (typeof currentTheme?.id === 'string') {
          setSelectedThemeId(currentTheme.id);
        } else if (publishedThemes.length > 0) {
          setSelectedThemeId(publishedThemes[0].id);
        }
      } catch {
        if (!active) return;
        setThemes([]);
        setThemeLoadError('Wochenthemen konnten gerade nicht geladen werden. Du kannst das Video trotzdem ohne Zuordnung einreichen.');
      } finally {
        if (active) setThemesLoading(false);
      }
    }

    void loadThemes();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        url,
        ...(selectedThemeId ? { wochenthemaId: selectedThemeId } : {}),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Fehler beim Speichern.');
    } else {
      router.push('/meine-videos?submitted=1');
    }
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Video teilen</h1>
        <p className="text-gray-500 mb-8">Teile ein Video aus YouTube oder Vimeo mit der Gemeinschaft. Nach dem Absenden geht dein Beitrag zuerst an den Admin zur Prüfung. Erst nach Freigabe erscheint er unter „Meine Videos“ und im gemeinsamen Mitgliederbereich „Videos“.</p>

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
                placeholder="Videotitel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Kurze Beschreibung des Videos…"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video-URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label htmlFor="video-theme" className="block text-sm font-medium text-gray-700 mb-1">Passendes Wochenthema</label>
              <select
                id="video-theme"
                value={selectedThemeId}
                onChange={e => setSelectedThemeId(e.target.value)}
                disabled={themesLoading || themes.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {themesLoading ? 'Wochenthemen werden geladen…' : 'Ohne Zuordnung einreichen'}
                </option>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>
                    {theme.week} · {theme.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Wenn möglich, ordne dein Video direkt einem Wochenthema zu. So erscheint es nach der Freigabe am richtigen Themenort.
              </p>
              {themeLoadError && (
                <p className="mt-2 text-xs text-amber-700">{themeLoadError}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Wird eingereicht…' : 'Video einreichen'}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
