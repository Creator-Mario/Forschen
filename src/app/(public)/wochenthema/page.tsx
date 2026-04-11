export const dynamic = 'force-dynamic';

import { getCurrentWochenthema } from '@/lib/db';
import Link from 'next/link';
import BibleLink from '@/components/BibleLink';
import SubmissionCta from '@/components/SubmissionCta';

export default function WochenthemaPage() {
  const theme = getCurrentWochenthema();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-1">Wochenthema</h1>
          {theme && <p className="text-gray-500">Woche {theme.week}</p>}
        </div>
        <Link href="/wochenthema/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      {theme ? (
        <article>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{theme.title}</h2>

          {theme.bibleVerses && theme.bibleVerses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {theme.bibleVerses.map((v, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  <BibleLink text={v} />
                </span>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Einführung</h3>
            <p className="text-gray-700 leading-relaxed">{theme.introduction}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-amber-800 mb-3">Die Frage dieser Woche</h3>
            <p className="text-gray-700 leading-relaxed">{theme.problemStatement}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Forschungsfragen</h3>
            <ol className="space-y-3">
              {theme.researchQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="text-blue-500 font-semibold shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>

          <SubmissionCta
            title="Deine Forschung beitragen"
            description="Teile deine Erkenntnisse zu diesem Wochenthema mit der Gemeinschaft."
            href="/forschung/beitraege"
            actionLabel="Beitrag verfassen"
          />
        </article>
      ) : (
        <div className="bg-blue-50 rounded-xl p-8 text-center text-gray-500">
          <p>Noch kein Wochenthema verfügbar. Bitte schau später noch einmal vorbei.</p>
        </div>
      )}
    </div>
  );
}
