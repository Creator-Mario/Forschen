'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Partner {
  id: string;
  name: string;
  email?: string;
  unreadCount: number;
}

export default function ChatPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chat')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPartners(data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Nachrichten</h1>
        <p className="text-gray-500 text-sm mb-8">
          Private 1-zu-1-Chats – nur für freigeschaltete Mitglieder
        </p>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Laden…</div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-400">
            Noch keine Gespräche vorhanden. Besuche die{' '}
            <Link href="/mitglieder/vorstellungen" className="text-blue-600 hover:underline">
              Mitglieder-Vorstellungen
            </Link>
            , um eine Nachricht zu senden.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md divide-y">
            {partners.map(p => (
              <Link
                key={p.id}
                href={`/chat/${p.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {p.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {p.unreadCount > 9 ? '9+' : p.unreadCount}
                    </span>
                  )}
                  <span className="text-blue-500 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
