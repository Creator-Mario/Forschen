export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getTodayBuchempfehlungen } from '@/lib/generated-content';
import BookRecommendationsCard from '@/components/BookRecommendationsCard';
import UserBookRecommendationCard from '@/components/UserBookRecommendationCard';
import { getApprovedBuchempfehlungen } from '@/lib/db';
import { COMMUNITY_ARCHIVE_DAYS, MS_PER_DAY } from '@/lib/archive-window';
import { createPageMetadata } from '@/lib/seo';

function isWithinArchiveWindow(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() <= COMMUNITY_ARCHIVE_DAYS * MS_PER_DAY;
}

export const metadata: Metadata = createPageMetadata({
  title: 'Buchempfehlungen',
  description: 'Tägliche Buchempfehlungen und freigegebene Literaturtipps aus der Gemeinschaft.',
  path: '/buchempfehlungen',
  keywords: ['christliche Buchempfehlungen', 'Literaturtipps', 'Bücher'],
});

export default function BuchempfehlungenPage() {
  const collection = getTodayBuchempfehlungen();
  const communityRecommendations = getApprovedBuchempfehlungen()
    .filter(item => isWithinArchiveWindow(item.createdAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Buchempfehlungen des Tages</h1>
          <p className="text-gray-500">{formatDate(collection.date)}</p>
        </div>
        <Link href="/buchempfehlungen/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      <BookRecommendationsCard collection={collection} />

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="font-semibold text-blue-800">Eigene Buchempfehlung einreichen</h2>
            <p className="text-sm text-gray-600">Nenne das Buch, den Autor und das Thema, zu dem du es empfiehlst. Der Admin prüft die Empfehlung vor der Veröffentlichung.</p>
          </div>
          <Link href="/buchempfehlungen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Empfehlung einreichen
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-800">Empfehlungen der Gemeinschaft</h2>
            <p className="text-gray-500 text-sm">Freigegebene Empfehlungen der letzten 90 Tage</p>
          </div>
          <Link href="/buchempfehlungen/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
            Alles im Archiv →
          </Link>
        </div>

        {communityRecommendations.length > 0 ? (
          <div className="space-y-5">
            {communityRecommendations.map(item => (
              <UserBookRecommendationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">
            Noch keine freigegebenen Buchempfehlungen aus der Gemeinschaft.
          </div>
        )}
      </div>
    </div>
  );
}
