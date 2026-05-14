import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createContentBackedPageMetadata } from '@/lib/seo';
import { getCalendarDay, getDisplayLiturgicalDay } from '@/lib/churchCalendarHelpers';
import { loadSermon } from '@/lib/sermonArchive';
import { formatDate } from '@/lib/utils';
import type { LiturgicalColor } from '@/data/churchCalendarData';

const liturgicalColorClasses: Record<LiturgicalColor, string> = {
  weiß: 'bg-slate-200',
  rot: 'bg-rose-500',
  grün: 'bg-emerald-500',
  violett: 'bg-violet-500',
};

type LiturgicalDayDetailPageProps = {
  params: Promise<{
    date: string;
  }>;
};

export async function generateMetadata({ params }: LiturgicalDayDetailPageProps): Promise<Metadata> {
  const { date } = await params;
  const entry = getCalendarDay(date);

  return createContentBackedPageMetadata(
    {
      title: entry ? `${entry.liturgicalName} – Kirchenkalender` : 'Liturgischer Tag nicht gefunden',
      description: entry
        ? `${entry.significance} am ${formatDate(date)} mit liturgischer Farbe ${entry.color}.`
        : 'Der angefragte liturgische Tag konnte nicht gefunden werden.',
      path: `/kalender/${date}`,
      keywords: ['Kirchenkalender', 'Liturgischer Tag', 'Kirchenjahr', 'Festtag'],
    },
    Boolean(entry),
    false,
  );
}

export default async function LiturgicalDayDetailPage({ params }: LiturgicalDayDetailPageProps) {
  const { date } = await params;
  const entry = getCalendarDay(date);

  if (!entry) {
    notFound();
  }

  const sermon = await loadSermon(date);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-lg shadow-blue-100/60">
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 px-6 py-8 text-white sm:px-10">
          <div className="flex flex-wrap gap-4 text-sm text-blue-100">
            <Link href="/" className="transition hover:text-white">
              ← Zur Startseite
            </Link>
            <Link href={sermon ? `/archiv/${date}` : '/archiv'} className="transition hover:text-white">
              {sermon ? 'Zur Predigt dieses Tages' : 'Predigtarchiv'}
            </Link>
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Kirchenkalender</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{entry.liturgicalName}</h1>
          <p className="mt-4 text-sm text-blue-50">{formatDate(date)}</p>
        </div>

        <div className="space-y-8 px-6 py-8 sm:px-10">
          <section className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${liturgicalColorClasses[entry.color]}`} aria-hidden="true" />
                Liturgische Farbe: {entry.color}
              </span>
              <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-900">
                {entry.type}
              </span>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-900">Bedeutung</h2>
            <p className="mt-3 text-base leading-8 text-slate-700">{entry.significance}</p>
            <p className="mt-4 text-sm leading-7 text-slate-500">{getDisplayLiturgicalDay(date)}</p>
          </section>

          <section className="rounded-[1.75rem] border border-amber-100 bg-amber-50/80 p-6">
            <h2 className="text-lg font-semibold text-amber-900">Predigtverknüpfung</h2>
            {sermon ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-7 text-amber-950">
                  Für diesen Tag ist bereits eine Predigt im Archiv vorhanden.
                </p>
                <Link
                  href={`/archiv/${date}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400"
                >
                  {sermon.title}
                </Link>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-amber-950">
                Aktuell ist noch keine archivierte Predigt für diesen Tag hinterlegt.
              </p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-6">
            <h2 className="text-lg font-semibold text-blue-900">Bibelstellen</h2>
            <p className="mt-3 text-sm leading-7 text-blue-950">
              Dieser Bereich ist vorbereitet und kann später um Lesungen, Psalmen und Evangelium des Tages erweitert werden.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
