'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AdminNotification } from '@/types';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    fetch('/api/user/notifications')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setNotifications(data); })
      .catch(() => {});
  }, []);

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Willkommen, {session?.user.name}!
          </h1>
          <p className="text-gray-500">Dein persönlicher Bereich bei Der Fluss des Lebens</p>
        </div>

        {notifications.length > 0 && (
          <div className="mb-8 space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-start">
                <span className="text-xl shrink-0">❓</span>
                <div>
                  <p className="font-semibold text-orange-800 text-sm">
                    Rückfrage des Admins zu deinem {n.contentTypeLabel}: &bdquo;{n.title}&ldquo;
                  </p>
                  <p className="text-orange-700 text-sm mt-1">{n.adminMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { href: '/mein-tageswort', icon: '📖', title: 'Mein Tageswort', desc: 'Deine Notizen und Antworten auf das tägliche Bibelwort.' },
            { href: '/meine-thesen', icon: '💡', title: 'Meine Thesen', desc: 'Verwalte deine theologischen Thesen.' },
            { href: '/thesen/archiv', icon: '🗂️', title: 'Thesen-Archiv', desc: 'Alle veröffentlichten Thesen der Gemeinschaft im Überblick.' },
            { href: '/thesen/neu', icon: '✍️', title: 'These schreiben', desc: 'Eine neue theologische These verfassen.' },
            { href: '/meine-forschung', icon: '📚', title: 'Meine Forschung', desc: 'Deine Forschungsbeiträge verwalten.' },
            { href: '/forschung/archiv', icon: '📜', title: 'Forschungsarchiv', desc: 'Frühere Forschungsbeiträge der Gemeinschaft weiterlesen.' },
            { href: '/meine-buchempfehlungen', icon: '📘', title: 'Meine Buchempfehlungen', desc: 'Deine Buchhinweise und deren Freigabestatus.' },
            { href: '/buchempfehlungen/neu', icon: '➕', title: 'Buchempfehlung hinzufügen', desc: 'Empfiehl ein Buch zu einem konkreten Thema.' },
            { href: '/meine-gebete', icon: '🙏', title: 'Meine Gebete', desc: 'Deine eingereichten Gebete.' },
            { href: '/gebet/neu', icon: '✨', title: 'Gebet einreichen', desc: 'Ein neues Gebet für die Gemeinschaft.' },
            { href: '/fragestellungen', icon: '❓', title: 'Fragen an die Gemeinschaft', desc: 'Fragen der Mitglieder lesen, beantworten und gemeinsam vertiefen.' },
            { href: '/fragestellungen/neu', icon: '📝', title: 'Frage stellen', desc: 'Eine eigene, klar formulierte Fragestellung an die Gemeinschaft richten.' },
            { href: '/chat', icon: '💬', title: 'Nachrichten', desc: 'Private 1-zu-1-Chats mit Mitgliedern.' },
            { href: '/mitglieder/vorstellungen', icon: '🧑‍🤝‍🧑', title: 'Mitglieder', desc: 'Vorstellungen der Gemeinschaftsmitglieder.' },
            { href: '/aktionen/neu', icon: '🤝', title: 'Aktion erstellen', desc: 'Eine Gemeinschaftsaktion organisieren.' },
            { href: '/videos/hochladen', icon: '🎥', title: 'Video teilen', desc: 'Ein Video mit der Gemeinschaft teilen.' },
            { href: '/meine-videos', icon: '📹', title: 'Meine Videos', desc: 'Deine eingereichten Videos und deren Status.' },
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
