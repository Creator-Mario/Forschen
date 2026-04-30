import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getTodayGlaubenHeuteThema } from '@/lib/generated-content';
import CurrentTopicCard from '@/components/CurrentTopicCard';
import SubmissionCta from '@/components/SubmissionCta';
import { createCollectionPageStructuredData, createPageMetadata, serializeJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Glauben heute – christliche Themenimpulse',
  description: 'Aktuelle christliche Themenimpulse für den Glauben heute mit Fragen zur Vertiefung und weiterführender Forschung.',
  path: '/glauben-heute',
  keywords: ['Glauben heute', 'christliche Impulse', 'Tagesimpuls', 'Glaubensfragen'],
});

export default async function GlaubenHeutePage() {
  const item = await getTodayGlaubenHeuteThema();
  const structuredData = createCollectionPageStructuredData({
    name: `${item.title} – Glauben heute`,
    description: `${item.headline} ${item.worldFocus}`,
    path: '/glauben-heute',
    about: [item.title, 'Glauben heute', 'christliche Themenimpulse'],
    keywords: ['Glauben heute', 'christliche Impulse', 'Glaubensfragen'],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Glauben heute</h1>
          <p className="text-gray-500">{formatDate(item.date)}</p>
        </div>
        <Link href="/glauben-heute/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      <CurrentTopicCard item={item} />

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Fragen zur Vertiefung</h2>
        <ol className="space-y-3">
          {item.questions.map((question, index) => (
            <li key={question} className="flex gap-3 text-gray-700">
              <span className="text-blue-500 font-semibold shrink-0">{index + 1}.</span>
              <span>{question}</span>
            </li>
          ))}
        </ol>
      </div>

      <SubmissionCta
        title="Deinen Gedankenbeitrag einreichen"
        description="Teile deine Beobachtungen, Fragen oder einen Forschungsbeitrag zu diesem aktuellen Thema."
        href="/forschung/beitraege"
        actionLabel="Gedankenbeitrag verfassen"
      />
    </div>
    </>
  );
}
