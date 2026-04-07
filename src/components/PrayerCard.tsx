import type { Gebet } from '@/types';
import { formatDate } from '@/lib/utils';

interface PrayerCardProps {
  gebet: Gebet;
}

export default function PrayerCard({ gebet }: PrayerCardProps) {
  const author = gebet.anonymous ? 'Anonym' : (gebet.authorName || 'Unbekannt');
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-400">
      <p className="text-gray-700 leading-relaxed italic mb-4">&ldquo;{gebet.content}&rdquo;</p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-medium text-gray-500">{author}</span>
        <span>{formatDate(gebet.createdAt)}</span>
      </div>
    </div>
  );
}
