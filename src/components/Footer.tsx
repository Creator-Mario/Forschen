import Link from 'next/link';
import Logo from './Logo';
import { operatorName } from '@/lib/config';

export default function Footer() {
  return (
    <footer className="mt-auto">
      {/* Wave transition into footer */}
      <div className="overflow-hidden leading-none" style={{ lineHeight: 0 }}>
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-20 block"
        >
          <path
            d="M0,40 C180,80 360,0 540,40 C720,80 900,0 1080,40 C1260,80 1380,20 1440,40 L1440,80 L0,80 Z"
            fill="#0d47a1"
          />
        </svg>
      </div>

      <div
        className="text-blue-100"
        style={{
          background: 'linear-gradient(180deg, #0d47a1 0%, #072860 100%)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand column */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-3">
                <Logo size={56} />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-medium tracking-widest text-blue-300 uppercase">Der</span>
                  <span
                    className="font-bold text-xl leading-none"
                    style={{ fontFamily: 'Georgia, serif', color: '#fbbf24' }}
                  >
                    Fluss
                  </span>
                  <span className="text-xs font-semibold tracking-widest text-blue-300 uppercase">des Lebens</span>
                </div>
              </div>
              <p className="text-sm text-blue-200 leading-relaxed mt-1">
                Eine private christliche Forschungsplattform für alle, die tiefer in die Heilige Schrift eintauchen möchten.
              </p>
            </div>

            {/* Pages column */}
            <div>
              <h3
                className="font-bold text-white mb-4 text-sm uppercase tracking-widest"
                style={{ color: '#fbbf24' }}
              >
                Seiten
              </h3>
              <ul className="text-sm space-y-2">
                {[
                  { href: '/vision', label: 'Unsere Vision' },
                  { href: '/tageswort', label: 'Tageswort' },
                  { href: '/wochenthema', label: 'Wochenthema' },
                  { href: '/thesen', label: 'Thesen' },
                  { href: '/forschung', label: 'Bibelforschung' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-blue-400">›</span> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <h3
                className="font-bold text-white mb-4 text-sm uppercase tracking-widest"
                style={{ color: '#fbbf24' }}
              >
                Rechtliches
              </h3>
              <ul className="text-sm space-y-2">
                {[
                  { href: '/datenschutz', label: 'Datenschutz' },
                  { href: '/impressum', label: 'Impressum' },
                  { href: '/spenden', label: 'Unterstützen' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-blue-200 hover:text-white transition-colors flex items-center gap-2">
                      <span className="text-blue-400">›</span> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom strip with a subtle wave divider */}
          <div className="border-t border-blue-700 pt-5 text-center space-y-1">
            {/* Decorative wave line */}
            <div className="flex justify-center mb-3">
              <svg viewBox="0 0 200 12" xmlns="http://www.w3.org/2000/svg" className="w-40 h-3 opacity-60">
                <path d="M0,6 C25,12 50,0 75,6 C100,12 125,0 150,6 C175,12 190,4 200,6" fill="none" stroke="#f5a623" strokeWidth="2" />
              </svg>
            </div>
            <p className="text-sm text-blue-300">© {new Date().getFullYear()} {operatorName} · Alle Rechte vorbehalten</p>
            <p className="text-xs text-blue-500">
              Der Fluss des Lebens – Private Plattform für christliche Forschung
              <span className="mx-2 text-blue-600">·</span>
              <Link href="/admin-login" className="hover:text-blue-300 transition-colors">
                Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

