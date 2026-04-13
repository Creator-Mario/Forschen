export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getApprovedVideos, getWochenthemaList } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Videos',
  description: 'Freigegebene Video-Beiträge aus der Gemeinschaft mit thematischer Zuordnung.',
  path: '/videos',
  keywords: ['christliche Videos', 'Bibelforschung Videos', 'Gemeinschaftsvideos'],
});

export default async function VideosPage() {
  const session = await getServerSession(authOptions);
  const videos = getApprovedVideos();
  const themen = getWochenthemaList().filter(t => t.status === 'published');
  const themenById = new Map(themen.map(theme => [theme.id, theme]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Videos</h1>
          <p className="text-gray-500">Freigegebene Video-Beiträge aus der Gemeinschaft</p>
        </div>
        {session ? (
          <Link href="/videos/hochladen" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Video teilen
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
          <h2 className="font-semibold text-blue-900 mb-2">Videos öffentlich ansehen, mit Anmeldung selbst teilen</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Hier siehst du alle freigegebenen Videos. Nach der Anmeldung kannst du eigene Beiträge einreichen. Sie gehen automatisch in die Moderation und erscheinen nach der Freigabe im Mitgliederbereich und unter passenden Themen.
          </p>
        </div>
      )}

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {videos.map(v => {
            // Only allow http / https URLs to prevent javascript: injection.
            const safeHref =
              v.url && (v.url.startsWith('https://') || v.url.startsWith('http://'))
                ? v.url
                : null;
            return (
              <div key={v.id} className="bg-white rounded-xl shadow-md p-6">
                <h2 className="font-bold text-gray-800 mb-2">{v.title}</h2>
                {v.wochenthemaId && themenById.get(v.wochenthemaId) && (
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    Thema: {themenById.get(v.wochenthemaId)?.title}
                  </p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{v.description}</p>
                {safeHref ? (
                  <a
                    href={safeHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                  >
                    Video ansehen →
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm">Link nicht verfügbar</span>
                )}
                <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                  <span>{v.authorName}</span>
                  <span>{formatDate(v.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine Videos vorhanden.</p>
          <Link href={session ? '/videos/hochladen' : '/registrieren'} className="text-blue-600 hover:text-blue-800 transition-colors">
            {session ? 'Erstes Video teilen →' : 'Jetzt registrieren und erstes Video teilen →'}
          </Link>
        </div>
      )}
    </div>
  );
}
