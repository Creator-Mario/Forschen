'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DailySermonPayload = {
  date: string;
  liturgicalDay: string;
  title: string;
  content: string;
  prayer: string;
  fromCache: boolean;
  archived: boolean;
};

function formatGermanDate(date: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  }).format(new Date(`${date}T00:00:00Z`));
}

function buildExcerpt(content: string, wordLimit = 180): string {
  const words = content.trim().split(/\s+/);
  if (words.length <= wordLimit) return content;
  return `${words.slice(0, wordLimit).join(' ')}...`;
}

export default function HomeSermonPreview() {
  const [sermon, setSermon] = useState<DailySermonPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSermon = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/generate-sermon', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = await response.json() as DailySermonPayload | { error?: string };
      if (!response.ok) {
        throw new Error(
          'error' in payload && payload.error
            ? payload.error
            : `Die API antwortete mit Status ${response.status}.`,
        );
      }

      setSermon(payload as DailySermonPayload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Die Predigt konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSermon();
  }, [loadSermon]);

  const previewText = useMemo(() => (sermon ? buildExcerpt(sermon.content) : ''), [sermon]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-slate-50 shadow-lg shadow-blue-100/70">
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 px-6 py-8 text-white sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Tagespredigt</p>
        <h2 className="mt-3 text-2xl font-bold font-serif sm:text-3xl">Ein geistlicher Impuls für heute</h2>
        <p className="mt-3 text-sm text-blue-50">
          {sermon ? formatGermanDate(sermon.date) : 'Die heutige Predigt wird geladen ...'}
        </p>
        <p className="mt-2 text-sm font-medium text-blue-100">
          {sermon?.liturgicalDay ?? 'Liturgischer Tag wird geladen ...'}
        </p>
      </div>

      <div className="space-y-5 px-6 py-8 sm:px-8">
        {loading ? (
          <div className="space-y-4" aria-live="polite">
            <div className="h-7 w-2/3 animate-pulse rounded-full bg-blue-100" />
            <div className="space-y-3">
              <div className="h-4 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 animate-pulse rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-semibold">Die Vorschau konnte nicht geladen werden.</p>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        ) : sermon ? (
          <>
            <div className="rounded-[1.5rem] border border-blue-100 bg-white/90 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Titel</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">{sermon.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{previewText}</p>
              <p className="mt-4 text-xs font-medium text-slate-500">
                {sermon.archived ? 'Bereits im Tagesarchiv gespeichert.' : 'Wird nach der Erstellung archiviert.'}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/predigt"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Zur heutigen Predigt
              </Link>
              <Link
                href="/archiv"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-blue-200 bg-white px-5 py-3 text-sm font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
              >
                Alle Predigten im Archiv
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
