const BERLIN_TIMEZONE = 'Europe/Berlin';
const DAILY_PUBLISH_HOUR = 3;
const DEFAULT_TAGESWORT_ARCHIVE_LIMIT = 90;
const TAGESWORT_SEQUENCE_START_DATE = '2026-05-14';

function parseIsoDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date) {
  return date.toISOString().split('T')[0];
}

function shiftIsoDate(value, days) {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function getBerlinPublicationDate(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  );

  const berlinDate = `${parts.year}-${parts.month}-${parts.day}`;
  return Number(parts.hour) < DAILY_PUBLISH_HOUR ? shiftIsoDate(berlinDate, -1) : berlinDate;
}

function getSequenceIndex(date) {
  const current = parseIsoDate(date);
  const start = parseIsoDate(TAGESWORT_SEQUENCE_START_DATE);
  return Math.round((current.getTime() - start.getTime()) / 86400000);
}

function buildQuestions(verse) {
  return [
    `Was ist der historische Kontext von ${verse}?`,
    'Welche theologischen Kernaussagen enthält dieser Vers?',
    'Wie verbindet sich dieser Text mit dem Gesamtzeugnis der Schrift?',
    'Was fordert dieser Vers mein persönliches Denken heraus?',
    'Wie kann die Botschaft dieses Verses konkret gelebt werden?',
  ];
}

function createEntry(date, template) {
  return {
    id: date,
    date,
    verse: template.verse,
    text: template.text,
    context: template.context,
    questions: buildQuestions(template.verse),
    published: true,
  };
}

function getMissingPublicationDates(existing, today) {
  if (today < TAGESWORT_SEQUENCE_START_DATE) return [];

  const publishedDates = existing
    .filter(entry => entry.published)
    .map(entry => entry.date)
    .sort();

  if (publishedDates.includes(today)) return [];

  const latestPublished = publishedDates.at(-1);
  let nextDate = TAGESWORT_SEQUENCE_START_DATE;

  if (latestPublished && latestPublished >= TAGESWORT_SEQUENCE_START_DATE) {
    nextDate = shiftIsoDate(latestPublished, 1);
  }

  if (nextDate > today) return [];

  const dates = [];
  for (let cursor = nextDate; cursor <= today; cursor = shiftIsoDate(cursor, 1)) {
    dates.push(cursor);
  }
  return dates;
}

function generateTageswortEntries(existing, templates, today) {
  const usedKeys = new Set(
    existing.filter(entry => entry.published).map(entry => `${entry.verse}\n${entry.text}`)
  );

  return getMissingPublicationDates(existing, today).map(date => {
    const sequenceIndex = getSequenceIndex(date);
    if (sequenceIndex < 0) {
      throw new Error(`Tageswort sequence cannot generate entries before ${TAGESWORT_SEQUENCE_START_DATE}.`);
    }

    if (sequenceIndex >= templates.length) {
      throw new Error(
        `No Tageswort template available for ${date}: sequence index ${sequenceIndex} exceeds ${templates.length} configured templates.`
      );
    }

    const template = templates[sequenceIndex];

    const key = `${template.verse}\n${template.text}`;
    if (usedKeys.has(key)) {
      throw new Error(`Tageswort template for ${date} would repeat ${template.verse}.`);
    }

    usedKeys.add(key);
    return createEntry(date, template);
  });
}

function appendAndPrune(existing, newEntries, archiveLimit = DEFAULT_TAGESWORT_ARCHIVE_LIMIT) {
  const updated = [...existing, ...newEntries];
  const published = updated
    .filter(entry => entry.published)
    .sort((a, b) => a.date.localeCompare(b.date));
  const retainedPublished = published.slice(-archiveLimit);
  const unpublished = updated.filter(entry => !entry.published);

  return {
    entries: [...retainedPublished, ...unpublished],
    prunedCount: published.length - retainedPublished.length,
  };
}

module.exports = {
  DEFAULT_TAGESWORT_ARCHIVE_LIMIT,
  TAGESWORT_SEQUENCE_START_DATE,
  appendAndPrune,
  generateTageswortEntries,
  getBerlinPublicationDate,
};
