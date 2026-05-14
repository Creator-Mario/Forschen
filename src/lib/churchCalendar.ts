const SUPPORTED_CHURCH_YEARS = {
  2026: {
    easter: '2026-04-05',
    firstAdvent: '2026-11-29',
  },
  2027: {
    easter: '2027-03-28',
    firstAdvent: '2027-11-28',
  },
} as const;

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

function isSameUtcDay(left: Date, right: Date): boolean {
  return toIsoDate(startOfUtcDay(left)) === toIsoDate(startOfUtcDay(right));
}

function getNthSundayLabel(date: Date, seasonStart: Date, label: string): string {
  const seasonAnchor = addDays(seasonStart, ((7 - seasonStart.getUTCDay()) % 7) || 7);
  const diffDays = Math.floor((startOfUtcDay(date).getTime() - startOfUtcDay(seasonAnchor).getTime()) / 86_400_000);
  return `${Math.floor(diffDays / 7) + 1}. ${label}`;
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

function getFixedFeastLabel(month: number, day: number): string | null {
  const fixedFeasts: Record<string, string> = {
    '1-1': 'Neujahr / Hochfest der Gottesmutter Maria',
    '1-6': 'Epiphanias / Erscheinung des Herrn',
    '11-1': 'Allerheiligen',
    '12-24': 'Heiligabend',
    '12-25': '1. Weihnachtstag',
    '12-26': '2. Weihnachtstag',
    '12-31': 'Altjahresabend',
  };

  return fixedFeasts[`${month}-${day}`] ?? null;
}

// Vereinfachte Zuordnung für die wichtigsten Sonn- und Feiertage im Kirchenjahr.
export function getLiturgicalDay(date: Date): string {
  const normalized = startOfUtcDay(date);
  const year = normalized.getUTCFullYear();
  if (!(year in SUPPORTED_CHURCH_YEARS)) {
    return `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`;
  }
  const churchYear = SUPPORTED_CHURCH_YEARS[year as keyof typeof SUPPORTED_CHURCH_YEARS];

  const fixedFeast = getFixedFeastLabel(normalized.getUTCMonth() + 1, normalized.getUTCDate());
  if (fixedFeast) return fixedFeast;

  const easter = parseIsoDate(churchYear.easter);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const maundyThursday = addDays(easter, -3);
  const goodFriday = addDays(easter, -2);
  const easterMonday = addDays(easter, 1);
  const ascension = addDays(easter, 39);
  const pentecostSunday = addDays(easter, 49);
  const pentecostMonday = addDays(easter, 50);
  const trinitySunday = addDays(easter, 56);
  const corpusChristi = addDays(easter, 60);
  const firstAdvent = parseIsoDate(churchYear.firstAdvent);
  const christmasEve = parseIsoDate(`${year}-12-24`);

  if (isSameUtcDay(normalized, ashWednesday)) return 'Aschermittwoch';
  if (isSameUtcDay(normalized, palmSunday)) return 'Palmsonntag';
  if (isSameUtcDay(normalized, maundyThursday)) return 'Gründonnerstag';
  if (isSameUtcDay(normalized, goodFriday)) return 'Karfreitag';
  if (isSameUtcDay(normalized, easter)) return 'Ostersonntag';
  if (isSameUtcDay(normalized, easterMonday)) return 'Ostermontag';
  if (isSameUtcDay(normalized, ascension)) return 'Christi Himmelfahrt';
  if (isSameUtcDay(normalized, pentecostSunday)) return 'Pfingstsonntag';
  if (isSameUtcDay(normalized, pentecostMonday)) return 'Pfingstmontag';
  if (isSameUtcDay(normalized, trinitySunday)) return 'Trinitatis';
  if (isSameUtcDay(normalized, corpusChristi)) return 'Fronleichnam';

  if (normalized.getUTCDay() === 0) {
    if (normalized >= firstAdvent && normalized < christmasEve) {
      return `${Math.floor((normalized.getTime() - firstAdvent.getTime()) / 86_400_000 / 7) + 1}. Advent`;
    }

    if (normalized > easter && normalized < pentecostSunday) {
      return getNthSundayLabel(normalized, easter, 'Sonntag nach Ostern');
    }

    if (normalized > ashWednesday && normalized < palmSunday) {
      return getNthSundayLabel(normalized, ashWednesday, 'Sonntag der Passionszeit');
    }

    if (normalized > pentecostSunday && normalized < firstAdvent) {
      return `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`;
    }
  }

  return `${getOrdinarySundayNumber(normalized)}. Sonntag im Jahreskreis`;
}
