export type LiturgicalColor = 'weiß' | 'rot' | 'grün' | 'violett';
export type ChurchCalendarType = 'Hochfest' | 'Fest' | 'Gedenktag' | 'Sonntag' | 'Wochentag';

export type ChurchCalendarEntry = {
  date: string;
  liturgicalName: string;
  significance: string;
  type: ChurchCalendarType;
  color: LiturgicalColor;
};

type ObservanceDefinition = {
  name: string;
  significance: string;
  type: Exclude<ChurchCalendarType, 'Sonntag' | 'Wochentag'>;
  color: LiturgicalColor;
  keepSeasonName?: boolean;
};

type CalendarContext = {
  year: number;
  easterSunday: Date;
  ashWednesday: Date;
  firstSundayOfLent: Date;
  palmSunday: Date;
  holyThursday: Date;
  goodFriday: Date;
  holySaturday: Date;
  easterMonday: Date;
  ascensionThursday: Date;
  pentecostSunday: Date;
  pentecostMonday: Date;
  trinitySunday: Date;
  corpusChristi: Date;
  sacredHeart: Date;
  christKing: Date;
  firstAdvent: Date;
  christmasDay: Date;
  epiphany: Date;
  baptismOfLord: Date;
  holyFamily: Date;
};

type BaseDay = Omit<ChurchCalendarEntry, 'date'>;

const DAY_IN_MS = 86_400_000;
const BASE_YEAR = 2026;
const PRELOADED_YEARS = [2026, 2027] as const;

const WEEKDAY_NAMES = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

const FIXED_OBSERVANCES: Record<string, ObservanceDefinition> = {
  '01-01': {
    name: 'Hochfest der Gottesmutter Maria',
    significance: 'Hochfest der Gottesmutter Maria – Neujahr im Weihnachtsfestkreis.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '01-02': {
    name: 'Basilius der Große und Gregor von Nazianz',
    significance: 'Gedenktag der heiligen Basilius des Großen und Gregor von Nazianz, Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '01-06': {
    name: 'Erscheinung des Herrn',
    significance: 'Hochfest der Erscheinung des Herrn – Christus offenbart sich den Völkern.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '01-17': {
    name: 'Antonius',
    significance: 'Gedenktag des heiligen Antonius, Mönchsvater.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '01-24': {
    name: 'Franz von Sales',
    significance: 'Gedenktag des heiligen Franz von Sales, Bischof und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '01-25': {
    name: 'Bekehrung des Apostels Paulus',
    significance: 'Fest der Bekehrung des Apostels Paulus.',
    type: 'Fest',
    color: 'weiß',
  },
  '01-26': {
    name: 'Timotheus und Titus',
    significance: 'Gedenktag der heiligen Timotheus und Titus, Bischöfe.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '01-28': {
    name: 'Thomas von Aquin',
    significance: 'Gedenktag des heiligen Thomas von Aquin, Priester und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '01-31': {
    name: 'Don Bosco',
    significance: 'Gedenktag des heiligen Johannes Bosco, Priester.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '02-02': {
    name: 'Darstellung des Herrn',
    significance: 'Fest der Darstellung des Herrn im Tempel.',
    type: 'Fest',
    color: 'weiß',
  },
  '02-05': {
    name: 'Agatha',
    significance: 'Gedenktag der heiligen Agatha, Jungfrau und Märtyrin.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '02-06': {
    name: 'Paul Miki und Gefährten',
    significance: 'Gedenktag der heiligen Paul Miki und Gefährten, Märtyrer.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '02-10': {
    name: 'Scholastika',
    significance: 'Gedenktag der heiligen Scholastika, Jungfrau.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '02-11': {
    name: 'Unsere Liebe Frau in Lourdes',
    significance: 'Gedenktag Unserer Lieben Frau in Lourdes.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '02-14': {
    name: 'Kyrill und Methodius',
    significance: 'Fest der heiligen Kyrill und Methodius, Patrone Europas.',
    type: 'Fest',
    color: 'weiß',
  },
  '02-22': {
    name: 'Kathedra Petri',
    significance: 'Fest der Kathedra des heiligen Petrus.',
    type: 'Fest',
    color: 'weiß',
  },
  '02-23': {
    name: 'Polykarp',
    significance: 'Gedenktag des heiligen Polykarp, Bischof und Märtyrer.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '03-19': {
    name: 'Josef, Bräutigam der Gottesmutter Maria',
    significance: 'Hochfest des heiligen Josef, Bräutigam der Gottesmutter Maria.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '03-25': {
    name: 'Verkündigung des Herrn',
    significance: 'Hochfest der Verkündigung des Herrn.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '04-25': {
    name: 'Markus, Evangelist',
    significance: 'Fest des heiligen Markus, Evangelist.',
    type: 'Fest',
    color: 'rot',
  },
  '04-29': {
    name: 'Katharina von Siena',
    significance: 'Fest der heiligen Katharina von Siena, Ordensfrau und Kirchenlehrerin.',
    type: 'Fest',
    color: 'weiß',
  },
  '05-01': {
    name: 'Josef der Arbeiter',
    significance: 'Gedenktag des heiligen Josef, des Arbeiters.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '05-14': {
    name: 'Matthias, Apostel',
    significance: 'Fest des heiligen Matthias, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '05-31': {
    name: 'Heimsuchung Mariens',
    significance: 'Fest der Heimsuchung Mariens.',
    type: 'Fest',
    color: 'weiß',
  },
  '06-03': {
    name: 'Karl Lwanga und Gefährten',
    significance: 'Gedenktag der heiligen Karl Lwanga und Gefährten, Märtyrer.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '06-11': {
    name: 'Barnabas',
    significance: 'Gedenktag des heiligen Barnabas, Apostel.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '06-13': {
    name: 'Antonius von Padua',
    significance: 'Gedenktag des heiligen Antonius von Padua, Priester und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '06-24': {
    name: 'Geburt des heiligen Johannes des Täufers',
    significance: 'Hochfest der Geburt des heiligen Johannes des Täufers.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '06-29': {
    name: 'Petrus und Paulus, Apostel',
    significance: 'Hochfest der heiligen Petrus und Paulus, Apostel.',
    type: 'Hochfest',
    color: 'rot',
  },
  '07-03': {
    name: 'Thomas, Apostel',
    significance: 'Fest des heiligen Thomas, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '07-11': {
    name: 'Benedikt von Nursia',
    significance: 'Fest des heiligen Benedikt von Nursia, Patron Europas.',
    type: 'Fest',
    color: 'weiß',
  },
  '07-22': {
    name: 'Maria Magdalena',
    significance: 'Fest der heiligen Maria Magdalena.',
    type: 'Fest',
    color: 'weiß',
  },
  '07-25': {
    name: 'Jakobus, Apostel',
    significance: 'Fest des heiligen Jakobus, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '07-29': {
    name: 'Martha, Maria und Lazarus',
    significance: 'Gedenktag der heiligen Martha, Maria und Lazarus.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '08-06': {
    name: 'Verklärung des Herrn',
    significance: 'Fest der Verklärung des Herrn.',
    type: 'Fest',
    color: 'weiß',
  },
  '08-10': {
    name: 'Laurentius',
    significance: 'Fest des heiligen Laurentius, Diakon und Märtyrer.',
    type: 'Fest',
    color: 'rot',
  },
  '08-15': {
    name: 'Mariä Aufnahme in den Himmel',
    significance: 'Hochfest der Aufnahme Mariens in den Himmel.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '08-24': {
    name: 'Bartholomäus, Apostel',
    significance: 'Fest des heiligen Bartholomäus, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '08-27': {
    name: 'Monika',
    significance: 'Gedenktag der heiligen Monika.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '08-28': {
    name: 'Augustinus',
    significance: 'Gedenktag des heiligen Augustinus, Bischof und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '09-03': {
    name: 'Gregor der Große',
    significance: 'Gedenktag des heiligen Gregor des Großen, Papst und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '09-08': {
    name: 'Mariä Geburt',
    significance: 'Fest der Geburt Mariens.',
    type: 'Fest',
    color: 'weiß',
  },
  '09-14': {
    name: 'Kreuzerhöhung',
    significance: 'Fest der Kreuzerhöhung.',
    type: 'Fest',
    color: 'rot',
  },
  '09-15': {
    name: 'Gedächtnis der Schmerzen Mariens',
    significance: 'Gedenktag der Schmerzen Mariens.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '09-21': {
    name: 'Matthäus, Apostel und Evangelist',
    significance: 'Fest des heiligen Matthäus, Apostel und Evangelist.',
    type: 'Fest',
    color: 'rot',
  },
  '09-29': {
    name: 'Michael, Gabriel und Rafael',
    significance: 'Fest der heiligen Erzengel Michael, Gabriel und Rafael.',
    type: 'Fest',
    color: 'weiß',
  },
  '09-30': {
    name: 'Hieronymus',
    significance: 'Gedenktag des heiligen Hieronymus, Priester und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-01': {
    name: 'Theresia vom Kinde Jesu',
    significance: 'Gedenktag der heiligen Theresia vom Kinde Jesu, Ordensfrau und Kirchenlehrerin.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-02': {
    name: 'Heilige Schutzengel',
    significance: 'Gedenktag der heiligen Schutzengel.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-04': {
    name: 'Franz von Assisi',
    significance: 'Gedenktag des heiligen Franz von Assisi.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-07': {
    name: 'Unsere Liebe Frau vom Rosenkranz',
    significance: 'Gedenktag Unserer Lieben Frau vom Rosenkranz.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-15': {
    name: 'Teresa von Ávila',
    significance: 'Gedenktag der heiligen Teresa von Jesus, Ordensfrau und Kirchenlehrerin.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '10-18': {
    name: 'Lukas, Evangelist',
    significance: 'Fest des heiligen Lukas, Evangelist.',
    type: 'Fest',
    color: 'rot',
  },
  '10-28': {
    name: 'Simon und Judas, Apostel',
    significance: 'Fest der heiligen Simon und Judas, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '11-01': {
    name: 'Allerheiligen',
    significance: 'Hochfest Allerheiligen.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '11-02': {
    name: 'Allerseelen',
    significance: 'Gebetstag für alle Verstorbenen – Allerseelen.',
    type: 'Gedenktag',
    color: 'violett',
    keepSeasonName: true,
  },
  '11-04': {
    name: 'Karl Borromäus',
    significance: 'Gedenktag des heiligen Karl Borromäus, Bischof.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '11-09': {
    name: 'Weihetag der Lateranbasilika',
    significance: 'Fest des Weihetags der Lateranbasilika.',
    type: 'Fest',
    color: 'weiß',
  },
  '11-10': {
    name: 'Leo der Große',
    significance: 'Gedenktag des heiligen Leo des Großen, Papst und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '11-11': {
    name: 'Martin von Tours',
    significance: 'Gedenktag des heiligen Martin von Tours, Bischof.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '11-21': {
    name: 'Unsere Liebe Frau in Jerusalem',
    significance: 'Gedenktag der Darstellung Mariens im Tempel.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '11-22': {
    name: 'Cäcilia',
    significance: 'Gedenktag der heiligen Cäcilia, Jungfrau und Märtyrin.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '11-30': {
    name: 'Andreas, Apostel',
    significance: 'Fest des heiligen Andreas, Apostel.',
    type: 'Fest',
    color: 'rot',
  },
  '12-03': {
    name: 'Franz Xaver',
    significance: 'Gedenktag des heiligen Franz Xaver, Priester.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '12-06': {
    name: 'Nikolaus',
    significance: 'Gedenktag des heiligen Nikolaus, Bischof.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '12-07': {
    name: 'Ambrosius',
    significance: 'Gedenktag des heiligen Ambrosius, Bischof und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '12-08': {
    name: 'Mariä Empfängnis',
    significance: 'Hochfest der ohne Erbsünde empfangenen Jungfrau und Gottesmutter Maria.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '12-13': {
    name: 'Luzia',
    significance: 'Gedenktag der heiligen Luzia, Jungfrau und Märtyrin.',
    type: 'Gedenktag',
    color: 'rot',
    keepSeasonName: true,
  },
  '12-14': {
    name: 'Johannes vom Kreuz',
    significance: 'Gedenktag des heiligen Johannes vom Kreuz, Priester und Kirchenlehrer.',
    type: 'Gedenktag',
    color: 'weiß',
    keepSeasonName: true,
  },
  '12-25': {
    name: 'Weihnachten – Hochfest der Geburt des Herrn',
    significance: 'Hochfest der Geburt des Herrn – Weihnachten.',
    type: 'Hochfest',
    color: 'weiß',
  },
  '12-26': {
    name: 'Stephanus',
    significance: 'Fest des heiligen Stephanus, erster Märtyrer.',
    type: 'Fest',
    color: 'rot',
  },
  '12-27': {
    name: 'Johannes, Apostel und Evangelist',
    significance: 'Fest des heiligen Johannes, Apostel und Evangelist.',
    type: 'Fest',
    color: 'weiß',
  },
  '12-28': {
    name: 'Unschuldige Kinder',
    significance: 'Fest der unschuldigen Kinder, Märtyrer.',
    type: 'Fest',
    color: 'rot',
  },
};

const yearCache = new Map<number, ChurchCalendarEntry[]>();
const contextCache = new Map<number, CalendarContext>();

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

function getDayDifference(left: Date, right: Date): number {
  return Math.round((startOfUtcDay(left).getTime() - startOfUtcDay(right).getTime()) / DAY_IN_MS);
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfWeekMonday(date: Date): Date {
  return addDays(startOfUtcDay(date), -((date.getUTCDay() + 6) % 7));
}

function isSameDate(left: Date, right: Date): boolean {
  return toIsoDate(left) === toIsoDate(right);
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  const normalized = startOfUtcDay(date).getTime();
  return normalized >= startOfUtcDay(start).getTime() && normalized <= startOfUtcDay(end).getTime();
}

function getMonthDayKey(date: Date): string {
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getWeekdayName(date: Date): string {
  return WEEKDAY_NAMES[date.getUTCDay()];
}

function computeEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function getFirstAdvent(year: number): Date {
  const novemberTwentySeventh = new Date(Date.UTC(year, 10, 27));
  return addDays(novemberTwentySeventh, (7 - novemberTwentySeventh.getUTCDay()) % 7);
}

function getBaptismOfLord(year: number): Date {
  const epiphany = new Date(Date.UTC(year, 0, 6));
  const offset = (7 - epiphany.getUTCDay()) % 7;
  return addDays(epiphany, offset === 0 ? 1 : offset);
}

function getHolyFamily(year: number): Date {
  for (let day = 26; day <= 31; day += 1) {
    const date = new Date(Date.UTC(year, 11, day));
    if (date.getUTCDay() === 0) {
      return date;
    }
  }

  return new Date(Date.UTC(year, 11, 30));
}

function getCalendarContext(year: number): CalendarContext {
  const cached = contextCache.get(year);
  if (cached) {
    return cached;
  }

  const easterSunday = computeEasterSunday(year);
  const ashWednesday = addDays(easterSunday, -46);
  const firstSundayOfLent = addDays(ashWednesday, 4);
  const palmSunday = addDays(easterSunday, -7);
  const holyThursday = addDays(easterSunday, -3);
  const goodFriday = addDays(easterSunday, -2);
  const holySaturday = addDays(easterSunday, -1);
  const easterMonday = addDays(easterSunday, 1);
  const ascensionThursday = addDays(easterSunday, 39);
  const pentecostSunday = addDays(easterSunday, 49);
  const pentecostMonday = addDays(easterSunday, 50);
  const trinitySunday = addDays(easterSunday, 56);
  const corpusChristi = addDays(easterSunday, 60);
  const sacredHeart = addDays(easterSunday, 68);
  const firstAdvent = getFirstAdvent(year);
  const christKing = addDays(firstAdvent, -7);
  const christmasDay = new Date(Date.UTC(year, 11, 25));
  const epiphany = new Date(Date.UTC(year, 0, 6));
  const baptismOfLord = getBaptismOfLord(year);
  const holyFamily = getHolyFamily(year);

  const context = {
    year,
    easterSunday,
    ashWednesday,
    firstSundayOfLent,
    palmSunday,
    holyThursday,
    goodFriday,
    holySaturday,
    easterMonday,
    ascensionThursday,
    pentecostSunday,
    pentecostMonday,
    trinitySunday,
    corpusChristi,
    sacredHeart,
    christKing,
    firstAdvent,
    christmasDay,
    epiphany,
    baptismOfLord,
    holyFamily,
  } satisfies CalendarContext;

  contextCache.set(year, context);
  return context;
}

function getOrdinaryWeekNumber(date: Date, context: CalendarContext): number {
  const ordinaryStart = addDays(context.baptismOfLord, 1);
  const normalized = startOfUtcDay(date);

  if (normalized < context.ashWednesday) {
    return Math.floor((startOfWeekMonday(normalized).getTime() - startOfWeekMonday(ordinaryStart).getTime()) / DAY_IN_MS / 7) + 1;
  }

  const lastOrdinaryWeekBeforeLent = getOrdinaryWeekNumber(addDays(context.ashWednesday, -1), context);
  const resumedOrdinaryStart = addDays(context.pentecostSunday, 1);
  return lastOrdinaryWeekBeforeLent
    + Math.floor((startOfWeekMonday(normalized).getTime() - startOfWeekMonday(resumedOrdinaryStart).getTime()) / DAY_IN_MS / 7)
    + 1;
}

function getOrdinarySundayNumber(date: Date, context: CalendarContext): number {
  return getOrdinaryWeekNumber(date, context) + 1;
}

function getBaseChristmasSeasonDay(date: Date, context: CalendarContext): BaseDay {
  if (isSameDate(date, context.holyFamily)) {
    return {
      liturgicalName: 'Fest der Heiligen Familie',
      significance: 'Fest der Heiligen Familie Jesu, Marias und Josefs.',
      type: 'Fest',
      color: 'weiß',
    };
  }

  if (date.getUTCMonth() === 11 && date.getUTCDate() >= 29 && date.getUTCDate() <= 31) {
    return {
      liturgicalName: `${getWeekdayName(date)} der Weihnachtsoktav`,
      significance: 'Tag innerhalb der Weihnachtsoktav.',
      type: 'Wochentag',
      color: 'weiß',
    };
  }

  if (date.getUTCMonth() === 0 && date.getUTCDate() >= 2 && date.getUTCDate() <= 5) {
    return {
      liturgicalName: `${getWeekdayName(date)} der Weihnachtszeit`,
      significance: 'Wochentag der Weihnachtszeit zwischen Weihnachten und Erscheinung des Herrn.',
      type: 'Wochentag',
      color: 'weiß',
    };
  }

  if (date > context.epiphany && date < context.baptismOfLord) {
    return {
      liturgicalName: date.getUTCDay() === 0 ? 'Sonntag nach Erscheinung des Herrn' : `${getWeekdayName(date)} nach Erscheinung des Herrn`,
      significance: 'Tag der Weihnachtszeit nach Erscheinung des Herrn.',
      type: date.getUTCDay() === 0 ? 'Sonntag' : 'Wochentag',
      color: 'weiß',
    };
  }

  return {
    liturgicalName: `${getWeekdayName(date)} der Weihnachtszeit`,
    significance: 'Tag der Weihnachtszeit.',
    type: date.getUTCDay() === 0 ? 'Sonntag' : 'Wochentag',
    color: 'weiß',
  };
}

function getBaseLentDay(date: Date, context: CalendarContext): BaseDay {
  if (isSameDate(date, context.ashWednesday)) {
    return {
      liturgicalName: 'Aschermittwoch',
      significance: 'Beginn der österlichen Bußzeit – Fast- und Abstinenztag.',
      type: 'Wochentag',
      color: 'violett',
    };
  }

  if (date < context.firstSundayOfLent) {
    return {
      liturgicalName: `${getWeekdayName(date)} nach Aschermittwoch`,
      significance: 'Wochentag unmittelbar nach dem Aschermittwoch in der Fastenzeit.',
      type: 'Wochentag',
      color: 'violett',
    };
  }

  const lentWeek = Math.floor(getDayDifference(date, context.firstSundayOfLent) / 7) + 1;
  if (date.getUTCDay() === 0) {
    return {
      liturgicalName: `${lentWeek}. Sonntag der Fastenzeit`,
      significance: `Sonntag der ${lentWeek}. Fastenwoche auf dem Weg zum Osterfest.`,
      type: 'Sonntag',
      color: 'violett',
    };
  }

  return {
    liturgicalName: `${getWeekdayName(date)} der ${lentWeek}. Fastenwoche`,
    significance: `Wochentag der ${lentWeek}. Fastenwoche.`,
    type: 'Wochentag',
    color: 'violett',
  };
}

function getBaseHolyWeekDay(date: Date, context: CalendarContext): BaseDay {
  if (isSameDate(date, context.palmSunday)) {
    return {
      liturgicalName: 'Palmsonntag',
      significance: 'Sonntag vom Leiden des Herrn – Beginn der Heiligen Woche.',
      type: 'Sonntag',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.holyThursday)) {
    return {
      liturgicalName: 'Gründonnerstag',
      significance: 'Feier vom Letzten Abendmahl des Herrn – Beginn des Triduums.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.goodFriday)) {
    return {
      liturgicalName: 'Karfreitag',
      significance: 'Gedächtnis des Leidens und Sterbens Jesu Christi.',
      type: 'Hochfest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.holySaturday)) {
    return {
      liturgicalName: 'Karsamstag',
      significance: 'Tag der Grabesruhe des Herrn in Erwartung der Osternacht.',
      type: 'Wochentag',
      color: 'violett',
    };
  }

  return {
    liturgicalName: `${getWeekdayName(date)} der Karwoche`,
    significance: 'Wochentag der Heiligen Woche unmittelbar vor Ostern.',
    type: 'Wochentag',
    color: 'violett',
  };
}

function getBaseEasterDay(date: Date, context: CalendarContext): BaseDay {
  if (isSameDate(date, context.easterSunday)) {
    return {
      liturgicalName: 'Ostersonntag',
      significance: 'Hochfest der Auferstehung des Herrn – Mittelpunkt des Kirchenjahres.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.easterMonday)) {
    return {
      liturgicalName: 'Ostermontag',
      significance: 'Zweiter Tag der Osterfeier – Christus lebt.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  const easterOctaveEnd = addDays(context.easterSunday, 7);
  if (date <= easterOctaveEnd) {
    return {
      liturgicalName: `${getWeekdayName(date)} in der Osteroktav`,
      significance: 'Tag innerhalb der Osteroktav.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.pentecostSunday)) {
    return {
      liturgicalName: 'Pfingstsonntag',
      significance: 'Hochfest des Heiligen Geistes – Vollendung der Osterzeit.',
      type: 'Hochfest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.ascensionThursday)) {
    return {
      liturgicalName: 'Christi Himmelfahrt',
      significance: 'Hochfest der Himmelfahrt Christi – vierzigster Tag der Osterzeit.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.pentecostMonday)) {
    return {
      liturgicalName: 'Pfingstmontag',
      significance: 'Festtag in der Freude über die Sendung des Heiligen Geistes.',
      type: 'Fest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.trinitySunday)) {
    return {
      liturgicalName: 'Dreifaltigkeitssonntag',
      significance: 'Hochfest der heiligsten Dreifaltigkeit.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.corpusChristi)) {
    return {
      liturgicalName: 'Fronleichnam',
      significance: 'Hochfest des Leibes und Blutes Christi.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.sacredHeart)) {
    return {
      liturgicalName: 'Heiligstes Herz Jesu',
      significance: 'Hochfest des heiligsten Herzens Jesu.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  const easterWeek = Math.floor(getDayDifference(date, context.easterSunday) / 7) + 1;
  if (date.getUTCDay() === 0) {
    return {
      liturgicalName: `${easterWeek}. Sonntag der Osterzeit`,
      significance: `Sonntag der ${easterWeek}. Woche der Osterzeit.`,
      type: 'Sonntag',
      color: 'weiß',
    };
  }

  return {
    liturgicalName: `${getWeekdayName(date)} der ${easterWeek}. Osterwoche`,
    significance: `Wochentag der ${easterWeek}. Osterwoche.`,
    type: 'Wochentag',
    color: 'weiß',
  };
}

function getBaseAdventDay(date: Date, context: CalendarContext): BaseDay {
  const adventWeek = Math.floor(getDayDifference(date, context.firstAdvent) / 7) + 1;
  if (date.getUTCDay() === 0) {
    return {
      liturgicalName: `${adventWeek}. Adventssonntag`,
      significance: `Sonntag der ${adventWeek}. Adventswoche in Erwartung der Geburt Christi.`,
      type: 'Sonntag',
      color: 'violett',
    };
  }

  return {
    liturgicalName: `${getWeekdayName(date)} der ${adventWeek}. Adventswoche`,
    significance: `Wochentag der ${adventWeek}. Adventswoche.`,
    type: 'Wochentag',
    color: 'violett',
  };
}

function getBaseOrdinaryTimeDay(date: Date, context: CalendarContext): BaseDay {
  if (isSameDate(date, context.baptismOfLord)) {
    return {
      liturgicalName: 'Taufe des Herrn',
      significance: 'Fest der Taufe des Herrn – Abschluss der Weihnachtszeit.',
      type: 'Fest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.christKing)) {
    return {
      liturgicalName: 'Christkönigssonntag',
      significance: 'Hochfest unseres Herrn Jesus Christus, des Königs des Weltalls.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (date.getUTCDay() === 0) {
    const sundayNumber = getOrdinarySundayNumber(date, context);
    return {
      liturgicalName: `${sundayNumber}. Sonntag im Jahreskreis`,
      significance: `Sonntag im Jahreskreis mit Fokus auf Jüngerschaft und Alltag des Glaubens.`,
      type: 'Sonntag',
      color: 'grün',
    };
  }

  const weekNumber = getOrdinaryWeekNumber(date, context);
  return {
    liturgicalName: `${getWeekdayName(date)} der ${weekNumber}. Woche im Jahreskreis`,
    significance: `Wochentag der ${weekNumber}. Woche im Jahreskreis.`,
    type: 'Wochentag',
    color: 'grün',
  };
}

function getBaseDayForDate(date: Date, context: CalendarContext): BaseDay {
  if (date >= context.christmasDay || date < addDays(context.baptismOfLord, 1)) {
    return getBaseChristmasSeasonDay(date, context);
  }

  if (date >= context.ashWednesday && date <= context.holySaturday) {
    if (date >= context.palmSunday) {
      return getBaseHolyWeekDay(date, context);
    }

    return getBaseLentDay(date, context);
  }

  if (date >= context.easterSunday && date <= context.pentecostMonday) {
    return getBaseEasterDay(date, context);
  }

  if (date >= context.firstAdvent && date < context.christmasDay) {
    return getBaseAdventDay(date, context);
  }

  return getBaseOrdinaryTimeDay(date, context);
}

function getMovablePrincipalObservance(date: Date, context: CalendarContext): ObservanceDefinition | null {
  if (isSameDate(date, context.easterSunday)) {
    return {
      name: 'Ostersonntag',
      significance: 'Hochfest der Auferstehung des Herrn – Mittelpunkt des Kirchenjahres.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.easterMonday)) {
    return {
      name: 'Ostermontag',
      significance: 'Zweiter Tag der Osterfeier – Christus lebt.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.holyThursday)) {
    return {
      name: 'Gründonnerstag',
      significance: 'Feier vom Letzten Abendmahl des Herrn – Beginn des Triduums.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.goodFriday)) {
    return {
      name: 'Karfreitag',
      significance: 'Gedächtnis des Leidens und Sterbens Jesu Christi.',
      type: 'Hochfest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.pentecostSunday)) {
    return {
      name: 'Pfingstsonntag',
      significance: 'Hochfest des Heiligen Geistes – Vollendung der Osterzeit.',
      type: 'Hochfest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.ascensionThursday)) {
    return {
      name: 'Christi Himmelfahrt',
      significance: 'Hochfest der Himmelfahrt Christi – vierzigster Tag der Osterzeit.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.pentecostMonday)) {
    return {
      name: 'Pfingstmontag',
      significance: 'Festtag in der Freude über die Sendung des Heiligen Geistes.',
      type: 'Fest',
      color: 'rot',
    };
  }

  if (isSameDate(date, context.trinitySunday)) {
    return {
      name: 'Dreifaltigkeitssonntag',
      significance: 'Hochfest der heiligsten Dreifaltigkeit.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.corpusChristi)) {
    return {
      name: 'Fronleichnam',
      significance: 'Hochfest des Leibes und Blutes Christi.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.sacredHeart)) {
    return {
      name: 'Heiligstes Herz Jesu',
      significance: 'Hochfest des heiligsten Herzens Jesu.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.christKing)) {
    return {
      name: 'Christkönigssonntag',
      significance: 'Hochfest unseres Herrn Jesus Christus, des Königs des Weltalls.',
      type: 'Hochfest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.holyFamily)) {
    return {
      name: 'Fest der Heiligen Familie',
      significance: 'Fest der Heiligen Familie Jesu, Marias und Josefs.',
      type: 'Fest',
      color: 'weiß',
    };
  }

  if (isSameDate(date, context.baptismOfLord)) {
    return {
      name: 'Taufe des Herrn',
      significance: 'Fest der Taufe des Herrn – Abschluss der Weihnachtszeit.',
      type: 'Fest',
      color: 'weiß',
    };
  }

  return null;
}

function getFixedObservance(date: Date): ObservanceDefinition | null {
  return FIXED_OBSERVANCES[getMonthDayKey(date)] ?? null;
}

function shouldSuppressMemorial(date: Date, context: CalendarContext): boolean {
  if (date.getUTCDay() === 0) {
    return true;
  }

  if (isBetween(date, context.ashWednesday, context.holySaturday)) {
    return true;
  }

  if (isBetween(date, context.easterSunday, addDays(context.easterSunday, 7))) {
    return true;
  }

  const decemberSeventeenth = new Date(Date.UTC(context.year, 11, 17));
  const decemberTwentyFourth = new Date(Date.UTC(context.year, 11, 24));
  return isBetween(date, decemberSeventeenth, decemberTwentyFourth);
}

function buildCalendarEntry(date: Date): ChurchCalendarEntry {
  const context = getCalendarContext(date.getUTCFullYear());
  const baseDay = getBaseDayForDate(date, context);
  const movablePrincipal = getMovablePrincipalObservance(date, context);
  const fixedObservance = getFixedObservance(date);

  if (movablePrincipal) {
    // Bewegliche Hochfeste und Feste gehen bewusst vor festen Gedenktagen/Festen,
    // damit Kollisionen wie 14. Mai 2026 (Christi Himmelfahrt vor Matthias) korrekt
    // nach der liturgischen Rangordnung behandelt werden.
    return {
      date: toIsoDate(date),
      liturgicalName: movablePrincipal.name,
      significance: movablePrincipal.significance,
      type: movablePrincipal.type,
      color: movablePrincipal.color,
    };
  }

  if (fixedObservance && fixedObservance.type !== 'Gedenktag' && !(date.getUTCDay() === 0 && fixedObservance.type !== 'Hochfest')) {
    return {
      date: toIsoDate(date),
      liturgicalName: fixedObservance.name,
      significance: fixedObservance.significance,
      type: fixedObservance.type,
      color: fixedObservance.color,
    };
  }

  if (fixedObservance && fixedObservance.type === 'Gedenktag' && !shouldSuppressMemorial(date, context)) {
    return {
      date: toIsoDate(date),
      liturgicalName: fixedObservance.keepSeasonName ? baseDay.liturgicalName : fixedObservance.name,
      significance: fixedObservance.significance,
      type: fixedObservance.type,
      color: fixedObservance.color,
    };
  }

  return {
    date: toIsoDate(date),
    ...baseDay,
  };
}

function generateChurchCalendarYear(year: number): ChurchCalendarEntry[] {
  const cached = yearCache.get(year);
  if (cached) {
    return cached;
  }

  const daysInYear = Math.round((Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY_IN_MS);
  const yearData = Array.from({ length: daysInYear }, (_, index) => {
    const date = new Date(Date.UTC(year, 0, index + 1));
    return buildCalendarEntry(date);
  });

  yearCache.set(year, yearData);
  return yearData;
}

function getLastAutoMaintainedYear(referenceDate = new Date()): number {
  return Math.max(...PRELOADED_YEARS, referenceDate.getUTCFullYear() + 1);
}

export function getChurchCalendarYearData(year: number): ChurchCalendarEntry[] {
  if (!Number.isInteger(year) || year < BASE_YEAR) {
    return [];
  }

  return generateChurchCalendarYear(year);
}

export function getChurchCalendarData(referenceDate = new Date()): Record<number, ChurchCalendarEntry[]> {
  const lastYear = getLastAutoMaintainedYear(referenceDate);
  const entries = Array.from({ length: lastYear - BASE_YEAR + 1 }, (_, index) => {
    const year = BASE_YEAR + index;
    return [year, getChurchCalendarYearData(year)] as const;
  });

  return Object.fromEntries(entries);
}

export function getChurchCalendarEntryByDate(date: string): ChurchCalendarEntry | null {
  const parsedDate = parseIsoDate(date);
  if (Number.isNaN(parsedDate.getTime()) || toIsoDate(parsedDate) !== date) {
    return null;
  }

  return getChurchCalendarYearData(parsedDate.getUTCFullYear()).find((entry) => entry.date === date) ?? null;
}

export const churchCalendarData = Object.fromEntries(
  PRELOADED_YEARS.map((year) => [year, getChurchCalendarYearData(year)]),
) as Record<number, ChurchCalendarEntry[]>;
