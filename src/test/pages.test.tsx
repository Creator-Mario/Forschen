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
  notFound: vi.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
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

  it('renders the about me section with the linked Amazon book', async () => {
    const { default: VisionPage } = await import('@/app/(public)/vision/page');
    render(React.createElement(VisionPage));

    expect(screen.getByRole('heading', { name: /Mario Reiner Denzer/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Der Schmale Pfad der Mündigkeit/i).length).toBeGreaterThan(0);
    expect(screen.getByAltText(/Buchcover von Der Schmale Pfad der Mündigkeit/i)).toHaveAttribute(
      'src',
      '/mario-reiner-denzer-book.svg',
    );
    expect(
      screen
        .getAllByRole('link', { name: /Auf Amazon ansehen/i })
        .every(link => link.getAttribute('href') === 'https://www.amazon.de/dp/B0GW8FW5GM')
    ).toBe(true);
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
    expect(screen.getByLabelText(/E-Mail-Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
  });

  it('renders a submit button', async () => {
    const { default: RegistrierenPage } = await import('@/app/(public)/registrieren/page');
    render(React.createElement(RegistrierenPage));
    expect(screen.getByRole('button', { name: /Konto erstellen/i })).toBeInTheDocument();
  });

  it('renders the registration explanations and weekly faith email option', async () => {
    const { default: RegistrierenPage } = await import('@/app/(public)/registrieren/page');
    render(React.createElement(RegistrierenPage));
    expect(screen.getByText(/Wir geben deine Daten nicht an Dritte weiter/i)).toBeInTheDocument();
    expect(screen.getByText(/Im Vorstellungsbereich können alle freigeschalteten Mitglieder sehen/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
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
    vi.doMock('@/lib/db', () => ({ getTodayTageswortFresh: vi.fn().mockResolvedValue(undefined) }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    const jsx = await TageswortPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Tageswort/i })).toBeInTheDocument();
  });

  it('shows placeholder when no tageswort is available', async () => {
    vi.doMock('@/lib/db', () => ({ getTodayTageswortFresh: vi.fn().mockResolvedValue(undefined) }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    const jsx = await TageswortPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText(/noch kein Tageswort/i)).toBeInTheDocument();
  });

  it('renders the tageswort content when available', async () => {
    const tw = { id: 'tw1', date: '2024-01-01', verse: 'Johannes 3,16', text: 'Denn also hat Gott', context: '', questions: [], published: true };
    vi.doMock('@/lib/db', () => ({ getTodayTageswortFresh: vi.fn().mockResolvedValue(tw) }));
    vi.doMock('@/components/BibleVerseCard', () => ({
      default: ({ tageswort }: { tageswort: { text: string } }) => React.createElement('div', null, tageswort.text),
    }));
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');
    const jsx = await TageswortPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText('Denn also hat Gott')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });
});

describe('TageswortArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders published archived daily words', async () => {
    const items = [
      { id: 'tw1', date: '2024-01-02', verse: 'Psalm 1,1', text: 'Text 1', context: '', questions: [], published: true },
      { id: 'tw2', date: '2024-01-01', verse: 'Psalm 2,1', text: 'Text 2', context: '', questions: [], published: false },
    ];
    vi.doMock('@/lib/db', () => ({ getTageswortListFresh: vi.fn().mockResolvedValue(items) }));
    vi.doMock('@/components/BibleVerseCard', () => ({
      default: ({ tageswort }: { tageswort: { verse: string } }) => React.createElement('div', null, tageswort.verse),
    }));
    const { default: TageswortArchivPage } = await import('@/app/(public)/tageswort/archiv/page');
    const jsx = await TageswortArchivPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Archiv – Tageswörter/i })).toBeInTheDocument();
    expect(screen.getByText('Psalm 1,1')).toBeInTheDocument();
    expect(screen.queryByText('Psalm 2,1')).not.toBeInTheDocument();
  });
});

describe('PredigtPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the daily sermon component on the public page', async () => {
    vi.doMock('@/components/DailySermon', () => ({
      default: () => React.createElement('div', null, 'Daily sermon component'),
    }));

    const { default: PredigtPage } = await import('@/app/predigt/page');
    render(React.createElement(PredigtPage));

    expect(screen.getByText('Daily sermon component')).toBeInTheDocument();
  });
});

describe('SermonArchivePage', () => {
  beforeEach(() => vi.resetModules());

  it('renders archived sermons in descending order', async () => {
    vi.doMock('@/lib/sermonArchive', () => ({
      getAllSermons: vi.fn().mockResolvedValue([
        { date: '2026-05-14', liturgicalDay: 'Christi Himmelfahrt', title: 'Aufgefahren, aber nicht fort', content: 'Predigt', prayer: 'Gebet', createdAt: '2026-05-14T04:00:00.000Z' },
        { date: '2026-05-13', liturgicalDay: 'Mittwoch', title: 'Treue im Alltag', content: 'Predigt', prayer: 'Gebet', createdAt: '2026-05-13T04:00:00.000Z' },
      ]),
    }));

    const { default: SermonArchivePage } = await import('@/app/archiv/page');
    const jsx = await SermonArchivePage();
    render(React.createElement(React.Fragment, null, jsx));

    expect(screen.getByRole('heading', { name: /Archiv – Tagespredigten/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Aufgefahren, aber nicht fort/i })).toHaveAttribute('href', '/archiv/2026-05-14');
    expect(screen.getByText('Christi Himmelfahrt')).toBeInTheDocument();
  });
});

describe('SermonArchiveDetailPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders a stored sermon from the archive', async () => {
    vi.doMock('@/lib/sermonArchive', () => ({
      loadSermon: vi.fn().mockResolvedValue({
        date: '2026-05-14',
        liturgicalDay: 'Christi Himmelfahrt',
        title: 'Aufgefahren, aber nicht fort',
        content: 'Vollständige Predigt',
        prayer: 'Abschlussgebet',
        createdAt: '2026-05-14T04:00:00.000Z',
      }),
    }));

    const { default: SermonArchiveDetailPage } = await import('@/app/archiv/[date]/page');
    const jsx = await SermonArchiveDetailPage({ params: Promise.resolve({ date: '2026-05-14' }) });
    render(React.createElement(React.Fragment, null, jsx));

    expect(screen.getByRole('heading', { name: /Aufgefahren, aber nicht fort/i })).toBeInTheDocument();
    expect(screen.getByText('Vollständige Predigt')).toBeInTheDocument();
    expect(screen.getByText('Abschlussgebet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Zurück zum Archiv/i })).toHaveAttribute('href', '/archiv');
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
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue([]), getWochenthemaListFresh: vi.fn().mockResolvedValue([]) }));
    const { default: VideosPage } = await import('@/app/(public)/videos/page');
    const jsx = await VideosPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Videos/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\+ Video teilen/i })).toHaveAttribute('href', '/videos/hochladen');
  });

  it('shows the linked theme title for videos', async () => {
    vi.doMock('@/lib/db', () => ({
      getApprovedVideos: vi.fn().mockReturnValue([
        { id: 'v1', title: 'Video', description: 'Beschreibung', url: 'https://example.com', authorName: 'Anna', createdAt: '2026-04-11T00:00:00Z', wochenthemaId: 'w1', status: 'published' },
      ]),
      getWochenthemaListFresh: vi.fn().mockResolvedValue([
        { id: 'w1', week: '2026-W15', title: 'Treue', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'published', createdAt: '2026-04-11T00:00:00Z' },
      ]),
    }));
    const { default: VideosPage } = await import('@/app/(public)/videos/page');
    const jsx = await VideosPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText(/Thema: Treue/i)).toBeInTheDocument();
  });
});

// ─── Wochenthema page ─────────────────────────────────────────────────────────

describe('WochenthemaPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Wochenthema heading', async () => {
    vi.doMock('@/lib/db', () => ({
      getCurrentWochenthemaFresh: vi.fn().mockResolvedValue({
        id: 'w1',
        week: '2026-W16',
        title: 'Wochenthema',
        introduction: 'Einführung',
        bibleVerses: [],
        problemStatement: 'Frage',
        researchQuestions: ['RQ1'],
        status: 'published',
      }),
      getApprovedForschung: vi.fn().mockReturnValue([]),
      getApprovedVideos: vi.fn().mockReturnValue([]),
    }));
    const { default: WochenthemaPage } = await import('@/app/(public)/wochenthema/page');
    const jsx = await WochenthemaPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Wochenthema/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });

  it('renders approved research and videos for the current theme', async () => {
    vi.doMock('@/lib/db', () => ({
      getCurrentWochenthemaFresh: vi.fn().mockResolvedValue({
        id: 'w1',
        week: '2026-W16',
        title: 'Wochenthema',
        introduction: 'Einführung',
        bibleVerses: [],
        problemStatement: 'Frage',
        researchQuestions: ['RQ1'],
        status: 'published',
      }),
      getApprovedForschung: vi.fn().mockReturnValue([
        { id: 'f1', title: 'Passender Beitrag', content: 'Inhalt', authorName: 'Anna', createdAt: '2026-04-11T00:00:00Z', wochenthemaId: 'w1', status: 'published' },
        { id: 'f2', title: 'Falsches Thema', content: 'Inhalt', authorName: 'Ben', createdAt: '2026-04-11T00:00:00Z', wochenthemaId: 'w2', status: 'published' },
      ]),
      getApprovedVideos: vi.fn().mockReturnValue([
        { id: 'v1', title: 'Passendes Video', description: 'Beschreibung', url: 'https://example.com/video', authorName: 'Anna', createdAt: '2026-04-11T00:00:00Z', wochenthemaId: 'w1', status: 'published' },
        { id: 'v2', title: 'Falsches Video', description: 'Beschreibung', url: 'https://example.com/other', authorName: 'Ben', createdAt: '2026-04-11T00:00:00Z', wochenthemaId: 'w2', status: 'published' },
      ]),
    }));
    const { default: WochenthemaPage } = await import('@/app/(public)/wochenthema/page');
    const jsx = await WochenthemaPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText('Passender Beitrag')).toBeInTheDocument();
    expect(screen.getByText('Passendes Video')).toBeInTheDocument();
    expect(screen.queryByText('Falsches Thema')).not.toBeInTheDocument();
    expect(screen.queryByText('Falsches Video')).not.toBeInTheDocument();
  });
});

describe('WochenthemaArchivPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders archived themes in the archive view', async () => {
    vi.doMock('@/lib/db', () => ({
      getWochenthemaListFresh: vi.fn().mockResolvedValue([
        { id: 'w1', week: '2024-W02', title: 'Archiviertes Thema', introduction: 'Einführung', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'archived' },
        { id: 'w2', week: '2024-W03', title: 'Aktuelles Thema', introduction: 'Einführung', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'published' },
      ]),
    }));
    const { default: WochenthemaArchivPage } = await import('@/app/(public)/wochenthema/archiv/page');
    const jsx = await WochenthemaArchivPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText('Archiviertes Thema')).toBeInTheDocument();
    expect(screen.getAllByText(/Archiviert/i).length).toBeGreaterThan(0);
  });
});

describe('PsalmenPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Psalmen heading', async () => {
    vi.doMock('@/lib/generated-content', () => ({
      getTodayPsalmThema: vi.fn().mockReturnValue({
        id: 'ps-1',
        date: '2026-04-11',
        psalmReference: 'Psalm 1,1-3',
        title: 'Verwurzelt leben',
        excerpt: 'Auszug',
        summary: 'Zusammenfassung',
        significance: 'Bedeutung',
        practice: 'Praxis',
        questions: ['Frage 1'],
      }),
    }));
    const { default: PsalmenPage } = await import('@/app/(public)/psalmen/page');
    const jsx = await PsalmenPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Psalm des Tages/i })).toBeInTheDocument();
    expect(screen.getByText('Frage 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /psalm-beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });
});

describe('GlaubenHeutePage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Glauben heute heading', async () => {
    vi.doMock('@/lib/generated-content', () => ({
      getTodayGlaubenHeuteThema: vi.fn().mockReturnValue({
        id: 'gh-1',
        date: '2026-04-11',
        title: 'Digitale Überforderung',
        headline: 'Zwischen Dauerrauschen',
        worldFocus: 'Weltfokus',
        faithPerspective: 'Glaubensperspektive',
        discipleshipImpulse: 'Impuls',
        bibleVerses: ['Psalm 46,11'],
        questions: ['Frage A'],
      }),
    }));
    const { default: GlaubenHeutePage } = await import('@/app/(public)/glauben-heute/page');
    const jsx = await GlaubenHeutePage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Glauben heute/i })).toBeInTheDocument();
    expect(screen.getByText('Frage A')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gedankenbeitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });
});

describe('BuchempfehlungenPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders generated and community book recommendations', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T12:00:00Z'));
    vi.doMock('@/lib/generated-content', () => ({
      getTodayBuchempfehlungen: vi.fn().mockReturnValue({
        id: 'bk-1',
        date: '2026-04-11',
        topicTitle: 'Digitale Überforderung',
        introduction: 'Intro',
        recommendations: [{ title: 'Nachfolge', author: 'Bonhoeffer', description: 'Desc', relevance: 'Fit' }],
      }),
    }));
    vi.doMock('@/lib/db', () => ({
      getApprovedBuchempfehlungen: vi.fn().mockReturnValue([
        { id: 'u1', userId: 'u1', recommenderName: 'Alice', title: 'Gemeinschaftsbuch', author: 'Autor', description: 'Beschreibung', themeReference: 'Psalmen', status: 'published', createdAt: '2026-04-11T00:00:00Z' },
        { id: 'u2', userId: 'u2', recommenderName: 'Bob', title: 'Altes Buch', author: 'Autor', description: 'Alt', themeReference: 'Archiv', status: 'published', createdAt: '2025-12-01T00:00:00Z' },
      ]),
    }));
    const { default: BuchempfehlungenPage } = await import('@/app/(public)/buchempfehlungen/page');
    const jsx = await BuchempfehlungenPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Buchempfehlungen des Tages/i })).toBeInTheDocument();
    expect(screen.getByText('Gemeinschaftsbuch')).toBeInTheDocument();
    expect(screen.queryByText('Altes Buch')).toBeNull();
    vi.useRealTimers();
  });
});

// ─── Forschung page ──────────────────────────────────────────────────────────

describe('ForschungPage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the Forschung heading', async () => {
    vi.doMock('@/lib/db', () => ({ getApprovedForschung: vi.fn().mockReturnValue([]), getWochenthemaListFresh: vi.fn().mockResolvedValue([]) }));
    const { default: ForschungPage } = await import('@/app/(public)/forschung/page');
    const jsx = await ForschungPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Forschung/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\+ Beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });

  it('shows the linked theme title for research contributions', async () => {
    vi.doMock('@/lib/db', () => ({
      getApprovedForschung: vi.fn().mockReturnValue([
        { id: 'f1', userId: 'u1', authorName: 'Alice', title: 'Beitrag', content: 'Inhalt', bibleReference: '', wochenthemaId: 'w1', status: 'published', createdAt: '2026-04-11T00:00:00Z' },
      ]),
      getWochenthemaListFresh: vi.fn().mockResolvedValue([
        { id: 'w1', week: '2026-W15', title: 'Treue', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'published', createdAt: '2026-04-11T00:00:00Z' },
      ]),
    }));
    const { default: ForschungPage } = await import('@/app/(public)/forschung/page');
    const jsx = await ForschungPage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByText(/Thema: Treue/i)).toBeInTheDocument();
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

describe('ChatPage', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it('loads existing chats and selectable member names', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 'u2', name: 'Bob', unreadCount: 0 }]), ok: true })
      .mockResolvedValueOnce({ json: () => Promise.resolve([{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }, { id: 'u3', name: 'Carla' }]), ok: true });
    vi.stubGlobal('fetch', fetchMock);
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'USER', name: 'Alice' } }, status: 'authenticated' }),
      signOut: vi.fn(),
      signIn: vi.fn(),
      SessionProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
    }));
    const { default: ChatPage } = await import('@/app/(user)/chat/page');
    render(React.createElement(ChatPage));
    expect(screen.getByRole('heading', { name: /Nachrichten/i })).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/chat'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/mitglieder'));
    expect(await screen.findByRole('option', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Carla' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alice' })).toBeNull();
    expect(screen.getByRole('button', { name: /chat öffnen/i })).toBeEnabled();
  });
});

// ─── Home page ────────────────────────────────────────────────────────────────

describe('HomePage', () => {
  beforeEach(() => vi.resetModules());

  it('renders the hero section', async () => {
    vi.doMock('@/lib/db', () => ({
      getTodayTageswortFresh: vi.fn().mockResolvedValue(undefined),
      getCurrentWochenthemaFresh: vi.fn().mockResolvedValue(undefined),
      getApprovedThesen: vi.fn().mockReturnValue([]),
    }));
    vi.doMock('@/lib/generated-content', () => ({
      getTodayPsalmThema: vi.fn().mockReturnValue({
        id: 'ps-1',
        date: '2026-04-11',
        psalmReference: 'Psalm 1,1-3',
        title: 'Verwurzelt leben',
        excerpt: 'Auszug',
        summary: 'Zusammenfassung',
        significance: 'Bedeutung',
        practice: 'Praxis',
        questions: [],
      }),
      getTodayGlaubenHeuteThema: vi.fn().mockReturnValue({
        id: 'gh-1',
        date: '2026-04-11',
        title: 'Digitale Überforderung',
        headline: 'Zwischen Dauerrauschen',
        worldFocus: 'Weltfokus',
        faithPerspective: 'Perspektive',
        discipleshipImpulse: 'Impuls',
        bibleVerses: [],
        questions: [],
      }),
      getTodayBuchempfehlungen: vi.fn().mockReturnValue({
        id: 'bk-1',
        date: '2026-04-11',
        topicTitle: 'Digitale Überforderung',
        introduction: 'Intro',
        recommendations: [],
      }),
    }));
    vi.doMock('@/components/BibleVerseCard', () => ({ default: () => null }));
    vi.doMock('@/components/WeeklyThemeCard', () => ({ default: () => null }));
    vi.doMock('@/components/Logo', () => ({ default: () => React.createElement('div', null, 'Logo') }));
    vi.doMock('@/components/HomeSermonPreview', () => ({ default: () => React.createElement('div', null, 'Home sermon preview') }));
    vi.doMock('@/components/ChurchCalendar', () => ({ default: () => React.createElement('div', null, 'Church calendar') }));
    const { default: HomePage } = await import('@/app/(public)/page');
    const jsx = await HomePage();
    render(React.createElement(React.Fragment, null, jsx));
    expect(screen.getByRole('heading', { name: /Der Fluss/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Vorstellung des Gründers/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mario Reiner Denzer/i })).toBeInTheDocument();
    expect(screen.getByAltText(/qr-code zum teilen der website/i).getAttribute('src')).toContain('share-qr');
    expect(screen.getByAltText(/Buchcover von Der Schmale Pfad der Mündigkeit/i)).toHaveAttribute(
      'src',
      '/mario-reiner-denzer-book.svg',
    );
    expect(screen.getByText('Der Fluss des Lebens')).toBeInTheDocument();
    expect(screen.getByText('https://www.flussdeslebens.live')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Link teilen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /QR-Code herunterladen/i })).toHaveAttribute('href', '/api/share-qr?format=png&download=1');
    expect(screen.getByRole('link', { name: /Auf WhatsApp teilen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Auf Facebook teilen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Zur Vision des Gründers/i })).toHaveAttribute('href', '/vision');
    expect(screen.getByText('Home sermon preview')).toBeInTheDocument();
    expect(screen.getByText('Church calendar')).toBeInTheDocument();
  });
});
