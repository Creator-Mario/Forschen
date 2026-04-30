import type { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getTodayPsalmThema } from '@/lib/generated-content';
import PsalmThemeCard from '@/components/PsalmThemeCard';
import SubmissionCta from '@/components/SubmissionCta';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Psalm des Tages',
  description: 'Der Psalm des Tages mit Impuls, Fragen zur Vertiefung und geistlicher Einordnung.',
  path: '/psalmen',
  keywords: ['Psalm des Tages', 'Psalmen', 'Andacht'],
});

export default async function PsalmenPage() {
  const item = await getTodayPsalmThema();

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Psalm des Tages</h1>
          <p className="text-gray-500">{formatDate(item.date)}</p>
        </div>
        <Link href="/psalmen/archiv" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
          Archiv →
        </Link>
      </div>

      <PsalmThemeCard item={item} />

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h2 className="font-semibold text-blue-800 mb-3">Forschungsfragen für heute</h2>
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
        title="Deinen Psalm-Beitrag einreichen"
        description="Schreibe einen eigenen Forschungsbeitrag oder eine geistliche Beobachtung zu diesem Psalm."
        href="/forschung/beitraege"
        actionLabel="Psalm-Beitrag verfassen"
      />
    </div>
    </>
  );
}
