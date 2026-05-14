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
};

const CHURCH_YEAR_TABLE: Record<number, SupportedChurchYear> = {
  2026: {
    easter: '2026-04-05',
    firstAdvent: '2026-11-29',
  },
  2027: {
    easter: '2027-03-28',
    firstAdvent: '2027-11-28',
  },
};

const FIXED_FEASTS: Record<string, string> = {
  '01-01': 'Neujahr / Hochfest der Gottesmutter Maria',
  '01-06': 'Epiphanias / Erscheinung des Herrn',
  '11-01': 'Allerheiligen',
  '12-24': 'Heiligabend',
  '12-25': '1. Weihnachtstag',
  '12-26': '2. Weihnachtstag',
  '12-31': 'Altjahresabend',
};

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

// Die beweglichen Feiertage sind zentral aus den Osterdaten abgeleitet.
// Dadurch bleibt die Tabelle für weitere Jahre leicht erweiterbar, ohne jede
// einzelne Datumskombination erneut manuell pflegen zu müssen.
function getMovableFeasts(year: number): Map<string, string> {
  const definition = getYearDefinition(year);
  const feasts = new Map<string, string>();

  if (!definition) return feasts;

  const easter = parseIsoDate(definition.easter);
  const movableFeasts = [
    { offset: -46, label: 'Aschermittwoch' },
    { offset: -7, label: 'Palmsonntag' },
    { offset: -3, label: 'Gründonnerstag' },
    { offset: -2, label: 'Karfreitag' },
    { offset: 0, label: 'Ostersonntag' },
    { offset: 1, label: 'Ostermontag' },
    { offset: 39, label: 'Christi Himmelfahrt' },
    { offset: 49, label: 'Pfingstsonntag' },
    { offset: 50, label: 'Pfingstmontag' },
    { offset: 56, label: 'Trinitatis' },
    { offset: 60, label: 'Fronleichnam' },
  ] as const;

  for (const feast of movableFeasts) {
    feasts.set(toIsoDate(addDays(easter, feast.offset)), feast.label);
  }

  return feasts;
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

export function isFeastDay(date: Date): boolean {
  const normalized = startOfUtcDay(date);
  return Boolean(getFixedFeastLabel(normalized) || getMovableFeasts(normalized.getUTCFullYear()).get(toIsoDate(normalized)));
}

// Für die UI wird jeder Kalendertag vollständig vorbereitet ausgeliefert:
// Datum, liturgische Bezeichnung und Markierungen für Sonntage/Festtage.
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
    return `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`;
  }

  const seasonalSunday = getSeasonalSundayLabel(normalized, yearDefinition);
  if (seasonalSunday) return seasonalSunday;

  return `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`;
}
