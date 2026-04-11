export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getTodayBuchempfehlungen } from '@/lib/generated-content';
import BookRecommendationsCard from '@/components/BookRecommendationsCard';

export default function BuchempfehlungenPage() {
  const collection = getTodayBuchempfehlungen();

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
    </div>
  );
}
