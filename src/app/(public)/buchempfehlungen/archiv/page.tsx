export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getBuchempfehlungenArchiv } from '@/lib/generated-content';
import BookRecommendationsCard from '@/components/BookRecommendationsCard';

export default function BuchempfehlungenArchivPage() {
  const items = getBuchempfehlungenArchiv();

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
    </div>
  );
}
