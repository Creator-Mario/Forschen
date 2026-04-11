import type { NutzerBuchempfehlung } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface UserBookRecommendationCardProps {
  item: NutzerBuchempfehlung;
  showStatus?: boolean;
}

export default function UserBookRecommendationCard({ item, showStatus = false }: UserBookRecommendationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-bold text-gray-800 text-xl">{item.title}</h2>
          <p className="text-blue-700 text-sm">{item.author}</p>
        </div>
        {showStatus && (
          <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(item.status)}`}>
            {getStatusLabel(item.status)}
          </span>
        )}
      </div>

      <div className="mb-3 text-xs uppercase tracking-wide text-amber-700 font-semibold">
        Empfohlen zu: {item.themeReference}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>
      <div className="text-xs text-gray-400">
        Empfohlen von {item.recommenderName} · {formatDate(item.createdAt)}
      </div>

      {showStatus && item.adminMessage && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-800">
          <span className="font-medium">Rückfrage des Admins:</span> {item.adminMessage}
        </div>
      )}
    </div>
  );
}
