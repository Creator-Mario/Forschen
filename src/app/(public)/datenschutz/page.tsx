import type { Metadata } from 'next';

import { operatorName, operatorEmail, operatorAddress } from '@/lib/config';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Datenschutzerklärung',
  description: 'Datenschutzhinweise zur Nutzung von Der Fluss des Lebens und zur Verarbeitung personenbezogener Daten.',
  path: '/datenschutz',
  keywords: ['Datenschutz', 'DSGVO', 'Datenschutzerklärung'],
});

export default function DatenschutzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Datenschutzerklärung</h1>
      <p className="text-gray-500 mb-8">Letzte Aktualisierung: April 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:
          </p>
          <p className="mt-2 font-medium">{operatorName}</p>
          <p className="text-sm">
            {operatorAddress.street}, {operatorAddress.city}, {operatorAddress.zip}, {operatorAddress.country}
          </p>
          <p className="text-sm mt-1">
            E-Mail:{' '}
            <a href={`mailto:${operatorEmail}`} className="text-blue-600 hover:underline">
              {operatorEmail}
            </a>
          </p>
          <p className="text-sm mt-2 text-gray-500">
            Diese Plattform wird als Ein-Personen-Projekt betrieben. Betreiber, Verantwortlicher
            und Administrator sind identisch.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Erhobene Daten</h2>
          <p>Wir erheben und verarbeiten folgende personenbezogene Daten:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
            <li>Name und E-Mail-Adresse bei der Registrierung</li>
            <li>Von dir eingereichte Inhalte (Thesen, Forschungsbeiträge, Gebete, Videos)</li>
            <li>Technische Zugriffsdaten (IP-Adresse, Zeitstempel) aus Sicherheitsgründen</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Zweck der Datenverarbeitung</h2>
          <p>Deine Daten werden ausschließlich verwendet für:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
            <li>Die Bereitstellung des Dienstes und deines Nutzerkontos</li>
            <li>Die Authentifizierung beim Anmelden</li>
            <li>Die Zuordnung von Inhalten zu ihrem Verfasser</li>
          </ul>
          <p className="mt-3">Wir verarbeiten keine Daten für Werbezwecke und geben keine Daten an Dritte weiter.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Datenspeicherung</h2>
          <p>
            Deine Daten werden auf den Servern des Hosting-Dienstleisters (Railway) gespeichert. Wir
            wenden angemessene technische und organisatorische Maßnahmen an, um deine Daten vor
            unbefugtem Zugriff zu schützen.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Deine Rechte</h2>
          <p>Nach der DSGVO hast du folgende Rechte:</p>
          <ul className="list-disc ml-6 mt-2 space-y-1 text-sm">
            <li>Recht auf Auskunft über deine gespeicherten Daten</li>
            <li>Recht auf Berichtigung unrichtiger Daten</li>
            <li>Recht auf Löschung deiner Daten</li>
            <li>Recht auf Einschränkung der Verarbeitung</li>
            <li>Recht auf Datenübertragbarkeit</li>
            <li>Widerspruchsrecht</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung dieser Rechte wende dich an:{' '}
            <a href={`mailto:${operatorEmail}`} className="text-blue-600 hover:underline">
              {operatorEmail}
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Cookies</h2>
          <p>
            Diese Website verwendet ausschließlich technisch notwendige Cookies für die
            Authentifizierung (Session-Cookie). Es werden keine Tracking- oder Marketing-Cookies
            eingesetzt.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Beschwerderecht</h2>
          <p>
            Du hast das Recht, dich bei der zuständigen Datenschutzaufsichtsbehörde zu beschweren.
          </p>
        </section>
      </div>
    </div>
  );
}
