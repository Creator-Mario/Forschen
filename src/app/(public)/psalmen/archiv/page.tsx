export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getPsalmThemaArchiv } from '@/lib/generated-content';
import PsalmThemeCard from '@/components/PsalmThemeCard';

export default function PsalmenArchivPage() {
  const items = getPsalmThemaArchiv();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/psalmen" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          ← Aktueller Psalm
        </Link>
        <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Psalmen</h1>
        <p className="text-gray-500">{items.length} tägliche Psalm-Impulse</p>
      </div>

      <div className="space-y-6">
        {items.map(item => (
          <article key={item.id} className="space-y-3">
            <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
            <PsalmThemeCard item={item} compact />
          </article>
        ))}
      </div>
    </div>
  );
}
