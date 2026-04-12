/**
 * Extended API Route Tests
 *
 * Professional coverage for all previously untested routes:
 *   /api/forschung, /api/aktionen, /api/tageswort (CUD), /api/wochenthema (CUD),
 *   /api/chat/[userId], /api/user/account, /api/user/notifications, /api/user/intro,
 *   /api/admin/moderate, /api/admin/overview, /api/admin/logs, /api/admin/spenden,
 *   /api/mitglieder, /api/auth/reset-password
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
function makeDeleteRequest(url: string, body: unknown): NextRequest {
  return makeJsonRequest(url, body, 'DELETE');
}
function makePatchRequest(url: string, body: unknown): NextRequest {
  return makeJsonRequest(url, body, 'PATCH');
}

const ADMIN_SESSION = { user: { id: 'admin1', name: 'Admin', role: 'ADMIN' } };
const USER_SESSION  = { user: { id: 'u1',     name: 'Alice',  role: 'USER'  } };

// ─── /api/forschung ───────────────────────────────────────────────────────────

describe('POST /api/forschung', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveForschung: vi.fn(), getApprovedForschung: vi.fn().mockReturnValue([]), getForschung: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/forschung/route');
    const res = await POST(makeJsonRequest('http://localhost/api/forschung', { title: 'T', content: 'C' }));
    expect(res.status).toBe(401);
  });

  it('saves a beitrag and returns success for authenticated user', async () => {
    const saveForschung = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveForschung, getApprovedForschung: vi.fn().mockReturnValue([]), getForschung: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/forschung/route');
    const res = await POST(makeJsonRequest('http://localhost/api/forschung', { title: 'Studie', content: 'Inhalt', wochenthemaId: 'wt-1' }));
    expect(res.status).toBe(200);
    expect(saveForschung).toHaveBeenCalledOnce();
    const saved = saveForschung.mock.calls[0][0];
    expect(saved.title).toBe('Studie');
    expect(saved.wochenthemaId).toBe('wt-1');
    expect(saved.status).toBe('created');
  });

  it('publishes immediately when admin submits', async () => {
    const saveForschung = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveForschung, getApprovedForschung: vi.fn().mockReturnValue([]), getForschung: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/forschung/route');
    const res = await POST(makeJsonRequest('http://localhost/api/forschung', { title: 'Admin Studie', content: 'Inhalt' }));
    expect(res.status).toBe(200);
    expect(saveForschung.mock.calls[0][0].status).toBe('published');
  });
});

// ─── /api/aktionen ────────────────────────────────────────────────────────────

describe('POST /api/aktionen', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ saveAktion: vi.fn(), getApprovedAktionen: vi.fn().mockReturnValue([]), getAktionen: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/aktionen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/aktionen', { title: 'T', description: 'D' }));
    expect(res.status).toBe(401);
  });

  it('saves an aktion and returns success', async () => {
    const saveAktion = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveAktion, getApprovedAktionen: vi.fn().mockReturnValue([]), getAktionen: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/aktionen/route');
    const res = await POST(makeJsonRequest('http://localhost/api/aktionen', { title: 'Event', description: 'Details', location: 'Berlin' }));
    expect(res.status).toBe(200);
    const saved = saveAktion.mock.calls[0][0];
    expect(saved.title).toBe('Event');
    expect(saved.location).toBe('Berlin');
    expect(saved.status).toBe('created');
  });
});

// ─── /api/tageswort ───────────────────────────────────────────────────────────

describe('GET /api/tageswort', () => {
  beforeEach(() => vi.resetModules());

  it('returns today tageswort for unauthenticated request', async () => {
    const entry = { id: 't1', date: '2026-01-01', published: true, verse: 'Joh 3:16', text: 'Text', context: '', questions: [] };
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn().mockReturnValue(entry), getTageswortList: vi.fn().mockReturnValue([entry]) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort'));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('t1');
  });

  it('returns 401 for ?all without admin session', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort?all=1'));
    expect(res.status).toBe(401);
  });

  it('returns full list for admin with ?all', async () => {
    const list = [{ id: 't1' }, { id: 't2' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue(list) }));
    const { GET } = await import('@/app/api/tageswort/route');
    const res = await GET(makeRequest('http://localhost/api/tageswort?all=1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(2);
  });
});

describe('POST /api/tageswort', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveTageswort: vi.fn(), getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/tageswort/route');
    const res = await POST(makeJsonRequest('http://localhost/api/tageswort', { id: 't1', verse: 'Joh 1:1' }));
    expect(res.status).toBe(401);
  });

  it('saves entry and returns success for admin', async () => {
    const saveTageswort = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveTageswort, getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { POST } = await import('@/app/api/tageswort/route');
    const entry = { id: 't1', date: '2026-01-01', verse: 'Joh 1:1', text: 'Im Anfang…', context: '', questions: [] };
    const res = await POST(makeJsonRequest('http://localhost/api/tageswort', entry));
    expect(res.status).toBe(200);
    expect(saveTageswort).toHaveBeenCalledWith(entry);
  });
});

describe('PATCH /api/tageswort', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when id is missing', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveTageswort: vi.fn(), getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { PATCH } = await import('@/app/api/tageswort/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/tageswort', { verse: 'X' }));
    expect(res.status).toBe(400);
  });

  it('saves updated entry for admin', async () => {
    const saveTageswort = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveTageswort, getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { PATCH } = await import('@/app/api/tageswort/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/tageswort', { id: 't1', verse: 'Updated' }));
    expect(res.status).toBe(200);
    expect(saveTageswort).toHaveBeenCalledOnce();
  });
});

describe('DELETE /api/tageswort', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteTageswort: vi.fn(), getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { DELETE } = await import('@/app/api/tageswort/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/tageswort', { id: 't1' }));
    expect(res.status).toBe(401);
  });

  it('returns 404 when entry not found', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteTageswort: vi.fn().mockResolvedValue(false), getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { DELETE } = await import('@/app/api/tageswort/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/tageswort', { id: 'missing' }));
    expect(res.status).toBe(404);
  });

  it('deletes entry and returns success', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteTageswort: vi.fn().mockResolvedValue(true), getTodayTageswort: vi.fn(), getTageswortList: vi.fn().mockReturnValue([]) }));
    const { DELETE } = await import('@/app/api/tageswort/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/tageswort', { id: 't1' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});

// ─── /api/wochenthema ────────────────────────────────────────────────────────

describe('POST /api/wochenthema', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveWochenthema: vi.fn(), getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { POST } = await import('@/app/api/wochenthema/route');
    const res = await POST(makeJsonRequest('http://localhost/api/wochenthema', { id: 'w1', week: '2026-W01', title: 'T', status: 'draft' }));
    expect(res.status).toBe(401);
  });

  it('saves wochenthema and returns success for admin', async () => {
    const saveWochenthema = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveWochenthema, getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { POST } = await import('@/app/api/wochenthema/route');
    const theme = { id: 'w1', week: '2026-W10', title: 'Thema', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [], status: 'draft' };
    const res = await POST(makeJsonRequest('http://localhost/api/wochenthema', theme));
    expect(res.status).toBe(200);
    expect(saveWochenthema).toHaveBeenCalledWith(theme);
  });
});

describe('PATCH /api/wochenthema', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when id is missing', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveWochenthema: vi.fn(), getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { PATCH } = await import('@/app/api/wochenthema/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/wochenthema', { title: 'Kein ID' }));
    expect(res.status).toBe(400);
  });

  it('updates wochenthema status to published', async () => {
    const saveWochenthema = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ saveWochenthema, getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { PATCH } = await import('@/app/api/wochenthema/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/wochenthema', { id: 'w1', status: 'published', title: 'Thema' }));
    expect(res.status).toBe(200);
    expect(saveWochenthema.mock.calls[0][0].status).toBe('published');
  });
});

describe('DELETE /api/wochenthema', () => {
  beforeEach(() => vi.resetModules());

  it('returns 404 when theme not found', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteWochenthema: vi.fn().mockResolvedValue(false), getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { DELETE } = await import('@/app/api/wochenthema/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/wochenthema', { id: 'missing' }));
    expect(res.status).toBe(404);
  });

  it('deletes theme and returns success', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteWochenthema: vi.fn().mockResolvedValue(true), getWochenthemaList: vi.fn().mockReturnValue([]), getCurrentWochenthema: vi.fn() }));
    const { DELETE } = await import('@/app/api/wochenthema/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/wochenthema', { id: 'w1' }));
    expect(res.status).toBe(200);
  });
});

// ─── /api/mitglieder ─────────────────────────────────────────────────────────

describe('GET /api/mitglieder', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({ getUsers: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/mitglieder/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns only active members with intro', async () => {
    const users = [
      { id: 'u1', name: 'Alice', role: 'USER', status: 'active', createdAt: '2024-01-01', intro: { vorstellung: 'Ich bin Alice', motivation: 'm', submittedAt: '2024-01-01' } },
      { id: 'u2', name: 'Bob',   role: 'USER', status: 'active', createdAt: '2024-01-02', intro: null },
      { id: 'u3', name: 'Carol', role: 'USER', status: 'awaiting_admin_review', createdAt: '2024-01-03', intro: { vorstellung: 'Ich bin Carol', motivation: 'm', submittedAt: '2024-01-03' } },
      { id: 'adm', name: 'Admin', role: 'ADMIN', status: 'active', createdAt: '2024-01-04', intro: { vorstellung: 'Admin', motivation: 'm', submittedAt: '2024-01-04' } },
    ];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/auth', () => ({ authOptions: {} }));
    vi.doMock('@/lib/db', () => ({ getUsers: vi.fn().mockReturnValue(users) }));
    const { GET } = await import('@/app/api/mitglieder/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('u1');
    expect(json[0].vorstellung).toBe('Ich bin Alice');
    expect(json[0].profileImage).toBeNull();
    expect(json[0].password).toBeUndefined();
  });
});

// ─── /api/user/notifications ─────────────────────────────────────────────────

describe('GET /api/user/notifications', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn(), getThesen: vi.fn().mockReturnValue([]), getForschung: vi.fn().mockReturnValue([]), getGebete: vi.fn().mockReturnValue([]), getVideos: vi.fn().mockReturnValue([]), getAktionen: vi.fn().mockReturnValue([]), getBuchempfehlungen: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/user/notifications/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns content-level question_to_user notifications for logged-in user', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({ id: 'u1', status: 'active', adminNote: null, createdAt: '2024-01-01' }),
      getThesen: vi.fn().mockReturnValue([
        { id: 'th1', userId: 'u1', status: 'question_to_user', adminMessage: 'Frage?', title: 'These', createdAt: '2024-01-01' },
        { id: 'th2', userId: 'u1', status: 'approved', adminMessage: null, title: 'OK', createdAt: '2024-01-02' },
      ]),
      getForschung: vi.fn().mockReturnValue([]),
      getGebete: vi.fn().mockReturnValue([]),
      getVideos: vi.fn().mockReturnValue([]),
      getAktionen: vi.fn().mockReturnValue([]),
      getBuchempfehlungen: vi.fn().mockReturnValue([]),
    }));
    const { GET } = await import('@/app/api/user/notifications/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('th1');
    expect(json[0].adminMessage).toBe('Frage?');
  });

  it('includes account-level admin note when user is question_to_user', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({ id: 'u1', status: 'question_to_user', adminNote: 'Bitte Unterlagen nachreichen', createdAt: '2024-01-01' }),
      getThesen: vi.fn().mockReturnValue([]),
      getForschung: vi.fn().mockReturnValue([]),
      getGebete: vi.fn().mockReturnValue([]),
      getVideos: vi.fn().mockReturnValue([]),
      getAktionen: vi.fn().mockReturnValue([]),
      getBuchempfehlungen: vi.fn().mockReturnValue([]),
    }));
    const { GET } = await import('@/app/api/user/notifications/route');
    const res = await GET();
    const json = await res.json();
    expect(json.some((n: { contentType: string }) => n.contentType === 'account')).toBe(true);
  });
});

// ─── /api/user/account (DELETE) ───────────────────────────────────────────────

describe('DELETE /api/user/account', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn(), deleteUserAccount: vi.fn() }));
    vi.doMock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
    const { DELETE } = await import('@/app/api/user/account/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/user/account', { password: 'pw' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 when password is missing', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'u1', role: 'USER', password: 'hashed' }), deleteUserAccount: vi.fn() }));
    vi.doMock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
    const { DELETE } = await import('@/app/api/user/account/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/user/account', {}));
    expect(res.status).toBe(400);
  });

  it('returns 403 when admin tries to self-delete', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'admin1', role: 'ADMIN', password: 'hashed' }), deleteUserAccount: vi.fn() }));
    vi.doMock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(true) } }));
    const { DELETE } = await import('@/app/api/user/account/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/user/account', { password: 'pw' }));
    expect(res.status).toBe(403);
  });

  it('returns 400 when password is wrong', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'u1', role: 'USER', password: 'hashed' }), deleteUserAccount: vi.fn() }));
    vi.doMock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(false) } }));
    const { DELETE } = await import('@/app/api/user/account/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/user/account', { password: 'wrong' }));
    expect(res.status).toBe(400);
  });

  it('deletes account and returns success with correct password', async () => {
    const deleteUserAccount = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'u1', role: 'USER', password: 'hashed' }), deleteUserAccount }));
    vi.doMock('bcryptjs', () => ({ default: { compare: vi.fn().mockResolvedValue(true) } }));
    const { DELETE } = await import('@/app/api/user/account/route');
    const res = await DELETE(makeDeleteRequest('http://localhost/api/user/account', { password: 'correct' }));
    expect(res.status).toBe(200);
    expect(deleteUserAccount).toHaveBeenCalledWith('u1');
  });
});

// ─── /api/user/intro ─────────────────────────────────────────────────────────

describe('POST /api/user/intro', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when required fields are missing', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn(), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendEmail: vi.fn(), sendRegistrationPendingEmail: vi.fn(), escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ operatorEmail: 'op@example.com', canonicalSiteUrl: 'https://flussdeslebens.live', siteDomain: 'example.com', siteName: 'Site' }));
    const { POST } = await import('@/app/api/user/intro/route');
    const res = await POST(makeJsonRequest('http://localhost/api/user/intro', { userId: 'u1' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when motivation is too short', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'u1', status: 'email_verified' }), saveUser: vi.fn() }));
    vi.doMock('@/lib/email', () => ({ sendEmail: vi.fn(), sendRegistrationPendingEmail: vi.fn(), escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ operatorEmail: 'op@example.com', canonicalSiteUrl: 'https://flussdeslebens.live', siteDomain: 'example.com', siteName: 'Site' }));
    const { POST } = await import('@/app/api/user/intro/route');
    const res = await POST(makeJsonRequest('http://localhost/api/user/intro', { userId: 'u1', motivation: 'too short', vorstellung: 'too short' }));
    expect(res.status).toBe(400);
  });

  it('saves intro and sends confirmation emails for valid submission', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    const sendRegistrationPendingEmail = vi.fn().mockResolvedValue(true);
    const sendEmail = vi.fn().mockResolvedValue(true);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockReturnValue({ id: 'u1', email: 'alice@example.com', name: 'Alice', status: 'email_verified' }),
      saveUser,
    }));
    vi.doMock('@/lib/email', () => ({ sendEmail, sendRegistrationPendingEmail, escHtml: (s: string) => s }));
    vi.doMock('@/lib/config', () => ({ operatorEmail: 'op@example.com', canonicalSiteUrl: 'https://flussdeslebens.live', siteDomain: 'example.com', siteName: 'Site' }));
    const longText = 'A'.repeat(310);
    const { POST } = await import('@/app/api/user/intro/route');
    const res = await POST(makeJsonRequest('http://localhost/api/user/intro', { userId: 'u1', motivation: longText, vorstellung: longText }));
    expect(res.status).toBe(200);
    expect(saveUser).toHaveBeenCalledOnce();
    expect(saveUser.mock.calls[0][0].status).toBe('awaiting_admin_review');
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendEmail.mock.calls[0][0].html).toContain('https://flussdeslebens.live/admin/vorstellungen');
    expect(sendEmail.mock.calls[0][0].text).toContain('https://flussdeslebens.live/admin/vorstellungen');
    expect(sendRegistrationPendingEmail).toHaveBeenCalledWith('alice@example.com', 'Alice');
  });
});

// ─── /api/admin/moderate ─────────────────────────────────────────────────────

describe('POST /api/admin/moderate', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({}));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'these', id: 't1', status: 'approved' }));
    expect(res.status).toBe(401);
  });

  it('approves a these and logs the action', async () => {
    const saveThese = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([{ id: 'th1', userId: 'u1', title: 'T', status: 'review' }]),
      saveThese,
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
        getVideos: vi.fn().mockReturnValue([]),
        saveVideo: vi.fn(),
        getAktionen: vi.fn().mockReturnValue([]),
        saveAktion: vi.fn(),
        getBuchempfehlungen: vi.fn().mockReturnValue([]),
        saveBuchempfehlung: vi.fn(),
        getUserById: vi.fn().mockReturnValue(null),
        deleteContentItem: vi.fn(),
        saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn().mockResolvedValue(true) }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'these', id: 'th1', status: 'approved' }));
    expect(res.status).toBe(200);
    expect(saveThese).toHaveBeenCalledOnce();
    expect(saveThese.mock.calls[0][0].status).toBe('approved');
    expect(saveAdminLog).toHaveBeenCalledOnce();
  });

  it('hard_deletes a video and logs the action', async () => {
    const deleteContentItem = vi.fn().mockResolvedValue(true);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([]),
      saveThese: vi.fn(),
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
        getVideos: vi.fn().mockReturnValue([]),
        saveVideo: vi.fn(),
        getAktionen: vi.fn().mockReturnValue([]),
        saveAktion: vi.fn(),
        getBuchempfehlungen: vi.fn().mockReturnValue([]),
        saveBuchempfehlung: vi.fn(),
        getUserById: vi.fn().mockReturnValue(null),
        deleteContentItem,
        saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'video', id: 'v1', status: 'hard_delete' }));
    expect(res.status).toBe(200);
    expect(deleteContentItem).toHaveBeenCalledWith('video', 'v1');
    expect(saveAdminLog.mock.calls[0][0].action).toBe('hard_delete');
  });

  it('sets wochenthemaId when publishing a video', async () => {
    const saveVideo = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([]),
      saveThese: vi.fn(),
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
        getVideos: vi.fn().mockReturnValue([{ id: 'v1', userId: 'u1', title: 'Vid', status: 'review' }]),
        saveVideo,
        getAktionen: vi.fn().mockReturnValue([]),
        saveAktion: vi.fn(),
        getBuchempfehlungen: vi.fn().mockReturnValue([]),
        saveBuchempfehlung: vi.fn(),
        getUserById: vi.fn().mockReturnValue(null),
        deleteContentItem: vi.fn(),
        saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'video', id: 'v1', status: 'published', wochenthemaId: 'wt-42' }));
    expect(res.status).toBe(200);
    expect(saveVideo.mock.calls[0][0].wochenthemaId).toBe('wt-42');
    expect(saveVideo.mock.calls[0][0].status).toBe('published');
  });

  it('sets wochenthemaId when publishing research', async () => {
    const saveForschung = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([]),
      saveThese: vi.fn(),
      getForschung: vi.fn().mockReturnValue([{ id: 'f1', userId: 'u1', title: 'Res', status: 'review' }]),
      saveForschung,
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
      getVideos: vi.fn().mockReturnValue([]),
      saveVideo: vi.fn(),
      getAktionen: vi.fn().mockReturnValue([]),
      saveAktion: vi.fn(),
      getBuchempfehlungen: vi.fn().mockReturnValue([]),
      saveBuchempfehlung: vi.fn(),
      getUserById: vi.fn().mockReturnValue(null),
      deleteContentItem: vi.fn(),
      saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'forschung', id: 'f1', status: 'published', wochenthemaId: 'wt-42' }));
    expect(res.status).toBe(200);
    expect(saveForschung.mock.calls[0][0].wochenthemaId).toBe('wt-42');
    expect(saveForschung.mock.calls[0][0].status).toBe('published');
  });

  it('rejects publishing videos without a wochenthema', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([]),
      saveThese: vi.fn(),
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
      getVideos: vi.fn().mockReturnValue([{ id: 'v1', userId: 'u1', title: 'Vid', status: 'review' }]),
      saveVideo: vi.fn(),
      getAktionen: vi.fn().mockReturnValue([]),
      saveAktion: vi.fn(),
      getBuchempfehlungen: vi.fn().mockReturnValue([]),
      saveBuchempfehlung: vi.fn(),
      getUserById: vi.fn().mockReturnValue(null),
      deleteContentItem: vi.fn(),
      saveAdminLog: vi.fn(),
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'video', id: 'v1', status: 'published' }));
    expect(res.status).toBe(400);
  });

  it('sends question_to_user email when applicable', async () => {
    const sendAdminMessageEmail = vi.fn().mockResolvedValue(true);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([{ id: 'th1', userId: 'u1', title: 'T', status: 'review' }]),
      saveThese: vi.fn().mockResolvedValue(undefined),
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
        getVideos: vi.fn().mockReturnValue([]),
        saveVideo: vi.fn(),
        getAktionen: vi.fn().mockReturnValue([]),
        saveAktion: vi.fn(),
        getBuchempfehlungen: vi.fn().mockReturnValue([]),
        saveBuchempfehlung: vi.fn(),
        getUserById: vi.fn().mockReturnValue({ id: 'u1', email: 'alice@example.com', name: 'Alice' }),
        deleteContentItem: vi.fn(),
        saveAdminLog,
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'these', id: 'th1', status: 'question_to_user', adminMessage: 'Bitte erläutern.' }));
    expect(res.status).toBe(200);
    expect(sendAdminMessageEmail).toHaveBeenCalledWith('alice@example.com', 'Alice', 'These', 'Bitte erläutern.');
  });

  it('returns 400 for invalid status', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getThesen: vi.fn().mockReturnValue([]),
      saveThese: vi.fn(),
      getForschung: vi.fn().mockReturnValue([]),
      saveForschung: vi.fn(),
      getGebete: vi.fn().mockReturnValue([]),
      saveGebet: vi.fn(),
        getVideos: vi.fn().mockReturnValue([]),
        saveVideo: vi.fn(),
        getAktionen: vi.fn().mockReturnValue([]),
        saveAktion: vi.fn(),
        getBuchempfehlungen: vi.fn().mockReturnValue([]),
        saveBuchempfehlung: vi.fn(),
        getUserById: vi.fn(),
        deleteContentItem: vi.fn(),
        saveAdminLog: vi.fn(),
    }));
    vi.doMock('@/lib/email', () => ({ sendAdminMessageEmail: vi.fn() }));
    const { POST } = await import('@/app/api/admin/moderate/route');
    const res = await POST(makeJsonRequest('http://localhost/api/admin/moderate', { type: 'these', id: 'th1', status: 'deleted' }));
    expect(res.status).toBe(400);
  });
});

// ─── /api/admin/spenden ───────────────────────────────────────────────────────

describe('GET /api/admin/spenden', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getSpenden: vi.fn().mockReturnValue([]) }));
    const { GET } = await import('@/app/api/admin/spenden/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns spenden list for admin', async () => {
    const spenden = [{ id: 's1', amount: 50, currency: 'EUR', anonymous: false, createdAt: '2024-01-01' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getSpenden: vi.fn().mockReturnValue(spenden) }));
    const { GET } = await import('@/app/api/admin/spenden/route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});

// ─── /api/admin/overview ─────────────────────────────────────────────────────

describe('GET /api/admin/overview', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getThesen: vi.fn().mockReturnValue([]), getForschung: vi.fn().mockReturnValue([]), getGebete: vi.fn().mockReturnValue([]), getVideos: vi.fn().mockReturnValue([]), getAktionen: vi.fn().mockReturnValue([]), getBuchempfehlungen: vi.fn().mockReturnValue([]), getUserById: vi.fn() }));
    const { GET } = await import('@/app/api/admin/overview/route');
    const res = await GET(makeRequest('http://localhost/api/admin/overview'));
    expect(res.status).toBe(401);
  });

  it('returns enriched content list for admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([{ id: 'u1', name: 'Alice', email: 'alice@example.com' }]),
      getThesen: vi.fn().mockReturnValue([{ id: 'th1', userId: 'u1', title: 'Eine These', status: 'review', createdAt: '2024-01-01T00:00:00Z' }]),
      getForschung: vi.fn().mockReturnValue([]),
      getGebete: vi.fn().mockReturnValue([]),
      getVideos: vi.fn().mockReturnValue([]),
      getAktionen: vi.fn().mockReturnValue([]),
      getBuchempfehlungen: vi.fn().mockReturnValue([{ id: 'book1', userId: 'u1', title: 'Nachfolge', themeReference: 'Psalmen', status: 'published', createdAt: '2026-04-11T00:00:00Z' }]),
      getUserById: vi.fn().mockReturnValue({ id: 'u1', name: 'Alice', email: 'alice@example.com' }),
    }));
    const { GET } = await import('@/app/api/admin/overview/route');
    const res = await GET(makeRequest('http://localhost/api/admin/overview'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json.some((item: { id: string }) => item.id === 'th1')).toBe(true);
    expect(json.some((item: { id: string; userName: string }) => item.id === 'book1' && item.userName === 'Alice')).toBe(true);
  });
});

// ─── /api/admin/logs ─────────────────────────────────────────────────────────

describe('GET /api/admin/logs', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getAdminLogs: vi.fn().mockReturnValue([]), getUserById: vi.fn() }));
    const { GET } = await import('@/app/api/admin/logs/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns enriched logs in reverse chronological order', async () => {
    const logs = [
      { id: 'l1', adminId: 'admin1', action: 'approve', targetType: 'these', targetId: 't1', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'l2', adminId: 'admin1', action: 'hard_delete', targetType: 'video', targetId: 'v1', createdAt: '2024-01-02T00:00:00Z' },
    ];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getAdminLogs: vi.fn().mockReturnValue(logs),
      getUsers: vi.fn().mockReturnValue([{ id: 'admin1', name: 'Admin', email: 'admin@example.com' }]),
      getUserById: vi.fn().mockReturnValue({ id: 'admin1', name: 'Admin', email: 'admin@example.com' }),
    }));
    const { GET } = await import('@/app/api/admin/logs/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    // newest first
    expect(json[0].id).toBe('l2');
    expect(json[0].adminName).toBe('Admin');
  });
});

// ─── /api/auth/reset-password ────────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 when token or password is missing', async () => {
    vi.doMock('@/lib/db', () => ({ getUsers: vi.fn().mockReturnValue([]), saveUser: vi.fn() }));
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/reset-password', { token: '', password: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    vi.doMock('@/lib/db', () => ({ getUsers: vi.fn().mockReturnValue([]), saveUser: vi.fn() }));
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/reset-password', { token: 'valid-token', password: 'short' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when token is not found', async () => {
    vi.doMock('@/lib/db', () => ({ getUsers: vi.fn().mockReturnValue([{ id: 'u1', passwordResetToken: 'other-token', passwordResetExpiry: new Date(Date.now() + 60000).toISOString() }]), saveUser: vi.fn() }));
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/reset-password', { token: 'unknown-token', password: 'newSecurePassword' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when token is expired', async () => {
    const expiredToken = 'expired-token';
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([{
        id: 'u1',
        passwordResetToken: expiredToken,
        passwordResetExpiry: new Date(Date.now() - 1000).toISOString(),
        password: 'hashed',
      }]),
      saveUser: vi.fn(),
    }));
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/reset-password', { token: expiredToken, password: 'newSecurePassword' }));
    expect(res.status).toBe(400);
  });

  it('resets password successfully with valid token', async () => {
    const saveUser = vi.fn().mockResolvedValue(undefined);
    const validToken = 'valid-reset-token';
    vi.doMock('@/lib/db', () => ({
      getUsers: vi.fn().mockReturnValue([{
        id: 'u1',
        email: 'alice@example.com',
        password: 'old-hashed',
        passwordResetToken: validToken,
        passwordResetExpiry: new Date(Date.now() + 3_600_000).toISOString(),
      }]),
      saveUser,
    }));
    vi.doMock('bcryptjs', () => ({
      default: { hash: vi.fn().mockResolvedValue('new-hashed-password') },
    }));
    const { POST } = await import('@/app/api/auth/reset-password/route');
    const res = await POST(makeJsonRequest('http://localhost/api/auth/reset-password', { token: validToken, password: 'newSecurePassword123' }));
    expect(res.status).toBe(200);
    expect(saveUser).toHaveBeenCalledOnce();
    expect(saveUser.mock.calls[0][0].passwordResetToken).toBeUndefined();
    expect(saveUser.mock.calls[0][0].passwordResetExpiry).toBeUndefined();
  });
});

// ─── /api/chat/[userId] ───────────────────────────────────────────────────────

describe('GET /api/chat/[userId]', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveAdminLog: vi.fn(), saveChatMessage: vi.fn(), deleteConversation: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { GET } = await import('@/app/api/chat/[userId]/route');
    const res = await GET(makeRequest('http://localhost/api/chat/u2'), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(401);
  });

  it('returns messages between two users', async () => {
    const messages = [{ id: 'm1', fromUserId: 'u1', toUserId: 'u2', content: 'Hi', createdAt: '2024-01-01T10:00:00Z' }];
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getConversation: vi.fn().mockReturnValue(messages), getUserById: vi.fn(), saveAdminLog: vi.fn(), saveChatMessage: vi.fn(), deleteConversation: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { GET } = await import('@/app/api/chat/[userId]/route');
    const res = await GET(makeRequest('http://localhost/api/chat/u2'), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});

describe('POST /api/chat/[userId]', () => {
  beforeEach(() => vi.resetModules());

  it('returns 400 for empty message content', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue({ id: 'u2', status: 'active' }), saveChatMessage: vi.fn(), getConversation: vi.fn().mockReturnValue([]), saveAdminLog: vi.fn(), deleteConversation: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { POST } = await import('@/app/api/chat/[userId]/route');
    const res = await POST(makeJsonRequest('http://localhost/api/chat/u2', { content: '   ' }), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when recipient does not exist', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ getUserById: vi.fn().mockReturnValue(undefined), saveChatMessage: vi.fn(), getConversation: vi.fn().mockReturnValue([]), saveAdminLog: vi.fn(), deleteConversation: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { POST } = await import('@/app/api/chat/[userId]/route');
    const res = await POST(makeJsonRequest('http://localhost/api/chat/unknown', { content: 'Hi' }), { params: Promise.resolve({ userId: 'unknown' }) });
    expect(res.status).toBe(404);
  });

  it('saves message and returns it', async () => {
    const saveChatMessage = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({
      getUserById: vi.fn().mockImplementation((id: string) => id === 'u1' ? { id: 'u1', status: 'active' } : { id: 'u2', status: 'active' }),
      saveChatMessage,
      getConversation: vi.fn().mockReturnValue([]),
      saveAdminLog: vi.fn(),
      deleteConversation: vi.fn(),
      markMessagesAsRead: vi.fn(),
    }));
    const { POST } = await import('@/app/api/chat/[userId]/route');
    const res = await POST(makeJsonRequest('http://localhost/api/chat/u2', { content: 'Hello!' }), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(200);
    expect(saveChatMessage).toHaveBeenCalledOnce();
    const msg = await res.json();
    expect(msg.content).toBe('Hello!');
  });
});

describe('DELETE /api/chat/[userId]', () => {
  beforeEach(() => vi.resetModules());

  it('returns 403 for non-admin', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteConversation: vi.fn(), saveAdminLog: vi.fn(), getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveChatMessage: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { DELETE } = await import('@/app/api/chat/[userId]/route');
    const res = await DELETE(makeRequest('http://localhost/api/chat/u2'), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(403);
  });

  it('deletes conversation and logs action for admin', async () => {
    const deleteConversation = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteConversation, saveAdminLog, getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveChatMessage: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { DELETE } = await import('@/app/api/chat/[userId]/route');
    const res = await DELETE(makeRequest('http://localhost/api/chat/u2?partner=u3'), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(200);
    expect(deleteConversation).toHaveBeenCalledWith('u2', 'u3');
    expect(saveAdminLog.mock.calls[0][0].action).toBe('chat_delete');
  });

  it('falls back to the admin id when no chat partner is provided', async () => {
    const deleteConversation = vi.fn().mockResolvedValue(undefined);
    const saveAdminLog = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(ADMIN_SESSION) }));
    vi.doMock('@/lib/db', () => ({ deleteConversation, saveAdminLog, getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveChatMessage: vi.fn(), markMessagesAsRead: vi.fn() }));
    const { DELETE } = await import('@/app/api/chat/[userId]/route');
    const res = await DELETE(makeRequest('http://localhost/api/chat/u2'), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(200);
    expect(deleteConversation).toHaveBeenCalledWith('u2', 'admin1');
    expect(saveAdminLog.mock.calls[0][0].targetId).toBe('u2:admin1');
  });
});

describe('PATCH /api/chat/[userId] – mark as read', () => {
  beforeEach(() => vi.resetModules());

  it('returns 401 when unauthenticated', async () => {
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
    vi.doMock('@/lib/db', () => ({ markMessagesAsRead: vi.fn(), deleteConversation: vi.fn(), saveAdminLog: vi.fn(), getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveChatMessage: vi.fn() }));
    const { PATCH } = await import('@/app/api/chat/[userId]/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/chat/u2', {}), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(401);
  });

  it('marks messages as read and returns success', async () => {
    const markMessagesAsRead = vi.fn().mockResolvedValue(undefined);
    vi.doMock('next-auth', () => ({ getServerSession: vi.fn().mockResolvedValue(USER_SESSION) }));
    vi.doMock('@/lib/db', () => ({ markMessagesAsRead, deleteConversation: vi.fn(), saveAdminLog: vi.fn(), getConversation: vi.fn().mockReturnValue([]), getUserById: vi.fn(), saveChatMessage: vi.fn() }));
    const { PATCH } = await import('@/app/api/chat/[userId]/route');
    const res = await PATCH(makePatchRequest('http://localhost/api/chat/u2', {}), { params: Promise.resolve({ userId: 'u2' }) });
    expect(res.status).toBe(200);
    expect(markMessagesAsRead).toHaveBeenCalledWith('u1', 'u2');
  });
});
