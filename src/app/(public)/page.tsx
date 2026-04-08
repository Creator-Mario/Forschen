import Link from 'next/link';
import BibleVerseCard from '@/components/BibleVerseCard';
import WeeklyThemeCard from '@/components/WeeklyThemeCard';
import { getTodayTageswort, getCurrentWochenthema, getApprovedThesen } from '@/lib/db';

export default function HomePage() {
  const tageswort = getTodayTageswort();
  const wochenthema = getCurrentWochenthema();
  const thesen = getApprovedThesen().slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4 leading-tight">
          Der Fluss des Lebens
        </h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Eine private Plattform für ernsthafte christliche Bibelforschung – ohne Gamification, ohne Rankings, nur echte Fragen und ehrliche Suche.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/tageswort" className="bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Zum Tageswort
          </Link>
          <Link href="/vision" className="border border-blue-800 text-blue-800 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            Unsere Vision
          </Link>
        </div>
      </section>

      {/* Today's verse + weekly theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div>
          {tageswort ? (
            <BibleVerseCard tageswort={tageswort} />
          ) : (
            <div className="bg-blue-50 rounded-xl p-6 text-gray-500 text-center">Kein Tageswort verfügbar</div>
          )}
        </div>
        <div>
          {wochenthema ? (
            <WeeklyThemeCard theme={wochenthema} compact />
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 text-gray-500 text-center">Kein Wochenthema verfügbar</div>
          )}
        </div>
      </div>

      {/* Features */}
      <section className="mb-14">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Bereiche der Plattform</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { href: '/tageswort', icon: '📖', title: 'Tageswort', desc: 'Täglich ein Bibelvers mit fünf Forschungsfragen zur Vertiefung.' },
            { href: '/wochenthema', icon: '🔍', title: 'Wochenthema', desc: 'Ein theologisches Thema pro Woche mit Schriftbelegen und offenen Fragen.' },
            { href: '/thesen', icon: '💡', title: 'Thesen', desc: 'Theologische Kernaussagen aus der Gemeinschaft zur Diskussion.' },
            { href: '/forschung', icon: '📚', title: 'Bibelforschung', desc: 'Tiefgehende Beiträge zur Exegese und Hermeneutik.' },
            { href: '/gebet', icon: '🙏', title: 'Gebetsraum', desc: 'Ein geschützter Raum für persönliche und gemeinsame Gebete.' },
            { href: '/aktionen', icon: '🤝', title: 'Aktionen', desc: 'Gemeinschaftliche Aktivitäten und Treffen in der Realen Welt.' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-800 transition-colors">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Thesen */}
      {thesen.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Aktuelle Thesen</h2>
            <Link href="/thesen" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
              Alle Thesen →
            </Link>
          </div>
          <div className="space-y-4">
            {thesen.map(t => (
              <div key={t.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-2">{t.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t.content.substring(0, 200)}…</p>
                <div className="mt-3 text-xs text-gray-400">{t.authorName}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Call to action */}
      <section className="bg-blue-800 text-white rounded-2xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Mitmachen und forschen</h2>
        <p className="text-blue-100 mb-6 max-w-xl mx-auto">
          Registriere dich kostenlos und teile deine Forschungsbeiträge, Thesen und Gebete mit der Gemeinschaft.
        </p>
        <Link href="/registrieren" className="bg-white text-blue-800 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
          Jetzt kostenlos registrieren
        </Link>
      </section>
    </div>
  );
}
