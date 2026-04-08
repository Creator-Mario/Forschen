import Image from 'next/image';

export default function SpendenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Unterstützen</h1>
      <p className="text-gray-500 mb-8">Der Fluss des Lebens – freiwillig und ohne Gegenleistung</p>

      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Warum spenden?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Der Fluss des Lebens ist und bleibt kostenlos für alle Nutzerinnen und Nutzer. Um die
          Plattform betreiben und dauerhaft kostenlos anbieten zu können, ist der Betreiber auf
          freiwillige Unterstützung angewiesen.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Jede Spende – egal in welcher Höhe – hilft, diese Plattform für die christliche Gemeinschaft
          am Leben zu erhalten.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800 space-y-1">
        <p>✅ Spenden sind freiwillig und ohne Gegenleistung.</p>
        <p>✅ Eine Spende begründet keine Rechte oder Vorteile auf der Plattform.</p>
        <p>✅ Es wird keine Spendenquittung ausgestellt.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Jetzt via PayPal spenden</h2>
        <p className="text-gray-600 text-sm mb-6">
          Spenden sind ausschließlich über PayPal möglich.
        </p>
        <a
          href="https://www.paypal.com/donate?business=lebendigenachfolge%40gmail.com&currency_code=EUR"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <Image
            src="https://www.paypalobjects.com/de_DE/DE/i/btn/btn_donate_LG.gif"
            alt="Spenden-Button – weiterleiten zu PayPal"
            width={92}
            height={26}
            unoptimized
          />
        </a>
        <p className="text-xs text-gray-400 mt-6">
          Du wirst zur sicheren PayPal-Seite weitergeleitet.
        </p>
      </div>
    </div>
  );
}
