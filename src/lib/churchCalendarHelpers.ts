import {
  churchCalendarData,
  getChurchCalendarData,
  getChurchCalendarEntryByDate,
  getChurchCalendarYearData,
  type ChurchCalendarEntry,
  type ChurchCalendarType,
  type LiturgicalColor,
} from '@/data/churchCalendarData';

type DateInput = string | Date;

export type MonthCalendarEntry = ChurchCalendarEntry & {
  day: number;
  weekday: number;
  abbreviatedLiturgicalName: string;
  displayName: string;
};

function normalizeDateInput(dateInput: DateInput): string | null {
  if (typeof dateInput === 'string') {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateInput) ? dateInput : null;
  }

  if (!(dateInput instanceof Date) || Number.isNaN(dateInput.getTime())) {
    return null;
  }

  return dateInput.toISOString().slice(0, 10);
}

export function getCalendarDay(dateInput: DateInput): ChurchCalendarEntry | null {
  const date = normalizeDateInput(dateInput);
  if (!date) {
    return null;
  }

  return getChurchCalendarEntryByDate(date);
}

export function getFullLiturgicalName(dateInput: DateInput): string {
  return getCalendarDay(dateInput)?.liturgicalName ?? '';
}

export function getLiturgicalColor(dateInput: DateInput): LiturgicalColor | null {
  return getCalendarDay(dateInput)?.color ?? null;
}

export function getLiturgicalType(dateInput: DateInput): ChurchCalendarType | null {
  return getCalendarDay(dateInput)?.type ?? null;
}

export function getDisplayLiturgicalDay(dateInput: DateInput): string {
  const entry = getCalendarDay(dateInput);
  if (!entry) {
    return '';
  }

  if (entry.type === 'Gedenktag' && entry.significance !== entry.liturgicalName) {
    return `${entry.liturgicalName} – ${entry.significance}`;
  }

  return entry.liturgicalName;
}

export function isFeastDay(dateInput: DateInput): boolean {
  const type = getLiturgicalType(dateInput);
  return type === 'Hochfest' || type === 'Fest' || type === 'Gedenktag';
}

export function abbreviateLiturgicalName(name: string): string {
  return name
    .replace(/Sonntag/g, 'So.')
    .replace(/Montag/g, 'Mo.')
    .replace(/Dienstag/g, 'Di.')
    .replace(/Mittwoch/g, 'Mi.')
    .replace(/Donnerstag/g, 'Do.')
    .replace(/Freitag/g, 'Fr.')
    .replace(/Samstag/g, 'Sa.')
    .replace(/Adventssonntag/g, 'Advent')
    .replace(/Fastenzeit/g, 'Fastenz.')
    .replace(/Osterzeit/g, 'Osterz.')
    .replace(/Osterwoche/g, 'Osterwo.')
    .replace(/Woche im Jahreskreis/g, 'Wo. i. JK')
    .replace(/Jahreskreis/g, 'JK')
    .replace(/Weihnachtszeit/g, 'Weihnachtsz.')
    .replace(/Erscheinung des Herrn/g, 'Epiphanie')
    .replace(/Heiligen Familie/g, 'Hl. Familie');
}

export function getMonthData(year: number, month: number): MonthCalendarEntry[] {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('year and month must be valid integers');
  }

  return getChurchCalendarYearData(year)
    .filter((entry) => entry.date.startsWith(`${year}-${String(month).padStart(2, '0')}-`))
    .map((entry) => {
      const date = new Date(`${entry.date}T00:00:00Z`);
      return {
        ...entry,
        day: date.getUTCDate(),
        // Transform JavaScript's Sunday = 0 to ISO-style Monday = 0 for grid alignment.
        weekday: (date.getUTCDay() + 6) % 7,
        abbreviatedLiturgicalName: abbreviateLiturgicalName(entry.liturgicalName),
        displayName: getDisplayLiturgicalDay(entry.date),
      } satisfies MonthCalendarEntry;
    });
}

export function getAvailableChurchCalendarData(referenceDate = new Date()): Record<number, ChurchCalendarEntry[]> {
  return getChurchCalendarData(referenceDate);
}

export { churchCalendarData };
