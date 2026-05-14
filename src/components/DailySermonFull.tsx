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

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function DailySermonFull() {
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
        throw new Error('error' in payload && payload.error ? payload.error : 'Die Tagespredigt konnte nicht geladen werden.');
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

  const formattedDate = useMemo(
    () => (sermon ? formatGermanDate(sermon.date) : formatGermanDate(new Date().toISOString().slice(0, 10))),
    [sermon],
  );

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-xl shadow-blue-100/60">
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 px-6 py-8 text-white sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Tagespredigt</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-blue-50 sm:flex-row sm:items-center sm:gap-4">
            <time dateTime={sermon?.date}>{formattedDate}</time>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-blue-200 sm:block" aria-hidden="true" />
            <span>{sermon?.liturgicalDay ?? 'Liturgischer Tag wird geladen …'}</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold font-serif sm:text-4xl">
            {sermon?.title ?? 'Die heutige Predigt wird geladen'}
          </h1>
        </div>

        <div className="space-y-6 px-6 py-8 sm:px-10">
          {loading ? (
            <div className="space-y-4" aria-live="polite">
              <div className="h-8 w-2/3 animate-pulse rounded-full bg-blue-100" />
              <div className="space-y-3">
                <div className="h-4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-11/12 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
              <p className="font-semibold">Die Tagespredigt konnte nicht geladen werden.</p>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => void loadSermon()}
                className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Erneut versuchen
              </button>
            </div>
          ) : sermon ? (
            <>
              <div className="rounded-2xl bg-blue-50/80 p-5">
                <p className="text-sm leading-7 text-slate-600">
                  {sermon.fromCache ? 'Aus dem heutigen Archiv geladen.' : 'Gerade für den heutigen Tag erstellt.'}
                  {sermon.archived ? ' Die Predigt ist im Archiv gespeichert.' : ''}
                </p>
              </div>

              <article className="space-y-8 text-base leading-8 text-slate-700">
                <section>
                  <h2 className="mb-4 text-lg font-semibold text-slate-900">Predigt</h2>
                  <div className="space-y-5">
                    {splitParagraphs(sermon.content).map((paragraph, index) => (
                      <p key={`sermon-content-paragraph-${sermon.date}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-amber-100 bg-amber-50/80 p-6">
                  <h2 className="text-lg font-semibold text-amber-900">Gebet</h2>
                  <div className="mt-3 space-y-4 text-amber-950">
                    {splitParagraphs(sermon.prayer).map((paragraph, index) => (
                      <p key={`sermon-prayer-paragraph-${sermon.date}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              </article>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/archiv"
                  className="inline-flex items-center justify-center rounded-full bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Zum Predigtarchiv
                </Link>
                <Link
                  href={`/archiv/${sermon.date}`}
                  className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100"
                >
                  Diese Predigt im Archiv öffnen
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
