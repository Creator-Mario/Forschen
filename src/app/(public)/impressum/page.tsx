import type { Metadata } from 'next';

import { operatorName, operatorEmail, operatorAddress, operatorPhoneE164 } from '@/lib/config';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Impressum',
  description: 'Rechtliche Angaben, Kontaktinformationen und Verantwortliche von Der Fluss des Lebens.',
  path: '/impressum',
  keywords: ['Impressum', 'Kontakt', 'rechtliche Angaben'],
});

export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Impressum</h1>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-6 text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Angaben gemäß § 5 TMG</h2>
          <p className="font-medium">{operatorName}</p>
          <p>{operatorAddress.street}</p>
          <p>{operatorAddress.city}</p>
          <p>{operatorAddress.zip}</p>
          <p>{operatorAddress.country}</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Verantwortlicher</h2>
          <p>{operatorName}</p>
          <p className="text-sm text-gray-500 mt-1">
            Autor &amp; theologischer Forscher — Betreiber und Administrator dieser Plattform
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Kontakt</h2>
          <p>
            E-Mail:{' '}
            <a href={`mailto:${operatorEmail}`} className="text-blue-600 hover:underline">
              {operatorEmail}
            </a>
          </p>
          <p className="mt-1">
            WhatsApp:{' '}
            <a
              href={`https://wa.me/${operatorPhoneE164.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              {operatorPhoneE164}
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV</h2>
          <p>{operatorName} (Anschrift wie oben)</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Hinweis: Ein-Personen-Projekt</h2>
          <p className="text-sm leading-relaxed">
            Diese Plattform wird von einer Einzelperson betrieben. Betreiber, Verantwortlicher und
            Administrator sind identisch: {operatorName}.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Streitschlichtung</h2>
          <p className="text-sm leading-relaxed">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a href="https://ec.europa.eu/consumers/odr/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              https://ec.europa.eu/consumers/odr/
            </a>
            . Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Haftungsausschluss</h2>
          <p className="text-sm leading-relaxed">
            Die Inhalte dieser Plattform wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte kann keine Gewähr übernommen werden.
            Nutzerinhalte werden moderiert, stellen jedoch nicht zwingend die Meinung des Betreibers dar.
          </p>
        </section>
      </div>
    </div>
  );
}
