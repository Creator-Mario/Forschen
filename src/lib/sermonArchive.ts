import fs from 'node:fs/promises';
import path from 'node:path';

import { readStoredCollectionFresh, writeStoredCollection } from '@/lib/db';

export type ArchivedSermon = {
  date: string;
  liturgicalDay: string;
  title: string;
  content: string;
  prayer: string;
  createdAt: string;
};

const SERMON_ARCHIVE_FILENAME = 'sermon-history.json';
const SERMON_ARCHIVE_DIR = path.join(process.cwd(), 'data', 'sermons');
export const SERMON_ARCHIVE_LIMIT = 50;
const MIN_TITLE_LENGTH_FOR_SUBSTRING_CHECK = 12;
const STOP_WORDS = new Set([
  'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'aber', 'nicht', 'doch', 'den', 'dem', 'des',
  'zu', 'zur', 'zum', 'im', 'in', 'am', 'an', 'auf', 'mit', 'für', 'von', 'ist', 'wir', 'du',
]);

function getSermonFilePath(date: string): string {
  return path.join(SERMON_ARCHIVE_DIR, `${date}.json`);
}

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

function keepLatestSermons(sermons: ArchivedSermon[]): ArchivedSermon[] {
  return [...sermons]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, SERMON_ARCHIVE_LIMIT);
}

async function readStoredArchive(): Promise<ArchivedSermon[]> {
  const sermons = await readStoredCollectionFresh<ArchivedSermon>(SERMON_ARCHIVE_FILENAME);
  return keepLatestSermons(sermons);
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

  await writeStoredCollection(SERMON_ARCHIVE_FILENAME, updated);
}

export async function loadSermon(date: string): Promise<ArchivedSermon | null> {
  const sermons = await readStoredArchive();
  if (sermons.length > 0) {
    return sermons.find((sermon) => sermon.date === date) ?? null;
  }

  await ensureArchiveDirectory();
  return readSermonFile(getSermonFilePath(date));
}

export async function getAllSermons(): Promise<ArchivedSermon[]> {
  const sermons = await readStoredArchive();
  if (sermons.length > 0) {
    return sermons;
  }

  return readLegacyArchiveFromFiles();
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
