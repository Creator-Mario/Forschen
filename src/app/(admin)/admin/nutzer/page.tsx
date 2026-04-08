'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminNutzerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  function load() {
    fetch('/api/admin/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    });
  }

  useEffect(() => { load(); }, []);

  async function handleAction(id: string, action: 'lock' | 'unlock' | 'delete') {
    const confirmMsg =
      action === 'delete' ? 'Nutzer wirklich löschen (Soft-Delete)?' :
      action === 'lock' ? 'Nutzer sperren?' : 'Nutzer reaktivieren?';
    if (!confirm(confirmMsg)) return;
    setLoading(true);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    setLoading(false);
    load();
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Nutzerverwaltung</h1>
          <span className="text-sm text-gray-500">{users.length} Nutzer gesamt</span>
        </div>

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
                    {u.role !== 'ADMIN' && (
                      <div className="flex gap-2">
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
                          onClick={() => handleAction(u.id, 'delete')}
                          disabled={loading}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          Löschen
                        </button>
                      </div>
                    )}
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
