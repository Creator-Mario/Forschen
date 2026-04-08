import Link from 'next/link';

const sections = [
  {
    icon: '📖',
    title: 'Eine Plattform für ehrliche Fragen',
    text: 'Der Fluss des Lebens entstand aus dem Wunsch, einen Raum zu schaffen, in dem die Heilige Schrift ernst genommen wird – nicht als Steinbruch für Zitate, sondern als lebendiges Zeugnis, das uns heute noch herausfordert und tröstet. Hier ist Platz für Zweifel, für Tiefe und für echte Begegnung mit dem Text.',
  },
  {
    icon: '🔬',
    title: 'Forschung ohne Konkurrenz',
    text: 'Wir glauben, dass theologische Forschung keine Bühne für Selbstdarstellung ist. Deshalb gibt es hier keine Likes, keine Rankings, keine Follower. Was zählt, ist die Qualität des Gedankens und die Ernsthaftigkeit des Suchens. Eine These kann von einem Erstklässler kommen oder von einem promovierten Theologen – was zählt, ist der Inhalt.',
  },
  {
    icon: '🙏',
    title: 'Gemeinschaft in der Tiefe',
    text: 'Christlicher Glaube war nie ein Einzelsport. Diese Plattform soll verbinden: Menschen, die ernsthaft fragen, gemeinsam beten und sich gegenseitig in ihrem Glaubensweg unterstützen. Der Gebetsraum ist bewusst geschützt – nicht um Exklusivität zu fördern, sondern um einen Raum für Verletzlichkeit zu schaffen.',
  },
  {
    icon: '🗓️',
    title: 'Das Tageswort und das Wochenthema',
    text: 'Täglich erscheint ein Bibelvers mit fünf Forschungsfragen – nicht um Antworten zu geben, sondern um das Nachdenken anzuregen. Einmal pro Woche vertiefen wir ein theologisches Thema mit Textbelegen, historischen Fragen und einer Einladung zur Forschung. Die Plattform ist ein Werkzeug für persönliche und gemeinschaftliche Bibelarbeit.',
  },
  {
    icon: '🎁',
    title: 'Kostenlos und frei',
    text: 'Der Fluss des Lebens ist und bleibt kostenlos. Es gibt keine Premium-Stufen, keine Bezahlschranken. Wer unterstützen möchte, kann spenden – aber niemand soll aus Geldmangel ausgeschlossen sein. Das entspricht unserer Überzeugung: Das Evangelium ist für alle.',
  },
];

const values = [
  { icon: '📜', label: 'Schrifttreue' },
  { icon: '🤝', label: 'Gemeinschaft' },
  { icon: '🔍', label: 'Ehrlichkeit' },
  { icon: '🕊️', label: 'Freiheit' },
  { icon: '💡', label: 'Tiefe' },
  { icon: '❤️', label: 'Liebe' },
];

export default function VisionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-5">
          <span className="text-3xl">✦</span>
        </div>
        <h1 className="text-4xl font-bold text-blue-800 mb-3">Unsere Vision</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Was ist Der Fluss des Lebens – und warum gibt es diese Plattform?
        </p>
      </div>

      {/* Scripture quote */}
      <blockquote className="border-l-4 border-blue-500 pl-5 py-3 bg-blue-50 rounded-r-xl text-gray-700 italic mb-14 text-lg">
        &ldquo;Wer mich dürstet, der komme zu mir und trinke!&rdquo;
        <span className="block mt-1 text-sm not-italic text-gray-500">Johannes 7,37</span>
      </blockquote>

      {/* Sections */}
      <div className="space-y-5 mb-14">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-md p-6 flex gap-5 items-start">
            <div className="text-3xl flex-shrink-0 mt-0.5">{section.icon}</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Values grid */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Unsere Werte</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {values.map((value) => (
            <div key={value.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-2 text-center">
              <span className="text-3xl">{value.icon}</span>
              <span className="font-semibold text-gray-700">{value.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-800 text-white rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Gemeinsam forschen</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Werde Teil der Gemeinschaft. Teile deine Gedanken, Thesen und Gebete – kostenlos und ohne Druck.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/registrieren" className="bg-white text-blue-800 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Jetzt registrieren
          </Link>
          <Link href="/tageswort" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Zum Tageswort
          </Link>
        </div>
      </section>
    </div>
  );
}
