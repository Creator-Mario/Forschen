import fs from 'fs';
import path from 'path';
import type {
  User, Tageswort, Wochenthema, These, ForschungsBeitrag,
  Gebet, Video, Aktion, SpendenRecord
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

async function writeJson<T>(filename: string, data: T[]): Promise<void> {
  // Update in-memory cache so this process instance sees the change immediately.
  memoryCache.set(filename, data as unknown[]);

  if (process.env.GITHUB_TOKEN) {
    // Production (Vercel): commit data changes back to the GitHub repo via the API.
    // This way the JSON files in the repo are the persistent store across deployments.
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const filePath = `data/${filename}`;
    const encoded = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf-8').toString('base64');

    try {
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
    } catch (error) {
      console.error(`GitHub write failed for ${filename}:`, error);
    }
  } else {
    // Development: write directly to local filesystem.
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// Users
export function getUsers(): User[] {
  return readJson<User>('users.json');
}
export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}
export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email === email);
}
export async function saveUser(user: User): Promise<void> {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) users[idx] = user;
  else users.push(user);
  await writeJson('users.json', users);
}

// Tageswort
export function getTageswortList(): Tageswort[] {
  return readJson<Tageswort>('tageswort.json');
}
export function getTodayTageswort(): Tageswort | undefined {
  const today = new Date().toISOString().split('T')[0];
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

// Wochenthema
export function getWochenthemaList(): Wochenthema[] {
  return readJson<Wochenthema>('wochenthema.json');
}
export function getCurrentWochenthema(): Wochenthema | undefined {
  const published = getWochenthemaList().filter(w => w.status === 'published');
  return published.at(-1);
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

// Thesen
export function getThesen(): These[] {
  return readJson<These>('thesen.json');
}
export function getApprovedThesen(): These[] {
  return getThesen().filter(t => t.status === 'approved');
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
  return getForschung().filter(f => f.status === 'approved');
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
  return getGebete().filter(g => g.status === 'approved');
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
  return getVideos().filter(v => v.status === 'approved');
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
  return getAktionen().filter(a => a.status === 'approved');
}
export async function saveAktion(aktion: Aktion): Promise<void> {
  const list = getAktionen();
  const idx = list.findIndex(a => a.id === aktion.id);
  if (idx >= 0) list[idx] = aktion;
  else list.push(aktion);
  await writeJson('aktionen.json', list);
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

