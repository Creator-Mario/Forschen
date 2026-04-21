export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import ThesisCard from '@/components/ThesisCard';
import { getApprovedThesen } from '@/lib/db';
import Link from 'next/link';
import { createCollectionPageStructuredData, createPageMetadata, serializeJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Theologische Thesen und Glaubensfragen',
  description: 'Lies veröffentlichte theologische Thesen, Glaubensfragen und zugespitzte Kernaussagen aus der Gemeinschaft.',
  path: '/thesen',
  keywords: ['Thesen', 'Theologie', 'Glaubensfragen', 'theologische Diskussion'],
});

export default function ThesenPage() {
  const thesen = getApprovedThesen();
  const structuredData = createCollectionPageStructuredData({
    name: 'Theologische Thesen und Glaubensfragen',
    description: 'Veröffentlichte theologische Thesen aus der Gemeinschaft zur Diskussion und Vertiefung christlicher Glaubensfragen.',
    path: '/thesen',
    about: ['Theologische Thesen', 'Glaubensfragen', 'christliche Diskussion'],
    keywords: ['Thesen', 'Theologie', 'Glaubensfragen'],
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Theologische Thesen und Glaubensfragen</h1>
          <p className="text-gray-500">Veröffentlichte Kernaussagen, Diskussionsanstöße und zugespitzte Glaubensfragen aus der Gemeinschaft</p>
        </div>
        <Link href="/thesen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
          + These verfassen
        </Link>
      </div>

      {thesen.length > 0 ? (
        <div className="space-y-5">
          {thesen.map(t => <ThesisCard key={t.id} these={t} />)}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">Noch keine genehmigten Thesen vorhanden.</p>
          <Link href="/thesen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
            Erste These verfassen →
          </Link>
        </div>
      )}

      <div className="mt-10 bg-blue-50 rounded-xl p-6">
        <h2 className="font-semibold text-blue-800 mb-2">Was ist eine These?</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Eine theologische These ist eine prägnante Aussage, die eine Überzeugung formuliert und zur Diskussion einlädt. Sie sollte klar, begründet und mit einem Schriftbezug versehen sein. Thesen werden vor der Veröffentlichung moderiert.
        </p>
      </div>
    </div>
  );
}
