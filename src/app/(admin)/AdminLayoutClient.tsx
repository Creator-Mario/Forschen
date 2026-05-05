'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getAuthRedirectPath } from '@/lib/request-routing';

const adminNav: Array<{
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
}> = [
  { href: '/admin', icon: '🏠', label: 'Dashboard', exact: true },
  { href: '/admin/vorstellungen', icon: '🧑‍🤝‍🧑', label: 'Vorstellungen' },
  { href: '/admin/nutzer', icon: '👥', label: 'Nutzerverwaltung' },
  { href: '/admin/chats', icon: '💬', label: 'Chat-Moderation' },
  { href: '/admin/thesen', icon: '💡', label: 'Thesen' },
  { href: '/admin/forschung', icon: '📚', label: 'Forschung' },
  { href: '/admin/gebet', icon: '🙏', label: 'Gebete' },
  { href: '/admin/videos', icon: '🎥', label: 'Videos' },
  { href: '/admin/aktionen', icon: '🤝', label: 'Aktionen' },
  { href: '/admin/tageswort', icon: '📖', label: 'Tageswort' },
  { href: '/admin/wochenthema', icon: '🔍', label: 'Wochenthema' },
  { href: '/admin/spenden', icon: '💰', label: 'Spenden' },
  { href: '/admin/logs', icon: '📋', label: 'Protokoll' },
  { href: '/admin/system', icon: '⚙️', label: 'System' },
];

const PUBLIC_ADMIN_PATHS = ['/admin-login', '/admin-reset'];

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublicPath = PUBLIC_ADMIN_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPath) return;
    if (status === 'loading') return;
    if (!session) {
      router.replace(getAuthRedirectPath({ pathname, requireAdmin: true }));
      return;
    }
    if (session.user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [isPublicPath, pathname, session, status, router]);

  if (isPublicPath) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20 bg-slate-100">
        <div className="text-slate-400">Lade Admin-Bereich…</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') return null;

  return (
    <div className="flex bg-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-slate-900 text-white z-30 flex flex-col shadow-2xl
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:sticky md:top-0 md:self-start md:h-screen
        `}
      >
        <header className="px-5 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="text-xs font-medium tracking-widest text-slate-400 uppercase mb-0.5">Schaltzentrale</div>
          <h1 className="text-base font-bold text-white">Admin-Bereich</h1>
          <div className="text-xs text-slate-400 mt-0.5 truncate">{session.user.name}</div>
        </header>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {adminNav.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href + '/') || pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium mb-0.5
                  transition-colors
                  ${active
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-slate-700 flex-shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Zum Mitgliederbereich
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <div className="md:hidden bg-slate-800 text-white px-4 py-3 flex items-center gap-3 border-b border-slate-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-300 hover:text-white p-0.5"
            aria-label="Navigationsmenü öffnen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">Admin-Bereich</span>
        </div>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
