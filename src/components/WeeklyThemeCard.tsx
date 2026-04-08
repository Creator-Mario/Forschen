import Link from 'next/link';
import type { Wochenthema } from '@/types';
import BibleLink from './BibleLink';

interface WeeklyThemeCardProps {
  theme: Wochenthema;
  compact?: boolean;
}

export default function WeeklyThemeCard({ theme, compact = false }: WeeklyThemeCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="text-blue-500 text-xs font-medium uppercase tracking-wide mb-2">Wochenthema</div>
      <h2 className="text-gray-800 font-bold text-xl mb-3 leading-snug">{theme.title}</h2>
      {!compact && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{theme.introduction}</p>
      )}
      {!compact && theme.bibleVerses && theme.bibleVerses.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {theme.bibleVerses.map((v, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
              <BibleLink text={v} />
            </span>
          ))}
        </div>
      )}
      <Link href="/wochenthema" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
        Zum Wochenthema →
      </Link>
    </div>
  );
}
