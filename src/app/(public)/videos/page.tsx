import { getApprovedVideos } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function VideosPage() {
  const videos = getApprovedVideos();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Videos</h1>
          <p className="text-gray-500">Video-Beiträge aus der Gemeinschaft</p>
        </div>
        <Link href="/videos/hochladen" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          + Video teilen
        </Link>
      </div>

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {videos.map(v => (
            <div key={v.id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-gray-800 mb-2">{v.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{v.description}</p>
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                Video ansehen →
              </a>
              <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
                <span>{v.authorName}</span>
                <span>{formatDate(v.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine Videos vorhanden.</p>
          <Link href="/videos/hochladen" className="text-blue-600 hover:text-blue-800 transition-colors">
            Erstes Video teilen →
          </Link>
        </div>
      )}
    </div>
  );
}
