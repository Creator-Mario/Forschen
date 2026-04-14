import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('publishing cutoffs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('switches the daily publication date at 03:00 Berlin time', async () => {
    const { getCurrentPublicationDate } = await import('@/lib/publishing');

    expect(getCurrentPublicationDate(new Date('2026-04-11T00:30:00Z'))).toBe('2026-04-10');
    expect(getCurrentPublicationDate(new Date('2026-04-11T01:30:00Z'))).toBe('2026-04-11');
  });

  it('switches the weekly publication week at 03:00 on Monday Berlin time', async () => {
    const { getCurrentPublicationWeek } = await import('@/lib/publishing');

    expect(getCurrentPublicationWeek(new Date('2026-04-13T00:30:00Z'))).toBe('2026-W15');
    expect(getCurrentPublicationWeek(new Date('2026-04-13T01:30:00Z'))).toBe('2026-W16');
  });
});
