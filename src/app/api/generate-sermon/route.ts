import fs from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getCurrentPublicationDate } from '@/lib/publishing';
import { getLiturgicalDay } from '@/lib/churchCalendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DailySermonResponse = {
  date: string;
  liturgicalDay: string;
  title: string;
  content: string;
  prayer: string;
  cached: boolean;
};

type StoredDailySermon = Omit<DailySermonResponse, 'cached'> & {
  createdAt: string;
};

type SermonHistoryEntry = {
  date: string;
  liturgicalDay: string;
  title: string;
  normalizedTitle: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DAILY_SERMON_FILE = path.join(DATA_DIR, 'daily-sermon.json');
const SERMON_HISTORY_FILE = path.join(DATA_DIR, 'sermon-history.json');
const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_GENERATION_ATTEMPTS = 4;
const MIN_TITLE_LENGTH_FOR_SUBSTRING_CHECK = 12;
const SERMON_WORD_COUNT_RANGE = '300-400 Wörter';
const OPENAI_TEMPERATURE = 0.85;
const OPENAI_MAX_TOKENS = 700;

let sermonCache: StoredDailySermon | null = null;
let inFlightGeneration: Promise<StoredDailySermon> | null = null;

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY fehlt');
  }

  return new OpenAI({ apiKey });
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
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
  const stopWords = new Set([
    'der', 'die', 'das', 'ein', 'eine', 'und', 'oder', 'aber', 'nicht', 'doch', 'den', 'dem', 'des',
    'zu', 'zur', 'zum', 'im', 'in', 'am', 'an', 'auf', 'mit', 'für', 'von', 'ist', 'wir', 'du',
  ]);

  return normalizeTitle(title)
    .split(' ')
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function areTitlesTooSimilar(title: string, history: SermonHistoryEntry[]): boolean {
  const normalizedTitle = normalizeTitle(title);
  const tokens = new Set(titleTokens(title));

  return history.some((entry) => {
    if (!entry.title) return false;
    if (entry.normalizedTitle === normalizedTitle) return true;
    if (
      normalizedTitle.length >= MIN_TITLE_LENGTH_FOR_SUBSTRING_CHECK
      && (normalizedTitle.includes(entry.normalizedTitle) || entry.normalizedTitle.includes(normalizedTitle))
    ) {
      return true;
    }

    const entryTokens = new Set(titleTokens(entry.title));
    if (tokens.size === 0 || entryTokens.size === 0) return false;

    const overlap = [...tokens].filter((token) => entryTokens.has(token)).length;
    const ratio = overlap / Math.min(tokens.size, entryTokens.size);
    return ratio >= 0.75;
  });
}

function parseSermonPayload(rawContent: string, date: string, liturgicalDay: string): StoredDailySermon {
  const cleaned = rawContent.replace(/\r/g, '').replace(/\*\*/g, '').trim();
  const match = cleaned.match(/TITEL:\s*(.+?)\n+PREDIGT:\s*([\s\S]+?)\n+GEBET:\s*([\s\S]+)/i);

  if (!match) {
    throw new Error('Die KI-Antwort hat nicht das erwartete Format.');
  }

  const [, rawTitle, rawSermon, rawPrayer] = match;
  const title = rawTitle.trim();
  const content = rawSermon.trim();
  const prayer = rawPrayer.trim();

  if (!title || !content || !prayer) {
    throw new Error('Die KI-Antwort ist unvollständig.');
  }

  return {
    date,
    liturgicalDay,
    title,
    content,
    prayer,
    createdAt: new Date().toISOString(),
  };
}

async function ensureDataDirectory(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
}

async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
}

async function readStoredDailySermon(): Promise<StoredDailySermon | null> {
  const sermon = await readJsonFile<StoredDailySermon | null>(DAILY_SERMON_FILE, null);
  if (!sermon || typeof sermon !== 'object') return null;
  return sermon;
}

async function readSermonHistory(): Promise<SermonHistoryEntry[]> {
  const history = await readJsonFile<SermonHistoryEntry[]>(SERMON_HISTORY_FILE, []);
  return Array.isArray(history) ? history : [];
}

async function persistSermon(sermon: StoredDailySermon, history: SermonHistoryEntry[]): Promise<void> {
  const nextHistory = [
    ...history,
    {
      date: sermon.date,
      liturgicalDay: sermon.liturgicalDay,
      title: sermon.title,
      normalizedTitle: normalizeTitle(sermon.title),
      createdAt: sermon.createdAt,
    },
  ];

  await Promise.all([
    writeJsonFile(DAILY_SERMON_FILE, sermon),
    writeJsonFile(SERMON_HISTORY_FILE, nextHistory),
  ]);
}

async function requestUniqueSermon(date: string, liturgicalDay: string, history: SermonHistoryEntry[]): Promise<StoredDailySermon> {
  const openai = getOpenAiClient();
  const recentTitles = history.slice(-12).map((entry) => `- ${entry.title}`).join('\n');
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'Du schreibst deutschsprachige, seelsorglich warme Tagespredigten für eine christliche Website. Halte dich exakt an das gewünschte Format.',
    },
    {
      role: 'user',
      content: [
        `Erstelle eine kurze Tagespredigt (ca. 300-400 Wörter) für den ${liturgicalDay}.`,
        `Die Predigt soll ungefähr ${SERMON_WORD_COUNT_RANGE} umfassen.`,
        'Stil: warm, einladend, nicht dogmatisch, mit Bibelbezug, praktischem Impuls und einem kurzen Gebet.',
        'Verwende einen neuen, klar unterscheidbaren Titel.',
        recentTitles ? `Bereits verwendete Titel:\n${recentTitles}` : 'Es gibt noch keine früheren Titel.',
        'Format:',
        'TITEL: ...',
        'PREDIGT: ...',
        'GEBET: ...',
      ].join('\n'),
    },
  ];

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: OPENAI_TEMPERATURE,
      max_tokens: OPENAI_MAX_TOKENS,
      messages,
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();
    if (!rawContent) {
      throw new Error('Leere Antwort von OpenAI');
    }

    const sermon = parseSermonPayload(rawContent, date, liturgicalDay);
    if (!areTitlesTooSimilar(sermon.title, history)) {
      return sermon;
    }

    messages.push({ role: 'assistant', content: rawContent });
    messages.push({
      role: 'user',
      content: `Der Titel "${sermon.title}" ist zu ähnlich zu bereits verwendeten Titeln. Bitte liefere eine neue Predigt mit einem deutlich anderen Titel und bleibe exakt im Format TITEL / PREDIGT / GEBET.`,
    });
  }

  throw new Error('Es konnte keine ausreichend neue Predigt erzeugt werden.');
}

function toApiResponse(sermon: StoredDailySermon, cached: boolean): DailySermonResponse {
  return {
    date: sermon.date,
    liturgicalDay: sermon.liturgicalDay,
    title: sermon.title,
    content: sermon.content,
    prayer: sermon.prayer,
    cached,
  };
}

async function getOrCreateDailySermon(): Promise<DailySermonResponse> {
  const publicationDate = getCurrentPublicationDate();

  if (sermonCache?.date === publicationDate) {
    return toApiResponse(sermonCache, true);
  }

  const storedSermon = await readStoredDailySermon();
  if (storedSermon?.date === publicationDate) {
    sermonCache = storedSermon;
    return toApiResponse(storedSermon, true);
  }

  if (!inFlightGeneration) {
    inFlightGeneration = (async () => {
      const liturgicalDay = getLiturgicalDay(parseIsoDate(publicationDate));
      const history = await readSermonHistory();
      const sermon = await requestUniqueSermon(publicationDate, liturgicalDay, history);
      await persistSermon(sermon, history);
      sermonCache = sermon;
      return sermon;
    })();
  }

  try {
    const sermon = await inFlightGeneration;
    return toApiResponse(sermon, false);
  } finally {
    inFlightGeneration = null;
  }
}

export async function GET() {
  try {
    const sermon = await getOrCreateDailySermon();
    return NextResponse.json(sermon);
  } catch (error) {
    console.error('[generate-sermon] Fehler bei der Predigtgenerierung:', error);
    return NextResponse.json(
      {
        error: 'Die Tagespredigt konnte nicht generiert werden.',
        ...(process.env.NODE_ENV !== 'production' && error instanceof Error
          ? { details: error.message }
          : {}),
      },
      { status: 500 },
    );
  }
}
