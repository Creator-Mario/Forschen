export default function SpendenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Unterstützen</h1>
      <p className="text-gray-500 mb-8">Der Fluss des Lebens finanzieren</p>

      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Warum spenden?</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Der Fluss des Lebens ist und bleibt kostenlos für alle Nutzerinnen und Nutzer. Um die Plattform betreiben, weiterentwickeln und dauerhaft kostenlos anbieten zu können, sind wir auf freiwillige Unterstützung angewiesen.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Jede Spende – egal in welcher Höhe – hilft uns, diese Plattform für die christliche Gemeinschaft am Leben zu erhalten.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {[
          { title: 'Serverkosten', desc: 'Hosting und Infrastruktur für den Betrieb der Plattform.' },
          { title: 'Entwicklung', desc: 'Weiterentwicklung neuer Funktionen und Verbesserungen.' },
          { title: 'Moderation', desc: 'Qualitätssicherung der Inhalte durch Moderatoren.' },
          { title: 'Übersetzungen', desc: 'Erweiterung auf weitere Sprachen in der Zukunft.' },
        ].map(item => (
          <div key={item.title} className="bg-blue-50 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-1">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Banküberweisung</h2>
        <p className="text-gray-600 text-sm mb-6">Spenden können per Überweisung an folgende Bankverbindung geleistet werden:</p>
        <div className="bg-slate-50 rounded-lg p-4 text-left text-sm space-y-2 inline-block">
          <div><span className="text-gray-400">Empfänger:</span> <span className="font-medium">Der Fluss des Lebens e.V.</span></div>
          <div><span className="text-gray-400">IBAN:</span> <span className="font-medium font-mono">DE00 0000 0000 0000 0000 00</span></div>
          <div><span className="text-gray-400">BIC:</span> <span className="font-medium font-mono">XXXXXXXX</span></div>
          <div><span className="text-gray-400">Verwendungszweck:</span> <span className="font-medium">Spende Plattform</span></div>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Eine Spendenquittung kann auf Anfrage ausgestellt werden.
        </p>
      </div>
    </div>
  );
}
