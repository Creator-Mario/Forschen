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
});
