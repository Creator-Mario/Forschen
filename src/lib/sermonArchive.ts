import fs from 'node:fs/promises';
import path from 'node:path';

export type ArchivedSermon = {
  date: string;
  liturgicalDay: string;
  title: string;
  content: string;
  prayer: string;
  createdAt: string;
};

type CurrentSermonDocument = ArchivedSermon | null;

const SERMON_ARCHIVE_FILENAME = 'sermon-history.json';
const SERMON_ARCHIVE_FILE_PATH = path.join(process.cwd(), 'data', SERMON_ARCHIVE_FILENAME);
const CURRENT_SERMON_FILENAME = 'daily-sermon.json';
const CURRENT_SERMON_FILE_PATH = path.join(process.cwd(), 'data', CURRENT_SERMON_FILENAME);
const SERMON_ARCHIVE_DIR = path.join(process.cwd(), 'data', 'sermons');
export const SERMON_ARCHIVE_LIMIT = 50;
const MIN_TITLE_LENGTH_FOR_SUBSTRING_CHECK = 12;
const STOP_WORDS = new Set([
  'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'aber', 'nicht', 'doch', 'den', 'dem', 'des',
  'zu', 'zur', 'zum', 'im', 'in', 'am', 'an', 'auf', 'mit', 'für', 'von', 'ist', 'wir', 'du',
]);

function normalizeTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleTokens(title: string): string[] {
  return normalizeTitle(title)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function isArchivedSermon(value: unknown): value is ArchivedSermon {
  if (!value || typeof value !== 'object') return false;
  const sermon = value as Record<string, unknown>;
  return ['date', 'liturgicalDay', 'title', 'content', 'prayer', 'createdAt']
    .every((key) => typeof sermon[key] === 'string');
}

function normalizeSermons(entries: unknown): ArchivedSermon[] {
  if (!Array.isArray(entries)) return [];
  return entries.filter(isArchivedSermon);
}

function sermonsEqual(left: ArchivedSermon[], right: ArchivedSermon[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeSermonSources(...sources: Array<ArchivedSermon[] | CurrentSermonDocument>): ArchivedSermon[] {
  const merged = new Map<string, ArchivedSermon>();

  for (const source of sources) {
    if (!source) continue;
    const sermons = Array.isArray(source) ? source : [source];
    for (const sermon of sermons) {
      if (!isArchivedSermon(sermon) || merged.has(sermon.date)) continue;
      merged.set(sermon.date, sermon);
    }
  }

  return keepLatestSermons([...merged.values()]);
}

export function areSermonTitlesSimilar(left: string, right: string): boolean {
  const normalizedLeft = normalizeTitle(left);
  const normalizedRight = normalizeTitle(right);

  if (!normalizedLeft || !normalizedRight) return false;
  if (normalizedLeft === normalizedRight) return true;

  if (
    normalizedLeft.length >= MIN_TITLE_LENGTH_FOR_SUBSTRING_CHECK
    && (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft))
  ) {
    return true;
  }

  const leftTokens = new Set(titleTokens(left));
  const rightTokens = new Set(titleTokens(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return false;

  const overlap = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return overlap / Math.min(leftTokens.size, rightTokens.size) >= 0.75;
}

// Die Archivstruktur lebt bewusst in einzelnen Tagesdateien, damit tägliche
// Predigten unabhängig gelesen, überschrieben und später leicht erweitert
// werden können, ohne eine große Sammeldatei anfassen zu müssen.
async function ensureArchiveDirectory(): Promise<void> {
  await fs.mkdir(SERMON_ARCHIVE_DIR, { recursive: true });
}

async function readSermonFile(filePath: string): Promise<ArchivedSermon | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ArchivedSermon;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function readStoredArchiveFromLocalFile(): Promise<ArchivedSermon[]> {
  try {
    const content = await fs.readFile(SERMON_ARCHIVE_FILE_PATH, 'utf-8');
    return normalizeSermons(JSON.parse(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeStoredArchiveToLocalFile(sermons: ArchivedSermon[]): Promise<void> {
  await fs.mkdir(path.dirname(SERMON_ARCHIVE_FILE_PATH), { recursive: true });
  await fs.writeFile(SERMON_ARCHIVE_FILE_PATH, JSON.stringify(sermons, null, 2) + '\n', 'utf-8');
}

async function readCurrentSermonFromLocalFile(): Promise<CurrentSermonDocument> {
  try {
    const content = await fs.readFile(CURRENT_SERMON_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content) as unknown;
    return isArchivedSermon(parsed) ? parsed : null;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function writeCurrentSermonToLocalFile(sermon: CurrentSermonDocument): Promise<void> {
  await fs.mkdir(path.dirname(CURRENT_SERMON_FILE_PATH), { recursive: true });
  await fs.writeFile(CURRENT_SERMON_FILE_PATH, JSON.stringify(sermon, null, 2) + '\n', 'utf-8');
}

function keepLatestSermons(sermons: ArchivedSermon[]): ArchivedSermon[] {
  return [...sermons]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, SERMON_ARCHIVE_LIMIT);
}

async function readStoredArchive(): Promise<ArchivedSermon[]> {
  const db = await import('@/lib/db');
  const sermons = Reflect.has(db, 'readStoredCollectionFresh')
    ? await db.readStoredCollectionFresh<ArchivedSermon>(SERMON_ARCHIVE_FILENAME)
    : await readStoredArchiveFromLocalFile();
  return keepLatestSermons(normalizeSermons(sermons));
}

async function writeStoredArchive(sermons: ArchivedSermon[]): Promise<void> {
  const db = await import('@/lib/db');
  if (Reflect.has(db, 'writeStoredCollection')) {
    await db.writeStoredCollection(SERMON_ARCHIVE_FILENAME, sermons);
    return;
  }

  await writeStoredArchiveToLocalFile(sermons);
}

export async function loadCurrentSermon(): Promise<CurrentSermonDocument> {
  const db = await import('@/lib/db');
  if (Reflect.has(db, 'readStoredDocumentFresh')) {
    const sermon = await db.readStoredDocumentFresh<CurrentSermonDocument>(CURRENT_SERMON_FILENAME, null);
    return isArchivedSermon(sermon) ? sermon : null;
  }

  return readCurrentSermonFromLocalFile();
}

export async function saveCurrentSermon(sermon: CurrentSermonDocument): Promise<void> {
  const db = await import('@/lib/db');
  if (Reflect.has(db, 'writeStoredDocument')) {
    await db.writeStoredDocument(CURRENT_SERMON_FILENAME, sermon);
    return;
  }

  await writeCurrentSermonToLocalFile(sermon);
}

async function readLegacyArchiveFromFiles(): Promise<ArchivedSermon[]> {
  await ensureArchiveDirectory();

  const entries = await fs.readdir(SERMON_ARCHIVE_DIR, { withFileTypes: true });
  const sermons = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => readSermonFile(path.join(SERMON_ARCHIVE_DIR, entry.name))),
  );

  return sermons.filter((sermon): sermon is ArchivedSermon => sermon !== null)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export async function saveSermon(sermon: ArchivedSermon): Promise<void> {
  const sermons = await getAllSermons();
  const updated = keepLatestSermons([
    sermon,
    ...sermons.filter((entry) => entry.date !== sermon.date),
  ]);

  await writeStoredArchive(updated);
}

export async function loadSermon(date: string): Promise<ArchivedSermon | null> {
  const sermons = await getAllSermons();
  return sermons.find((sermon) => sermon.date === date) ?? null;
}

export async function getAllSermons(): Promise<ArchivedSermon[]> {
  const [storedSermons, currentSermon, legacySermons] = await Promise.all([
    readStoredArchive(),
    loadCurrentSermon(),
    readLegacyArchiveFromFiles(),
  ]);
  const mergedSermons = mergeSermonSources(storedSermons, currentSermon, legacySermons);

  if (!sermonsEqual(storedSermons, mergedSermons)) {
    await writeStoredArchive(mergedSermons);
  }

  return mergedSermons;
}

export async function getLatestSermons(limit: number): Promise<ArchivedSermon[]> {
  if (limit <= 0) return [];
  const sermons = await getAllSermons();
  return sermons.slice(0, limit);
}

// Die Titelprüfung nutzt eine einfache Ähnlichkeitsheuristik statt nur exakte
// Treffer, damit wiederkehrende Themen mit fast identischer Formulierung früh
// erkannt und bei der KI-Anfrage vermieden werden.
export async function titleExists(title: string): Promise<boolean> {
  const sermons = await getAllSermons();
  return sermons.some((sermon) => areSermonTitlesSimilar(title, sermon.title));
}
