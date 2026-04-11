/**
 * Page Render Tests
 *
 * Smoke tests for all public & user-facing pages.
 * Server-side data (db calls) and next-auth sessions are mocked so pages
 * render in jsdom without a real server.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('TageswortArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders published archived daily words', async () => {
    const items = [
      { id: 'tw1', date: '2024-01-02', verse: 'Psalm 1,1', text: 'Text 1', context: '', questions: [], published: true },
      { id: 'tw2', date: '2024-01-01', verse: 'Psalm 2,1', text: 'Text 2', context: '', questions: [], published: false },
    ];
    vi.doMock('@/lib/db', () => ({ getTageswortList: vi.fn().mockReturnValue(items) }));
    vi.doMock('@/components/BibleVerseCard', () => ({
      default: ({ tageswort }: { tageswort: { verse: string } }) => React.createElement('div', null, tageswort.verse),
    }));
    const { default: TageswortArchivPage } = await import('@/app/(public)/tageswort/archiv/page');
    render(React.createElement(TageswortArchivPage));
    expect(screen.getByRole('heading', { name: /Archiv – Tageswörter/i })).toBeInTheDocument();
    expect(screen.getByText('Psalm 1,1')).toBeInTheDocument();
    expect(screen.queryByText('Psalm 2,1')).not.toBeInTheDocument();
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

describe('ThesenArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders published theses in the member archive', async () => {
    const these = { id: 'th1', userId: 'u1', authorName: 'Alice', title: 'Archiv-These', content: 'Body', bibleReference: '', status: 'published', createdAt: '2024-01-01T00:00:00Z' };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Test', role: 'USER' } }) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({ getApprovedThesen: vi.fn().mockReturnValue([these]) }));
    vi.doMock('@/components/ThesisCard', () => ({
      default: ({ these }: { these: { title: string } }) => React.createElement('div', null, these.title),
    }));
    const { default: ThesenArchivPage } = await import('@/app/(user)/thesen/archiv/page');
    const jsx = await ThesenArchivPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Archiv – Thesen/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Archiv-These')).toBeInTheDocument();
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
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Test', role: 'USER' } }) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue([]) }));
    const { default: VideosPage } = await import('@/app/(public)/videos/page');
    const jsx = await VideosPage();
    render(React.createElement(React.Fragment, null, jsx));
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

describe('WochenthemaArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders archived themes in the archive view', async () => {
    vi.doMock('@/lib/db', () => ({
      getWochenthemaList: vi.fn().mockReturnValue([
        { id: 'w1', week: '2024-W02', title: 'Archiviertes Thema', introduction: 'Einführung', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'archived' },
        { id: 'w2', week: '2024-W03', title: 'Aktuelles Thema', introduction: 'Einführung', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'published' },
      ]),
    }));
    const { default: WochenthemaArchivPage } = await import('@/app/(public)/wochenthema/archiv/page');
    render(React.createElement(WochenthemaArchivPage));
    expect(screen.getByText('Archiviertes Thema')).toBeInTheDocument();
    expect(screen.getAllByText(/Archiviert/i).length).toBeGreaterThan(0);
  });
});

// ─── Forschung page ──────────────────────────────────────────────────────────

describe('ForschungPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Forschung heading', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Test', role: 'USER' } }) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({ getApprovedForschung: vi.fn().mockReturnValue([]), getWochenthemaList: vi.fn().mockReturnValue([]) }));
    const { default: ForschungPage } = await import('@/app/(public)/forschung/page');
    const jsx = await ForschungPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Forschung/i, level: 1 })).toBeInTheDocument();
  });
});

describe('ForschungArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders published research contributions in the member archive', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Test', role: 'USER' } }) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({
      getApprovedForschung: vi.fn().mockReturnValue([
        { id: 'f1', userId: 'u1', authorName: 'Alice', title: 'Archiv-Beitrag', content: 'Inhalt', bibleReference: '', status: 'published', createdAt: '2024-01-01T00:00:00Z' },
      ]),
    }));
    const { default: ForschungArchivPage } = await import('@/app/(user)/forschung/archiv/page');
    const jsx = await ForschungArchivPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Archiv – Forschungsbeiträge/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Archiv-Beitrag')).toBeInTheDocument();
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
  afterEach(() => vi.unstubAllGlobals());

  it('renders the page heading', async () => {
    // Mock fetch so the useEffect doesn't fail with invalid URL in jsdom
    const fetchMock = vi.fn().mockResolvedValue({ json: () => Promise.resolve([]), ok: true });
    vi.stubGlobal('fetch', fetchMock);
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'USER', name: 'Alice' } }, status: 'authenticated' }),
      signOut: vi.fn(),
    }));
    const { default: MitgliederPage } = await import('@/app/(public)/mitglieder/vorstellungen/page');
    render(React.createElement(MitgliederPage));
    expect(screen.getByRole('heading', { name: /Mitglieder/i })).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/mitglieder'));
  });
});

describe('AdminNutzerPage', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('updates the visible user row immediately after a lock action and reloads the list', async () => {
    const initialUsers = [
      { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'USER', active: true, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
    ];
    const refreshedUsers = [
      { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'USER', active: false, status: 'deleted', createdAt: '2024-01-01T00:00:00Z' },
    ];
    let getCount = 0;
    const fetchMock = vi.fn().mockImplementation((_input: string, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
      }

      getCount += 1;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(getCount === 1 ? initialUsers : refreshedUsers),
      });
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'admin-1', role: 'ADMIN', name: 'Admin' } }, status: 'authenticated' }),
      signIn: vi.fn(),
      signOut: vi.fn(),
      SessionProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }));

    const { default: AdminNutzerPage } = await import('@/app/(admin)/admin/nutzer/page');
    render(React.createElement(AdminNutzerPage));

    await screen.findByText('Alice');
    const lockButton = await screen.findByRole('button', { name: 'Sperren' });
    fireEvent.click(lockButton);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Reaktivieren' })).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Inaktiv')).toBeInTheDocument());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/admin/users', { cache: 'no-store' });
    expect(fetchMock).toHaveBeenNthCalledWith(3, '/api/admin/users', { cache: 'no-store' });
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
