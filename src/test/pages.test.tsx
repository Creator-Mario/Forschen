/**
 * Page Render Tests
 *
 * Smoke tests for all public & user-facing pages.
 * Server-side data (db calls) and next-auth sessions are mocked so pages
 * render in jsdom without a real server.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ─── Global mocks (applied before any test) ──────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// ─── Static/legal pages ──────────────────────────────────────────────────────

describe('ImpressumPage', () => {
  it('renders the Impressum heading', async () => {
    const { default: ImpressumPage } = await import('@/app/(public)/impressum/page');
    render(React.createElement(ImpressumPage));
    expect(screen.getByRole('heading', { name: /Impressum/i })).toBeInTheDocument();
  });

  it('contains operator address information', async () => {
    const { default: ImpressumPage } = await import('@/app/(public)/impressum/page');
    render(React.createElement(ImpressumPage));
    expect(screen.getByText(/Bogor/i)).toBeInTheDocument();
  });
});

describe('DatenschutzPage', () => {
  it('renders the Datenschutzerklärung heading', async () => {
    const { default: DatenschutzPage } = await import('@/app/(public)/datenschutz/page');
    render(React.createElement(DatenschutzPage));
    expect(screen.getByRole('heading', { name: /Datenschutzerklärung/i })).toBeInTheDocument();
  });
});

// ─── Vision page ─────────────────────────────────────────────────────────────

describe('VisionPage', () => {
  it('renders the Vision heading', async () => {
    const { default: VisionPage } = await import('@/app/(public)/vision/page');
    render(React.createElement(VisionPage));
    expect(screen.getByRole('heading', { name: /Vision/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Login page ───────────────────────────────────────────────────────────────

describe('LoginPage', () => {
  it('renders email and password inputs', async () => {
    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
  });

  it('renders a submit button', async () => {
    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
  });

  it('renders a link to the registration page', async () => {
    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));
    const regLink = screen.getByRole('link', { name: /Registrieren/i });
    expect(regLink).toHaveAttribute('href', '/registrieren');
  });
});

// ─── Registration page ────────────────────────────────────────────────────────

describe('RegistrierenPage', () => {
  it('renders name, email and password fields', async () => {
    const { default: RegistrierenPage } = await import('@/app/(public)/registrieren/page');
    render(React.createElement(RegistrierenPage));
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
  });

  it('renders a submit button', async () => {
    const { default: RegistrierenPage } = await import('@/app/(public)/registrieren/page');
    render(React.createElement(RegistrierenPage));
    expect(screen.getByRole('button', { name: /Konto erstellen/i })).toBeInTheDocument();
  });
});

// ─── Passwort-vergessen page ──────────────────────────────────────────────────

describe('PasswortVergessenPage', () => {
  it('renders the forgot password form', async () => {
    const { default: PasswortVergessenPage } = await import('@/app/(public)/passwort-vergessen/page');
    render(React.createElement(PasswortVergessenPage));
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
  });
});

// ─── Tageswort page ───────────────────────────────────────────────────────────

describe('TageswortPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Tageswort heading', async () => {
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(undefined) }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    render(React.createElement(TageswortPage));
    expect(screen.getByRole('heading', { name: /Tageswort/i })).toBeInTheDocument();
  });

  it('shows placeholder when no tageswort is available', async () => {
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(undefined) }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    render(React.createElement(TageswortPage));
    expect(screen.getByText(/noch kein Tageswort/i)).toBeInTheDocument();
  });

  it('renders the tageswort content when available', async () => {
    const tw = { id: 'tw1', date: '2024-01-01', verse: 'Johannes 3,16', text: 'Denn also hat Gott', context: '', questions: [], published: true };
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(tw) }));
    vi.doMock('@/components/BibleVerseCard', () => ({
      default: ({ tageswort }: { tageswort: { text: string } }) => React.createElement('div', null, tageswort.text),
    }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    render(React.createElement(TageswortPage));
    expect(screen.getByText('Denn also hat Gott')).toBeInTheDocument();
  });
});

// ─── Thesen page ──────────────────────────────────────────────────────────────

describe('ThesenPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Thesen heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedThesen: vi.fn().mockReturnValue([]) }));
    const { default: ThesenPage } = await import('@/app/(public)/thesen/page');
    render(React.createElement(ThesenPage));
    expect(screen.getByRole('heading', { name: /Thesen/i, level: 1 })).toBeInTheDocument();
  });

  it('shows empty-state message when there are no thesen', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedThesen: vi.fn().mockReturnValue([]) }));
    const { default: ThesenPage } = await import('@/app/(public)/thesen/page');
    render(React.createElement(ThesenPage));
    expect(screen.getByText(/noch keine/i)).toBeInTheDocument();
  });

  it('renders thesis cards when thesen are present', async () => {
    const these = { id: 'th1', userId: 'u1', authorName: 'Alice', title: 'My Thesis', content: 'Body', bibleReference: '', status: 'published', createdAt: '2024-01-01T00:00:00Z' };
    vi.doMock('@/lib/db', () => ({ getApprovedThesen: vi.fn().mockReturnValue([these]) }));
    vi.doMock('@/components/ThesisCard', () => ({
      default: ({ these }: { these: { title: string } }) => React.createElement('div', null, these.title),
    }));
    const { default: ThesenPage } = await import('@/app/(public)/thesen/page');
    render(React.createElement(ThesenPage));
    expect(screen.getByText('My Thesis')).toBeInTheDocument();
  });
});

// ─── Gebet page ──────────────────────────────────────────────────────────────

describe('GebetPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Gebet heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedGebete: vi.fn().mockReturnValue([]) }));
    const { default: GebetPage } = await import('@/app/(public)/gebet/page');
    render(React.createElement(GebetPage));
    expect(screen.getByRole('heading', { name: /Gebet/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Videos page ─────────────────────────────────────────────────────────────

describe('VideosPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Videos heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue([]) }));
    const { default: VideosPage } = await import('@/app/(public)/videos/page');
    render(React.createElement(VideosPage));
    expect(screen.getByRole('heading', { name: /Videos/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Wochenthema page ─────────────────────────────────────────────────────────

describe('WochenthemaPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Wochenthema heading', async () => {
    vi.doMock('@/lib/db', () => ({ getCurrentWochenthema: vi.fn().mockReturnValue(undefined), getWochenthemaList: vi.fn().mockReturnValue([]) }));
    const { default: WochenthemaPage } = await import('@/app/(public)/wochenthema/page');
    render(React.createElement(WochenthemaPage));
    expect(screen.getByRole('heading', { name: /Wochenthema/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Forschung page ──────────────────────────────────────────────────────────

describe('ForschungPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Forschung heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedForschung: vi.fn().mockReturnValue([]), getWochenthemaList: vi.fn().mockReturnValue([]) }));
    const { default: ForschungPage } = await import('@/app/(public)/forschung/page');
    render(React.createElement(ForschungPage));
    expect(screen.getByRole('heading', { name: /Forschung/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Aktionen page ────────────────────────────────────────────────────────────

describe('AktionenPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Aktionen heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedAktionen: vi.fn().mockReturnValue([]) }));
    const { default: AktionenPage } = await import('@/app/(public)/aktionen/page');
    render(React.createElement(AktionenPage));
    expect(screen.getByRole('heading', { name: /Aktionen/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Spenden page ─────────────────────────────────────────────────────────────

describe('SpendenPage', () => {
  it('renders the Unterstützen heading', async () => {
    const { default: SpendenPage } = await import('@/app/(public)/spenden/page');
    render(React.createElement(SpendenPage));
    expect(screen.getByRole('heading', { name: /Unterstützen/i, level: 1 })).toBeInTheDocument();
  });
});

// ─── Mitglieder/Vorstellungen page ────────────────────────────────────────────

describe('MitgliederVorstellungenPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the page heading', async () => {
    // Mock fetch so the useEffect doesn't fail with invalid URL in jsdom
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve([]), ok: true }));
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'USER', name: 'Alice' } }, status: 'authenticated' }),
      signOut: vi.fn(),
    }));
    const { default: MitgliederPage } = await import('@/app/(public)/mitglieder/vorstellungen/page');
    render(React.createElement(MitgliederPage));
    expect(screen.getByRole('heading', { name: /Mitglieder/i })).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

// ─── Home page ────────────────────────────────────────────────────────────────

describe('HomePage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the hero section', async () => {
    vi.doMock('@/lib/db', () => ({
      getTodayTageswort: vi.fn().mockReturnValue(undefined),
      getCurrentWochenthema: vi.fn().mockReturnValue(undefined),
      getApprovedThesen: vi.fn().mockReturnValue([]),
    }));
    vi.doMock('@/components/BibleVerseCard', () => ({ default: () => null }));
    vi.doMock('@/components/WeeklyThemeCard', () => ({ default: () => null }));
    vi.doMock('@/components/Logo', () => ({ default: () => React.createElement('div', null, 'Logo') }));
    const { default: HomePage } = await import('@/app/(public)/page');
    render(React.createElement(HomePage));
    expect(screen.getByRole('heading', { name: /Der Fluss/i, level: 1 })).toBeInTheDocument();
  });
});
