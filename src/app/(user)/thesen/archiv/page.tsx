export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ThesisCard from '@/components/ThesisCard';
import { authOptions } from '@/lib/auth';
import { getApprovedThesen } from '@/lib/db';

export default async function ThesenArchivPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const thesen = getApprovedThesen()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Archiv – Thesen</h1>
          <p className="text-gray-500">
            {thesen.length} veröffentlichte Thesen aus der Gemeinschaft
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/meine-thesen" className="border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
            Meine Thesen
          </Link>
          <Link href="/thesen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + These verfassen
          </Link>
        </div>
      </div>

      {thesen.length > 0 ? (
        <div className="space-y-5">
          {thesen.map(these => <ThesisCard key={these.id} these={these} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine veröffentlichten Thesen im Archiv.</p>
          <Link href="/thesen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
            Erste These verfassen →
          </Link>
        </div>
      )}
    </div>
  );
}
