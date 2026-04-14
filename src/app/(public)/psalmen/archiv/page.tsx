export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getPsalmThemaArchiv } from '@/lib/generated-content';
import PsalmThemeCard from '@/components/PsalmThemeCard';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Archiv der Psalmen',
  description: 'Durchsuche frühere Psalm-Impulse und Andachten im Psalmen-Archiv.',
  path: '/psalmen/archiv',
  keywords: ['Psalmen Archiv', 'Psalm-Andachten'],
});

export default async function PsalmenArchivPage() {
  const items = await getPsalmThemaArchiv();

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
