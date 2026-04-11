'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Member {
  id: string;
  name: string;
  vorstellung: string;
  createdAt: string;
}

export default function VorstellungenPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mitglieder')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMembers(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Mitglieder-Vorstellungen</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Lerne die Mitglieder der Gemeinschaft kennen. Jede Person wurde vom Administrator persönlich
            freigeschaltet.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Laden…</div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Noch keine Mitglieder-Vorstellungen vorhanden.
          </div>
        ) : (
          <div className="space-y-5">
            {members.map(m => (
              <div key={m.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800 text-lg">{m.name}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">Mitglied seit {formatDate(m.createdAt)}</span>
                    {session?.user.id && session.user.id !== m.id && (
                      <Link
                        href={`/chat/${m.id}`}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors font-medium"
                      >
                        💬 Nachricht senden
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{m.vorstellung}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
