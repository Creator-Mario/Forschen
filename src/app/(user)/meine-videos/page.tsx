'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import type { Video } from '@/types';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function MeineVideosPage() {
  const { data: session } = useSession();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/videos?all=1')
      .then(r => r.json())
      .then((data: Video[]) => {
        if (session?.user.id) {
          setVideos(data.filter(v => v.userId === session.user.id));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Videos konnten nicht geladen werden.');
        setLoading(false);
      });
  }, [session]);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Meine Videos</h1>
          <Link href="/videos/hochladen" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Video teilen
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-6">{error}</div>
        )}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Wird geladen...</p>
        ) : videos.length > 0 ? (
          <div className="space-y-5">
            {videos.map(v => {
              const safeHref =
                v.url && (v.url.startsWith('https://') || v.url.startsWith('http://'))
                  ? v.url
                  : null;
              return (
                <div key={v.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg leading-snug">{v.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${getStatusColor(v.status)}`}>
                      {getStatusLabel(v.status)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">{v.description}</p>
                  {v.adminMessage && (
                    <div className="mb-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-800">
                      <span className="font-medium">Rückfrage des Admins:</span> {v.adminMessage}
                    </div>
                  )}
                  {safeHref ? (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                    >
                      Video ansehen →
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Link nicht verfügbar</span>
                  )}
                  <div className="mt-3 text-xs text-gray-400">
                    {formatDate(v.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Du hast noch keine Videos geteilt.</p>
            <Link href="/videos/hochladen" className="text-blue-600 hover:text-blue-800 transition-colors">
              Erstes Video teilen →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
