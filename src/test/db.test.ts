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
  const tageswortList = [
    { id: 't1', date: '2026-04-10', published: true, verse: 'old', text: 'old text', context: '', questions: [] },
    { id: 't2', date: '2026-04-11', published: true, verse: 'John 3:16', text: 'For God…', context: '', questions: [] },
    { id: 't3', date: '2026-04-11', published: false, verse: 'Draft', text: 'draft', context: '', questions: [] },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T10:00:00Z'));
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(tageswortList));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns today's published tageswort", async () => {
    const { getTodayTageswort } = await import('@/lib/db');
    expect(getTodayTageswort()?.id).toBe('t2');
  });

  it('does not return unpublished entries', async () => {
    const { getTodayTageswort } = await import('@/lib/db');
    expect(getTodayTageswort()?.id).not.toBe('t3');
  });

  it('uses the previous day before 03:00 Europe/Berlin', async () => {
    vi.setSystemTime(new Date('2026-04-11T00:30:00Z'));
    const { getTodayTageswort } = await import('@/lib/db');
    expect(getTodayTageswort()?.id).toBe('t1');
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

describe('db – getBuchempfehlungen', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T12:00:00Z'));
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([
      { id: 'b1', createdAt: '2026-04-11T00:00:00Z', status: 'published' },
      { id: 'b2', createdAt: '2025-12-01T00:00:00Z', status: 'published' },
    ]));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns stored entries without deleting older archive items', async () => {
    const { getBuchempfehlungen } = await import('@/lib/db');
    expect(getBuchempfehlungen().map(item => item.id)).toEqual(['b1', 'b2']);
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
    delete process.env.VERCEL;
    delete process.env.ENABLE_GITHUB_DATA_SYNC;
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

  it('still writes locally when a generic GITHUB_TOKEN is present outside Vercel', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    const { saveUser } = await import('@/lib/db');
    const user = { id: 'u100', email: 'local@test.de', name: 'Local', role: 'USER' as const, status: 'active' as const, active: true, createdAt: '2024-01-01', password: 'hash' };
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
    { id: 'w1', week: '2026-W15', status: 'published', title: 'Week 15', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
    { id: 'w2', week: '2026-W16', status: 'draft', title: 'Draft', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
    { id: 'w3', week: '2026-W16', status: 'published', title: 'Week 16', introduction: '', bibleVerses: [], problemStatement: '', researchQuestions: [] },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-12T01:30:00Z'));
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(themes));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the theme matching the effective publication week', async () => {
    const { getCurrentWochenthema } = await import('@/lib/db');
    expect(getCurrentWochenthema()?.id).toBe('w3');
  });

  it('returns undefined when no published themes exist', async () => {
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([themes[1]]));
    const { getCurrentWochenthema } = await import('@/lib/db');
    expect(getCurrentWochenthema()).toBeUndefined();
  });

  it('keeps the previous week before the Sunday 03:00 Europe/Berlin switch', async () => {
    vi.setSystemTime(new Date('2026-04-12T00:30:00Z'));
    const { getCurrentWochenthema } = await import('@/lib/db');
    expect(getCurrentWochenthema()?.id).toBe('w1');
  });
});

// ── deleteContentItem ─────────────────────────────────────────────────────────

describe('db – deleteContentItem', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('removes a these by id and returns true', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{ id: 'th1', userId: 'u1' }, { id: 'th2', userId: 'u2' }]));
    const { deleteContentItem } = await import('@/lib/db');
    const result = await deleteContentItem('these', 'th1');
    expect(result).toBe(true);
    const written = JSON.parse((fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string);
    expect(written).toHaveLength(1);
    expect(written[0].id).toBe('th2');
  });

  it('returns false when the item does not exist', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{ id: 'th1', userId: 'u1' }]));
    const { deleteContentItem } = await import('@/lib/db');
    const result = await deleteContentItem('these', 'not-there');
    expect(result).toBe(false);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('removes a video by id', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify([{ id: 'v1', userId: 'u1', status: 'published' }]));
    const { deleteContentItem } = await import('@/lib/db');
    const result = await deleteContentItem('video', 'v1');
    expect(result).toBe(true);
  });
});

// ── deleteUserAccount ─────────────────────────────────────────────────────────

describe('db – deleteUserAccount', () => {
  const user = { id: 'u1', email: 'a@b.de', name: 'Alice', role: 'USER', status: 'active', active: true, createdAt: '2024-01-01', password: 'h' };
  const these = [{ id: 'th1', userId: 'u1' }, { id: 'th2', userId: 'u2' }];
  const forschung = [{ id: 'f1', userId: 'u1' }, { id: 'f2', userId: 'u2' }];
  const gebete = [{ id: 'g1', userId: 'u1' }, { id: 'g2', userId: 'u2' }];
  const videos = [{ id: 'v1', userId: 'u1' }, { id: 'v2', userId: 'u2' }];
  const aktionen = [{ id: 'a1', userId: 'u1' }, { id: 'a2', userId: 'u2' }];
  const buchempfehlungen = [{ id: 'b1', userId: 'u1' }, { id: 'b2', userId: 'u2' }];
  const fragestellungen = [
    { id: 'frage1', userId: 'u1', authorName: 'Alice', title: 'Frage 1', content: 'Inhalt 1', createdAt: '2024-01-01T09:00:00Z', answers: [] },
    {
      id: 'frage2',
      userId: 'u2',
      authorName: 'Bob',
      title: 'Frage 2',
      content: 'Inhalt 2',
      createdAt: '2024-01-01T09:30:00Z',
      answers: [
        { id: 'ant1', userId: 'u1', authorName: 'Alice', content: 'Antwort', createdAt: '2024-01-01T09:45:00Z' },
        { id: 'ant2', userId: 'u2', authorName: 'Bob', content: 'Bleibt', createdAt: '2024-01-01T10:00:00Z' },
      ],
    },
  ];
  const messages = [
    { id: 'm1', fromUserId: 'u1', toUserId: 'u2', content: 'hi', createdAt: '2024-01-01T10:00:00Z' },
    { id: 'm2', fromUserId: 'u3', toUserId: 'u4', content: 'other', createdAt: '2024-01-01T11:00:00Z' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    delete process.env.VERCEL;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    vi.spyOn(fs, 'readFileSync').mockImplementation((p) => {
      const file = String(p);
      if (file.endsWith('users.json')) return JSON.stringify([user]);
      if (file.endsWith('thesen.json')) return JSON.stringify(these);
      if (file.endsWith('forschung.json')) return JSON.stringify(forschung);
      if (file.endsWith('gebete.json')) return JSON.stringify(gebete);
      if (file.endsWith('videos.json')) return JSON.stringify(videos);
      if (file.endsWith('aktionen.json')) return JSON.stringify(aktionen);
      if (file.endsWith('buchempfehlungen.json')) return JSON.stringify(buchempfehlungen);
      if (file.endsWith('fragestellungen.json')) return JSON.stringify(fragestellungen);
      if (file.endsWith('messages.json')) return JSON.stringify(messages);
      return JSON.stringify([]);
    });
  });
  afterEach(() => {
    delete process.env.VERCEL;
    vi.restoreAllMocks();
  });

  it('removes the user and their content from all collections', async () => {
    const { deleteUserAccount } = await import('@/lib/db');
    await deleteUserAccount('u1');

    // Find the call that wrote users.json and check the user was removed
    const writeCalls = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls;
    const usersWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('users.json'));
    expect(usersWrite).toBeDefined();
    const writtenUsers = JSON.parse(usersWrite![1] as string);
    expect(writtenUsers.find((u: { id: string }) => u.id === 'u1')).toBeUndefined();

    // Thesen of u1 should be removed
    const thesenWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('thesen.json'));
    const writtenThesen = JSON.parse(thesenWrite![1] as string);
    expect(writtenThesen).toHaveLength(1);
    expect(writtenThesen[0].id).toBe('th2');

    const forschungWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('forschung.json'));
    expect(JSON.parse(forschungWrite![1] as string)).toEqual([{ id: 'f2', userId: 'u2' }]);

    const gebeteWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('gebete.json'));
    expect(JSON.parse(gebeteWrite![1] as string)).toEqual([{ id: 'g2', userId: 'u2' }]);

    const videosWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('videos.json'));
    expect(JSON.parse(videosWrite![1] as string)).toEqual([{ id: 'v2', userId: 'u2' }]);

    const aktionenWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('aktionen.json'));
    expect(JSON.parse(aktionenWrite![1] as string)).toEqual([{ id: 'a2', userId: 'u2' }]);

    const buchempfehlungenWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('buchempfehlungen.json'));
    expect(JSON.parse(buchempfehlungenWrite![1] as string)).toEqual([{ id: 'b2', userId: 'u2' }]);

    const fragestellungenWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('fragestellungen.json'));
    expect(JSON.parse(fragestellungenWrite![1] as string)).toEqual([
      {
        id: 'frage2',
        userId: 'u2',
        authorName: 'Bob',
        title: 'Frage 2',
        content: 'Inhalt 2',
        createdAt: '2024-01-01T09:30:00Z',
        answers: [
          { id: 'ant2', userId: 'u2', authorName: 'Bob', content: 'Bleibt', createdAt: '2024-01-01T10:00:00Z' },
        ],
      },
    ]);

    // Messages involving u1 should be removed
    const msgWrite = writeCalls.find((c: unknown[]) => String(c[0]).endsWith('messages.json'));
    const writtenMsgs = JSON.parse(msgWrite![1] as string);
    expect(writtenMsgs).toHaveLength(1);
    expect(writtenMsgs[0].id).toBe('m2');
  });

  it('writes hard-delete updates sequentially when using GitHub-backed storage', async () => {
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.VERCEL = '1';
    // users, thesen, forschung, gebete, videos, aktionen, buchempfehlungen, messages, fragestellungen
    const EXPECTED_DELETION_FILE_COUNT = 9;

    const getContent = vi.fn().mockResolvedValue({ data: { sha: 'sha-1' } });
    let activeWrites = 0;
    let maxActiveWrites = 0;
    const createOrUpdateFileContents = vi.fn().mockImplementation(async () => {
      activeWrites += 1;
      maxActiveWrites = Math.max(maxActiveWrites, activeWrites);
      if (activeWrites > 1) {
        activeWrites -= 1;
        throw new Error('deleteUserAccount must not overlap GitHub writes');
      }
      await new Promise(resolve => setTimeout(resolve, 5));
      activeWrites -= 1;
    });
    class MockOctokit {
      repos = {
        getContent,
        createOrUpdateFileContents,
      };
    }

    vi.doMock('@octokit/rest', () => ({
      Octokit: MockOctokit,
    }));

    const { deleteUserAccount } = await import('@/lib/db');
    await deleteUserAccount('u1');

    expect(getContent).toHaveBeenCalledTimes(EXPECTED_DELETION_FILE_COUNT);
    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(EXPECTED_DELETION_FILE_COUNT);
    expect(maxActiveWrites).toBe(1);
  });
});

// ── markMessagesAsRead ────────────────────────────────────────────────────────

describe('db – markMessagesAsRead', () => {
  const messages = [
    { id: 'm1', fromUserId: 'u2', toUserId: 'u1', content: 'Hi', createdAt: '2024-01-01T10:00:00Z', readAt: undefined },
    { id: 'm2', fromUserId: 'u2', toUserId: 'u1', content: 'Hey', createdAt: '2024-01-01T10:01:00Z', readAt: undefined },
    { id: 'm3', fromUserId: 'u1', toUserId: 'u2', content: 'Hello', createdAt: '2024-01-01T11:00:00Z', readAt: undefined },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(messages));
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('marks all matching unread messages as read', async () => {
    const { markMessagesAsRead } = await import('@/lib/db');
    await markMessagesAsRead('u1', 'u2');
    const written = JSON.parse((fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string);
    // m1 and m2 are from u2 to u1 – should be read now
    expect(written.find((m: { id: string }) => m.id === 'm1').readAt).toBeTruthy();
    expect(written.find((m: { id: string }) => m.id === 'm2').readAt).toBeTruthy();
    // m3 is from u1 to u2 – should not be marked
    expect(written.find((m: { id: string }) => m.id === 'm3').readAt).toBeUndefined();
  });
});

// ── deleteConversation ────────────────────────────────────────────────────────

describe('db – deleteConversation', () => {
  const messages = [
    { id: 'm1', fromUserId: 'u1', toUserId: 'u2', content: 'Hi', createdAt: '2024-01-01T10:00:00Z' },
    { id: 'm2', fromUserId: 'u2', toUserId: 'u1', content: 'Hey', createdAt: '2024-01-01T10:01:00Z' },
    { id: 'm3', fromUserId: 'u1', toUserId: 'u3', content: 'Hello', createdAt: '2024-01-01T11:00:00Z' },
  ];

  beforeEach(() => {
    vi.resetModules();
    delete process.env.GITHUB_TOKEN;
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(messages));
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('removes all messages between two users and preserves others', async () => {
    const { deleteConversation } = await import('@/lib/db');
    await deleteConversation('u1', 'u2');
    const written = JSON.parse((fs.writeFileSync as ReturnType<typeof vi.fn>).mock.calls[0][1] as string);
    expect(written).toHaveLength(1);
    expect(written[0].id).toBe('m3');
  });
});
