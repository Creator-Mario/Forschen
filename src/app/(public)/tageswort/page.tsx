export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import BibleVerseCard from '@/components/BibleVerseCard';
import SubmissionCta from '@/components/SubmissionCta';
import { getTodayTageswortFresh } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Tageswort',
  description: 'Entdecke das aktuelle Tageswort mit Bibelvers, Auslegung und Forschungsfragen für den Tag.',
  path: '/tageswort',
  keywords: ['Tageswort', 'Bibelvers des Tages', 'Auslegung'],
});

export default async function TageswortPage() {
  const tageswort = await getTodayTageswortFresh();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Tageswort</h1>
          <p className="text-gray-500">
            {tageswort ? formatDate(tageswort.date) : 'Heutiger Tag'}
          </p>
        </div>
        <Link href="/tageswort/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      {tageswort ? (
        <>
          <BibleVerseCard tageswort={tageswort} showQuestions />

          <SubmissionCta
            title="Deine Auslegung einreichen"
            description="Teile deine Gedanken oder Forschungsergebnisse zu diesem Vers mit der Gemeinschaft."
            href="/forschung/beitraege"
            actionLabel="Beitrag verfassen"
          />
        </>
      ) : (
        <div className="bg-blue-50 rounded-xl p-8 text-center text-gray-500">
          <p className="text-lg">Noch kein Tageswort für heute verfügbar.</p>
          <p className="text-sm mt-2">Bitte schau später noch einmal vorbei.</p>
        </div>
      )}
    </div>
  );
}
