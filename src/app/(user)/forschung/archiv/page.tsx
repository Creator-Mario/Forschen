export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import BibleLink from '@/components/BibleLink';
import { authOptions } from '@/lib/auth';
import { getApprovedForschung } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export default async function ForschungArchivPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const beitraege = getApprovedForschung()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Archiv – Forschungsbeiträge</h1>
          <p className="text-gray-500">
            {beitraege.length} veröffentlichte Beiträge aus der Gemeinschaft
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/meine-forschung" className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
            Meine Beiträge
          </Link>
          <Link href="/forschung/beitraege" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Beitrag verfassen
          </Link>
        </div>
      </div>

      {beitraege.length > 0 ? (
        <div className="space-y-5">
          {beitraege.map(beitrag => (
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
          <p className="text-lg mb-4">Noch keine veröffentlichten Forschungsbeiträge im Archiv.</p>
          <Link href="/forschung/beitraege" className="text-blue-600 hover:text-blue-800 transition-colors">
            Ersten Beitrag verfassen →
          </Link>
        </div>
      )}
    </div>
  );
}
