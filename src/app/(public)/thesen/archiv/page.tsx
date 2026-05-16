import type { Metadata } from 'next';
import Link from 'next/link';

import ThesisCard from '@/components/ThesisCard';
import { COMMUNITY_ARCHIVE_DAYS, keepRecentItemsByCreatedAt } from '@/lib/archive-window';
import { getApprovedThesenFresh } from '@/lib/db';
import {
  createContentBackedPageMetadata,
  createCollectionPageStructuredData,
  serializeJsonLd,
  type PageMetadataOptions,
} from '@/lib/seo';

const pageMetadata = {
  title: 'Archiv – Thesen',
  description: 'Öffentliches Archiv freigegebener theologischer Thesen aus den letzten 90 Tagen.',
  path: '/thesen/archiv',
  keywords: ['Thesen Archiv', 'theologische Thesen', 'Glaubensfragen Archiv'],
} satisfies PageMetadataOptions;

async function getArchivedThesen() {
  return keepRecentItemsByCreatedAt(await getApprovedThesenFresh());
}

export async function generateMetadata(): Promise<Metadata> {
  const thesen = await getArchivedThesen();
  return createContentBackedPageMetadata(pageMetadata, thesen.length > 0);
}

export default async function ThesenArchivPage() {
  const thesen = await getArchivedThesen();
  const structuredData = createCollectionPageStructuredData({
    name: 'Archiv – Thesen',
    description: `Freigegebene theologische Thesen der letzten ${COMMUNITY_ARCHIVE_DAYS} Tage.`,
    path: '/thesen/archiv',
    about: ['Theologische Thesen', 'Glaubensfragen', 'Archiv'],
    keywords: ['Thesen Archiv', 'Theologie', 'Glaubensfragen'],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <Link href="/thesen" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
            ← Aktuelle Thesen
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Thesen</h1>
          <p className="text-gray-500">
            {thesen.length} veröffentlichte Thesen der letzten {COMMUNITY_ARCHIVE_DAYS} Tage
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/thesen" className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
            Zur Übersicht
          </Link>
          <Link href="/thesen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + These verfassen
          </Link>
        </div>
      </div>

      {thesen.length > 0 ? (
        <div className="space-y-5">
          {thesen.map((these) => <ThesisCard key={these.id} these={these} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine veröffentlichten Thesen im Archiv der letzten 90 Tage.</p>
          <Link href="/thesen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
            Erste These verfassen →
          </Link>
        </div>
      )}
    </div>
  );
}
