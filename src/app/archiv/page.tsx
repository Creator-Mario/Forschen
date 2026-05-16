import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllSermons } from '@/lib/sermonArchive';
import { formatDate } from '@/lib/utils';
import { createContentBackedPageMetadata, type PageMetadataOptions } from '@/lib/seo';

export const revalidate = 300;

const pageMetadata = {
  title: 'Archiv der Tagespredigten',
  description: 'Alle gespeicherten KI-gestützten Tagespredigten im Überblick – mit Datum, liturgischem Tag und Titel.',
  path: '/archiv',
  keywords: ['Predigt Archiv', 'Tagespredigten', 'Kirchenjahr', 'Predigtübersicht'],
} satisfies PageMetadataOptions;

export async function generateMetadata(): Promise<Metadata> {
  const sermons = await getAllSermons();
  return createContentBackedPageMetadata(pageMetadata, sermons.length > 0);
}

export default async function SermonArchivePage() {
  const sermons = await getAllSermons();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-3">
        <Link href="/predigt" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
          ← Zur heutigen Predigt
        </Link>
        <h1 className="text-3xl font-bold text-blue-900 sm:text-4xl">Archiv – Tagespredigten</h1>
        <p className="text-base text-slate-600">
          {sermons.length} gespeicherte Predigten mit liturgischem Bezug und Gebet.
        </p>
      </div>

      {sermons.length > 0 ? (
        <div className="space-y-4">
          {sermons.map((sermon) => (
            <Link
              key={sermon.date}
              href={`/archiv/${sermon.date}`}
              className="block rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-md"
            >
              <p className="text-sm font-medium text-blue-700">{formatDate(sermon.date)}</p>
              <p className="mt-2 text-sm text-slate-500">{sermon.liturgicalDay}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{sermon.title}</h2>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50 px-6 py-10 text-center text-slate-600">
          Noch keine Predigten im Archiv vorhanden.
        </div>
      )}
    </div>
  );
}
