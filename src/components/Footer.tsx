import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-white mb-3">Der Fluss des Lebens</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Eine freie christliche Forschungsplattform für alle, die tiefer in die Heilige Schrift eintauchen möchten.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Seiten</h3>
            <ul className="text-sm space-y-1">
              <li><Link href="/vision" className="hover:text-white transition-colors">Unsere Vision</Link></li>
              <li><Link href="/tageswort" className="hover:text-white transition-colors">Tageswort</Link></li>
              <li><Link href="/wochenthema" className="hover:text-white transition-colors">Wochenthema</Link></li>
              <li><Link href="/thesen" className="hover:text-white transition-colors">Thesen</Link></li>
              <li><Link href="/forschung" className="hover:text-white transition-colors">Bibelforschung</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-3">Rechtliches</h3>
            <ul className="text-sm space-y-1">
              <li><Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
              <li><Link href="/spenden" className="hover:text-white transition-colors">Unterstützen</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Der Fluss des Lebens – Kostenlose Plattform für christliche Forschung
          <span className="mx-2">·</span>
          <Link href="/admin-login" className="text-slate-600 hover:text-slate-400 transition-colors text-xs">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
