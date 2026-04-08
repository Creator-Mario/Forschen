'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Willkommen, {session?.user.name}!
          </h1>
          <p className="text-gray-500">Dein persönlicher Bereich bei Der Fluss des Lebens</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { href: '/mein-tageswort', icon: '📖', title: 'Mein Tageswort', desc: 'Deine Notizen und Antworten auf das tägliche Bibelwort.' },
            { href: '/meine-thesen', icon: '💡', title: 'Meine Thesen', desc: 'Verwalte deine theologischen Thesen.' },
            { href: '/thesen/neu', icon: '✍️', title: 'These schreiben', desc: 'Eine neue theologische These verfassen.' },
            { href: '/forschung/beitraege', icon: '📚', title: 'Meine Forschung', desc: 'Deine Forschungsbeiträge verwalten.' },
            { href: '/meine-gebete', icon: '🙏', title: 'Meine Gebete', desc: 'Deine eingereichten Gebete.' },
            { href: '/gebet/neu', icon: '✨', title: 'Gebet einreichen', desc: 'Ein neues Gebet für die Gemeinschaft.' },
            { href: '/chat', icon: '💬', title: 'Nachrichten', desc: 'Private 1-zu-1-Chats mit Mitgliedern.' },
            { href: '/mitglieder/vorstellungen', icon: '🧑‍🤝‍🧑', title: 'Mitglieder', desc: 'Vorstellungen der Gemeinschaftsmitglieder.' },
            { href: '/aktionen/neu', icon: '🤝', title: 'Aktion erstellen', desc: 'Eine Gemeinschaftsaktion organisieren.' },
            { href: '/videos/hochladen', icon: '🎥', title: 'Video teilen', desc: 'Ein Video mit der Gemeinschaft teilen.' },
            { href: '/profil', icon: '👤', title: 'Mein Profil', desc: 'Deine persönlichen Daten verwalten.' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow group">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-blue-800 transition-colors">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
