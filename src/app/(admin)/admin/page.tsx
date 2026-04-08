'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

const adminLinks = [
  { href: '/admin/vorstellungen', icon: '🧑‍🤝‍🧑', title: 'Vorstellungen prüfen', desc: 'Neue Mitglieder freischalten oder ablehnen' },
  { href: '/admin/nutzer', icon: '👥', title: 'Nutzerverwaltung', desc: 'Nutzer anzeigen und verwalten' },
  { href: '/admin/thesen', icon: '💡', title: 'Thesen moderieren', desc: 'Eingereichte Thesen prüfen' },
  { href: '/admin/forschung', icon: '📚', title: 'Forschung moderieren', desc: 'Forschungsbeiträge prüfen' },
  { href: '/admin/gebet', icon: '🙏', title: 'Gebete moderieren', desc: 'Eingereichte Gebete prüfen' },
  { href: '/admin/videos', icon: '🎥', title: 'Videos moderieren', desc: 'Eingereichte Videos prüfen' },
  { href: '/admin/aktionen', icon: '🤝', title: 'Aktionen moderieren', desc: 'Eingereichte Aktionen prüfen' },
  { href: '/admin/tageswort', icon: '📖', title: 'Tageswort verwalten', desc: 'Tagesbibelverse verwalten' },
  { href: '/admin/wochenthema', icon: '🔍', title: 'Wochenthema verwalten', desc: 'Wöchentliche Themen verwalten' },
  { href: '/admin/spenden', icon: '💰', title: 'Spenden', desc: 'Spendenübersicht' },
  { href: '/admin/system', icon: '⚙️', title: 'System', desc: 'Systemeinstellungen' },
];

const CONTENT_TYPE_LABELS: Record<string, string> = {
  these: 'These',
  forschung: 'Forschung',
  gebet: 'Gebet',
  video: 'Video',
  aktion: 'Aktion',
};

const CONTENT_TYPE_TO_ROUTE: Record<string, string> = {
  these: 'thesen',
  forschung: 'forschung',
  gebet: 'gebet',
  video: 'videos',
  aktion: 'aktionen',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OverviewItem = Record<string, any>;

function AdminPageInner() {
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get('userId') || '';

  const [items, setItems] = useState<OverviewItem[]>([]);
  const [pendingVorstellungen, setPendingVorstellungen] = useState(0);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = userIdFilter
      ? `/api/admin/overview?userId=${encodeURIComponent(userIdFilter)}`
      : '/api/admin/overview';
    fetch(url)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .finally(() => setLoading(false));

    // Also load pending introductions count
    fetch('/api/admin/vorstellungen')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPendingVorstellungen(data.length); });
  }, [userIdFilter]);

  const typeOptions = ['all', 'these', 'forschung', 'gebet', 'video', 'aktion'];
  const statusOptions = ['all', 'created', 'pending', 'review', 'published', 'approved', 'question_to_user', 'postponed', 'deleted', 'rejected'];

  const filtered = items
    .filter(i => filter === 'all' || i.contentType === filter)
    .filter(i => statusFilter === 'all' || i.status === statusFilter);

  const pendingCount = items.filter(i => i.status === 'created' || i.status === 'pending').length;

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="text-blue-600 text-sm font-medium mb-1">Verwaltungsbereich</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          {pendingVorstellungen > 0 && (
            <p className="text-sm text-red-600 mt-1 font-medium">
              🧑‍🤝‍🧑 {pendingVorstellungen} neue Vorstellung{pendingVorstellungen > 1 ? 'en' : ''} warten auf Freischaltung
            </p>
          )}
          {pendingCount > 0 && (
            <p className="text-sm text-orange-600 mt-1 font-medium">
              ⚠️ {pendingCount} Inhalte warten auf Bearbeitung
            </p>
          )}
        </div>

        {!userIdFilter && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {adminLinks.map(link => (
              <Link key={link.href} href={link.href} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group border-l-4 border-blue-500">
                <div className="text-2xl mb-2">{link.icon}</div>
                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-800 transition-colors">{link.title}</h3>
                <p className="text-gray-500 text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {userIdFilter ? 'Inhalte dieses Nutzers' : 'Alle Inhalte im System'}
            </h2>
            {userIdFilter && (
              <Link
                href="/admin"
                className="text-sm text-blue-600 hover:underline"
              >
                ← Alle Inhalte anzeigen
              </Link>
            )}
          </div>

          {userIdFilter && items.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800">
              Gefiltert nach Nutzer: <span className="font-semibold">{items[0]?.userName}</span>{' '}
              <span className="text-blue-600">({items[0]?.userEmail})</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Typ</label>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t === 'all' ? 'Alle Typen' : CONTENT_TYPE_LABELS[t] || t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'Alle Status' : getStatusLabel(s)}</option>
                ))}
              </select>
            </div>
            <div className="self-end text-sm text-gray-500">{filtered.length} Einträge</div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Laden…</div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Typ</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Titel / Inhalt</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Erstellt von</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">E-Mail</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {CONTENT_TYPE_LABELS[item.contentType] || item.contentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-gray-800 truncate">{item.displayTitle}</p>
                        <p className="text-xs text-gray-400 font-mono">{item.id}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{item.userName}</td>
                      <td className="px-4 py-3 text-blue-600 text-xs">{item.userEmail}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/${CONTENT_TYPE_TO_ROUTE[item.contentType] || item.contentType}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Bearbeiten →
                        </Link>
                      </td>
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

        <div className="mt-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">← Zurück zur Plattform</Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-64"><div className="text-gray-500">Laden...</div></div>}>
      <AdminPageInner />
    </Suspense>
  );
}
