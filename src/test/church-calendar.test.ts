import { describe, expect, it } from 'vitest';

import { getLiturgicalDay, getMonthOverview, isFeastDay } from '@/lib/churchCalendar';

describe('church calendar helpers', () => {
  it('recognizes Christi Himmelfahrt in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-05-14T00:00:00Z'))).toBe('Christi Himmelfahrt');
  });

  it('recognizes the first Sunday of Advent in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-11-29T00:00:00Z'))).toBe('1. Advent');
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

  it('falls back to an ordinary-time label for uncovered dates', () => {
    expect(getLiturgicalDay(new Date('2026-02-10T00:00:00Z'))).toMatch(/Sonntag im Jahreskreis/);
  });
});
