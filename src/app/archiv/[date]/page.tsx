import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { loadSermon } from '@/lib/sermonArchive';
import { formatDate } from '@/lib/utils';
import { createContentBackedPageMetadata } from '@/lib/seo';

type SermonArchiveDetailPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export async function generateMetadata({ params }: SermonArchiveDetailPageProps): Promise<Metadata> {
  const { date } = await params;
  const sermon = await loadSermon(date);

  return createContentBackedPageMetadata(
    {
      title: sermon ? `${sermon.title} – Tagespredigt` : 'Predigt nicht gefunden',
      description: sermon
        ? `Archivierte Tagespredigt zum ${sermon.liturgicalDay} vom ${formatDate(sermon.date)}.`
        : 'Diese archivierte Predigt konnte nicht gefunden werden.',
      path: `/archiv/${date}`,
      keywords: ['Predigt', 'Archiv', 'Kirchenjahr'],
    },
    Boolean(sermon),
    false,
  );
}

export default async function SermonArchiveDetailPage({ params }: SermonArchiveDetailPageProps) {
  const { date } = await params;
  const sermon = await loadSermon(date);

  if (!sermon) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg shadow-blue-100/60">
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 px-6 py-8 text-white sm:px-10">
          <Link href="/archiv" className="text-sm text-blue-100 transition hover:text-white">
            ← Zurück zum Archiv
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Archivpredigt</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{sermon.title}</h1>
          <div className="mt-4 space-y-1 text-sm text-blue-50">
            <p>{formatDate(sermon.date)}</p>
            <p>{sermon.liturgicalDay}</p>
          </div>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-10">
          <article>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Predigt</h2>
            <p className="whitespace-pre-line text-base leading-8 text-slate-700">{sermon.content}</p>
          </article>

          <section className="rounded-2xl border border-amber-100 bg-amber-50/80 p-6">
            <h2 className="text-lg font-semibold text-amber-900">Gebet</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-8 text-amber-950">{sermon.prayer}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
