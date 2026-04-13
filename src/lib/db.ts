import fs from 'fs';
import path from 'path';
import { normalizeEmail } from '@/lib/utils';
import { getCurrentPublicationDate, getCurrentPublicationWeek } from '@/lib/publishing';
import type {
  User, Tageswort, Wochenthema, These, ForschungsBeitrag,
  Gebet, Video, Aktion, SpendenRecord, AdminLog, ChatMessage, NutzerBuchempfehlung, CommunityQuestion
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Creator-Mario';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Forschen';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// In-memory overlay so writes are immediately visible within the current process instance.
const memoryCache = new Map<string, unknown[]>();

function readJson<T>(filename: string): T[] {
  if (memoryCache.has(filename)) return memoryCache.get(filename) as T[];
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

async function readJsonFresh<T>(filename: string): Promise<T[]> {
  if (!shouldUseGithubBackedStorage()) {
    return readJson<T>(filename);
  }

  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: `data/${filename}`,
      ref: GITHUB_BRANCH,
    });

    if (Array.isArray(data) || !('content' in data) || typeof data.content !== 'string') {
      throw new Error(`Unerwartetes GitHub-Antwortformat für ${filename}`);
    }

    const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as T[];
    memoryCache.set(filename, parsed as unknown[]);
    return parsed;
  } catch (error) {
    console.error(`[db] GitHub read failed for ${filename}; falling back to local data:`, error);
    return readJson<T>(filename);
  }
}

function writeJsonToLocalFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function shouldUseGithubBackedStorage(): boolean {
  if (!process.env.GITHUB_TOKEN) return false;
  // Local shells (including CI/sandbox environments) often expose GITHUB_TOKEN
  // for repository APIs, but app data should still be written to the checked-out
  // JSON files there. Restrict GitHub-backed persistence to real Vercel runtime
  // or an explicit opt-in override.
  return process.env.VERCEL === '1' || process.env.ENABLE_GITHUB_DATA_SYNC === 'true';
}

async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  // Update in-memory cache so this process instance sees the change immediately.
  memoryCache.set(filename, data as unknown[]);

  if (shouldUseGithubBackedStorage()) {
    // Production (Vercel): commit data changes back to the GitHub repo via the API.
    // This way the JSON files in the repo are the persistent store across deployments.
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const filePath = `data/${filename}`;
    const encoded = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf-8').toString('base64');

    // Retry up to 3 times to handle SHA conflicts from concurrent writes (Vercel serverless).
    const MAX_RETRIES = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Always re-fetch the current SHA on each attempt so we have the latest.
        const { data: existing } = await octokit.repos.getContent({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: filePath,
          ref: GITHUB_BRANCH,
        });
        const sha =
          !Array.isArray(existing) && 'sha' in existing
            ? (existing.sha as string)
            : undefined;

        await octokit.repos.createOrUpdateFileContents({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          path: filePath,
          branch: GITHUB_BRANCH,
          message: `data: update ${filename}`,
          content: encoded,
          sha,
        });

        return; // Success — exit the retry loop.
      } catch (error) {
        lastError = error;
        const status = (error as { status?: number }).status;
        // 422 = SHA conflict (another write raced us); wait briefly and retry.
        if (status === 422 && attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, 200 * attempt));
          continue;
        }
        // For any other error, or after all retries exhausted, give up.
        break;
      }
    }

    console.error(`[db] GitHub write failed for ${filename} after ${MAX_RETRIES} attempts:`, lastError);
    throw new Error(
      `Datenpersistenz fehlgeschlagen: ${filename}. ${lastError instanceof Error ? lastError.message : String(lastError)}`
    );
  } else {
    // Development: write directly to local filesystem.
    writeJsonToLocalFile(filename, data);
  }
}

// Users
export function getUsers(): User[] {
  return readJson<User>('users.json');
}
export async function getUsersFresh(): Promise<User[]> {
  return readJsonFresh<User>('users.json');
}
export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}
export async function getUserByIdFresh(id: string): Promise<User | undefined> {
  const users = await getUsersFresh();
  return users.find(u => u.id === id);
}
export function getUserByEmail(email: string): User | undefined {
  const normalizedEmail = normalizeEmail(email);
  return getUsers().find(u => normalizeEmail(u.email) === normalizedEmail);
}
export async function getUserByEmailFresh(email: string): Promise<User | undefined> {
  const normalizedEmail = normalizeEmail(email);
  const users = await getUsersFresh();
  return users.find(u => normalizeEmail(u.email) === normalizedEmail);
}
export function getUserByEmailToken(token: string): User | undefined {
  return getUsers().find(u => u.emailToken === token);
}
export async function getUserByEmailTokenFresh(token: string): Promise<User | undefined> {
  const users = await getUsersFresh();
  return users.find(u => u.emailToken === token);
}
export function getAwaitingReviewUsers(): User[] {
  return getUsers().filter(u => u.role !== 'ADMIN' && (
    u.status === 'awaiting_admin_review' ||
    u.status === 'question_to_user' ||
    u.status === 'postponed'
  ));
}
export async function saveUser(user: User): Promise<void> {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await writeJson('users.json', users);
}

/** Hard-delete a user and every piece of content they created. */
export async function deleteUserAccount(userId: string): Promise<void> {
  // Read all collections first, then filter, then write — avoids interleaved reads/writes.
  const [users, thesen, forschung, gebete, videos, aktionen, buchempfehlungen, messages, fragestellungen] = await Promise.all([
    Promise.resolve(getUsers()),
    Promise.resolve(getThesen()),
    Promise.resolve(getForschung()),
    Promise.resolve(getGebete()),
    Promise.resolve(getVideos()),
    Promise.resolve(getAktionen()),
    Promise.resolve(getBuchempfehlungen()),
    Promise.resolve(getChatMessages()),
    Promise.resolve(getCommunityQuestions()),
  ]);

  const deletions: Array<[string, unknown[]]> = [
    ['users.json', users.filter(u => u.id !== userId)],
    ['thesen.json', thesen.filter(t => t.userId !== userId)],
    ['forschung.json', forschung.filter(f => f.userId !== userId)],
    ['gebete.json', gebete.filter(g => g.userId !== userId)],
    ['videos.json', videos.filter(v => v.userId !== userId)],
    ['aktionen.json', aktionen.filter(a => a.userId !== userId)],
    ['buchempfehlungen.json', buchempfehlungen.filter(b => b.userId !== userId)],
    ['messages.json', messages.filter(m => m.fromUserId !== userId && m.toUserId !== userId)],
    ['fragestellungen.json', fragestellungen
      .filter(q => q.userId !== userId)
      .map(q => ({ ...q, answers: q.answers.filter(answer => answer.userId !== userId) }))],
  ];

  for (const [filename, data] of deletions) {
    await writeJson(filename, data);
  }
}

// Admin Logs (append-only, never deleted)
export function getAdminLogs(): AdminLog[] {
  return readJson<AdminLog>('admin-logs.json');
}
export async function saveAdminLog(log: AdminLog): Promise<void> {
  const logs = getAdminLogs();
  logs.push(log);
  await writeJson('admin-logs.json', logs);
}

// Tageswort
export function getTageswortList(): Tageswort[] {
  return readJson<Tageswort>('tageswort.json');
}
export function getTodayTageswort(): Tageswort | undefined {
  const today = getCurrentPublicationDate();
  const list = getTageswortList();
  return list.find(t => t.date === today && t.published) || list.filter(t => t.published).at(-1);
}
export function getTageswortById(id: string): Tageswort | undefined {
  return getTageswortList().find(t => t.id === id);
}
export async function saveTageswort(entry: Tageswort): Promise<void> {
  const list = getTageswortList();
  const idx = list.findIndex(t => t.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await writeJson('tageswort.json', list);
}

export async function deleteTageswort(id: string): Promise<boolean> {
  const list = getTageswortList();
  const next = list.filter(t => t.id !== id);
  if (next.length === list.length) return false;
  await writeJson('tageswort.json', next);
  return true;
}

// Wochenthema
export function getWochenthemaList(): Wochenthema[] {
  return readJson<Wochenthema>('wochenthema.json');
}
export function getCurrentWochenthema(): Wochenthema | undefined {
  const published = getWochenthemaList().filter(w => w.status === 'published');
  const currentWeek = getCurrentPublicationWeek();
  return published.find(w => w.week === currentWeek) || published.at(-1);
}
export function getWochenthemaById(id: string): Wochenthema | undefined {
  return getWochenthemaList().find(w => w.id === id);
}
export async function saveWochenthema(entry: Wochenthema): Promise<void> {
  const list = getWochenthemaList();
  const idx = list.findIndex(w => w.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await writeJson('wochenthema.json', list);
}

export async function deleteWochenthema(id: string): Promise<boolean> {
  const list = getWochenthemaList();
  const next = list.filter(w => w.id !== id);
  if (next.length === list.length) return false;
  await writeJson('wochenthema.json', next);
  return true;
}

// Thesen
export function getThesen(): These[] {
  return readJson<These>('thesen.json');
}
export function getApprovedThesen(): These[] {
  return getThesen().filter(t => t.status === 'approved' || t.status === 'published');
}
export function getTheseById(id: string): These | undefined {
  return getThesen().find(t => t.id === id);
}
export async function saveThese(these: These): Promise<void> {
  const list = getThesen();
  const idx = list.findIndex(t => t.id === these.id);
  if (idx >= 0) list[idx] = these;
  else list.push(these);
  await writeJson('thesen.json', list);
}

// Forschung
export function getForschung(): ForschungsBeitrag[] {
  return readJson<ForschungsBeitrag>('forschung.json');
}
export function getApprovedForschung(): ForschungsBeitrag[] {
  return getForschung().filter(f => f.status === 'approved' || f.status === 'published');
}
export async function saveForschung(beitrag: ForschungsBeitrag): Promise<void> {
  const list = getForschung();
  const idx = list.findIndex(f => f.id === beitrag.id);
  if (idx >= 0) list[idx] = beitrag;
  else list.push(beitrag);
  await writeJson('forschung.json', list);
}

// Gebete
export function getGebete(): Gebet[] {
  return readJson<Gebet>('gebete.json');
}
export function getApprovedGebete(): Gebet[] {
  return getGebete().filter(g => g.status === 'approved' || g.status === 'published');
}
export async function saveGebet(gebet: Gebet): Promise<void> {
  const list = getGebete();
  const idx = list.findIndex(g => g.id === gebet.id);
  if (idx >= 0) list[idx] = gebet;
  else list.push(gebet);
  await writeJson('gebete.json', list);
}

// Videos
export function getVideos(): Video[] {
  return readJson<Video>('videos.json');
}
export function getApprovedVideos(): Video[] {
  return getVideos().filter(v => v.status === 'approved' || v.status === 'published');
}
export async function saveVideo(video: Video): Promise<void> {
  const list = getVideos();
  const idx = list.findIndex(v => v.id === video.id);
  if (idx >= 0) list[idx] = video;
  else list.push(video);
  await writeJson('videos.json', list);
}

// Aktionen
export function getAktionen(): Aktion[] {
  return readJson<Aktion>('aktionen.json');
}
export function getApprovedAktionen(): Aktion[] {
  return getAktionen().filter(a => a.status === 'approved' || a.status === 'published');
}
export async function saveAktion(aktion: Aktion): Promise<void> {
  const list = getAktionen();
  const idx = list.findIndex(a => a.id === aktion.id);
  if (idx >= 0) list[idx] = aktion;
  else list.push(aktion);
  await writeJson('aktionen.json', list);
}

// Buchempfehlungen
export function getBuchempfehlungen(): NutzerBuchempfehlung[] {
  return readJson<NutzerBuchempfehlung>('buchempfehlungen.json');
}
export function getApprovedBuchempfehlungen(): NutzerBuchempfehlung[] {
  return getBuchempfehlungen().filter(b => b.status === 'approved' || b.status === 'published');
}
export async function saveBuchempfehlung(entry: NutzerBuchempfehlung): Promise<void> {
  const list = getBuchempfehlungen();
  const idx = list.findIndex(b => b.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await writeJson('buchempfehlungen.json', list);
}

/**
 * Hard-delete a single content item by type and id.
 * Returns true if the item was found and removed, false otherwise.
 */
export async function deleteContentItem(
  type: 'these' | 'forschung' | 'gebet' | 'video' | 'aktion' | 'buchempfehlung',
  id: string,
): Promise<boolean> {
  switch (type) {
    case 'these': {
      const list = getThesen();
      const next = list.filter(t => t.id !== id);
      if (next.length === list.length) return false;
      await writeJson('thesen.json', next);
      return true;
    }
    case 'forschung': {
      const list = getForschung();
      const next = list.filter(f => f.id !== id);
      if (next.length === list.length) return false;
      await writeJson('forschung.json', next);
      return true;
    }
    case 'gebet': {
      const list = getGebete();
      const next = list.filter(g => g.id !== id);
      if (next.length === list.length) return false;
      await writeJson('gebete.json', next);
      return true;
    }
    case 'video': {
      const list = getVideos();
      const next = list.filter(v => v.id !== id);
      if (next.length === list.length) return false;
      await writeJson('videos.json', next);
      return true;
    }
    case 'aktion': {
      const list = getAktionen();
      const next = list.filter(a => a.id !== id);
      if (next.length === list.length) return false;
      await writeJson('aktionen.json', next);
      return true;
    }
    case 'buchempfehlung': {
      const list = getBuchempfehlungen();
      const next = list.filter(b => b.id !== id);
      if (next.length === list.length) return false;
      await writeJson('buchempfehlungen.json', next);
      return true;
    }
    default:
      return false;
  }
}

// Community questions
export function getCommunityQuestions(): CommunityQuestion[] {
  return readJson<CommunityQuestion>('fragestellungen.json');
}

export function getCommunityQuestionById(id: string): CommunityQuestion | undefined {
  return getCommunityQuestions().find(question => question.id === id);
}

export async function saveCommunityQuestion(question: CommunityQuestion): Promise<void> {
  const list = getCommunityQuestions();
  const idx = list.findIndex(item => item.id === question.id);
  if (idx >= 0) list[idx] = question;
  else list.push(question);
  await writeJson('fragestellungen.json', list);
}

// Spenden
export function getSpenden(): SpendenRecord[] {
  return readJson<SpendenRecord>('spenden.json');
}
export async function saveSpende(spende: SpendenRecord): Promise<void> {
  const list = getSpenden();
  list.push(spende);
  await writeJson('spenden.json', list);
}

// Chat Messages
export function getChatMessages(): ChatMessage[] {
  return readJson<ChatMessage>('messages.json');
}
export function getConversation(userId1: string, userId2: string): ChatMessage[] {
  return getChatMessages().filter(
    m => (m.fromUserId === userId1 && m.toUserId === userId2) ||
         (m.fromUserId === userId2 && m.toUserId === userId1)
  ).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
export function getConversationPartners(userId: string): string[] {
  const msgs = getChatMessages().filter(
    m => m.fromUserId === userId || m.toUserId === userId
  );
  const partners = new Set<string>();
  for (const m of msgs) {
    if (m.fromUserId !== userId) partners.add(m.fromUserId);
    if (m.toUserId !== userId) partners.add(m.toUserId);
  }
  return Array.from(partners);
}
export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const list = getChatMessages();
  list.push(msg);
  await writeJson('messages.json', list);
}

export async function markMessagesAsRead(toUserId: string, fromUserId: string): Promise<void> {
  const now = new Date().toISOString();
  const messages = getChatMessages().map(m => {
    if (m.fromUserId === fromUserId && m.toUserId === toUserId && !m.readAt) {
      return { ...m, readAt: now };
    }
    return m;
  });
  await writeJson('messages.json', messages);
}

export async function deleteConversation(userId1: string, userId2: string): Promise<void> {
  const messages = getChatMessages().filter(
    m => !((m.fromUserId === userId1 && m.toUserId === userId2) ||
           (m.fromUserId === userId2 && m.toUserId === userId1))
  );
  await writeJson('messages.json', messages);
}
