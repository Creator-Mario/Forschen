import { describe, expect, it } from 'vitest';

describe('tageswort rotation', () => {
  async function getRotation() {
    const rotationModule = await import('@/lib/tageswort-rotation.js');
    return 'default' in rotationModule ? rotationModule.default : rotationModule;
  }

  it('uses the previous day before 03:00 Berlin time', async () => {
    const { getBerlinPublicationDate } = await getRotation();

    expect(getBerlinPublicationDate(new Date('2026-05-14T00:30:00Z'))).toBe('2026-05-13');
    expect(getBerlinPublicationDate(new Date('2026-05-14T01:30:00Z'))).toBe('2026-05-14');
  });

  it('starts a non-repeating sequence on 2026-05-14', async () => {
    const { generateTageswortEntries } = await getRotation();
    const existing = [
      { id: '2026-05-13', date: '2026-05-13', verse: '1. Johannes 4,19', text: 'Wir lieben, weil er uns zuerst geliebt hat.', context: '', questions: [], published: true },
    ];
    const templates = [
      { verse: 'Römer 12,2', text: 'Stellt euch nicht dieser Welt gleich, sondern ändert euch durch Erneuerung eures Sinnes.', context: 'Kontext A' },
      { verse: '2. Korinther 5,17', text: 'Ist jemand in Christus, so ist er eine neue Kreatur.', context: 'Kontext B' },
    ];

    const generated = generateTageswortEntries(existing, templates, '2026-05-14');

    expect(generated).toHaveLength(1);
    expect(generated[0]).toMatchObject({
      id: '2026-05-14',
      verse: 'Römer 12,2',
      published: true,
    });
  });

  it('catches up missing days in sequence order', async () => {
    const { generateTageswortEntries } = await getRotation();
    const existing = [
      { id: '2026-05-13', date: '2026-05-13', verse: '1. Johannes 4,19', text: 'Wir lieben, weil er uns zuerst geliebt hat.', context: '', questions: [], published: true },
    ];
    const templates = [
      { verse: 'Römer 12,2', text: 'A', context: 'Kontext A' },
      { verse: '2. Korinther 5,17', text: 'B', context: 'Kontext B' },
      { verse: 'Psalm 139,14', text: 'C', context: 'Kontext C' },
    ];

    const generated = generateTageswortEntries(existing, templates, '2026-05-16');

    expect(generated.map((entry: { date: string; verse: string }) => [entry.date, entry.verse])).toEqual([
      ['2026-05-14', 'Römer 12,2'],
      ['2026-05-15', '2. Korinther 5,17'],
      ['2026-05-16', 'Psalm 139,14'],
    ]);
  });

  it('rejects templates that would repeat a published verse', async () => {
    const { generateTageswortEntries } = await getRotation();
    const existing = [
      { id: '2026-05-10', date: '2026-05-10', verse: 'Römer 12,2', text: 'Stellt euch nicht dieser Welt gleich, sondern ändert euch durch Erneuerung eures Sinnes.', context: '', questions: [], published: true },
      { id: '2026-05-13', date: '2026-05-13', verse: '1. Johannes 4,19', text: 'Wir lieben, weil er uns zuerst geliebt hat.', context: '', questions: [], published: true },
    ];
    const templates = [
      { verse: 'Römer 12,2', text: 'Stellt euch nicht dieser Welt gleich, sondern ändert euch durch Erneuerung eures Sinnes.', context: 'Kontext A' },
    ];

    expect(() => generateTageswortEntries(existing, templates, '2026-05-14')).toThrow(/would repeat/);
  });
});
