'use client';

import { useState } from 'react';
import type { BuchempfehlungsSammlung } from '@/types';

interface BookRecommendationsCardProps {
  collection: BuchempfehlungsSammlung;
  compact?: boolean;
}

export default function BookRecommendationsCard({ collection, compact = false }: BookRecommendationsCardProps) {
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const hasHiddenRecommendations = compact && collection.recommendations.length > 1;
  const visibleRecommendations = compact && !showAllRecommendations
    ? collection.recommendations.slice(0, 1)
    : collection.recommendations;
  const hiddenRecommendationsCount = collection.recommendations.length - 1;

  return (
    <div className={`bg-white rounded-xl shadow-md ${compact ? 'p-4' : 'p-6'}`}>
      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide mb-2">Buchempfehlungen</div>
      <h2 className={`text-gray-800 font-bold leading-snug ${compact ? 'text-lg mb-2' : 'text-xl mb-3'}`}>{collection.topicTitle}</h2>
      <p className={`text-gray-600 text-sm leading-relaxed ${compact ? 'line-clamp-3 mb-3' : 'mb-4'}`}>{collection.introduction}</p>
      <div className="space-y-3">
        {visibleRecommendations.map(book => (
          <div key={`${book.title}-${book.author}`} className={`border border-slate-200 rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
            <h3 className="font-semibold text-gray-800">{book.title}</h3>
            <p className="text-sm text-blue-700 mb-2">{book.author}</p>
            <p className={`text-sm text-gray-600 leading-relaxed ${compact ? '' : 'mb-2'}`}>{book.description}</p>
            {!compact && (
              <p className="text-sm text-amber-800 leading-relaxed">{book.relevance}</p>
            )}
          </div>
        ))}
      </div>
      {hasHiddenRecommendations && (
        <button
          type="button"
          onClick={() => setShowAllRecommendations(current => !current)}
          aria-label={showAllRecommendations ? 'Weniger Empfehlungen anzeigen' : 'Weitere Empfehlungen anzeigen'}
          className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          {showAllRecommendations
            ? 'Weniger anzeigen'
            : `+ ${hiddenRecommendationsCount} weitere Empfehlung${hiddenRecommendationsCount > 1 ? 'en' : ''}`}
        </button>
      )}
    </div>
  );
}
