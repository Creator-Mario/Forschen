import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getGlaubenHeuteArchiv } from '@/lib/generated-content';
import CurrentTopicCard from '@/components/CurrentTopicCard';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Archiv – Glauben heute',
  description: 'Frühere Themenimpulse aus Glauben heute gesammelt im Archiv.',
  path: '/glauben-heute/archiv',
  keywords: ['Glauben heute Archiv', 'Themenimpulse Archiv'],
});

export default async function GlaubenHeuteArchivPage() {
  const items = await getGlaubenHeuteArchiv();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/glauben-heute" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          ← Aktuelles Thema
        </Link>
        <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Glauben heute</h1>
        <p className="text-gray-500">{items.length} tägliche Themenimpulse</p>
      </div>

      <div className="space-y-6">
        {items.map(item => (
          <article key={item.id} className="space-y-3">
            <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
            <CurrentTopicCard item={item} compact />
          </article>
        ))}
      </div>
    </div>
  );
}
