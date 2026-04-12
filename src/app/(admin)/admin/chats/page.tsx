'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';

interface ConversationPair {
  userId1: string;
  userId2: string;
  user1Name: string;
  user1ProfileImage?: string | null;
  user2Name: string;
  user2ProfileImage?: string | null;
  messageCount: number;
  lastAt: string;
}

export default function AdminChatsPage() {
  const [pairs, setPairs] = useState<ConversationPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function load() {
    setLoading(true);
    fetch('/api/admin/chats')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPairs(data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(userId1: string, userId2: string, name1: string, name2: string) {
    if (!confirm(`Gespräch zwischen „${name1}" und „${name2}" wirklich löschen?`)) return;
    setDeleting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/chat/${userId1}?partner=${userId2}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', msg: 'Gespräch gelöscht.' });
      } else {
        setFeedback({ type: 'error', msg: 'Löschen fehlgeschlagen.' });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setDeleting(false);
      load();
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Chat-Moderation</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Alle privaten Gespräche zwischen Mitgliedern. Chats sind privat für Nutzer, aber vollständig einsehbar für den Administrator.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
        </div>

        {feedback && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Laden…</div>
        ) : pairs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-10 text-center text-gray-400">
            Noch keine Gespräche vorhanden.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Teilnehmer 1</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Teilnehmer 2</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nachrichten</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Letzte Nachricht</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map(p => (
                  <tr key={`${p.userId1}:${p.userId2}`} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={p.user1Name}
                          imageSrc={p.user1ProfileImage}
                          className="h-10 w-10 shrink-0 text-sm"
                          textClassName="text-sm font-semibold"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{p.user1Name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.userId1}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          name={p.user2Name}
                          imageSrc={p.user2ProfileImage}
                          className="h-10 w-10 shrink-0 text-sm"
                          textClassName="text-sm font-semibold"
                        />
                        <div>
                          <p className="font-medium text-gray-800">{p.user2Name}</p>
                          <p className="text-xs text-gray-400 font-mono">{p.userId2}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.messageCount}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(p.lastAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/chat/${p.userId1}?partner=${p.userId2}`}
                          className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        >
                          👁 Einsehen
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.userId1, p.userId2, p.user1Name, p.user2Name)}
                          disabled={deleting}
                          className="text-xs bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          🗑 Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
