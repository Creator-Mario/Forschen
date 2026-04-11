import { getISOWeek } from './utils';

const BERLIN_TIMEZONE = 'Europe/Berlin';
// Business rule: daily public content switches at 03:00 in German local time.
const DAILY_PUBLISH_HOUR = 3;

function getBerlinParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';

  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    hour: Number(read('hour')),
  };
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function shiftIsoDate(value: string, days: number): string {
  const date = parseIsoDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

export function getCurrentPublicationDate(date = new Date()): string {
  const parts = getBerlinParts(date);
  const berlinDate = `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  return parts.hour < DAILY_PUBLISH_HOUR ? shiftIsoDate(berlinDate, -1) : berlinDate;
}

export function getCurrentPublicationWeek(date = new Date()): string {
  const effectiveDate = parseIsoDate(getCurrentPublicationDate(date));

  // Business rule: the next weekly cycle becomes active on Sunday at 03:00 local time,
  // so Sunday content after the cutoff already points to the upcoming ISO week.
  if (effectiveDate.getUTCDay() === 0) {
    effectiveDate.setUTCDate(effectiveDate.getUTCDate() + 1);
  }

  return getISOWeek(effectiveDate);
}
