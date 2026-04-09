import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// ── readJson / basic lookups ─────────────────────────────────────────────────

describe('db – readJson (via getUsers)', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
  });

  it('returns an empty array when the data file does not exist', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    const { getUsers } = await import('@/lib/db');
    expect(getUsers()).toEqual([]);
    vi.restoreAllMocks();
  });

  it('parses JSON from the data file', async () => {
    const user = { id: 'u1', email: 'a@b.de', name: 'Test', role: 'USER' };
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([user]));
    const { getUsers } = await import('@/lib/db');
    expect(getUsers()).toEqual([user]);
    vi.restoreAllMocks();
  });

  it('uses in-memory cache after a write (no additional fs reads)', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    const readSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([]));
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    const { saveUser, getUsers } = await import('@/lib/db');
    // saveUser internally calls getUsers() then writeJson which populates the cache
    const user = { id: 'u1', email: 'a@b.de', name: 'Test', role: 'USER' as const, status: 'active' as const, active: true, createdAt: '2024-01-01', password: 'h' };
    await saveUser(user);
    const callsAfterWrite = readSpy.mock.calls.length;
    // After the write, cache is populated – further reads must not call readFileSync
    getUsers();
    getUsers();
    expect(readSpy.mock.calls.length).toBe(callsAfterWrite);
    vi.restoreAllMocks();
  });
});

// ── getUserById / getUserByEmail ──────────────────────────────────────────────

describe('db – getUserById / getUserByEmail', () => {
  const users = [
    { id: 'u1', email: 'alice@example.com', name: 'Alice', role: 'USER', status: 'active', active: true, createdAt: '2024-01-01', password: 'x' },
    { id: 'u2', email: 'bob@example.com', name: 'Bob', role: 'ADMIN', status: 'active', active: true, createdAt: '2024-01-02', password: 'y' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(users));
  });
  afterEach(() => vi.restoreAllMocks());

  it('finds a user by id', async () => {
    const { getUserById } = await import('@/lib/db');
    expect(getUserById('u1')?.name).toBe('Alice');
  });

  it('returns undefined for unknown id', async () => {
    const { getUserById } = await import('@/lib/db');
    expect(getUserById('not-there')).toBeUndefined();
  });

  it('finds a user by email (case-sensitive)', async () => {
    const { getUserByEmail } = await import('@/lib/db');
    expect(getUserByEmail('bob@example.com')?.id).toBe('u2');
  });

  it('returns undefined for unknown email', async () => {
    const { getUserByEmail } = await import('@/lib/db');
    expect(getUserByEmail('nobody@example.com')).toBeUndefined();
  });
});

// ── getAwaitingReviewUsers ────────────────────────────────────────────────────

describe('db – getAwaitingReviewUsers', () => {
  const users = [
    { id: 'u1', role: 'USER', status: 'awaiting_admin_review' },
    { id: 'u2', role: 'USER', status: 'active' },
    { id: 'u3', role: 'ADMIN', status: 'awaiting_admin_review' },
    { id: 'u4', role: 'USER', status: 'question_to_user' },
    { id: 'u5', role: 'USER', status: 'postponed' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(users));
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns non-admin users in awaiting/question/postponed states', async () => {
    const { getAwaitingReviewUsers } = await import('@/lib/db');
    const result = getAwaitingReviewUsers();
    expect(result.map(u => u.id).sort()).toEqual(['u1', 'u4', 'u5']);
  });

  it('excludes admin accounts', async () => {
    const { getAwaitingReviewUsers } = await import('@/lib/db');
    const result = getAwaitingReviewUsers();
    expect(result.find(u => u.id === 'u3')).toBeUndefined();
  });
});

// ── Tageswort lookups ─────────────────────────────────────────────────────────

describe('db – getTodayTageswort', () => {
  const today = new Date().toISOString().split('T')[0];
  const tageswortList = [
    { id: 't1', date: '2000-01-01', published: true, verse: 'old', text: 'old text', context: '', questions: [] },
    { id: 't2', date: today, published: true, verse: 'John 3:16', text: 'For God…', context: '', questions: [] },
    { id: 't3', date: today, published: false, verse: 'Draft', text: 'draft', context: '', questions: [] },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(tageswortList));
  });
  afterEach(() => vi.restoreAllMocks());

  it("returns today's published tageswort", async () => {
    const { getTodayTageswort } = await import('@/lib/db');
    expect(getTodayTageswort()?.id).toBe('t2');
  });

  it('does not return unpublished entries', async () => {
    const { getTodayTageswort } = await import('@/lib/db');
    expect(getTodayTageswort()?.id).not.toBe('t3');
  });
});

// ── Thesen filter helpers ─────────────────────────────────────────────────────

describe('db – getApprovedThesen', () => {
  const thesen = [
    { id: 'th1', status: 'created' },
    { id: 'th2', status: 'approved' },
    { id: 'th3', status: 'published' },
    { id: 'th4', status: 'rejected' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(thesen));
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns only approved and published thesen', async () => {
    const { getApprovedThesen } = await import('@/lib/db');
    const result = getApprovedThesen();
    expect(result.map(t => t.id).sort()).toEqual(['th2', 'th3']);
  });
});

// ── getConversation / getConversationPartners ─────────────────────────────────

describe('db – chat helpers', () => {
  const messages = [
    { id: 'm1', fromUserId: 'u1', toUserId: 'u2', content: 'Hi', createdAt: '2024-01-01T10:00:00Z' },
    { id: 'm2', fromUserId: 'u2', toUserId: 'u1', content: 'Hey', createdAt: '2024-01-01T10:01:00Z' },
    { id: 'm3', fromUserId: 'u1', toUserId: 'u3', content: 'Hello', createdAt: '2024-01-01T11:00:00Z' },
    { id: 'm4', fromUserId: 'u4', toUserId: 'u5', content: 'Other', createdAt: '2024-01-01T12:00:00Z' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(messages));
  });
  afterEach(() => vi.restoreAllMocks());

  it('getConversation returns messages between two users in chronological order', async () => {
    const { getConversation } = await import('@/lib/db');
    const conv = getConversation('u1', 'u2');
    expect(conv.map(m => m.id)).toEqual(['m1', 'm2']);
  });

  it('getConversation returns empty array for users with no conversation', async () => {
    const { getConversation } = await import('@/lib/db');
    expect(getConversation('u1', 'u4')).toEqual([]);
  });

  it('getConversationPartners returns unique partners for a user', async () => {
    const { getConversationPartners } = await import('@/lib/db');
    const partners = getConversationPartners('u1').sort();
    expect(partners).toEqual(['u2', 'u3']);
  });

  it('getConversationPartners returns empty array for user with no messages', async () => {
    const { getConversationPartners } = await import('@/lib/db');
    expect(getConversationPartners('unknown')).toEqual([]);
  });
});

// ── writeJson (local fs path, no GITHUB_TOKEN) ───────────────────────────────

describe('db – saveUser (local fs write)', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([]));
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('calls writeFileSync when no GITHUB_TOKEN is set', async () => {
    const { saveUser } = await import('@/lib/db');
    const user = { id: 'u99', email: 'test@test.de', name: 'Test', role: 'USER' as const, status: 'active' as const, active: true, createdAt: '2024-01-01', password: 'hash' };
    await saveUser(user);
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('updates existing user in place', async () => {
    const existing = { id: 'u1', email: 'e@e.de', name: 'Old', role: 'USER' as const, status: 'active' as const, active: true, createdAt: '2024-01-01', password: 'h' };
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([existing]));
    const { saveUser, getUserById } = await import('@/lib/db');
    const updated = { ...existing, name: 'New' };
    await saveUser(updated);
    // in-memory cache should reflect updated name
    expect(getUserById('u1')?.name).toBe('New');
  });
});

// ── getCurrentWochenthema ─────────────────────────────────────────────────────

describe('db – getCurrentWochenthema', () => {
  const themes = [
    { id: 'w1', week: '2024-W01', status: 'published', title: 'First', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
    { id: 'w2', week: '2024-W02', status: 'draft', title: 'Draft', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
    { id: 'w3', week: '2024-W03', status: 'published', title: 'Latest', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(themes));
  });
  afterEach(() => vi.restoreAllMocks());

  it('returns the last published theme', async () => {
    const { getCurrentWochenthema } = await import('@/lib/db');
    expect(getCurrentWochenthema()?.id).toBe('w3');
  });

  it('returns undefined when no published themes exist', async () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([themes[1]]));
    const { getCurrentWochenthema } = await import('@/lib/db');
    expect(getCurrentWochenthema()).toBeUndefined();
  });
});
