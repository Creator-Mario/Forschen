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

  it('saves video and returns success for valid input', async () => {
    const saveVideo = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Alice', role: 'USER' } }) }));
    vi.doMock('@/lib/db', () => ({ saveVideo }));
    const { POST } = await import('@/app/api/videos/route');
    const res = await POST(makeJsonRequest('http://localhost/api/videos', { title: 'My Video', url: 'https://youtube.com/watch?v=abc', description: 'Desc' }));
    expect(res.status).toBe(200);
    expect(saveVideo).toHaveBeenCalledOnce();
    expect(saveVideo.mock.calls[0][0].url).toBe('https://youtube.com/watch?v=abc');
  });
});

// ─── /api/auth/verify-email ───────────────────────────────────────────────────

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when token is missing', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmailToken: vi.fn(), saveUser: vi.fn() }));
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when token is invalid', async () => {
    vi.doMock('@/lib/db', () => ({ getUserByEmailToken: vi.fn().mockReturnValue(undefined), saveUser: vi.fn() }));
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email?token=badtoken'));
    expect(res.status).toBe(400);
  });

  it('verifies a valid token and updates user status', async () => {
    const user = { id: 'u1', email: 'a@a.de', emailToken: 'good-token', status: 'pending_email', intro: null };
    const saveUser = vi.fn().mockResolvedValue(undefined);
    vi.doMock('@/lib/db', () => ({ getUserByEmailToken: vi.fn().mockReturnValue(user), saveUser }));
    const { GET } = await import('@/app/api/auth/verify-email/route');
    const res = await GET(makeRequest('http://localhost/api/auth/verify-email?token=good-token'));
    // Should redirect (3xx) to the login/intro page
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(saveUser).toHaveBeenCalledOnce();
    const updatedUser = saveUser.mock.calls[0][0];
    expect(updatedUser.emailToken).toBeUndefined();
    expect(['email_verified', 'awaiting_admin_review']).toContain(updatedUser.status);
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
