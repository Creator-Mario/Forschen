'use client';

import { getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Item = Record<string, any>;

interface AdminModerationTableProps {
  items: Item[];
  titleField: string;
  authorField: string;
  contentField?: string;
  onModerate: (id: string, status: 'approved' | 'rejected') => void;
}

export default function AdminModerationTable({
  items, titleField, authorField, contentField, onModerate
}: AdminModerationTableProps) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.id} className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-semibold text-gray-800">{String(item[titleField] || '')}</h3>
              <p className="text-sm text-gray-500">{String(item[authorField] || '')} · {formatDate(item.createdAt)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(item.status)}`}>
              {getStatusLabel(item.status)}
            </span>
          </div>
          {contentField && item[contentField] && (
            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
              {String(item[contentField])}
            </p>
          )}
          {item.status === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => onModerate(item.id, 'approved')}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                Genehmigen
              </button>
              <button
                onClick={() => onModerate(item.id, 'rejected')}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Ablehnen
              </button>
            </div>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">Keine Einträge gefunden.</div>
      )}
    </div>
  );
}
