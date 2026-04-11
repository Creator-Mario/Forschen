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

    expect(getCurrentPublicationDate(new Date('2026-04-12T00:30:00Z'))).toBe('2026-04-11');
    expect(getCurrentPublicationDate(new Date('2026-04-12T01:30:00Z'))).toBe('2026-04-12');
  });

  it('switches the weekly publication week on Sunday after the Berlin cutoff', async () => {
    const { getCurrentPublicationWeek } = await import('@/lib/publishing');

    expect(getCurrentPublicationWeek(new Date('2026-04-12T00:30:00Z'))).toBe('2026-W15');
    expect(getCurrentPublicationWeek(new Date('2026-04-12T01:30:00Z'))).toBe('2026-W16');
  });
});
