import type { Metadata } from 'next';

import Link from 'next/link';
import { createCollectionPageStructuredData, createPageMetadata, serializeJsonLd } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Christlicher Gebetsraum',
  description: 'Informationen zum geschützten christlichen Gebetsraum für persönliche Gebete, Fürbitte und gemeinschaftliches Gebet.',
  path: '/gebet',
  keywords: ['Gebet', 'Gebetsraum', 'christliche Gemeinschaft', 'Fürbitte'],
});

export default function GebetPage() {
  const structuredData = createCollectionPageStructuredData({
    name: 'Christlicher Gebetsraum',
    description: 'Öffentliche Informationen zum geschützten Gebetsraum für persönliche Gebete, Fürbitte und gemeinschaftliches Gebet.',
    path: '/gebet',
    about: ['Gebet', 'Fürbitte', 'christliche Gemeinschaft', 'geschützter Gebetsraum'],
    keywords: ['Gebet', 'Gebetsraum', 'Fürbitte'],
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Christlicher Gebetsraum</h1>
      <p className="text-gray-500 mb-8">Ein geschützter Raum für persönliche Gebete, Fürbitte und gemeinschaftliches Gebet</p>

      <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
        <div className="text-purple-600 text-2xl mb-3">🙏</div>
        <h2 className="font-semibold text-purple-800 mb-2">Warum ist der Gebetsraum geschützt?</h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          Gebet ist ein zutiefst persönlicher Akt der Verletzlichkeit. Wir möchten einen Raum schaffen, in dem Menschen ehrlich und ohne Angst vor Missbrauch ihre Gedanken und Bitten vor Gott und die Gemeinschaft bringen können. Deshalb ist der Gebetsraum nur für eingeloggte Mitglieder sichtbar.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h2 className="font-semibold text-gray-800 mb-3">Zum Gebetsraum</h2>
        <p className="text-gray-600 text-sm mb-6">
          Melde dich an oder registriere dich, um die Gebete der Gemeinschaft zu lesen und eigene Gebete einzureichen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Anmelden
          </Link>
          <Link href="/registrieren" className="border border-blue-800 text-blue-800 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Kostenlos registrieren
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-3">Im Gebetsraum kannst du:</h3>
        <ul className="space-y-2 text-gray-600 text-sm">
          <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Gebete der Gemeinschaft lesen</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Eigene Gebete einreichen (anonym möglich)</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Für andere Mitglieder beten</li>
          <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">✓</span> Gebetsanliegen mit der Gemeinschaft teilen</li>
        </ul>
      </div>
    </div>
  );
}
