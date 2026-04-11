import type { BuchempfehlungsSammlung } from '@/types';

interface BookRecommendationsCardProps {
  collection: BuchempfehlungsSammlung;
  compact?: boolean;
}

export default function BookRecommendationsCard({ collection, compact = false }: BookRecommendationsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide mb-2">Buchempfehlungen</div>
      <h2 className="text-gray-800 font-bold text-xl mb-3 leading-snug">{collection.topicTitle}</h2>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{collection.introduction}</p>
      <div className="space-y-3">
        {collection.recommendations.map(book => (
          <div key={`${book.title}-${book.author}`} className="border border-slate-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800">{book.title}</h3>
            <p className="text-sm text-blue-700 mb-2">{book.author}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">{book.description}</p>
            {!compact && (
              <p className="text-sm text-amber-800 leading-relaxed">{book.relevance}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
