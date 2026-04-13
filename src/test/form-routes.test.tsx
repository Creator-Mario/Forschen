import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

type SessionState =
  | { data: null; status: 'unauthenticated' | 'loading' }
  | {
      data: { user: { id: string; name: string; email: string; role: 'USER' | 'ADMIN' } };
      status: 'authenticated';
    };

const routerPush = vi.fn();
const signInMock = vi.fn();
const signOutMock = vi.fn();

let currentSearchParams = new URLSearchParams();
let currentSession: SessionState = { data: null, status: 'unauthenticated' };
let currentGetSessionResult: { user: { role: 'USER' | 'ADMIN' } } | null = { user: { role: 'USER' } };
let currentTageswort: { id: string; date: string; verse: string; text: string; context: string; questions: string[]; published: boolean } | undefined;
let approvedThesen: Array<{ id: string; title: string; content: string; authorName: string; createdAt: string }> = [];
let approvedAktionen: Array<{ id: string; title: string; description: string; authorName: string; createdAt: string }> = [];
let communityGebete: Array<{ id: string; content: string; authorName: string; status: string; createdAt: string; anonymous?: boolean }> = [];
let approvedBuchempfehlungen: Array<{ id: string; userId: string; recommenderName: string; title: string; author: string; description: string; themeReference: string; status: string; createdAt: string }> = [];
let userThesen: Array<{ id: string; userId: string; title: string; content: string; status: string; createdAt: string }> = [];
let userBeitraege: Array<{ id: string; userId: string; title: string; content: string; status: string; createdAt: string }> = [];
let userVideos: Array<{ id: string; userId: string; title: string; description: string; status: string; createdAt: string; url?: string }> = [];

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => currentSearchParams,
  redirect: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => currentSession,
  signIn: signInMock,
  signOut: signOutMock,
  getSession: vi.fn().mockImplementation(async () => currentGetSessionResult),
  SessionProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('@/lib/db', () => ({
  getTodayTageswort: () => currentTageswort,
  getCurrentWochenthema: () => undefined,
  getApprovedThesen: () => approvedThesen,
  getApprovedAktionen: () => approvedAktionen,
  getApprovedGebete: () => communityGebete,
  getApprovedBuchempfehlungen: () => approvedBuchempfehlungen,
  getThesen: () => userThesen,
  getForschung: () => userBeitraege,
  getVideos: () => userVideos,
}));

vi.mock('@/components/BibleVerseCard', () => ({
  default: () => React.createElement('div', null, 'BibleVerseCard'),
}));

vi.mock('@/components/WeeklyThemeCard', () => ({
  default: () => React.createElement('div', null, 'WeeklyThemeCard'),
}));

vi.mock('@/components/Logo', () => ({
  default: () => React.createElement('div', null, 'Logo'),
}));

vi.mock('@/components/BibleLink', () => ({
  default: ({ text }: { text: string }) => React.createElement('span', null, text),
}));

vi.mock('@/components/ThesisCard', () => ({
  default: ({ these }: { these: { title: string } }) => React.createElement('div', null, these.title),
}));

vi.mock('@/components/PrayerCard', () => ({
  default: ({ gebet }: { gebet: { content: string } }) => React.createElement('div', null, gebet.content),
}));

function setUserSession() {
  currentSession = {
    data: {
      user: {
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
      },
    },
    status: 'authenticated',
  };
}

function setAdminSession() {
  currentSession = {
    data: {
      user: {
        id: 'admin1',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    },
    status: 'authenticated',
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  currentSearchParams = new URLSearchParams();
  currentSession = { data: null, status: 'unauthenticated' };
  currentGetSessionResult = { user: { role: 'USER' } };
  currentTageswort = undefined;
  approvedThesen = [];
  approvedAktionen = [];
  communityGebete = [];
  approvedBuchempfehlungen = [];
  userThesen = [];
  userBeitraege = [];
  userVideos = [];
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('public form entry routes', () => {
  it('exposes registration entry points on home and vision pages', async () => {
    const { default: HomePage } = await import('@/app/(public)/page');
    const { default: VisionPage } = await import('@/app/(public)/vision/page');

    const { unmount } = render(React.createElement(HomePage));
    expect(screen.getByRole('link', { name: /jetzt kostenlos registrieren/i })).toHaveAttribute('href', '/registrieren');
    unmount();

    render(React.createElement(VisionPage));
    expect(screen.getByRole('link', { name: /jetzt registrieren/i })).toHaveAttribute('href', '/registrieren');
  });

  it('connects login, forgot-password and registration routes correctly', async () => {
    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));

    expect(screen.getByRole('heading', { name: /anmelden/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /passwort vergessen/i })).toHaveAttribute('href', '/passwort-vergessen');
    expect(screen.getByRole('link', { name: /kostenlos registrieren/i })).toHaveAttribute('href', '/registrieren');
    expect(screen.getByRole('button', { name: /^anmelden$/i })).toBeInTheDocument();
  });

  it('returns members to the requested protected page after a successful login', async () => {
    currentSearchParams = new URLSearchParams('callbackUrl=%2Fmitglieder%2Fvorstellungen');
    signInMock.mockResolvedValue({ error: undefined });
    currentGetSessionResult = { user: { role: 'USER' } };

    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/passwort/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/mitglieder/vorstellungen'));
  });

  it('ignores unsafe callback URLs and falls back to the dashboard', async () => {
    currentSearchParams = new URLSearchParams('callbackUrl=https%3A%2F%2Fevil.example');
    signInMock.mockResolvedValue({ error: undefined });
    currentGetSessionResult = { user: { role: 'USER' } };

    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/passwort/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/dashboard'));
  });

  it('always sends admins to the admin dashboard after a successful login', async () => {
    currentSearchParams = new URLSearchParams('callbackUrl=%2Fmitglieder%2Fvorstellungen');
    signInMock.mockResolvedValue({ error: undefined });
    currentGetSessionResult = { user: { role: 'ADMIN' } };

    const { default: LoginPage } = await import('@/app/(public)/login/page');
    render(React.createElement(LoginPage));

    await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/passwort/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /^anmelden$/i }));

    await waitFor(() => expect(routerPush).toHaveBeenCalledWith('/admin'));
  });

  it('connects registration page to privacy policy and login', async () => {
    const { default: RegistrierenPage } = await import('@/app/(public)/registrieren/page');
    render(React.createElement(RegistrierenPage));

    expect(screen.getByRole('heading', { name: /konto erstellen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /datenschutzerklärung/i })).toHaveAttribute('href', '/datenschutz');
    expect(screen.getByRole('link', { name: /^anmelden$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByText(/geschützter Bereich/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /konto erstellen/i })).toBeInTheDocument();
  });

  it('connects forgot-password page back to login', async () => {
    const { default: PasswortVergessenPage } = await import('@/app/(public)/passwort-vergessen/page');
    render(React.createElement(PasswortVergessenPage));

    expect(screen.getByRole('heading', { name: /passwort vergessen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset-link anfordern/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zurück zur anmeldung/i })).toHaveAttribute('href', '/login');
  });

  it('shows the reset fallback path without token and the real form with token', async () => {
    const { default: PasswortZuruecksetzenPage } = await import('@/app/(public)/passwort-zuruecksetzen/page');
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;

    const { unmount } = render(React.createElement(PasswortZuruecksetzenPage));
    expect(await screen.findByRole('heading', { name: /ungültiger link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /neuen link anfordern/i })).toHaveAttribute('href', '/passwort-vergessen');
    unmount();

    currentSearchParams = new URLSearchParams('token=reset-123');
    render(React.createElement(PasswortZuruecksetzenPage));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ token: 'reset-123' }),
    }));
    expect(await screen.findByRole('heading', { name: /neues passwort vergeben/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/neues passwort/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passwort bestätigen/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /passwort speichern/i })).toBeInTheDocument();
  });

  it('shows a clear minimum-length error before submitting the reset form', async () => {
    currentSearchParams = new URLSearchParams('token=reset-123');
    const { default: PasswortZuruecksetzenPage } = await import('@/app/(public)/passwort-zuruecksetzen/page');
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    render(React.createElement(PasswortZuruecksetzenPage));

    await screen.findByRole('heading', { name: /neues passwort vergeben/i });

    await userEvent.type(await screen.findByLabelText(/neues passwort/i), 'kurz12');
    await userEvent.type(screen.getByLabelText(/passwort bestätigen/i), 'kurz12');
    await userEvent.click(screen.getByRole('button', { name: /passwort speichern/i }));

    expect(await screen.findByText(/mindestens 8 zeichen/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/reset-password/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ token: 'reset-123' }),
    });
  });

  it('shows the invalid reset-link state immediately when token validation fails', async () => {
    currentSearchParams = new URLSearchParams('token=kaputt');
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.' }),
    });

    const { default: PasswortZuruecksetzenPage } = await import('@/app/(public)/passwort-zuruecksetzen/page');
    render(React.createElement(PasswortZuruecksetzenPage));

    expect(await screen.findByRole('heading', { name: /ungültiger link/i })).toBeInTheDocument();
    expect(screen.getByText(/der link ist abgelaufen/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /neuen link anfordern/i })).toHaveAttribute('href', '/passwort-vergessen');
  });

  it('connects admin login and admin reset routes', async () => {
    const { default: AdminLoginPage } = await import('@/app/(admin)/admin-login/page');
    const { default: AdminResetPage } = await import('@/app/(admin)/admin-reset/page');

    const { unmount } = render(React.createElement(AdminLoginPage));
    expect(screen.getByRole('heading', { name: /administratorzugang/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /passwort vergessen/i })).toHaveAttribute('href', '/admin-reset');
    expect(screen.getByRole('button', { name: /^anmelden$/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(AdminResetPage));
    expect(screen.getByRole('heading', { name: /passwort zurücksetzen/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/admin_reset_token eingeben/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /passwort zurücksetzen/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /zurück zum admin-login/i })).toHaveAttribute('href', '/admin-login');
  });
});

describe('public overview pages link into the right form flows', () => {
  it('keeps thesen and aktionen entry labels aligned with their target routes', async () => {
    approvedThesen = [{ id: 'th1', title: 'These', content: 'Inhalt', authorName: 'Alice', createdAt: '2024-01-01' }];
    approvedAktionen = [{ id: 'a1', title: 'Aktion', description: 'Beschreibung', authorName: 'Alice', createdAt: '2024-01-01' }];

    const { default: ThesenPage } = await import('@/app/(public)/thesen/page');
    const { default: AktionenPage } = await import('@/app/(public)/aktionen/page');

    const { unmount } = render(React.createElement(ThesenPage));
    expect(screen.getByRole('link', { name: /\+ these verfassen/i })).toHaveAttribute('href', '/thesen/neu');
    unmount();

    render(React.createElement(AktionenPage));
    expect(screen.getByRole('link', { name: /\+ aktion erstellen/i })).toHaveAttribute('href', '/aktionen/neu');
  });

  it('keeps the protected gebet and tageswort calls-to-action aligned with their target flows', async () => {
    currentTageswort = {
      id: 'tw1',
      date: '2026-04-11',
      verse: 'Johannes 3,16',
      text: 'Denn also hat Gott die Welt geliebt',
      context: '',
      questions: [],
      published: true,
    };

    const { default: GebetPage } = await import('@/app/(public)/gebet/page');
    const { default: TageswortPage } = await import('@/app/(public)/tageswort/page');

    const { unmount } = render(React.createElement(GebetPage));
    expect(screen.getByRole('link', { name: /^anmelden$/i })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: /kostenlos registrieren/i })).toHaveAttribute('href', '/registrieren');
    unmount();

    render(React.createElement(TageswortPage));
    expect(screen.getByRole('link', { name: /beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
  });

  it('exposes the book recommendation submission path from the public recommendations page', async () => {
    approvedBuchempfehlungen = [
      { id: 'b1', userId: 'u1', recommenderName: 'Alice', title: 'Nachfolge', author: 'Bonhoeffer', description: 'Hilfreich.', themeReference: 'Psalmen', status: 'published', createdAt: '2026-04-11T00:00:00Z' },
    ];
    const { default: BuchempfehlungenPage } = await import('@/app/(public)/buchempfehlungen/page');

    render(React.createElement(BuchempfehlungenPage));
    expect(screen.getByRole('link', { name: /\+ empfehlung einreichen/i })).toHaveAttribute('href', '/buchempfehlungen/neu');
  });
});

describe('protected user form routes and their entry links', () => {
  it('keeps dashboard and personal pages wired to the right form routes', async () => {
    setUserSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    const { default: DashboardPage } = await import('@/app/(user)/dashboard/page');
    const { default: FragestellungenPage } = await import('@/app/(user)/fragestellungen/page');
    const { default: MeineThesenPage } = await import('@/app/(user)/meine-thesen/page');
    const { default: MeineForschungPage } = await import('@/app/(user)/meine-forschung/page');
    const { default: MeineGebetePage } = await import('@/app/(user)/meine-gebete/page');
    const { default: MeineVideosPage } = await import('@/app/(user)/meine-videos/page');

    const { unmount } = render(React.createElement(DashboardPage));
    expect(screen.getByRole('link', { name: /these schreiben/i })).toHaveAttribute('href', '/thesen/neu');
    expect(screen.getByRole('link', { name: /gebet einreichen/i })).toHaveAttribute('href', '/gebet/neu');
    expect(screen.getByRole('link', { name: /aktion erstellen/i })).toHaveAttribute('href', '/aktionen/neu');
    expect(screen.getByRole('link', { name: /video teilen/i })).toHaveAttribute('href', '/videos/hochladen');
    expect(screen.getByRole('link', { name: /buchempfehlung hinzufügen/i })).toHaveAttribute('href', '/buchempfehlungen/neu');
    expect(screen.getByRole('link', { name: /fragen an die gemeinschaft/i })).toHaveAttribute('href', '/fragestellungen');
    expect(screen.getByRole('link', { name: /frage stellen/i })).toHaveAttribute('href', '/fragestellungen/neu');
    expect(screen.getByRole('link', { name: /meine buchempfehlungen/i })).toHaveAttribute('href', '/meine-buchempfehlungen');
    expect(screen.getByRole('link', { name: /mein profil/i })).toHaveAttribute('href', '/profil');
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    unmount();

    render(React.createElement(FragestellungenPage));
    expect(screen.getByRole('link', { name: /\+ frage stellen/i })).toHaveAttribute('href', '/fragestellungen/neu');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/fragestellungen'));
    unmount();

    render(React.createElement(MeineThesenPage));
    expect(screen.getByRole('link', { name: /\+ neue these/i })).toHaveAttribute('href', '/thesen/neu');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/thesen?all=1'));
    unmount();

    render(React.createElement(MeineForschungPage));
    expect(screen.getByRole('link', { name: /\+ beitrag verfassen/i })).toHaveAttribute('href', '/forschung/beitraege');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/forschung?all=1'));
    unmount();

    render(React.createElement(MeineGebetePage));
    expect(screen.getByRole('link', { name: /\+ gebet einreichen/i })).toHaveAttribute('href', '/gebet/neu');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/gebet'));
    unmount();

    render(React.createElement(MeineVideosPage));
    expect(screen.getByRole('link', { name: /\+ video teilen/i })).toHaveAttribute('href', '/videos/hochladen');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/videos?mine=1'));
  });

  it('renders the intro form only for the verified click path with token', async () => {
    setUserSession();
    currentSearchParams = new URLSearchParams('token=good-token');
    const { default: VorstellungPage } = await import('@/app/(user)/vorstellung/page');

    render(React.createElement(VorstellungPage));
    expect(await screen.findByRole('heading', { name: /willkommen bei der fluss des lebens/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /vorstellung einreichen/i })).toBeDisabled();
  });

  it('renders the thesis, research, prayer, question, video, action and profile forms with matching submit labels', async () => {
    setUserSession();
    const { default: NeueThesePage } = await import('@/app/(user)/thesen/neu/page');
    const { default: ForschungBeitraegePage } = await import('@/app/(user)/forschung/beitraege/page');
    const { default: NeueBuchempfehlungPage } = await import('@/app/(user)/buchempfehlungen/neu/page');
    const { default: NeuesGebetPage } = await import('@/app/(user)/gebet/neu/page');
    const { default: NeueFragestellungPage } = await import('@/app/(user)/fragestellungen/neu/page');
    const { default: VideoHochladenPage } = await import('@/app/(user)/videos/hochladen/page');
    const { default: NeueAktionPage } = await import('@/app/(user)/aktionen/neu/page');
    const { default: ProfilPage } = await import('@/app/(user)/profil/page');

    const { unmount } = render(React.createElement(NeueThesePage));
    expect(screen.getByRole('heading', { name: /these verfassen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /these einreichen/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(ForschungBeitraegePage));
    expect(screen.getByRole('heading', { name: /forschungsbeitrag verfassen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /beitrag einreichen/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(NeueBuchempfehlungPage));
    expect(screen.getByRole('heading', { name: /buchempfehlung hinzufügen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buchempfehlung einreichen/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(NeuesGebetPage));
    expect(screen.getByRole('heading', { name: /gebet einreichen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^gebet einreichen$/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(NeueFragestellungPage));
    expect(screen.getByRole('heading', { name: /frage an die gemeinschaft stellen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /frage einreichen/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(VideoHochladenPage));
    expect(screen.getByRole('heading', { name: /video teilen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /video einreichen/i })).toBeInTheDocument();
    expect(screen.getByText(/erst nach freigabe erscheint er unter „meine videos“/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/passendes wochenthema/i)).toBeInTheDocument();
    unmount();

    render(React.createElement(NeueAktionPage));
    expect(screen.getByRole('heading', { name: /aktion erstellen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aktion einreichen/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(ProfilPage));
    expect(screen.getByRole('heading', { name: /mein profil/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/profilbild/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /passwort ändern/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /konto unwiderruflich löschen/i })).toBeInTheDocument();
  });

  it('shows approved videos separately from videos still under admin review', async () => {
    setUserSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { id: 'v1', userId: 'u1', title: 'Freigegebenes Video', description: 'Sichtbar', status: 'published', createdAt: '2026-04-12T08:00:00Z', url: 'https://example.com/1' },
        { id: 'v2', userId: 'u1', title: 'Prüfungsvideo', description: 'Noch prüfen', status: 'review', createdAt: '2026-04-12T09:00:00Z', url: 'https://example.com/2' },
      ]),
    });
    const { default: MeineVideosPage } = await import('@/app/(user)/meine-videos/page');

    render(React.createElement(MeineVideosPage));

    expect(await screen.findByRole('heading', { name: /freigegebene videos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /aktuell in prüfung/i })).toBeInTheDocument();
    expect(screen.getByText('Freigegebenes Video')).toBeInTheDocument();
    expect(screen.getByText('Prüfungsvideo')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/videos?mine=1');
  });

  it('shows an accessible loading indicator while personal videos are loading', async () => {
    setUserSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    let deferredFetchResolver: ((value: { ok: boolean; json: () => Promise<never[]> }) => void) | undefined;
    fetchMock.mockReturnValueOnce(
      new Promise(resolve => {
        deferredFetchResolver = resolve;
      }),
    );

    const { default: MeineVideosPage } = await import('@/app/(user)/meine-videos/page');
    render(React.createElement(MeineVideosPage));

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/videos werden geladen/i)).toBeInTheDocument();

    deferredFetchResolver?.({
      ok: true,
      json: async () => [],
    });

    expect(await screen.findByText(/du hast noch keine videos geteilt/i)).toBeInTheDocument();
  });

  it('shows the submission notice when the upload flow redirects with submitted=1', async () => {
    setUserSession();
    currentSearchParams = new URLSearchParams('submitted=1');
    const { default: MeineVideosPage } = await import('@/app/(user)/meine-videos/page');

    render(React.createElement(MeineVideosPage));

    expect(await screen.findByText(/dein video wurde eingereicht/i)).toBeInTheDocument();
  });
});

describe('admin form routes and their entry links', () => {
  it('keeps the admin dashboard wired to tageswort and wochenthema management', async () => {
    setAdminSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    const { default: AdminPage } = await import('@/app/(admin)/admin/page');

    render(React.createElement(AdminPage));
    expect(screen.getByRole('link', { name: /tageswort verwalten/i })).toHaveAttribute('href', '/admin/tageswort');
    expect(screen.getByRole('link', { name: /wochenthema verwalten/i })).toHaveAttribute('href', '/admin/wochenthema');
    expect(screen.getByRole('link', { name: /buchempfehlungen moderieren/i })).toHaveAttribute('href', '/admin/buchempfehlungen');
    expect(screen.getByRole('link', { name: /mitgliederbereich/i })).toHaveAttribute('href', '/dashboard');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/admin/overview'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/admin/vorstellungen'));
  });

  it('shows only moderation queue items on the admin videos page even when side data fails', async () => {
    setAdminSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === '/api/videos?all=1') {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            { id: 'v1', title: 'Zur Prüfung', description: 'Bitte prüfen', authorName: 'Alice', status: 'created', createdAt: '2024-01-01T00:00:00Z', url: 'https://example.com/a' },
            { id: 'v2', title: 'Rückfrage läuft', description: 'Wartet', authorName: 'Bob', status: 'question_to_user', createdAt: '2024-01-02T00:00:00Z', url: 'https://example.com/b' },
            { id: 'v3', title: 'Bereits veröffentlicht', description: 'Sichtbar', authorName: 'Carol', status: 'published', createdAt: '2024-01-03T00:00:00Z', url: 'https://example.com/c' },
          ]),
        } as Response);
      }
      if (url === '/api/admin/users') {
        return Promise.reject(new Error('users endpoint unavailable'));
      }
      if (url === '/api/wochenthema?all=1') {
        return Promise.resolve({ ok: true, json: async () => [] } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => [] } as Response);
    });

    const { default: AdminVideosPage } = await import('@/app/(admin)/admin/videos/page');
    render(React.createElement(AdminVideosPage));

    await waitFor(() => expect(screen.getByText('2 ausstehend')).toBeInTheDocument());
    expect(screen.getByText('Zur Prüfung')).toBeInTheDocument();
    expect(screen.getByText('Rückfrage läuft')).toBeInTheDocument();
    expect(screen.queryByText('Bereits veröffentlicht')).toBeNull();
  });

  it('shows participant avatars on the admin chats page', async () => {
    setAdminSession();
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          userId1: 'u1',
          userId2: 'u2',
          user1Name: 'Alice',
          user1ProfileImage: 'data:image/png;base64,aGVsbG8=',
          user2Name: 'Bob',
          user2ProfileImage: 'data:image/png;base64,aGVsbG8=',
          messageCount: 3,
          lastAt: '2024-01-02T00:00:00Z',
        },
      ]),
    });

    const { default: AdminChatsPage } = await import('@/app/(admin)/admin/chats/page');
    render(React.createElement(AdminChatsPage));

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByAltText('Alice Profilbild')).toBeInTheDocument();
    expect(screen.getByAltText('Bob Profilbild')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/admin/chats');
  });

  it('opens the admin tageswort and wochenthema forms with stable labels', async () => {
    setAdminSession();
    const user = userEvent.setup();
    const { default: AdminTageswortPage } = await import('@/app/(admin)/admin/tageswort/page');
    const { default: AdminWochenthemaPage } = await import('@/app/(admin)/admin/wochenthema/page');

    const { container, unmount } = render(React.createElement(AdminTageswortPage));
    await user.click(screen.getByRole('button', { name: /\+ neu erstellen/i }));
    expect(screen.getByRole('heading', { name: /neues tageswort/i })).toBeInTheDocument();
    const dateInput = container.querySelector('input[type="date"]');
    expect(dateInput).not.toBeNull();
    expect(dateInput).toHaveValue(new Date().toISOString().split('T')[0]);
    expect(screen.getByRole('button', { name: /^erstellen$/i })).toBeInTheDocument();
    unmount();

    render(React.createElement(AdminWochenthemaPage));
    await user.click(screen.getByRole('button', { name: /\+ neu erstellen/i }));
    expect(screen.getByRole('heading', { name: /neues wochenthema erstellen/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/2025-w20/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^erstellen$/i })).toBeInTheDocument();
  });
});
