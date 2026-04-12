export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import ThesisCard from '@/components/ThesisCard';
import { getApprovedThesen } from '@/lib/db';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Theologische Thesen',
  description: 'Lies veröffentlichte theologische Thesen aus der Gemeinschaft und beteilige dich an der Diskussion.',
  path: '/thesen',
  keywords: ['Thesen', 'Theologie', 'Glaubensfragen'],
});

export default function ThesenPage() {
  const thesen = getApprovedThesen();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Thesen</h1>
          <p className="text-gray-500">Theologische Kernaussagen aus der Gemeinschaft</p>
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
