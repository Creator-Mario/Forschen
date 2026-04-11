/**
 * Component Tests
 *
 * Render tests for all shared UI components using React Testing Library.
 * next-auth and next/navigation are mocked so components render in jsdom.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { formatDate } from '@/lib/utils';

const routerPush = vi.fn();
const routerReplace = vi.fn();
let currentPathname = '/';

// ─── Mock next/navigation (used by ProtectedRoute's router.push) ──────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
  usePathname: () => currentPathname,
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Mock next/link ────────────────────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href }, children),
}));

// ─── Card ─────────────────────────────────────────────────────────────────────

describe('Card', () => {
  it('renders children', async () => {
    const { default: Card } = await import('@/components/Card');
    render(React.createElement(Card, null, 'Hello Card'));
    expect(screen.getByText('Hello Card')).toBeInTheDocument();
  });

  it('applies extra className', async () => {
    const { default: Card } = await import('@/components/Card');
    const { container } = render(React.createElement(Card, { className: 'extra-class' }, 'Content'));
    expect(container.firstChild).toHaveClass('extra-class');
  });

  it('always has base classes', async () => {
    const { default: Card } = await import('@/components/Card');
    const { container } = render(React.createElement(Card, null, 'X'));
    expect(container.firstChild).toHaveClass('bg-white');
  });
});

// ─── BibleLink ────────────────────────────────────────────────────────────────

describe('BibleLink', () => {
  it('renders plain text without links when no bible reference', async () => {
    const { default: BibleLink } = await import('@/components/BibleLink');
    render(React.createElement(BibleLink, { text: 'No bible reference here' }));
    expect(screen.getByText(/No bible reference here/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders a link for a recognised bible reference', async () => {
    const { default: BibleLink } = await import('@/components/BibleLink');
    render(React.createElement(BibleLink, { text: 'Johannes 3,16 ist bekannt.' }));
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('bibleserver.com'));
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders multiple links for multiple references', async () => {
    const { default: BibleLink } = await import('@/components/BibleLink');
    render(React.createElement(BibleLink, { text: 'Johannes 3,16 und Römer 8,28 sind wichtig.' }));
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(2);
  });

  it('returns null for empty text', async () => {
    const { default: BibleLink } = await import('@/components/BibleLink');
    const { container } = render(React.createElement(BibleLink, { text: '' }));
    expect(container.firstChild).toBeNull();
  });
});

// ─── BibleVerseCard ───────────────────────────────────────────────────────────

describe('BibleVerseCard', () => {
  const tageswort = {
    id: 'tw1',
    date: '2024-01-01',
    verse: 'Johannes 3,16',
    text: 'Denn also hat Gott die Welt geliebt.',
    context: 'Ein wichtiger Kontext',
    questions: ['Was bedeutet das?', 'Wie wirkt es sich aus?'],
    published: true,
  };

  it('renders the bible verse text', async () => {
    const { default: BibleVerseCard } = await import('@/components/BibleVerseCard');
    render(React.createElement(BibleVerseCard, { tageswort }));
    expect(screen.getByText(/Denn also hat Gott/)).toBeInTheDocument();
  });

  it('does not show questions by default', async () => {
    const { default: BibleVerseCard } = await import('@/components/BibleVerseCard');
    render(React.createElement(BibleVerseCard, { tageswort }));
    expect(screen.queryByText('Forschungsfragen:')).toBeNull();
  });

  it('shows questions when showQuestions=true', async () => {
    const { default: BibleVerseCard } = await import('@/components/BibleVerseCard');
    render(React.createElement(BibleVerseCard, { tageswort, showQuestions: true }));
    expect(screen.getByText('Forschungsfragen:')).toBeInTheDocument();
    expect(screen.getByText(/Was bedeutet das\?/)).toBeInTheDocument();
  });

  it('shows the context text', async () => {
    const { default: BibleVerseCard } = await import('@/components/BibleVerseCard');
    render(React.createElement(BibleVerseCard, { tageswort }));
    expect(screen.getByText(/Ein wichtiger Kontext/)).toBeInTheDocument();
  });
});

// ─── ThesisCard ───────────────────────────────────────────────────────────────

describe('ThesisCard', () => {
  const these = {
    id: 'th1',
    userId: 'u1',
    authorName: 'Alice',
    title: 'My Thesis Title',
    content: 'The body of the thesis.',
    bibleReference: '',
    status: 'approved' as const,
    createdAt: '2024-01-01T00:00:00Z',
  };

  it('renders the thesis title', async () => {
    const { default: ThesisCard } = await import('@/components/ThesisCard');
    render(React.createElement(ThesisCard, { these }));
    expect(screen.getByText('My Thesis Title')).toBeInTheDocument();
  });

  it('renders author name', async () => {
    const { default: ThesisCard } = await import('@/components/ThesisCard');
    render(React.createElement(ThesisCard, { these }));
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('does not show status badge by default', async () => {
    const { default: ThesisCard } = await import('@/components/ThesisCard');
    render(React.createElement(ThesisCard, { these }));
    expect(screen.queryByText('Genehmigt')).toBeNull();
  });

  it('shows status badge when showStatus=true', async () => {
    const { default: ThesisCard } = await import('@/components/ThesisCard');
    render(React.createElement(ThesisCard, { these, showStatus: true }));
    expect(screen.getByText('Genehmigt')).toBeInTheDocument();
  });

  it('shows adminMessage when showStatus=true and adminMessage exists', async () => {
    const { default: ThesisCard } = await import('@/components/ThesisCard');
    const theseWithMsg = { ...these, adminMessage: 'Bitte ergänzen.', status: 'question_to_user' as const };
    render(React.createElement(ThesisCard, { these: theseWithMsg, showStatus: true }));
    expect(screen.getByText(/Bitte ergänzen\./)).toBeInTheDocument();
  });
});

// ─── PrayerCard ───────────────────────────────────────────────────────────────

describe('PrayerCard', () => {
  const gebet = {
    id: 'g1',
    userId: 'u1',
    content: 'Lord, hear my prayer.',
    anonymous: false,
    authorName: 'Bob',
    status: 'approved' as const,
    createdAt: '2024-03-01T00:00:00Z',
  };

  it('renders prayer content', async () => {
    const { default: PrayerCard } = await import('@/components/PrayerCard');
    render(React.createElement(PrayerCard, { gebet }));
    expect(screen.getByText(/Lord, hear my prayer/)).toBeInTheDocument();
  });

  it('shows author name when not anonymous', async () => {
    const { default: PrayerCard } = await import('@/components/PrayerCard');
    render(React.createElement(PrayerCard, { gebet }));
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows "Anonym" when anonymous=true', async () => {
    const { default: PrayerCard } = await import('@/components/PrayerCard');
    render(React.createElement(PrayerCard, { gebet: { ...gebet, anonymous: true } }));
    expect(screen.getByText('Anonym')).toBeInTheDocument();
  });
});

// ─── WeeklyThemeCard ──────────────────────────────────────────────────────────

describe('WeeklyThemeCard', () => {
  const theme = {
    id: 'wt1',
    week: '2024-W10',
    title: 'Glaube und Vernunft',
    introduction: 'Diese Woche beschäftigen wir uns mit dem Verhältnis von Glaube und Vernunft.',
    bibleVerses: ['Johannes 1,1', 'Römer 1,20'],
    problemStatement: 'Wie verhalten sich Glaube und Vernunft zueinander?',
    researchQuestions: ['Frage 1?', 'Frage 2?'],
    status: 'published' as const,
  };

  it('renders the theme title', async () => {
    const { default: WeeklyThemeCard } = await import('@/components/WeeklyThemeCard');
    render(React.createElement(WeeklyThemeCard, { theme }));
    expect(screen.getByText('Glaube und Vernunft')).toBeInTheDocument();
  });

  it('renders introduction in full mode (compact=false by default)', async () => {
    const { default: WeeklyThemeCard } = await import('@/components/WeeklyThemeCard');
    render(React.createElement(WeeklyThemeCard, { theme }));
    expect(screen.getByText(/Diese Woche beschäftigen/)).toBeInTheDocument();
  });

  it('hides introduction in compact mode', async () => {
    const { default: WeeklyThemeCard } = await import('@/components/WeeklyThemeCard');
    render(React.createElement(WeeklyThemeCard, { theme, compact: true }));
    expect(screen.queryByText(/Diese Woche beschäftigen/)).toBeNull();
  });

  it('renders a link to the wochenthema page', async () => {
    const { default: WeeklyThemeCard } = await import('@/components/WeeklyThemeCard');
    render(React.createElement(WeeklyThemeCard, { theme }));
    const link = screen.getByRole('link', { name: /Zum Wochenthema/ });
    expect(link).toHaveAttribute('href', '/wochenthema');
  });

  it('shows week number and current date', async () => {
    const { default: WeeklyThemeCard } = await import('@/components/WeeklyThemeCard');
    render(React.createElement(WeeklyThemeCard, { theme }));
    expect(screen.getByText(new RegExp(`Woche ${theme.week}`))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(formatDate(new Date().toISOString())))).toBeInTheDocument();
  });
});

// ─── AdminModerationTable ──────────────────────────────────────────────────────

describe('AdminModerationTable', () => {
  it('shows only items that are still in the moderation queue', async () => {
    const { default: AdminModerationTable } = await import('@/components/AdminModerationTable');
    render(React.createElement(AdminModerationTable, {
      items: [
        { id: 'v1', title: 'Neu eingereicht', authorName: 'Alice', status: 'created', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'v2', title: 'Rückfrage offen', authorName: 'Bob', status: 'question_to_user', createdAt: '2024-01-02T00:00:00Z' },
        { id: 'v3', title: 'Bereits veröffentlicht', authorName: 'Carol', status: 'published', createdAt: '2024-01-03T00:00:00Z' },
        { id: 'v4', title: 'Schon genehmigt', authorName: 'Dave', status: 'approved', createdAt: '2024-01-04T00:00:00Z' },
      ],
      titleField: 'title',
      authorField: 'authorName',
      contentType: 'Video',
      onAction: vi.fn(),
    }));

    expect(screen.getByText('Neu eingereicht')).toBeInTheDocument();
    expect(screen.getByText('Rückfrage offen')).toBeInTheDocument();
    expect(screen.queryByText('Bereits veröffentlicht')).toBeNull();
    expect(screen.queryByText('Schon genehmigt')).toBeNull();
  });
});

// ─── ProtectedRoute ────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    currentPathname = '/';
  });

  it('shows loading indicator while session is loading', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'loading' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    render(React.createElement(ProtectedRoute, null, React.createElement('div', null, 'Protected Content')));
    expect(screen.getByText('Laden...')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'USER', name: 'Alice' } }, status: 'authenticated' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    render(React.createElement(ProtectedRoute, null, React.createElement('div', null, 'Protected Content')));
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders nothing when user is unauthenticated', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    const { container } = render(React.createElement(ProtectedRoute, null, React.createElement('div', null, 'Protected Content')));
    expect(screen.queryByText('Protected Content')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('redirects unauthenticated users back to the requested member page after login', async () => {
    currentPathname = '/mitglieder/vorstellungen';
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    render(React.createElement(ProtectedRoute, null, React.createElement('div', null, 'Protected Content')));
    expect(routerReplace).toHaveBeenCalledWith('/login?callbackUrl=%2Fmitglieder%2Fvorstellungen');
  });

  it('renders nothing for non-admin user when requireAdmin=true', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'USER', name: 'Alice' } }, status: 'authenticated' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    render(React.createElement(ProtectedRoute, { requireAdmin: true }, React.createElement('div', null, 'Admin Content')));
    expect(screen.queryByText('Admin Content')).toBeNull();
  });

  it('renders admin content for admin user when requireAdmin=true', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', role: 'ADMIN', name: 'Admin' } }, status: 'authenticated' }),
    }));
    const { default: ProtectedRoute } = await import('@/components/ProtectedRoute');
    render(React.createElement(ProtectedRoute, { requireAdmin: true }, React.createElement('div', null, 'Admin Content')));
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});

// ─── Navbar ───────────────────────────────────────────────────────────────────

describe('Navbar', () => {
  beforeEach(() => vi.resetModules());

  it('renders nav links', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
      signOut: vi.fn(),
    }));
    const { default: Navbar } = await import('@/components/Navbar');
    render(React.createElement(Navbar));
    expect(screen.getAllByText('Tageswort').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Psalmen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Glauben heute').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Thesen').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Gebet').length).toBeGreaterThan(0);
  });

  it('shows login link when unauthenticated', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
      signOut: vi.fn(),
    }));
    const { default: Navbar } = await import('@/components/Navbar');
    render(React.createElement(Navbar));
    expect(screen.getAllByText('Anmelden').length).toBeGreaterThan(0);
  });

  it('shows user name and logout button when authenticated', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', name: 'Alice', role: 'USER' } }, status: 'authenticated' }),
      signOut: vi.fn(),
    }));
    const { default: Navbar } = await import('@/components/Navbar');
    render(React.createElement(Navbar));
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Abmelden').length).toBeGreaterThan(0);
  });

  it('shows a prominent chat link for authenticated users', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: { user: { id: 'u1', name: 'Alice', role: 'USER' } }, status: 'authenticated' }),
      signOut: vi.fn(),
    }));
    const { default: Navbar } = await import('@/components/Navbar');
    render(React.createElement(Navbar));
    expect(screen.getAllByRole('link', { name: /chat/i }).length).toBeGreaterThan(0);
  });

  it('toggles mobile menu on button click', async () => {
    vi.doMock('next-auth/react', () => ({
      useSession: () => ({ data: null, status: 'unauthenticated' }),
      signOut: vi.fn(),
    }));
    const { default: Navbar } = await import('@/components/Navbar');
    render(React.createElement(Navbar));
    const btn = screen.getByRole('button', { name: /Menü öffnen/i });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /Menü schließen/i })).toBeInTheDocument();
  });
});
