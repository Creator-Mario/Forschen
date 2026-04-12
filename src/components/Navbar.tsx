'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="relative text-white shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #072860 0%, #0d47a1 40%, #1565c0 70%, #1976d2 100%)',
      }}
    >
      {/* Subtle wave at the bottom of navbar */}
      <div
        className="absolute bottom-0 left-0 w-full overflow-hidden"
        style={{ lineHeight: 0, height: '6px' }}
      >
        <svg viewBox="0 0 1440 6" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,3 C240,6 480,0 720,3 C960,6 1200,0 1440,3 L1440,6 L0,6 Z" fill="rgba(99,179,237,0.4)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
          {/* Brand / Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={52} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium tracking-widest text-blue-200 uppercase">Der</span>
              <span
                className="font-bold text-xl leading-none"
                style={{
                  fontFamily: 'Georgia, serif',
                  color: '#fbbf24',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                Fluss
              </span>
              <span className="text-xs font-semibold tracking-widest text-blue-200 uppercase">des Lebens</span>
            </div>
          </Link>

          {/* Mobile menu button */}
          <button
            className="xl:hidden p-2 flex flex-col gap-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
          >
            <div className={`w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-6 h-0.5 bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden xl:flex items-start justify-between gap-6 border-t border-blue-700/70 pb-4 pt-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            {[
              { href: '/tageswort', label: 'Tageswort' },
              { href: '/psalmen', label: 'Psalmen' },
              { href: '/wochenthema', label: 'Wochenthema' },
              { href: '/glauben-heute', label: 'Glauben heute' },
              { href: '/buchempfehlungen', label: 'Bücher' },
              { href: '/thesen', label: 'Thesen' },
              { href: '/forschung', label: 'Forschung' },
              { href: '/gebet', label: 'Gebet' },
              { href: '/videos', label: 'Videos' },
              { href: '/aktionen', label: 'Aktionen' },
              { href: '/vision', label: 'Vision' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="hover:text-yellow-300 transition-colors font-medium relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300 rounded" />
              </Link>
            ))}
          </div>

          {session ? (
            <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
              <Link href="/mitglieder/vorstellungen" className="hover:text-yellow-300 transition-colors font-medium">Mitglieder</Link>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-md shadow-cyan-950/20 transition-all hover:-translate-y-0.5 hover:bg-cyan-400/25 hover:text-white"
                title="Chat"
              >
                <span className="text-base" aria-hidden="true">💬</span>
                <span>Chat</span>
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hover:text-yellow-300 transition-colors font-medium"
                  title="Admin-Bereich"
                >
                  🛠️ Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="hover:text-yellow-300 transition-colors font-medium"
              >
                {session.user.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-1.5 rounded-full font-medium text-sm transition-all"
                style={{ background: 'rgba(245,166,35,0.2)', border: '1px solid #f5a623', color: '#fbbf24' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,166,35,0.2)')}
              >
                Abmelden
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #f5a623, #fbbf24)', color: '#072860' }}
            >
              Anmelden
            </Link>
          )}
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="xl:hidden pb-4 pt-2 flex flex-col gap-1 text-sm border-t border-blue-700">
            {[
              { href: '/tageswort', label: 'Tageswort' },
              { href: '/psalmen', label: 'Psalmen' },
              { href: '/wochenthema', label: 'Wochenthema' },
              { href: '/glauben-heute', label: 'Glauben heute' },
              { href: '/buchempfehlungen', label: 'Bücher' },
              { href: '/thesen', label: 'Thesen' },
              { href: '/forschung', label: 'Forschung' },
              { href: '/gebet', label: 'Gebet' },
              { href: '/videos', label: 'Videos' },
              { href: '/aktionen', label: 'Aktionen' },
              { href: '/vision', label: 'Vision' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/mitglieder/vorstellungen" className="py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>Mitglieder</Link>
                <Link href="/chat" className="py-2 px-3 rounded-lg bg-cyan-400/15 border border-cyan-300 text-cyan-100 hover:bg-cyan-400/25 transition-colors font-semibold" onClick={() => setMenuOpen(false)}>💬 Chat</Link>
                {session.user.role === 'ADMIN' && (
                  <Link href="/admin" className="py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-yellow-300" onClick={() => setMenuOpen(false)}>🛠️ Admin-Bereich</Link>
                )}
                <Link href="/dashboard" className="py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={() => setMenuOpen(false)}>{session.user.name}</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-yellow-300">Abmelden</button>
              </>
            ) : (
              <Link href="/login" className="mt-2 mx-3 text-center py-2 rounded-full font-semibold" style={{ background: 'linear-gradient(135deg, #f5a623, #fbbf24)', color: '#072860' }} onClick={() => setMenuOpen(false)}>Anmelden</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
