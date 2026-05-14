import { describe, expect, it } from 'vitest';

import { getLiturgicalDay, getMonthOverview, isFeastDay } from '@/lib/churchCalendar';
import { churchCalendarData, getAvailableChurchCalendarData } from '@/lib/churchCalendarHelpers';

describe('church calendar helpers', () => {
  it('recognizes Christi Himmelfahrt in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-05-14T00:00:00Z'))).toBe('Christi Himmelfahrt');
  });

  it('recognizes the first Sunday of Advent in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-11-29T00:00:00Z'))).toBe('1. Adventssonntag');
  });

  it('recognizes Easter Sunday in 2027', () => {
    expect(getLiturgicalDay(new Date('2027-03-28T00:00:00Z'))).toBe('Ostersonntag');
  });

  it('marks feast days separately from ordinary days', () => {
    expect(isFeastDay(new Date('2026-05-14T00:00:00Z'))).toBe(true);
    expect(isFeastDay(new Date('2026-05-15T00:00:00Z'))).toBe(false);
  });

  it('builds a month overview with liturgical labels and feast markers', () => {
    const overview = getMonthOverview(2026, 5);
    const ascensionDay = overview.find((entry) => entry.date === '2026-05-14');

    expect(overview).toHaveLength(31);
    expect(ascensionDay).toMatchObject({
      liturgicalDay: 'Christi Himmelfahrt',
      isFeastDay: true,
      isSunday: false,
    });
  });

  it('returns a detailed weekday label with memorial significance', () => {
    expect(getLiturgicalDay(new Date('2026-02-10T00:00:00Z'))).toBe(
      'Dienstag der 5. Woche im Jahreskreis – Gedenktag der heiligen Scholastika, Jungfrau.',
    );
  });

  it('preloads complete year data for 2026 and 2027', () => {
    expect(churchCalendarData[2026]).toHaveLength(365);
    expect(churchCalendarData[2027]).toHaveLength(365);
  });

  it('extends the dataset automatically to the next year at year end', () => {
    const autoExtendedData = getAvailableChurchCalendarData(new Date('2027-12-31T12:00:00Z'));

    expect(autoExtendedData[2028]).toBeDefined();
    expect(autoExtendedData[2028]).toHaveLength(366);
  });
});
