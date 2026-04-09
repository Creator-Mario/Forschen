import { paypalBusinessEmail } from '@/lib/config';

export default function SpendenPage() {
  const paypalSendUrl = `https://www.paypal.com/send?recipient=${encodeURIComponent(paypalBusinessEmail)}&note=${encodeURIComponent('Freiwillige Gabe')}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Unterstützen</h1>
      <p className="text-gray-500 mb-8">Der Fluss des Lebens – freiwillig und ohne Gegenleistung</p>

      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Warum unterstützen?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Der Fluss des Lebens ist eine private Forschungsplattform und bleibt kostenlos für alle Nutzerinnen und Nutzer. Um die
          Plattform betreiben und dauerhaft kostenlos anbieten zu können, ist der Betreiber auf
          freiwillige Unterstützung angewiesen.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Jede freiwillige Gabe – egal in welcher Höhe – hilft, diese Plattform für die christliche Gemeinschaft
          am Leben zu erhalten.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-sm text-amber-800 space-y-1">
        <p>✅ Freiwillige Gaben sind ohne Gegenleistung.</p>
        <p>✅ Eine Gabe begründet keine Rechte oder Vorteile auf der Plattform.</p>
        <p>✅ Es wird keine Spendenquittung ausgestellt.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Jetzt via PayPal senden</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Freiwillige Gaben sind ausschließlich über PayPal möglich.
        </p>

        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <a
              href={paypalSendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold px-6 py-3 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12zm5.25-1.5a.75.75 0 0 0 0 1.5h7.19l-2.72 2.72a.75.75 0 1 0 1.06 1.06l4-4a.75.75 0 0 0 0-1.06l-4-4a.75.75 0 0 0-1.06 1.06l2.72 2.72H7.25z" />
              </svg>
              Freiwillige Gabe senden
            </a>
            <a
              href={paypalSendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm text-center"
            >
              Hier klicken für eine freiwillige Gabe für Fluss des Lebens
            </a>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <span className="font-semibold">Hinweis:</span> Um Gebühren zu vermeiden, wählen Sie bitte
            in PayPal die Option &lsquo;Für Freunde und Familie&rsquo;. Empfänger und Verwendungszweck
            sind bereits vorausgefüllt – Sie müssen nur noch den Betrag eingeben und absenden.
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Du wirst zur sicheren PayPal-Seite weitergeleitet.
        </p>
      </div>
    </div>
  );
}
