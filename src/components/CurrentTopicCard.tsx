import type { GlaubenHeuteThema } from '@/types';
import BibleLink from './BibleLink';

interface CurrentTopicCardProps {
  item: GlaubenHeuteThema;
  compact?: boolean;
}

export default function CurrentTopicCard({ item, compact = false }: CurrentTopicCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-md ${compact ? 'p-4' : 'p-6'}`}>
      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide mb-2">Glauben heute</div>
      <h2 className={`text-gray-800 font-bold leading-snug ${compact ? 'text-lg mb-2' : 'text-xl mb-2'}`}>{item.title}</h2>
      <p className={`text-amber-700 font-medium ${compact ? 'mb-2 text-sm' : 'mb-4'}`}>{item.headline}</p>
      <p className={`text-gray-600 text-sm leading-relaxed ${compact ? 'line-clamp-4' : 'mb-4'}`}>{item.worldFocus}</p>
      {!compact && (
        <>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Christliche Perspektive</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{item.faithPerspective}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Biblische Anker</h3>
            <div className="flex flex-wrap gap-2">
              {item.bibleVerses.map(verse => (
                <span key={verse} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                  <BibleLink text={verse} />
                </span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">Impuls zur Nachfolge</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{item.discipleshipImpulse}</p>
          </div>
        </>
      )}
    </div>
  );
}
