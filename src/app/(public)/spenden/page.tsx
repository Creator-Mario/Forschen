import Image from 'next/image';
import { paypalBusinessEmail } from '@/lib/config';

export default function SpendenPage() {
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
        <h2 className="text-xl font-semibold text-gray-800 mb-3 text-center">Geld senden via PayPal</h2>
        <p className="text-gray-600 text-sm mb-8 text-center">
          Scannen Sie den QR-Code mit Ihrer PayPal-App – oder geben Sie die E-Mail-Adresse manuell ein.
        </p>

        {/* PayPal QR code */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image
            src="/paypal-qr.jpg"
            alt="PayPal QR-Code – Scan to pay Mario Reiner Denzer"
            width={260}
            height={260}
            className="rounded-xl border border-gray-200"
            style={{ objectFit: 'contain' }}
            priority
          />
          <p className="text-sm text-gray-500">📱 QR-Code mit der PayPal-App scannen</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400 uppercase tracking-wide">oder manuell</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* PayPal email address */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">PayPal-Adresse</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 text-center">
            <span className="text-xl font-bold text-blue-800 select-all break-all">
              {paypalBusinessEmail}
            </span>
          </div>
          <p className="text-xs text-gray-400">Adresse antippen/anklicken zum Auswählen &amp; Kopieren</p>
        </div>

        {/* Step-by-step instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">So funktioniert es (weltweit):</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Öffnen Sie Ihre <span className="font-medium">PayPal-App</span></li>
            <li>Scannen Sie den QR-Code <span className="text-gray-400">– oder wählen Sie &bdquo;Geld senden&ldquo; und geben Sie die obige E-Mail-Adresse ein</span></li>
            <li>Tragen Sie den gewünschten Betrag ein</li>
            <li>Wählen Sie <span className="font-medium">&bdquo;Für Freunde und Familie&ldquo;</span> (keine Gebühren)</li>
            <li>Als Verwendungszweck: <span className="font-medium italic">Freiwillige Gabe</span></li>
            <li>Senden – fertig! 🙏</li>
          </ol>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <span className="font-semibold">Hinweis:</span> QR-Code und E-Mail-Adresse funktionieren mit PayPal in allen Ländern –
          Europa, Asien, Indonesien und weltweit.
        </div>
      </div>
    </div>
  );
}
