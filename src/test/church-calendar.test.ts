import { describe, expect, it } from 'vitest';

import { getLiturgicalDay } from '@/lib/churchCalendar';

describe('getLiturgicalDay', () => {
  it('recognizes Christi Himmelfahrt in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-05-14T00:00:00Z'))).toBe('Christi Himmelfahrt');
  });

  it('recognizes the first Sunday of Advent in 2026', () => {
    expect(getLiturgicalDay(new Date('2026-11-29T00:00:00Z'))).toBe('1. Advent');
  });

  it('recognizes Easter Sunday in 2027', () => {
    expect(getLiturgicalDay(new Date('2027-03-28T00:00:00Z'))).toBe('Ostersonntag');
  });

  it('falls back to an ordinary-time label for uncovered dates', () => {
    expect(getLiturgicalDay(new Date('2026-02-10T00:00:00Z'))).toMatch(/Sonntag im Jahreskreis/);
  });
});
