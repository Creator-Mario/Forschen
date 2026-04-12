'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import type { Video } from '@/types';
import Link from 'next/link';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

function isVisibleVideo(status: string) {
  return status === 'approved' || status === 'published';
}

function sortNewestFirst(a: Video, b: Video) {
  return b.createdAt.localeCompare(a.createdAt);
}

export default function MeineVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubmittedNotice, setShowSubmittedNotice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setShowSubmittedNotice(params.get('submitted') === '1');
    }

    fetch('/api/videos?mine=1')
      .then(async r => {
        if (!r.ok) {
          const data = await r.json().catch(() => null);
          throw new Error(data?.error || 'Videos konnten nicht geladen werden.');
        }
        return r.json();
      })
      .then((data: Video[]) => {
        setVideos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Videos konnten nicht geladen werden.');
        setLoading(false);
      });
  }, []);

  const visibleVideos = videos.filter(video => isVisibleVideo(video.status)).sort(sortNewestFirst);
  const reviewVideos = videos.filter(video => !isVisibleVideo(video.status)).sort(sortNewestFirst);

  function renderVideoCard(v: Video) {
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
            <span className="font-medium">Nachricht vom Admin:</span> {v.adminMessage}
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
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Meine Videos</h1>
            <p className="text-gray-500 mt-2">
              Freigegebene Videos erscheinen hier. Neue Einreichungen gehen zuerst zur Prüfung an den Admin.
            </p>
          </div>
          <Link href="/videos/hochladen" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            + Video teilen
          </Link>
        </div>

        {showSubmittedNotice && (
          <div className="mb-6 rounded-lg px-4 py-3 text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
            ✅ Dein Video wurde eingereicht und an den Admin zur Prüfung weitergeleitet.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-6">{error}</div>
        )}
        {loading ? (
          <p className="text-gray-400 text-center py-12">Wird geladen...</p>
        ) : videos.length > 0 ? (
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Freigegebene Videos</h2>
                <p className="text-sm text-gray-500">Diese Videos sind vom Admin freigegeben und für Mitglieder sichtbar.</p>
              </div>
              {visibleVideos.length > 0 ? (
                <div className="space-y-5">
                  {visibleVideos.map(renderVideoCard)}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-5 text-sm text-blue-800">
                  Nach der Freigabe durch den Admin erscheinen deine Videos hier.
                </div>
              )}
            </section>

            {reviewVideos.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Aktuell in Prüfung</h2>
                  <p className="text-sm text-gray-500">Diese Einreichungen sind noch nicht für alle Mitglieder sichtbar.</p>
                </div>
                <div className="space-y-5">
                  {reviewVideos.map(renderVideoCard)}
                </div>
              </section>
            )}
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
