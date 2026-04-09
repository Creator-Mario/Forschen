export const dynamic = 'force-dynamic';

import { getApprovedAktionen } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AktionenPage() {
  const aktionen = getApprovedAktionen();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Aktionen & Treffen</h1>
          <p className="text-gray-500">Gemeinschaftliche Aktivitäten und Veranstaltungen</p>
        </div>
        <Link href="/aktionen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          + Aktion erstellen
        </Link>
      </div>

      {aktionen.length > 0 ? (
        <div className="space-y-5">
          {aktionen.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 text-lg mb-2">{a.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{a.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-3">
                {a.location && (
                  <div>
                    <span className="text-gray-400 text-xs block">Ort</span>
                    <span>{a.location}</span>
                  </div>
                )}
                {a.dateEvent && (
                  <div>
                    <span className="text-gray-400 text-xs block">Datum</span>
                    <span>{formatDate(a.dateEvent)}</span>
                  </div>
                )}
                {a.contactInfo && (
                  <div>
                    <span className="text-gray-400 text-xs block">Kontakt</span>
                    <span>{a.contactInfo}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 flex justify-between">
                <span>{a.authorName}</span>
                <span>{formatDate(a.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine Aktionen vorhanden.</p>
          <Link href="/aktionen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
            Erste Aktion erstellen →
          </Link>
        </div>
      )}
    </div>
  );
}
