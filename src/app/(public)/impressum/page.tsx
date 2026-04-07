export default function ImpressumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">Impressum</h1>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-6 text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Angaben gemäß § 5 TMG</h2>
          <p>Der Fluss des Lebens e.V.</p>
          <p>Musterstraße 1</p>
          <p>12345 Musterstadt</p>
          <p>Deutschland</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Vertreten durch</h2>
          <p>Max Mustermann (1. Vorsitzender)</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Kontakt</h2>
          <p>E-Mail: kontakt@fluss-des-lebens.de</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Registrierung</h2>
          <p>Eingetragen im Vereinsregister.</p>
          <p>Registergericht: Amtsgericht Musterstadt</p>
          <p>Registernummer: VR XXXXX</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Inhaltlich verantwortlich</h2>
          <p>Max Mustermann (Anschrift wie oben)</p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Streitschlichtung</h2>
          <p className="text-sm leading-relaxed">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr/. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-800 mb-2">Haftungsausschluss</h2>
          <p className="text-sm leading-relaxed">
            Die Inhalte dieser Plattform wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir keine Gewähr übernehmen. Nutzerinhalte werden moderiert, stellen jedoch nicht zwingend die Meinung des Betreibers dar.
          </p>
        </section>
      </div>
    </div>
  );
}
