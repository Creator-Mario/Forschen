'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminNutzerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  async function load() {
    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('[admin/nutzer] load failed:', err);
      setFeedback(current => current ?? { type: 'error', msg: 'Nutzerliste konnte nicht geladen werden.' });
    }
  }

  function updateVisibleUsers(id: string, action: 'lock' | 'unlock' | 'hard_delete') {
    setUsers(current => {
      if (action === 'hard_delete') {
        return current.filter(user => user.id !== id);
      }

      return current.map(user => {
        if (user.id !== id) return user;
        return {
          ...user,
          active: action === 'unlock',
          status: action === 'unlock' ? 'active' : 'deleted',
        };
      });
    });
  }

  useEffect(() => {
    load().catch(err => {
      console.error('[admin/nutzer] initial load failed:', err);
      setFeedback(current => current ?? { type: 'error', msg: 'Nutzerliste konnte nicht geladen werden.' });
    });
  }, []);

  async function handleAction(id: string, action: 'lock' | 'unlock' | 'hard_delete') {
    const confirmMsg =
      action === 'hard_delete' ? 'ACHTUNG: Nutzer und ALLE zugehörigen Inhalte unwiderruflich löschen?' :
      action === 'lock' ? 'Nutzer sperren?' : 'Nutzer reaktivieren?';
    if (!confirm(confirmMsg)) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        const labels: Record<string, string> = {
          lock: 'Nutzer gesperrt.',
          unlock: 'Nutzer reaktiviert.',
          hard_delete: 'Nutzer endgültig gelöscht.',
        };
        updateVisibleUsers(id, action);
        setFeedback({ type: 'success', msg: labels[action] ?? 'Aktion ausgeführt.' });
        await load();
      } else {
        const d = await res.json().catch(() => ({}));
        setFeedback({ type: 'error', msg: d.error ?? `Aktion fehlgeschlagen (${res.status}).` });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Nutzerverwaltung</h1>
          <span className="text-sm text-gray-500">{users.length} Nutzer gesamt</span>
        </div>

        {feedback && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-Mail</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nutzer-ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rolle</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Registriert</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{u.id}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin?userId=${u.id}`}
                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                      >
                        📋 Inhalte
                      </Link>
                      {u.role !== 'ADMIN' && (
                        <>
                          {u.active ? (
                            <button
                              onClick={() => handleAction(u.id, 'lock')}
                              disabled={loading}
                              className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                              Sperren
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(u.id, 'unlock')}
                              disabled={loading}
                              className="text-xs bg-green-100 text-green-800 hover:bg-green-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            >
                              Reaktivieren
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(u.id, 'hard_delete')}
                            disabled={loading}
                            className="text-xs bg-red-600 text-white hover:bg-red-700 px-2 py-1 rounded transition-colors disabled:opacity-50"
                          >
                            💥 Endgültig löschen
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-400">Keine Nutzer gefunden</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
