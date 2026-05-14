import { NextResponse } from 'next/server';
import OpenAI from 'openai';

import { getCurrentPublicationDate } from '@/lib/publishing';
import { getLiturgicalDay } from '@/lib/churchCalendar';
import {
  getAllSermons,
  loadSermon,
  saveSermon,
  titleExists,
  type ArchivedSermon,
} from '@/lib/sermonArchive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DailySermonResponse = {
  date: string;
  liturgicalDay: string;
  title: string;
  content: string;
  prayer: string;
  fromCache: boolean;
  archived: boolean;
};

const OPENAI_MODEL = 'gpt-4o-mini';
const MAX_GENERATION_ATTEMPTS = 4;
const SERMON_WORD_COUNT_RANGE = '600-800 Wörter';
const OPENAI_TEMPERATURE = 0.85;
const OPENAI_MAX_TOKENS = 1800;

let sermonCache: ArchivedSermon | null = null;
let inFlightGeneration: Promise<ArchivedSermon> | null = null;

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

function parseSermonPayload(rawContent: string, date: string, liturgicalDay: string): ArchivedSermon {
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

function toApiResponse(sermon: ArchivedSermon, fromCache: boolean): DailySermonResponse {
  return {
    date: sermon.date,
    liturgicalDay: sermon.liturgicalDay,
    title: sermon.title,
    content: sermon.content,
    prayer: sermon.prayer,
    fromCache,
    archived: true,
  };
}

async function requestUniqueSermon(date: string, liturgicalDay: string): Promise<ArchivedSermon> {
  const openai = getOpenAiClient();
  const archivedSermons = await getAllSermons();
  const archivedTitles = archivedSermons.map((sermon) => sermon.title);
  const recentTitles = archivedTitles.slice(0, 20).map((title) => `- ${title}`).join('\n');
  const uniquenessInstruction = archivedTitles.length > 0
    ? [
        'Im Archiv existieren bereits Predigten. Wähle daher ausdrücklich ein neues, klar abweichendes Thema und keinen ähnlichen Titel.',
        'Vermeide insbesondere diese bereits verwendeten Titel:',
        recentTitles,
      ].join('\n')
    : 'Es gibt noch keine gespeicherten Predigten im Archiv.';
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'Du schreibst deutschsprachige, seelsorglich warme Tagespredigten für eine christliche Website. Halte dich exakt an das gewünschte Format.',
    },
    {
      role: 'user',
      content: [
        `Erstelle eine ausführliche, geistlich tiefgehende Predigt (ca. ${SERMON_WORD_COUNT_RANGE}) für den ${liturgicalDay}.`,
        'Die Predigt soll mit Einleitung, Hauptteil, praktischer Anwendung und einem abschließenden Gebet aufgebaut sein.',
        'Stil: warm, einladend, geistlich tiefgehend, nicht dogmatisch, mit Bibelbezug und seelsorglicher Klarheit.',
        uniquenessInstruction,
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
    if (!(await titleExists(sermon.title))) {
      return sermon;
    }

    const similarTitles = archivedTitles.filter((title) => title !== sermon.title).slice(0, 5);
    messages.push({ role: 'assistant', content: rawContent });
    messages.push({
      role: 'user',
      content: [
        `Der Titel „${sermon.title}“ ist dem Archiv zu ähnlich.`,
        similarTitles.length > 0
          ? `Achte besonders auf deutlichen Abstand zu diesen vorhandenen Titeln: ${similarTitles.join('; ')}`
          : 'Wähle bitte ein deutlich neues Thema und einen klar unterscheidbaren Titel.',
        'Bitte verfasse eine neue Predigt mit abweichendem Schwerpunkt und bleibe exakt im Format TITEL / PREDIGT / GEBET.',
      ].join(' '),
    });
  }

  throw new Error('Es konnte keine ausreichend neue Predigt erzeugt werden.');
}

async function getOrCreateDailySermon(): Promise<DailySermonResponse> {
  const publicationDate = getCurrentPublicationDate();

  if (sermonCache?.date === publicationDate) {
    return toApiResponse(sermonCache, true);
  }

  const archivedSermon = await loadSermon(publicationDate);
  if (archivedSermon) {
    sermonCache = archivedSermon;
    return toApiResponse(archivedSermon, true);
  }

  if (!inFlightGeneration) {
    inFlightGeneration = (async () => {
      const liturgicalDay = getLiturgicalDay(parseIsoDate(publicationDate));
      const sermon = await requestUniqueSermon(publicationDate, liturgicalDay);
      await saveSermon(sermon);
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
