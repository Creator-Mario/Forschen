import { getWochenthemaList } from '@/lib/db';
import Link from 'next/link';

export default function WochenthemaArchivPage() {
  const themes = getWochenthemaList()
    .filter(t => t.status === 'published')
    .sort((a, b) => b.week.localeCompare(a.week));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/wochenthema" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">← Aktuelles Wochenthema</Link>
        <h1 className="text-3xl font-bold text-blue-800 mt-3 mb-2">Archiv – Wochenthemen</h1>
        <p className="text-gray-500">{themes.length} veröffentlichte Themen</p>
      </div>

      <div className="space-y-4">
        {themes.map(theme => (
          <div key={theme.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="text-blue-500 text-xs font-medium mb-1">{theme.week}</div>
            <h2 className="font-bold text-gray-800 text-lg mb-2">{theme.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {theme.introduction.substring(0, 180)}…
            </p>
            <div className="flex flex-wrap gap-2">
              {theme.bibleVerses.slice(0, 3).map((v, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center text-gray-500 py-8">Noch keine Wochenthemen im Archiv.</div>
      )}
    </div>
  );
}
