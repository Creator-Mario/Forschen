export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getBuchempfehlungenArchiv } from '@/lib/generated-content';
import BookRecommendationsCard from '@/components/BookRecommendationsCard';
import UserBookRecommendationCard from '@/components/UserBookRecommendationCard';
import { getApprovedBuchempfehlungen } from '@/lib/db';

const COMMUNITY_ARCHIVE_DAYS = 90;
const MS_PER_DAY = 86400000;

function isWithinArchiveWindow(dateStr: string) {
  return Date.now() - new Date(dateStr).getTime() <= COMMUNITY_ARCHIVE_DAYS * MS_PER_DAY;
}

export default function BuchempfehlungenArchivPage() {
  const items = getBuchempfehlungenArchiv();
  const communityRecommendations = getApprovedBuchempfehlungen()
    .filter(item => isWithinArchiveWindow(item.createdAt))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/buchempfehlungen" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          ← Aktuelle Empfehlungen
        </Link>
        <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Buchempfehlungen</h1>
        <p className="text-gray-500">{items.length} archivierte Empfehlungslisten</p>
      </div>

      <div className="space-y-6">
        {items.map(collection => (
          <article key={collection.id} className="space-y-3">
            <p className="text-sm text-gray-500">{formatDate(collection.date)}</p>
            <BookRecommendationsCard collection={collection} compact />
          </article>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Archiv – Empfehlungen der Gemeinschaft</h2>
        <p className="text-gray-500 mb-6">{communityRecommendations.length} freigegebene Beiträge der letzten 90 Tage</p>

        {communityRecommendations.length > 0 ? (
          <div className="space-y-5">
            {communityRecommendations.map(item => (
              <UserBookRecommendationCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-md">
            Noch keine freigegebenen Beiträge im Archiv.
          </div>
        )}
      </div>
    </div>
  );
}
