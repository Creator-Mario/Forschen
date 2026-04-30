import type { Metadata } from 'next';
import Link from 'next/link';
import BibleVerseCard from '@/components/BibleVerseCard';
import { getTageswortListFresh } from '@/lib/db';
import { keepLatestItemsByDate } from '@/lib/archive-window';
import { formatDate } from '@/lib/utils';
import {
  createContentBackedPageMetadata,
  type PageMetadataOptions,
} from '@/lib/seo';

const pageMetadata = {
  title: 'Archiv der Tageswörter',
  description: 'Durchsuche das Archiv veröffentlichter Tageswörter mit Bibeltexten und Forschungsfragen.',
  path: '/tageswort/archiv',
  keywords: ['Tageswort Archiv', 'Bibelarchiv'],
} satisfies PageMetadataOptions;

async function getArchivedTageswortItems() {
  return keepLatestItemsByDate(
    (await getTageswortListFresh()).filter((item) => item.published),
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const items = await getArchivedTageswortItems();

  return createContentBackedPageMetadata(pageMetadata, items.length > 0);
}

export default async function TageswortArchivPage() {
  const items = await getArchivedTageswortItems();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/tageswort" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          ← Aktuelles Tageswort
        </Link>
        <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Tageswörter</h1>
        <p className="text-gray-500">{items.length} veröffentlichte Tageswörter</p>
      </div>

      {items.length > 0 ? (
        <div className="space-y-6">
          {items.map(item => (
            <article key={item.id} className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
              </div>
              <BibleVerseCard tageswort={item} showQuestions />
            </article>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">Noch keine Tageswörter im Archiv.</div>
      )}
    </div>
  );
}
