/**
 * API Route Tests
 *
 * Tests for Next.js App Router route handlers using vitest.
 * The database module (@/lib/db) and next-auth session are mocked for isolation.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Shared mock helpers ──────────────────────────────────────────────────────

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

function makeJsonRequest(url: string, body: unknown, method = 'POST'): NextRequest {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/share-qr', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns an SVG QR code for the canonical website URL', async () => {
    const { GET } = await import('@/app/api/share-qr/route');
    const res = await GET(makeRequest('http://localhost/api/share-qr'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('image/svg+xml');
    expect(await res.text()).toContain('<svg');
  });

  it('supports downloading the QR code as PNG', async () => {
    const { GET } = await import('@/app/api/share-qr/route');
    const res = await GET(makeRequest('http://localhost/api/share-qr?format=png&download=1'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('image/png');
    expect(res.headers.get('Content-Disposition')).toContain('attachment; filename="fluss-des-lebens-qr-code.png"');
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });
});

// ─── /api/register ───────────────────────────────────────────────────────────

describe('POST /api/register', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns 400 when required fields are missing', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: '', email: '', password: '' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toHaveProperty('error');
  });

  it('returns 400 when password is too short', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: 'Alice', email: 'alice@example.com', password: 'short' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns success (200) without revealing if email already exists', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue({ id: 'existing' }), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: 'Alice', email: 'alice@example.com', password: 'password123' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('creates a user and returns success for valid input', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: 'Alice', email: 'new@example.com', password: 'securePass1' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(saveUser).toHaveBeenCalledOnce();
    const savedUser = saveUser.mock.calls[0][0];
    expect(savedUser.email).toBe('new@example.com');
    expect(savedUser.status).toBe('pending_email');
    expect(savedUser.role).toBe('USER');
    expect(savedUser.active).toBe(false);
    expect(savedUser.weeklyFaithEmailEnabled).toBe(false);
  });

  it('normalizes the email address before saving and sending', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    const sendVerificationEmail = vi.fn().mockResolvedValue(true);
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: ' Alice ', email: ' Alice@Example.COM ', password: 'securePass1' });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(saveUser.mock.calls[0][0].email).toBe('alice@example.com');
    expect(saveUser.mock.calls[0][0].name).toBe('Alice');
    expect(sendVerificationEmail).toHaveBeenCalledWith('alice@example.com', expect.any(String));
  });

  it('returns 503 when the initial verification email cannot be sent', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(false) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: 'Alice', email: 'new@example.com', password: 'securePass1' });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it('stores the weekly faith email choice during registration', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn().mockReturnValue(undefined), saveUser }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'securePass1',
      weeklyFaithEmailEnabled: true,
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(saveUser.mock.calls[0][0].weeklyFaithEmailEnabled).toBe(true);
    expect(saveUser.mock.calls[0][0].weeklyFaithEmailUpdatedAt).toEqual(expect.any(String));
  });

  it('restores the previous token when resending the verification email fails', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({
      getUserByEmail: vi.fn().mockReturnValue({
        id: 'u1',
        email: 'alice@example.com',
        name: 'Alice',
        status: 'pending_email',
        emailToken: 'old-token',
      }),
      saveUser,
    }));
    vi.doMock('@/lib/email', () => ({ sendVerificationEmail: vi.fn().mockResolvedValue(false) }));
    const { POST } = await import('@/app/api/register/route');
    const req = makeJsonRequest('http://localhost/api/register', { name: 'Alice', email: 'alice@example.com', password: 'securePass1' });
    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(saveUser).toHaveBeenCalledTimes(2);
    expect(saveUser.mock.calls[1][0].emailToken).toBe('old-token');
  });
});

// ─── /api/gebet ──────────────────────────────────────────────────────────────

describe('GET /api/gebet', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedGebete: vi.fn().mockReturnValue([]), getGebete: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/gebet/route');
    const res = await GET(makeRequest('http://localhost/api/gebet'));
    expect(res.status).toBe(401);
  });

  it('returns approved gebete when authenticated', async () => {
    const approved = [{ id: 'g1', content: 'Prayer', status: 'approved' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ getApprovedGebete: vi.fn().mockReturnValue(approved), getGebete: vi.fn().mockReturnValue(approved) }));
    const { GET } = await import('@/app/api/gebet/route');
    const res = await GET(makeRequest('http://localhost/api/gebet'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(approved);
  });
});

describe('POST /api/gebet', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveGebet: vi.fn() }));
    const { POST } = await import('@/app/api/gebet/route');
    const res = await POST(makeJsonRequest('http://localhost/api/gebet', { content: 'Test prayer' }));
    expect(res.status).toBe(401);
  });

  it('saves a gebet and returns success when authenticated', async () => {
    const saveGebet = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveGebet }));
    const { POST } = await import('@/app/api/gebet/route');
    const res = await POST(makeJsonRequest('http://localhost/api/gebet', { content: 'Lord hear my prayer' }));
    expect(res.status).toBe(200);
    expect(saveGebet).toHaveBeenCalledOnce();
    const saved = saveGebet.mock.calls[0][0];
    expect(saved.content).toBe('Lord hear my prayer');
    expect(saved.userId).toBe('u1');
    expect(saved.status).toBe('created');
  });
});

// ─── /api/thesen ─────────────────────────────────────────────────────────────

describe('GET /api/thesen', () => {
  beforeEach(() => vi.resetModules());

  it('returns approved thesen without authentication', async () => {
    const approved = [{ id: 'th1', status: 'approved', title: 'Test' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedThesen: vi.fn().mockReturnValue(approved), getThesen: vi.fn().mockReturnValue(approved) }));
    const { GET } = await import('@/app/api/thesen/route');
    const res = await GET(makeRequest('http://localhost/api/thesen'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(approved);
  });
});

describe('POST /api/thesen', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveThese: vi.fn() }));
    const { POST } = await import('@/app/api/thesen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/thesen', { title: 'T', content: 'C' }));
    expect(res.status).toBe(401);
  });

  it('saves a these and returns success when authenticated', async () => {
    const saveThese = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveThese }));
    const { POST } = await import('@/app/api/thesen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/thesen', { title: 'My Thesis', content: 'Body', bibleReference: 'John 1:1' }));
    expect(res.status).toBe(200);
    const saved = saveThese.mock.calls[0][0];
    expect(saved.title).toBe('My Thesis');
    expect(saved.userId).toBe('u1');
    expect(saved.authorName).toBe('Alice');
    expect(saved.content).toBe('Body');
    expect(saved.bibleReference).toBe('John 1:1');
    expect(saved.status).toBe('created');
  });
});

describe('GET /api/buchempfehlungen', () => {
  beforeEach(() => vi.resetModules());

  it('returns approved recommendations without authentication', async () => {
    const approved = [{ id: 'b1', status: 'published', title: 'Nachfolge' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedBuchempfehlungen: vi.fn().mockReturnValue(approved), getBuchempfehlungen: vi.fn().mockReturnValue(approved) }));
    const { GET } = await import('@/app/api/buchempfehlungen/route');
    const res = await GET(makeRequest('http://localhost/api/buchempfehlungen'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(approved);
  });
});

describe('POST /api/buchempfehlungen', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveBuchempfehlung: vi.fn() }));
    const { POST } = await import('@/app/api/buchempfehlungen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/buchempfehlungen', { title: 'T', author: 'A', description: 'D', themeReference: 'Thema' }));
    expect(res.status).toBe(401);
  });

  it('requires a theme reference', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveBuchempfehlung: vi.fn() }));
    const { POST } = await import('@/app/api/buchempfehlungen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/buchempfehlungen', { title: 'T', author: 'A', description: 'D', themeReference: '' }));
    expect(res.status).toBe(400);
  });

  it('saves a recommendation and returns success when authenticated', async () => {
    const saveBuchempfehlung = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveBuchempfehlung }));
    const { POST } = await import('@/app/api/buchempfehlungen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/buchempfehlungen', { title: 'Nachfolge', author: 'Bonhoeffer', description: 'Sehr hilfreich', themeReference: 'Psalmen' }));
    expect(res.status).toBe(200);
    const saved = saveBuchempfehlung.mock.calls[0][0];
    expect(saved.themeReference).toBe('Psalmen');
    expect(saved.status).toBe('created');
  });
});

// ─── /api/tageswort ──────────────────────────────────────────────────────────

describe('GET /api/tageswort', () => {
  beforeEach(() => vi.resetModules());

  it('returns null when no tageswort is available', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(undefined), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort'));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it('returns the tageswort for today', async () => {
    const tw = { id: 'tw1', verse: 'John 3:16', text: 'For God…', date: '2024-01-01', published: true };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(tw), getTageswortList: vi.fn().mockReturnValue([tw]) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort'));
    expect((await res.json()).id).toBe('tw1');
  });

  it('returns 401 for ?all without ADMIN session', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort?all=1'));
    expect(res.status).toBe(401);
  });
});

// ─── /api/wochenthema ────────────────────────────────────────────────────────

describe('GET /api/wochenthema', () => {
  beforeEach(() => vi.resetModules());

  it('returns the current wochenthema', async () => {
    const theme = { id: 'wt1', title: 'Week Theme', status: 'published' };
    vi.doMock('@/lib/db', () => ({ getCurrentWochenthema: vi.fn().mockReturnValue(theme), getWochenthemaList: vi.fn().mockReturnValue([theme]) }));
    const { GET } = await import('@/app/api/wochenthema/route');
    const res = await GET(makeRequest('http://localhost/api/wochenthema'));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('wt1');
  });

  it('returns null when no published wochenthema exists', async () => {
    vi.doMock('@/lib/db', () => ({ getCurrentWochenthema: vi.fn().mockReturnValue(undefined), getWochenthemaList: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/wochenthema/route');
    const res = await GET(makeRequest('http://localhost/api/wochenthema'));
    expect(await res.json()).toBeNull();
  });

  it('returns all wochenthemen when ?all=1', async () => {
    const list = [{ id: 'w1' }, { id: 'w2' }];
    vi.doMock('@/lib/db', () => ({ getCurrentWochenthema: vi.fn(), getWochenthemaList: vi.fn().mockReturnValue(list) }));
    const { GET } = await import('@/app/api/wochenthema/route');
    const res = await GET(makeRequest('http://localhost/api/wochenthema?all=1'));
    expect((await res.json()).length).toBe(2);
  });
});

// ─── /api/videos ─────────────────────────────────────────────────────────────

describe('GET /api/videos', () => {
  beforeEach(() => vi.resetModules());

  it('returns approved videos for unauthenticated users', async () => {
    const approved = [{ id: 'v1', status: 'approved', url: 'https://example.com' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue(approved), getVideos: vi.fn().mockReturnValue(approved) }));
    const { GET } = await import('@/app/api/videos/route');
    const res = await GET(makeRequest('http://localhost/api/videos'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(approved);
  });

  it('returns only the current user videos for mine=1', async () => {
    const ownVideos = [
      { id: 'v1', userId: 'u1', status: 'review', url: 'https://example.com/1' },
      { id: 'v2', userId: 'u1', status: 'published', url: 'https://example.com/2' },
    ];
    const allVideos = [...ownVideos, { id: 'v3', userId: 'u2', status: 'published', url: 'https://example.com/3' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue(allVideos.filter(video => video.status === 'published')), getVideos: vi.fn().mockReturnValue(allVideos), saveVideo: vi.fn() }));
    const { GET } = await import('@/app/api/videos/route');
    const res = await GET(makeRequest('http://localhost/api/videos?mine=1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(ownVideos);
  });

  it('returns 401 for mine=1 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue([]), getVideos: vi.fn().mockReturnValue([]), saveVideo: vi.fn() }));
    const { GET } = await import('@/app/api/videos/route');
    const res = await GET(makeRequest('http://localhost/api/videos?mine=1'));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/videos', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveVideo: vi.fn() }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: 'T', url: 'https://yt.com', description: '' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid video URL (no http/https)', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveVideo: vi.fn() }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: 'T', url: 'javascript:alert(1)', description: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when title or description are blank after trimming', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveVideo: vi.fn() }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: '   ', url: 'https://youtube.com/watch?v=abc', description: '   ' }));
    expect(res.status).toBe(400);
  });

  it('saves video and returns success for valid input', async () => {
    const saveVideo = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveVideo }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: ' <b>My Video</b> ', url: 'https://youtube.com/watch?v=abc', description: ' <i>Desc</i> ' }));
    expect(res.status).toBe(200);
    expect(saveVideo).toHaveBeenCalledOnce();
    expect(saveVideo.mock.calls[0][0].title).toBe('My Video');
    expect(saveVideo.mock.calls[0][0].description).toBe('Desc');
    expect(saveVideo.mock.calls[0][0].url).toBe('https://youtube.com/watch?v=abc');
    expect(saveVideo.mock.calls[0][0].status).toBe('review');
  });

  it('saves video with wochenthemaId when provided', async () => {
    const saveVideo = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveVideo }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: 'My Video', url: 'https://youtube.com/watch?v=abc', description: 'Desc', wochenthemaId: 'wt-1' }));
    expect(res.status).toBe(200);
    expect(saveVideo.mock.calls[0][0].wochenthemaId).toBe('wt-1');
  });

  it('filters videos by wochenthemaId when query param is set', async () => {
    const videos = [
      { id: 'v1', status: 'published', url: 'https://a.com', wochenthemaId: 'wt-1' },
      { id: 'v2', status: 'published', url: 'https://b.com', wochenthemaId: 'wt-2' },
    ];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedVideos: vi.fn().mockReturnValue(videos), getVideos: vi.fn().mockReturnValue(videos) }));
    const { GET } = await import('@/app/api/videos/route');
    const res = await GET(makeRequest('http://localhost/api/videos?wochenthemaId=wt-1'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('v1');
  });
});

// ─── /api/auth/verify-email ───────────────────────────────────────────────────

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => vi.resetModules());

  it('redirects to the public confirmation page when token is missing', async () => {
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/email-bestaetigung');
  });

  it('redirects legacy verification links to the public confirmation page with the token', async () => {
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email?token=badtoken'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/email-bestaetigung?token=badtoken');
  });

  it('redirects valid legacy verification links to the public confirmation page', async () => {
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email?token=good-token'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/email-bestaetigung?token=good-token');
  });

  it('preserves the forwarded host when redirecting after verification', async () => {
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email?token=good-token', {
      headers: {
        host: '127.0.0.1:3000',
        'x-forwarded-host': '127.0.0.1:3000',
        'x-forwarded-proto': 'http',
      },
    }));
    expect(res.headers.get('location')).toBe('http://127.0.0.1:3000/email-bestaetigung?token=good-token');
  });
});

describe('GET /api/auth/verify-email/complete', () => {
  beforeEach(() => vi.resetModules());

  it('redirects to the public confirmation page when token is missing', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmailToken: vi.fn(), saveUser: vi.fn() }));
    const { GET } = await import('@/app/api/auth/verify-email/complete/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email/complete'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/email-bestaetigung');
  });

  it('stores the intro cookie and redirects verified users into the intro form', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({
      getUserByEmailToken: vi.fn().mockReturnValue({
        id: 'u1',
        email: 'a@a.de',
        emailToken: 'good-token',
        status: 'pending_email',
      }),
      saveUser,
    }));
    const { GET } = await import('@/app/api/auth/verify-email/complete/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email/complete?token=good-token'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/vorstellung?verified=1');
    expect(res.cookies.get('intro_verification_token')?.value).toBe('good-token');
    expect(saveUser).toHaveBeenCalledOnce();
  });
});

// ─── /api/auth/forgot-password ────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when email is missing', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmail: vi.fn(), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendPasswordResetEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/auth/forgot-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/forgot-password', { email: '   ' }));
    expect(res.status).toBe(400);
  });

  it('returns 503 and restores the previous reset token when email sending fails', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({
      getUserByEmail: vi.fn().mockReturnValue({
        id: 'u1',
        email: 'alice@example.com',
        name: 'Alice',
        status: 'active',
        passwordResetToken: 'old-token',
        passwordResetExpiry: '2026-04-11T05:00:00.000Z',
      }),
      saveUser,
    }));
    vi.doMock('@/lib/email', () => ({ sendPasswordResetEmail: vi.fn().mockResolvedValue(false) }));
    const { POST } = await import('@/app/api/auth/forgot-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/forgot-password', { email: ' Alice@Example.com ' }));
    expect(res.status).toBe(503);
    expect(saveUser).toHaveBeenCalledTimes(2);
    expect(saveUser.mock.calls[1][0].passwordResetToken).toBe('old-token');
    expect(saveUser.mock.calls[1][0].passwordResetExpiry).toBe('2026-04-11T05:00:00.000Z');
  });
});

// ─── /api/fragestellungen ─────────────────────────────────────────────────────

describe('GET /api/fragestellungen', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getCommunityQuestions: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/fragestellungen/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns community questions for authenticated users', async () => {
    const questions = [
      {
        id: 'frage-1',
        userId: 'u1',
        authorName: 'Alice',
        title: 'Frage',
        content: 'Wie ist das gemeint?',
        createdAt: '2026-04-12T09:00:00Z',
        answers: [],
      },
    ];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ getCommunityQuestions: vi.fn().mockReturnValue(questions) }));
    const { GET } = await import('@/app/api/fragestellungen/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(questions);
  });
});

describe('POST /api/fragestellungen', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveCommunityQuestion: vi.fn() }));
    const { POST } = await import('@/app/api/fragestellungen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/fragestellungen', { title: 'T', content: 'C' }));
    expect(res.status).toBe(401);
  });

  it('saves a sanitized community question for authenticated users', async () => {
    const saveCommunityQuestion = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveCommunityQuestion }));
    const { POST } = await import('@/app/api/fragestellungen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/fragestellungen', { title: ' <b>Frage</b> ', content: ' <script>x</script>Was bedeutet das? ' }));
    expect(res.status).toBe(200);
    const saved = saveCommunityQuestion.mock.calls[0][0];
    expect(saved.title).toBe('Frage');
    expect(saved.content).toBe('xWas bedeutet das?');
    expect(saved.userId).toBe('u1');
    expect(saved.authorName).toBe('Alice');
    expect(saved.answers).toEqual([]);
  });
});

describe('POST /api/fragestellungen/[questionId]/antworten', () => {
  beforeEach(() => vi.resetModules());

  it('returns 404 when the question does not exist', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u2', name: 'Bob', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ getCommunityQuestionById: vi.fn().mockReturnValue(undefined), saveCommunityQuestion: vi.fn() }));
    const { POST } = await import('@/app/api/fragestellungen/[questionId]/antworten/route');
    const res = await POST(
      makeJsonRequest('http://localhost/api/fragestellungen/frage-1/antworten', { content: 'Antwort' }),
      { params: Promise.resolve({ questionId: 'frage-1' }) },
    );
    expect(res.status).toBe(404);
  });

  it('appends a sanitized answer to the existing question', async () => {
    const saveCommunityQuestion = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u2', name: 'Bob', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({
      getCommunityQuestionById: vi.fn().mockReturnValue({
        id: 'frage-1',
        userId: 'u1',
        authorName: 'Alice',
        title: 'Frage',
        content: 'Wie ist das gemeint?',
        createdAt: '2026-04-12T09:00:00Z',
        answers: [],
      }),
      saveCommunityQuestion,
    }));
    const { POST } = await import('@/app/api/fragestellungen/[questionId]/antworten/route');
    const res = await POST(
      makeJsonRequest('http://localhost/api/fragestellungen/frage-1/antworten', { content: ' <b>Antwort</b> ' }),
      { params: Promise.resolve({ questionId: 'frage-1' }) },
    );
    expect(res.status).toBe(200);
    const saved = saveCommunityQuestion.mock.calls[0][0];
    expect(saved.answers).toHaveLength(1);
    expect(saved.answers[0].content).toBe('Antwort');
    expect(saved.answers[0].authorName).toBe('Bob');
    expect(saved.answers[0].userId).toBe('u2');
  });
});

// ─── /api/forschung ───────────────────────────────────────────────────────────

describe('GET /api/forschung', () => {
  beforeEach(() => vi.resetModules());

  it('returns approved forschung entries', async () => {
    const entries = [{ id: 'f1', status: 'published', title: 'Study' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedForschung: vi.fn().mockReturnValue(entries), getForschung: vi.fn().mockReturnValue(entries) }));
    const { GET } = await import('@/app/api/forschung/route');
    const res = await GET(makeRequest('http://localhost/api/forschung'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual(entries);
  });
});

// ─── /api/aktionen ────────────────────────────────────────────────────────────

describe('GET /api/aktionen', () => {
  beforeEach(() => vi.resetModules());

  it('returns approved aktionen', async () => {
    const aktionen = [{ id: 'a1', status: 'approved', title: 'Action' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getApprovedAktionen: vi.fn().mockReturnValue(aktionen), getAktionen: vi.fn().mockReturnValue(aktionen) }));
    const { GET } = await import('@/app/api/aktionen/route');
    const res = await GET(makeRequest('http://localhost/api/aktionen'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(aktionen);
  });
});

// ─── /api/chat ────────────────────────────────────────────────────────────────

describe('GET /api/chat', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getConversationPartners: vi.fn(), getUsers: vi.fn() }));
    const { GET } = await import('@/app/api/chat/route');
    const res = await GET(makeRequest('http://localhost/api/chat'));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/admin/chats', () => {
  beforeEach(() => vi.resetModules());

  it('returns conversation pairs with participant profile images for admins', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getChatMessages: vi.fn().mockReturnValue([
        { fromUserId: 'u1', toUserId: 'u2', createdAt: '2024-01-01T00:00:00Z' },
        { fromUserId: 'u2', toUserId: 'u1', createdAt: '2024-01-02T00:00:00Z' },
      ]),
      getUsers: vi.fn().mockReturnValue([
        { id: 'u1', name: 'Alice', profileImage: 'data:image/png;base64,aGVsbG8=' },
        { id: 'u2', name: 'Bob', profileImage: null },
      ]),
    }));
    const { GET } = await import('@/app/api/admin/chats/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      {
        userId1: 'u1',
        userId2: 'u2',
        user1Name: 'Alice',
        user1ProfileImage: 'data:image/png;base64,aGVsbG8=',
        user2Name: 'Bob',
        user2ProfileImage: null,
        messageCount: 2,
        lastAt: '2024-01-02T00:00:00Z',
      },
    ]);
  });
});

// ─── /api/user/password ──────────────────────────────────────────────────────

describe('POST /api/user/password', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn(), saveUser: vi.fn() }));
    const { POST } = await import('@/app/api/user/password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/user/password', { currentPassword: 'a', newPassword: 'b' }));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/user/account', () => {
  beforeEach(() => vi.resetModules());

  it('returns the current private account data', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        weeklyFaithEmailEnabled: true,
      }),
      getUserByEmail: vi.fn(),
      saveUser: vi.fn(),
      deleteUserAccount: vi.fn(),
    }));
    const { GET } = await import('@/app/api/user/account/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      weeklyFaithEmailEnabled: true,
      profileImage: null,
    });
  });
});

describe('PATCH /api/user/account', () => {
  beforeEach(() => vi.resetModules());

  it('updates name, email, profile image and weekly email preference', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'USER',
        weeklyFaithEmailEnabled: false,
      }),
      getUserByEmail: vi.fn().mockReturnValue(undefined),
      saveUser,
      deleteUserAccount: vi.fn(),
    }));
    const { PATCH } = await import('@/app/api/user/account/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/user/account', {
      name: ' Alice Example ',
      email: ' Alice.New@Example.com ',
      profileImage: 'data:image/png;base64,aGVsbG8=',
      weeklyFaithEmailEnabled: true,
    }, 'PATCH'));
    expect(res.status).toBe(200);
    expect(saveUser).toHaveBeenCalledOnce();
    expect(saveUser.mock.calls[0][0]).toMatchObject({
      name: 'Alice Example',
      email: 'alice.new@example.com',
      profileImage: 'data:image/png;base64,aGVsbG8=',
      weeklyFaithEmailEnabled: true,
    });
  });

  it('rejects unsupported profile image formats', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
      }),
      getUserByEmail: vi.fn().mockReturnValue(undefined),
      saveUser: vi.fn(),
      deleteUserAccount: vi.fn(),
    }));
    const { PATCH } = await import('@/app/api/user/account/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/user/account', {
      name: 'Alice',
      email: 'alice@example.com',
      profileImage: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      weeklyFaithEmailEnabled: false,
    }, 'PATCH'));
    expect(res.status).toBe(400);
  });

  it('returns 409 when another user already uses the email address', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
      }),
      getUserByEmail: vi.fn().mockReturnValue({ id: 'u2', email: 'taken@example.com' }),
      saveUser: vi.fn(),
      deleteUserAccount: vi.fn(),
    }));
    const { PATCH } = await import('@/app/api/user/account/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/user/account', {
      name: 'Alice',
      email: 'taken@example.com',
      weeklyFaithEmailEnabled: false,
    }, 'PATCH'));
    expect(res.status).toBe(409);
  });
});

describe('POST /api/internal/weekly-faith-email', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.WEEKLY_FAITH_EMAIL_CRON_SECRET = 'secret-123';
  });

  it('sends the weekly faith email to subscribed active users once per week', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    const sendWeeklyFaithEmail = vi.fn().mockResolvedValue(true);
    vi.doMock('@/lib/db', () => ({
      getCurrentWochenthema: vi.fn().mockReturnValue({
        id: '2026-W15',
        week: '2026-W15',
        title: 'Die Nachfolge',
        introduction: 'Einführung',
        bibleVerses: ['Markus 1,16-20'],
        problemStatement: 'Vertiefung',
        researchQuestions: ['Frage 1', 'Frage 2'],
        status: 'published',
      }),
      getUsers: vi.fn().mockReturnValue([
        {
          id: 'u1',
          role: 'USER',
          status: 'active',
          active: true,
          email: 'alice@example.com',
          name: 'Alice',
          weeklyFaithEmailEnabled: true,
        },
        {
          id: 'u2',
          role: 'USER',
          status: 'active',
          active: true,
          email: 'bob@example.com',
          name: 'Bob',
          weeklyFaithEmailEnabled: true,
          lastWeeklyFaithEmailWeek: '2026-W15',
        },
      ]),
      saveUser,
    }));
    vi.doMock('@/lib/email', () => ({ sendWeeklyFaithEmail }));
    const { POST } = await import('@/app/api/internal/weekly-faith-email/route');
    const res = await POST(new Request('http://localhost/api/internal/weekly-faith-email', {
      method: 'POST',
      headers: { Authorization: 'Bearer secret-123' },
    }));
    expect(res.status).toBe(200);
    expect(sendWeeklyFaithEmail).toHaveBeenCalledTimes(1);
    expect(sendWeeklyFaithEmail).toHaveBeenCalledWith('alice@example.com', 'Alice', expect.objectContaining({ week: '2026-W15' }));
    expect(saveUser).toHaveBeenCalledWith(expect.objectContaining({
      id: 'u1',
      lastWeeklyFaithEmailWeek: '2026-W15',
    }));
  });
});

// ─── /api/admin/users – action validation / hard delete ─────────────────────

describe('PATCH /api/admin/users', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 for legacy delete action', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([]),
      saveUser: vi.fn(),
      deleteUserAccount: vi.fn(),
      saveAdminLog: vi.fn(),
    }));
    vi.doMock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue(true), escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ siteName: 'Site', siteDomain: 'example.com' }));
    const { PATCH } = await import('@/app/api/admin/users/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/admin/users', { id: 'u2', action: 'delete' }, 'PATCH'));
    expect(res.status).toBe(400);
  });

  it('calls deleteUserAccount for hard_delete action', async () => {
    const deleteUserAccount = vi.fn().mockResolvedValue(undefined);
    const saveUser = vi.fn();
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    const user = { id: 'u3', email: 'carol@example.com', name: 'Carol', status: 'active', active: true };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([user]),
      saveUser,
      deleteUserAccount,
      saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue(true), escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ siteName: 'Site', siteDomain: 'example.com' }));
    const { PATCH } = await import('@/app/api/admin/users/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/admin/users', { id: 'u3', action: 'hard_delete' }, 'PATCH'));
    expect(res.status).toBe(200);
    expect(deleteUserAccount).toHaveBeenCalledWith('u3');
    expect(saveUser).not.toHaveBeenCalled();
    expect(saveAdminLog).toHaveBeenCalledOnce();
    expect(saveAdminLog.mock.calls[0][0].action).toBe('user_hard_delete');
  });

  it('still returns 200 when logging fails after hard delete', async () => {
    const deleteUserAccount = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockRejectedValue(new Error('log failed'));
    const user = { id: 'u3', email: 'carol@example.com', name: 'Carol', status: 'active', active: true };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([user]),
      saveUser: vi.fn(),
      deleteUserAccount,
      saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendEmail: vi.fn().mockResolvedValue(true), escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ siteName: 'Site', siteDomain: 'example.com' }));
    const { PATCH } = await import('@/app/api/admin/users/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/admin/users', { id: 'u3', action: 'hard_delete' }, 'PATCH'));
    expect(res.status).toBe(200);
    expect(deleteUserAccount).toHaveBeenCalledWith('u3');
  });
});

// ─── /api/admin/vorstellungen – hard delete ───────────────────────────────────

describe('PATCH /api/admin/vorstellungen (reject action)', () => {
  beforeEach(() => vi.resetModules());

  it('calls deleteUserAccount for reject action and returns 200', async () => {
    const deleteUserAccount = vi.fn().mockResolvedValue(undefined);
    const saveUser = vi.fn();
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    const user = { id: 'u4', email: 'dave@example.com', name: 'Dave', status: 'awaiting_admin_review' };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getAwaitingReviewUsers: vi.fn().mockReturnValue([user]),
      getUserById: vi.fn().mockReturnValue(user),
      saveUser,
      deleteUserAccount,
      saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({
      sendAdminApprovalEmail: vi.fn().mockResolvedValue(true),
      sendEmail: vi.fn().mockResolvedValue(true),
      escHtml: (s: string) => s,
    }));
    vi.doMock('@/lib/config', () => ({ siteName: 'Site', siteDomain: 'example.com' }));
    const { PATCH } = await import('@/app/api/admin/vorstellungen/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/admin/vorstellungen', { userId: 'u4', action: 'reject', note: '' }, 'PATCH'));
    expect(res.status).toBe(200);
    expect(deleteUserAccount).toHaveBeenCalledWith('u4');
    expect(saveUser).not.toHaveBeenCalled();
    expect(saveAdminLog.mock.calls[0][0].action).toBe('vorstellung_reject');
  });

  it('sends the approval email with the released account after approve action', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    const sendAdminApprovalEmail = vi.fn().mockResolvedValue(true);
    const user = { id: 'u4', email: 'dave@example.com', name: 'Dave', status: 'awaiting_admin_review', active: false };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'admin1', role: 'ADMIN' } }) }));
    vi.doMock('@/lib/db', () => ({
      getAwaitingReviewUsers: vi.fn().mockReturnValue([user]),
      getUserById: vi.fn().mockReturnValue(user),
      saveUser,
      deleteUserAccount: vi.fn(),
      saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({
      sendAdminApprovalEmail,
      sendEmail: vi.fn().mockResolvedValue(true),
      escHtml: (s: string) => s,
    }));
    vi.doMock('@/lib/config', () => ({ siteName: 'Site', siteDomain: 'example.com' }));
    const { PATCH } = await import('@/app/api/admin/vorstellungen/route');
    const res = await PATCH(makeJsonRequest('http://localhost/api/admin/vorstellungen', { userId: 'u4', action: 'approve', note: 'Willkommen!' }, 'PATCH'));
    expect(res.status).toBe(200);
    expect(saveUser).toHaveBeenCalledOnce();
    expect(saveUser.mock.calls[0][0].status).toBe('active');
    expect(saveUser.mock.calls[0][0].active).toBe(true);
    expect(sendAdminApprovalEmail).toHaveBeenCalledWith('dave@example.com', 'Dave', true, 'Willkommen!');
    expect(saveAdminLog.mock.calls[0][0].action).toBe('vorstellung_approve');
  });
});
