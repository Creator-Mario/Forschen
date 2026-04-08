export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Impressum</h1>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-6 text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Angaben gemäß § 5 TMG</h2>
          <p className="font-medium">Mario Reiner Denzer</p>
          <p>NIRWANA GOLDEN PARK BLOK D9 NO.9</p>
          <p>Bogor-Cibinong</p>
          <p>16915</p>
          <p>Indonesien</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Verantwortlicher</h2>
          <p>Mario Reiner Denzer</p>
          <p className="text-sm text-gray-500 mt-1">
            Autor &amp; theologischer Forscher — Betreiber und Administrator dieser Plattform
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Kontakt</h2>
          <p>
            E-Mail:{' '}
            <a href="mailto:lebendigenachfolge@gmail.com" className="text-blue-600 hover:underline">
              lebendigenachfolge@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Inhaltlich verantwortlich gemäß § 18 Abs. 2 MStV</h2>
          <p>Mario Reiner Denzer (Anschrift wie oben)</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Hinweis: Ein-Personen-Projekt</h2>
          <p className="text-sm leading-relaxed">
            Diese Plattform wird von einer Einzelperson betrieben. Betreiber, Verantwortlicher und
            Administrator sind identisch: Mario Reiner Denzer.
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
