export const dynamic = 'force-dynamic';

import BibleVerseCard from '@/components/BibleVerseCard';
import { getTodayTageswort } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function TageswortPage() {
  const tageswort = getTodayTageswort();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Tageswort</h1>
          <p className="text-gray-500">
            {tageswort ? formatDate(tageswort.date) : 'Heutiger Tag'}
          </p>
        </div>
        <Link href="/tageswort/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      {tageswort ? (
        <>
          <BibleVerseCard tageswort={tageswort} showQuestions />

          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Deine Gedanken teilen</h2>
            <p className="text-gray-600 text-sm mb-4">
              Möchtest du deine Forschungsergebnisse oder Gedanken zu diesem Vers teilen?{' '}
              Registriere dich oder melde dich an, um einen Forschungsbeitrag zu schreiben.
            </p>
            <div className="flex gap-3">
              <a href="/registrieren" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                Registrieren
              </a>
              <a href="/login" className="border border-blue-800 text-blue-800 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                Anmelden
              </a>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-blue-50 rounded-xl p-8 text-center text-gray-500">
          <p className="text-lg">Noch kein Tageswort für heute verfügbar.</p>
          <p className="text-sm mt-2">Bitte schau später noch einmal vorbei.</p>
        </div>
      )}
    </div>
  );
}
