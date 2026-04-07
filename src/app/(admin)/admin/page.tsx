'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const adminLinks = [
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

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="text-blue-600 text-sm font-medium mb-1">Verwaltungsbereich</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {adminLinks.map(link => (
            <Link key={link.href} href={link.href} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group border-l-4 border-blue-500">
              <div className="text-2xl mb-2">{link.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-800 transition-colors">{link.title}</h3>
              <p className="text-gray-500 text-sm">{link.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">← Zurück zur Plattform</Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
