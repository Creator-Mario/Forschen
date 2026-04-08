'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-blue-200">✦</span>
            <span>Der Fluss des Lebens</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/tageswort" className="hover:text-blue-200 transition-colors">Tageswort</Link>
            <Link href="/wochenthema" className="hover:text-blue-200 transition-colors">Wochenthema</Link>
            <Link href="/thesen" className="hover:text-blue-200 transition-colors">Thesen</Link>
            <Link href="/forschung" className="hover:text-blue-200 transition-colors">Forschung</Link>
            <Link href="/gebet" className="hover:text-blue-200 transition-colors">Gebet</Link>
            <Link href="/videos" className="hover:text-blue-200 transition-colors">Videos</Link>
            <Link href="/aktionen" className="hover:text-blue-200 transition-colors">Aktionen</Link>
            <Link href="/vision" className="hover:text-blue-200 transition-colors">Vision</Link>
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/mitglieder/vorstellungen" className="hover:text-blue-200 transition-colors">Mitglieder</Link>
                <Link href="/chat" className="hover:text-blue-200 transition-colors">💬</Link>
                <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                  {session.user.name}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors"
                >
                  Abmelden
                </button>
              </div>
            ) : (
              <Link href="/login" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors">
                Anmelden
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menü öffnen"
          >
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white mb-1" />
            <div className="w-5 h-0.5 bg-white" />
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-2 text-sm">
            <Link href="/tageswort" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Tageswort</Link>
            <Link href="/wochenthema" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Wochenthema</Link>
            <Link href="/thesen" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Thesen</Link>
            <Link href="/forschung" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Forschung</Link>
            <Link href="/gebet" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Gebet</Link>
            <Link href="/videos" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Videos</Link>
            <Link href="/aktionen" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Aktionen</Link>
            <Link href="/vision" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Vision</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>{session.user.name}</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left hover:text-blue-200 py-1">Abmelden</button>
              </>
            ) : (
              <Link href="/login" className="hover:text-blue-200 py-1" onClick={() => setMenuOpen(false)}>Anmelden</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
