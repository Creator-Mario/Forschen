import type { Metadata } from 'next';
import Link from 'next/link';

import BibleLink from '@/components/BibleLink';
import { COMMUNITY_ARCHIVE_DAYS, keepRecentItemsByCreatedAt } from '@/lib/archive-window';
import { getApprovedForschungFresh } from '@/lib/db';
import {
  createContentBackedPageMetadata,
  createCollectionPageStructuredData,
  serializeJsonLd,
  type PageMetadataOptions,
} from '@/lib/seo';
import { formatDate } from '@/lib/utils';

const pageMetadata = {
  title: 'Archiv – Forschungsbeiträge',
  description: 'Öffentliches Archiv freigegebener Forschungsbeiträge aus den letzten 90 Tagen.',
  path: '/forschung/archiv',
  keywords: ['Forschungsarchiv', 'Bibelforschung Archiv', 'theologische Beiträge'],
} satisfies PageMetadataOptions;

async function getArchivedResearch() {
  return keepRecentItemsByCreatedAt(await getApprovedForschungFresh());
}

export async function generateMetadata(): Promise<Metadata> {
  const beitraege = await getArchivedResearch();
  return createContentBackedPageMetadata(pageMetadata, beitraege.length > 0);
}

export default async function ForschungArchivPage() {
  const beitraege = await getArchivedResearch();
  const structuredData = createCollectionPageStructuredData({
    name: 'Archiv – Forschungsbeiträge',
    description: `Freigegebene Forschungsbeiträge der letzten ${COMMUNITY_ARCHIVE_DAYS} Tage.`,
    path: '/forschung/archiv',
    about: ['Bibelforschung', 'Forschungsbeiträge', 'Archiv'],
    keywords: ['Forschungsarchiv', 'Bibelforschung', 'christliche Forschung'],
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
          <Link href="/forschung" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
            ← Aktuelle Beiträge
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Forschungsbeiträge</h1>
          <p className="text-gray-500">
            {beitraege.length} veröffentlichte Beiträge der letzten {COMMUNITY_ARCHIVE_DAYS} Tage
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/forschung" className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
            Zur Übersicht
          </Link>
          <Link href="/forschung/beitraege" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Beitrag verfassen
          </Link>
        </div>
      </div>

      {beitraege.length > 0 ? (
        <div className="space-y-5">
          {beitraege.map((beitrag) => (
            <div key={beitrag.id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-2">{beitrag.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{beitrag.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">{beitrag.authorName}</span>
                  {beitrag.bibleReference && (
                    <>
                      <span>·</span>
                      <BibleLink text={beitrag.bibleReference} className="text-blue-600" />
                    </>
                  )}
                </div>
                <span>{formatDate(beitrag.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine veröffentlichten Forschungsbeiträge im Archiv der letzten 90 Tage.</p>
          <Link href="/forschung/beitraege" className="text-blue-600 hover:text-blue-800 transition-colors">
            Ersten Beitrag verfassen →
          </Link>
        </div>
      )}
    </div>
  );
}
