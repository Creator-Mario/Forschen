import { describe, expect, it } from 'vitest';
import {
  GENERATED_ARCHIVE_DAYS,
  WEEKLY_THEME_ARCHIVE_LIMIT,
  keepLatestItemsByDate,
  keepLatestItemsByWeek,
} from '@/lib/archive-window';

describe('archive-window helpers', () => {
  it('keeps the latest daily archive entries by date', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const entries = Array.from({ length: GENERATED_ARCHIVE_DAYS + 3 }, (_, index) => {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + index);
      return {
        date: current.toISOString().split('T')[0],
      };
    });

    const retained = keepLatestItemsByDate(entries);

    expect(retained).toHaveLength(GENERATED_ARCHIVE_DAYS);
    expect(retained[0].date).toBe('2026-04-03');
    expect(retained.at(-1)?.date).toBe('2026-01-04');
  });

  it('keeps the latest weekly archive entries by ISO week', () => {
    const entries = Array.from({ length: WEEKLY_THEME_ARCHIVE_LIMIT + 2 }, (_, index) => ({
      week: `2026-W${String(index + 1).padStart(2, '0')}`,
    }));

    const retained = keepLatestItemsByWeek(entries);

    expect(retained).toHaveLength(WEEKLY_THEME_ARCHIVE_LIMIT);
    expect(retained[0].week).toBe('2026-W15');
    expect(retained.at(-1)?.week).toBe('2026-W03');
  });
});
