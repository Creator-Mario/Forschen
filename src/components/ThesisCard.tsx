import type { These } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

interface ThesisCardProps {
  these: These;
  showStatus?: boolean;
}

export default function ThesisCard({ these, showStatus = false }: ThesisCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-800 text-lg leading-snug">{these.title}</h3>
        {showStatus && (
          <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(these.status)}`}>
            {getStatusLabel(these.status)}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{these.content}</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-500">{these.authorName}</span>
          {these.bibleReference && (
            <>
              <span>·</span>
              <span className="text-blue-600">{these.bibleReference}</span>
            </>
          )}
        </div>
        <span>{formatDate(these.createdAt)}</span>
      </div>
    </div>
  );
}
