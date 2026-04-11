'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { ForschungsBeitrag } from '@/types';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import BibleLink from '@/components/BibleLink';

export default function MeineForschungPage() {
  const { data: session } = useSession();
  const [beitraege, setBeitraege] = useState<ForschungsBeitrag[]>([]);

  useEffect(() => {
    fetch('/api/forschung?all=1')
      .then(r => r.json())
      .then((data: ForschungsBeitrag[]) => {
        if (session?.user.id) {
          setBeitraege(data.filter(b => b.userId === session.user.id));
        }
      });
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Meine Forschungsbeiträge</h1>
          <Link href="/forschung/beitraege" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Beitrag verfassen
          </Link>
        </div>

        {beitraege.length > 0 ? (
          <div className="space-y-5">
            {beitraege.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg leading-snug">{b.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(b.status)}`}>
                    {getStatusLabel(b.status)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{b.content}</p>
                {b.adminMessage && (
                  <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-800">
                    <span className="font-medium">Rückfrage des Admins:</span> {b.adminMessage}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    {b.bibleReference && (
                      <BibleLink text={b.bibleReference} className="text-blue-600" />
                    )}
                  </div>
                  <span>{formatDate(b.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Du hast noch keine Forschungsbeiträge verfasst.</p>
            <Link href="/forschung/beitraege" className="text-blue-600 hover:text-blue-800 transition-colors">
              Ersten Beitrag verfassen →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
