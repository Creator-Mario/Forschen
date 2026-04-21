export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getApprovedForschung, getWochenthemaListFresh } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import BibleLink from '@/components/BibleLink';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCollectionPageStructuredData, createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Bibelforschung und Forschungsbeiträge',
  description: 'Lies freigegebene Forschungsbeiträge zu Tageswort, Psalmen und Wochenthemen aus der christlichen Gemeinschaft.',
  path: '/forschung',
  keywords: ['Bibelforschung', 'christliche Forschung', 'Wochenthema Beiträge', 'theologische Beiträge'],
});

export default async function ForschungPage() {
  const session = await getServerSession(authOptions);
  const beitraege = getApprovedForschung();
  const themen = (await getWochenthemaListFresh()).filter(t => t.status === 'published');
  const themenById = new Map(themen.map(theme => [theme.id, theme]));
  const structuredData = createCollectionPageStructuredData({
    name: 'Bibelforschung und Forschungsbeiträge',
    description: 'Öffentliche Forschungsbeiträge der Gemeinschaft zu Bibelversen, Psalmen und theologischen Wochenthemen.',
    path: '/forschung',
    about: ['Bibelforschung', 'Tageswort', 'Psalmen', 'Wochenthema', 'theologische Beiträge'],
    keywords: ['Bibelforschung', 'christliche Forschung', 'theologische Beiträge'],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Bibelforschung und Forschungsbeiträge</h1>
          <p className="text-gray-500">Freigegebene Beiträge zu Tageswort, Psalmen, Wochenthemen und christlichen Glaubensfragen</p>
        </div>
        {session ? (
          <Link href="/forschung/beitraege" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Beitrag verfassen
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Anmelden
            </Link>
            <Link href="/registrieren" className="border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
              Kostenlos registrieren
            </Link>
          </div>
        )}
      </div>

      {!session && (
        <div className="mb-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-blue-900 mb-2">Öffentlich lesen, als Mitglied selbst beitragen</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Diese Seite zeigt freigegebene Forschungsbeiträge öffentlich an. Nach der Anmeldung kannst du eigene Forschung zu Tageswort, Psalmen und Wochenthemen einreichen. Jeder Beitrag geht vorher in die Moderation.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {beitraege.length > 0 ? beitraege.map(b => (
            <div key={b.id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-2">{b.title}</h2>
              {b.wochenthemaId && themenById.get(b.wochenthemaId) && (
                <p className="text-xs text-blue-600 font-medium mb-2">
                  Thema: {themenById.get(b.wochenthemaId)?.title}
                </p>
              )}
              <p className="text-gray-600 text-sm leading-relaxed mb-3">{b.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-500">{b.authorName}</span>
                  {b.bibleReference && (
                    <>
                      <span>·</span>
                      <BibleLink text={b.bibleReference} className="text-blue-600" />
                    </>
                  )}
                </div>
                <span>{formatDate(b.createdAt)}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-gray-500">
              <p>Noch keine Forschungsbeiträge verfügbar.</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Wochenthemen</h3>
            <ul className="space-y-2">
              {themen.slice(0, 5).map(t => (
                <li key={t.id}>
                  <Link href="/wochenthema" className="text-blue-600 hover:text-blue-800 text-sm transition-colors block">
                    {t.title}
                  </Link>
                  <span className="text-xs text-gray-400">{t.week}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
