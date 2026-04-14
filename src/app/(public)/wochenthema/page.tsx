export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getCurrentWochenthema } from '@/lib/db';
import { getApprovedForschung, getApprovedVideos } from '@/lib/db';
import Link from 'next/link';
import BibleLink from '@/components/BibleLink';
import SubmissionCta from '@/components/SubmissionCta';
import { createPageMetadata } from '@/lib/seo';

function getSafeVideoUrl(url: string | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export const metadata: Metadata = createPageMetadata({
  title: 'Wochenthema',
  description: 'Das aktuelle Wochenthema mit Einführung, Bibelstellen, Forschungsfragen und Beiträgen aus der Gemeinschaft.',
  path: '/wochenthema',
  keywords: ['Wochenthema', 'Bibelstudium', 'theologisches Thema'],
});

export default function WochenthemaPage() {
  const theme = getCurrentWochenthema();
  const research = theme
    ? getApprovedForschung().filter(item => item.wochenthemaId === theme.id)
    : [];
  const videos = theme
    ? getApprovedVideos().filter(item => item.wochenthemaId === theme.id)
    : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-1">Wochenthema</h1>
          {theme && <p className="text-gray-500">Woche {theme.week}</p>}
        </div>
        <Link href="/wochenthema/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      {theme ? (
        <article>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{theme.title}</h2>

          {theme.bibleVerses && theme.bibleVerses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {theme.bibleVerses.map((v, i) => (
                <span key={i} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  <BibleLink text={v} />
                </span>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Einführung</h3>
            <p className="text-gray-700 leading-relaxed">{theme.introduction}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-amber-800 mb-3">Die Frage dieser Woche</h3>
            <p className="text-gray-700 leading-relaxed">{theme.problemStatement}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Forschungsfragen</h3>
            <ol className="space-y-3">
              {theme.researchQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-gray-700">
                  <span className="text-blue-500 font-semibold shrink-0">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>

          <SubmissionCta
            title="Deine Forschung beitragen"
            description="Teile deine Erkenntnisse zu diesem Wochenthema mit der Gemeinschaft."
            href="/forschung/beitraege"
            actionLabel="Beitrag verfassen"
          />

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Beiträge zu diesem Thema</h3>
                  <p className="text-sm text-gray-500">Freigegebene Forschungsbeiträge</p>
                </div>
                <Link href="/forschung" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                  Alle Beiträge →
                </Link>
              </div>
              {research.length > 0 ? (
                <div className="space-y-4">
                  {research.map(item => (
                    <article key={item.id} className="border border-gray-100 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-4">{item.content}</p>
                      <div className="mt-3 text-xs text-gray-400 flex items-center justify-between gap-3">
                        <span>{item.authorName}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Noch keine freigegebenen Beiträge zu diesem Wochenthema.</p>
              )}
            </section>

            <section className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800">Videos zu diesem Thema</h3>
                  <p className="text-sm text-gray-500">Freigegebene Videos</p>
                </div>
                <Link href="/videos" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
                  Alle Videos →
                </Link>
              </div>
              {videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.map(item => {
                    const safeHref = getSafeVideoUrl(item.url);
                    return (
                      <article key={item.id} className="border border-gray-100 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-4">{item.description}</p>
                        {safeHref ? (
                          <a
                            href={safeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
                          >
                            Video ansehen →
                          </a>
                        ) : (
                          <span className="inline-block mt-3 text-sm text-gray-400">Link nicht verfügbar</span>
                        )}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Noch keine freigegebenen Videos zu diesem Wochenthema.</p>
              )}
            </section>
          </div>
        </article>
      ) : (
        <div className="bg-blue-50 rounded-xl p-8 text-center text-gray-500">
          <p>Noch kein Wochenthema verfügbar. Bitte schau später noch einmal vorbei.</p>
        </div>
      )}
    </div>
  );
}
