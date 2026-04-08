'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface EnrichedLog {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: string;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<EnrichedLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetch('/api/admin/logs')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLogs(data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? logs.filter(l =>
        l.action.includes(filter) ||
        l.adminName.toLowerCase().includes(filter.toLowerCase()) ||
        l.targetType.includes(filter) ||
        (l.note || '').toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin-Protokoll</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Alle Admin-Aktionen werden automatisch aufgezeichnet. Einträge können nicht gelöscht werden.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Suchen (Aktion, Admin, Typ, Notiz)…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-72"
          />
          <span className="text-sm text-gray-500">{filtered.length} Einträge</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Laden…</div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Zeitpunkt</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Aktion</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ziel-ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Notiz</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{log.adminName}</p>
                      {log.adminEmail && (
                        <p className="text-xs text-gray-400">{log.adminEmail}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.targetType}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.targetId}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{log.note || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400">Keine Einträge gefunden.</div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
