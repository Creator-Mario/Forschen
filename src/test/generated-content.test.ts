import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('generated-content', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps generated archives for the last 90 days including today', async () => {
    const { getPsalmThemaArchiv, getGlaubenHeuteArchiv, getBuchempfehlungenArchiv } = await import('@/lib/generated-content');

    const psalmen = getPsalmThemaArchiv();
    const glaubenHeute = getGlaubenHeuteArchiv();
    const buecher = getBuchempfehlungenArchiv();

    expect(psalmen).toHaveLength(90);
    expect(glaubenHeute).toHaveLength(90);
    expect(buecher).toHaveLength(90);
    expect(psalmen[0].date).toBe('2026-04-11');
    expect(psalmen.at(-1)?.date).toBe('2026-01-12');
  });

  it('updates Psalm des Tages and Glauben heute when the publication date changes', async () => {
    const {
      getTodayPsalmThema,
      getTodayGlaubenHeuteThema,
    } = await import('@/lib/generated-content');

    const firstPsalm = getTodayPsalmThema('2026-04-11');
    const secondPsalm = getTodayPsalmThema('2026-04-12');
    const firstTopic = getTodayGlaubenHeuteThema('2026-04-11');
    const secondTopic = getTodayGlaubenHeuteThema('2026-04-12');

    expect(firstPsalm.date).toBe('2026-04-11');
    expect(secondPsalm.date).toBe('2026-04-12');
    expect(firstPsalm.id).not.toBe(secondPsalm.id);

    expect(firstTopic.date).toBe('2026-04-11');
    expect(secondTopic.date).toBe('2026-04-12');
    expect(firstTopic.id).not.toBe(secondTopic.id);
  });
});
