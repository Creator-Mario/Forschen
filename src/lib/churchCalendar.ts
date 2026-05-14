export type MonthOverviewDay = {
  date: string;
  day: number;
  liturgicalDay: string;
  isSunday: boolean;
  isFeastDay: boolean;
};

type SupportedChurchYear = {
  easter: string;
  firstAdvent: string;
  movableFeasts: Record<string, string>;
};

const CHURCH_YEAR_TABLE: Record<number, SupportedChurchYear> = {
  2026: {
    easter: '2026-04-05',
    firstAdvent: '2026-11-29',
    movableFeasts: {
      '2026-02-18': 'Aschermittwoch',
      '2026-03-29': 'Palmsonntag',
      '2026-04-02': 'Gründonnerstag',
      '2026-04-03': 'Karfreitag',
      '2026-04-05': 'Ostersonntag',
      '2026-04-06': 'Ostermontag',
      '2026-05-14': 'Christi Himmelfahrt',
      '2026-05-24': 'Pfingstsonntag',
      '2026-05-25': 'Pfingstmontag',
      '2026-05-31': 'Trinitatis',
      '2026-06-04': 'Fronleichnam',
    },
  },
  2027: {
    easter: '2027-03-28',
    firstAdvent: '2027-11-28',
    movableFeasts: {
      '2027-02-10': 'Aschermittwoch',
      '2027-03-21': 'Palmsonntag',
      '2027-03-25': 'Gründonnerstag',
      '2027-03-26': 'Karfreitag',
      '2027-03-28': 'Ostersonntag',
      '2027-03-29': 'Ostermontag',
      '2027-05-06': 'Christi Himmelfahrt',
      '2027-05-16': 'Pfingstsonntag',
      '2027-05-17': 'Pfingstmontag',
      '2027-05-23': 'Trinitatis',
      '2027-05-27': 'Fronleichnam',
    },
  },
};

// Für weitere Jahre muss diese Tabelle ergänzt werden. Außerhalb der
// hinterlegten Jahre liefern die Helfer bewusst nur allgemeine Fallback-Labels.

const FIXED_FEASTS: Record<string, string> = {
  '01-01': 'Neujahr / Hochfest der Gottesmutter Maria',
  '01-06': 'Epiphanias / Erscheinung des Herrn',
  '11-01': 'Allerheiligen',
  '12-24': 'Heiligabend',
  '12-25': '1. Weihnachtstag',
  '12-26': '2. Weihnachtstag',
  '12-31': 'Altjahresabend',
};

const WEEKDAY_LABELS = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

function getMonthDayKey(date: Date): string {
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getOrdinarySundayNumber(date: Date): number {
  const normalized = startOfUtcDay(date);
  const sunday = addDays(normalized, -normalized.getUTCDay());
  const yearStart = new Date(Date.UTC(sunday.getUTCFullYear(), 0, 1));
  const firstSundayOffset = (7 - yearStart.getUTCDay()) % 7;
  const firstSunday = addDays(yearStart, firstSundayOffset);
  const diffDays = Math.max(0, Math.floor((sunday.getTime() - firstSunday.getTime()) / 86_400_000));
  return Math.floor(diffDays / 7) + 1;
}

function getNthSundayLabel(date: Date, seasonStart: Date, label: string): string {
  const firstSunday = addDays(seasonStart, ((7 - seasonStart.getUTCDay()) % 7) || 7);
  const diffDays = Math.floor((startOfUtcDay(date).getTime() - startOfUtcDay(firstSunday).getTime()) / 86_400_000);
  return `${Math.floor(diffDays / 7) + 1}. ${label}`;
}

function getYearDefinition(year: number): SupportedChurchYear | null {
  return CHURCH_YEAR_TABLE[year] ?? null;
}

function getFixedFeastLabel(date: Date): string | null {
  return FIXED_FEASTS[getMonthDayKey(date)] ?? null;
}

function getMovableFeasts(year: number): Map<string, string> {
  const definition = getYearDefinition(year);
  return new Map(Object.entries(definition?.movableFeasts ?? {}));
}

function getSeasonalSundayLabel(date: Date, yearDefinition: SupportedChurchYear): string | null {
  if (date.getUTCDay() !== 0) return null;

  const easter = parseIsoDate(yearDefinition.easter);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecostSunday = addDays(easter, 49);
  const firstAdvent = parseIsoDate(yearDefinition.firstAdvent);
  const christmasEve = parseIsoDate(`${date.getUTCFullYear()}-12-24`);

  if (date >= firstAdvent && date < christmasEve) {
    return `${Math.floor((date.getTime() - firstAdvent.getTime()) / 86_400_000 / 7) + 1}. Advent`;
  }

  if (date > easter && date < pentecostSunday) {
    return getNthSundayLabel(date, easter, 'Sonntag nach Ostern');
  }

  if (date > ashWednesday && date < palmSunday) {
    return getNthSundayLabel(date, ashWednesday, 'Sonntag der Passionszeit');
  }

  return `${getOrdinarySundayNumber(date)}. Sonntag im Jahreskreis`;
}

function getOrdinaryWeekLabel(date: Date): string {
  return `${getOrdinarySundayNumber(date)}. Woche im Jahreskreis`;
}

function getWeekdaySeasonLabel(date: Date, yearDefinition: SupportedChurchYear): string {
  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  const easter = parseIsoDate(yearDefinition.easter);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecostSunday = addDays(easter, 49);
  const firstAdvent = parseIsoDate(yearDefinition.firstAdvent);
  const christmasEve = parseIsoDate(`${date.getUTCFullYear()}-12-24`);
  const christmasDay = parseIsoDate(`${date.getUTCFullYear()}-12-25`);
  const altjahresabend = parseIsoDate(`${date.getUTCFullYear()}-12-31`);
  const jan2 = parseIsoDate(`${date.getUTCFullYear()}-01-02`);
  const epiphany = parseIsoDate(`${date.getUTCFullYear()}-01-06`);

  if (date >= jan2 && date < epiphany) {
    return `${weekday} in der Weihnachtszeit`;
  }

  if (date > christmasDay && date < altjahresabend) {
    return `${weekday} in der Weihnachtszeit`;
  }

  if (date >= firstAdvent && date < christmasEve) {
    return `${weekday} im Advent`;
  }

  if (date > palmSunday && date < easter) {
    return `${weekday} der Karwoche`;
  }

  if (date > ashWednesday && date < palmSunday) {
    return `${weekday} der Passionszeit`;
  }

  if (date > easter && date < pentecostSunday) {
    return `${weekday} der Osterzeit`;
  }

  return `${weekday} der ${getOrdinaryWeekLabel(date)}`;
}

export function isFeastDay(date: Date): boolean {
  const normalized = startOfUtcDay(date);
  return Boolean(getFixedFeastLabel(normalized) || getMovableFeasts(normalized.getUTCFullYear()).get(toIsoDate(normalized)));
}

// Für die UI wird jeder Kalendertag vollständig vorbereitet ausgeliefert:
// Datum, liturgische Bezeichnung und Markierungen für Sonntage/Festtage.
// Nicht hinterlegte Jahre verwenden dabei die allgemeinen Fallback-Bezeichnungen.
export function getMonthOverview(year: number, month: number): MonthOverviewDay[] {
  if (month < 1 || month > 12) {
    throw new Error('month must be between 1 and 12 (inclusive)');
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 1, index + 1));
    return {
      date: toIsoDate(date),
      day: index + 1,
      liturgicalDay: getLiturgicalDay(date),
      isSunday: date.getUTCDay() === 0,
      isFeastDay: isFeastDay(date),
    } satisfies MonthOverviewDay;
  });
}

export function getLiturgicalDay(date: Date): string {
  const normalized = startOfUtcDay(date);
  const fixedFeast = getFixedFeastLabel(normalized);
  if (fixedFeast) return fixedFeast;

  const movableFeast = getMovableFeasts(normalized.getUTCFullYear()).get(toIsoDate(normalized));
  if (movableFeast) return movableFeast;

  const yearDefinition = getYearDefinition(normalized.getUTCFullYear());
  if (!yearDefinition) {
    return normalized.getUTCDay() === 0
      ? `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`
      : `${WEEKDAY_LABELS[normalized.getUTCDay()]} der ${getOrdinaryWeekLabel(normalized)}`;
  }

  const seasonalSunday = getSeasonalSundayLabel(normalized, yearDefinition);
  if (seasonalSunday) return seasonalSunday;

  return getWeekdaySeasonLabel(normalized, yearDefinition);
}
