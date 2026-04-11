import type { PsalmThema } from '@/types';
import BibleLink from './BibleLink';

interface PsalmThemeCardProps {
  item: PsalmThema;
  compact?: boolean;
}

export default function PsalmThemeCard({ item, compact = false }: PsalmThemeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide mb-2">Psalm des Tages</div>
      <div className="text-blue-700 font-semibold mb-2">
        <BibleLink text={item.psalmReference} />
      </div>
      <h2 className="text-gray-800 font-bold text-xl mb-3 leading-snug">{item.title}</h2>
      <blockquote className="text-gray-700 italic border-l-4 border-blue-300 pl-4 mb-4">
        &ldquo;{item.excerpt}&rdquo;
      </blockquote>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.summary}</p>
      {!compact && (
        <>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Bedeutung für die Nachfolge</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{item.significance}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Impuls für heute</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{item.practice}</p>
          </div>
        </>
      )}
    </div>
  );
}
