import type { Tageswort } from '@/types';
import BibleLink from './BibleLink';

interface BibleVerseCardProps {
  tageswort: Tageswort;
  showQuestions?: boolean;
}

export default function BibleVerseCard({ tageswort, showQuestions = false }: BibleVerseCardProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
      <div className="text-blue-500 text-sm font-medium mb-2 uppercase tracking-wide">
        Tageswort
      </div>
      <div className="text-blue-800 text-lg font-semibold mb-1">
        <BibleLink text={tageswort.verse} />
      </div>
      <blockquote className="text-gray-800 text-xl italic leading-relaxed border-l-4 border-blue-400 pl-4 my-4">
        &ldquo;{tageswort.text}&rdquo;
      </blockquote>
      {tageswort.context && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          <BibleLink text={tageswort.context} />
        </p>
      )}
      {showQuestions && tageswort.questions && tageswort.questions.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-blue-800 mb-3">Forschungsfragen:</h3>
          <ol className="space-y-2">
            {tageswort.questions.map((q, i) => (
              <li key={i} className="flex gap-3 text-gray-700 text-sm">
                <span className="text-blue-500 font-semibold shrink-0">{i + 1}.</span>
                <BibleLink text={q} />
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
