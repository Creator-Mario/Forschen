import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GeneratedTopicBundle } from '@/types';

function createDbMock(initialEntries: GeneratedTopicBundle[] = []) {
  const entries = [...initialEntries];
  const saveGeneratedTopicBundle = vi.fn(async (entry: GeneratedTopicBundle) => {
    const index = entries.findIndex(item => item.date === entry.date);
    if (index >= 0) entries[index] = entry;
    else entries.push(entry);
  });

  return {
    module: {
      getGeneratedTopicBundleByDate: vi.fn((date: string) => entries.find(entry => entry.date === date)),
      getGeneratedTopicBundles: vi.fn(() => entries),
      saveGeneratedTopicBundle,
    },
    saveGeneratedTopicBundle,
    getEntries: () => entries,
  };
}

describe('generated-content', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-11T10:00:00Z'));
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;
    delete process.env.OPENAI_MODEL;
    delete process.env.OPENAI_TIMEOUT_MS;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    process.env = originalEnv;
  });

  it('keeps generated archives for the last 90 days including today', async () => {
    const dbMock = createDbMock();
    vi.doMock('@/lib/db', () => dbMock.module);
    const { getPsalmThemaArchiv, getGlaubenHeuteArchiv, getBuchempfehlungenArchiv } = await import('@/lib/generated-content');

    const psalmen = await getPsalmThemaArchiv();
    const glaubenHeute = await getGlaubenHeuteArchiv();
    const buecher = await getBuchempfehlungenArchiv();

    expect(psalmen).toHaveLength(90);
    expect(glaubenHeute).toHaveLength(90);
    expect(buecher).toHaveLength(90);
    expect(psalmen[0].date).toBe('2026-04-11');
    expect(psalmen.at(-1)?.date).toBe('2026-01-12');
    expect(dbMock.saveGeneratedTopicBundle).toHaveBeenCalledTimes(1);
  });

  it('updates Psalm des Tages and Glauben heute when the publication date changes', async () => {
    const dbMock = createDbMock();
    vi.doMock('@/lib/db', () => dbMock.module);
    const { getTodayPsalmThema, getTodayGlaubenHeuteThema } = await import('@/lib/generated-content');

    const firstPsalm = await getTodayPsalmThema('2026-04-11');
    const secondPsalm = await getTodayPsalmThema('2026-04-12');
    const firstTopic = await getTodayGlaubenHeuteThema('2026-04-11');
    const secondTopic = await getTodayGlaubenHeuteThema('2026-04-12');

    expect(firstPsalm.date).toBe('2026-04-11');
    expect(secondPsalm.date).toBe('2026-04-12');
    expect(firstPsalm.id).not.toBe(secondPsalm.id);

    expect(firstTopic.date).toBe('2026-04-11');
    expect(secondTopic.date).toBe('2026-04-12');
    expect(firstTopic.id).not.toBe(secondTopic.id);
  });

  it('uses the 03:00 Berlin publication switch for daily generated themes', async () => {
    const dbMock = createDbMock();
    vi.doMock('@/lib/db', () => dbMock.module);
    const { getTodayGlaubenHeuteThema, getTodayBuchempfehlungen } = await import('@/lib/generated-content');

    vi.setSystemTime(new Date('2026-04-11T00:30:00Z'));
    expect((await getTodayGlaubenHeuteThema()).date).toBe('2026-04-10');
    expect((await getTodayBuchempfehlungen()).date).toBe('2026-04-10');

    vi.setSystemTime(new Date('2026-04-11T01:30:00Z'));
    expect((await getTodayGlaubenHeuteThema()).date).toBe('2026-04-11');
    expect((await getTodayBuchempfehlungen()).date).toBe('2026-04-11');
  });

  it('persists a valid AI response and reuses it on later reads', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_BASE_URL = 'https://example.test/v1';
    process.env.OPENAI_MODEL = 'gpt-test';

    const dbMock = createDbMock();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                psalm: {
                  psalmReference: 'Psalm 25,4-5',
                  title: 'Auf Gottes Wegen bleiben',
                  excerpt: 'Herr, zeige mir deine Wege und lehre mich deine Steige.',
                  summary: 'Der Psalm bittet Gott um Leitung inmitten von Unsicherheit und offenen Fragen. Er verbindet Demut mit dem Vertrauen, dass Gott seinen Weg zeigt.',
                  significance: 'Für den Glauben heute heißt das, Orientierung nicht nur in uns selbst zu suchen, sondern im Wort und in der Gegenwart Gottes. Gerade darin wächst geistliche Klarheit.',
                  practice: 'Nimm dir heute bewusst Zeit, eine Entscheidung oder offene Frage betend vor Gott zu bringen. Bitte ihn konkret um Leitung und Bereitschaft zum Gehorsam.',
                  questions: ['Wo brauche ich gerade Gottes Leitung?', 'Welche Wege möchte Gott in mir zurechtrücken?', 'Wie übe ich hörenden Gehorsam im Alltag ein?'],
                },
                topic: {
                  title: 'Wahrheit und Treue im Alltag',
                  headline: 'Wenn Klarheit und Liebe zusammengehören',
                  worldFocus: 'Viele Menschen erleben widersprüchliche Informationen und verlieren Vertrauen. Das erzeugt Müdigkeit und Unsicherheit.',
                  faithPerspective: 'Die Schrift ruft dazu auf, Wahrheit nicht als Waffe, sondern als Weg der Treue zu leben. Christus verbindet Klarheit mit Liebe.',
                  discipleshipImpulse: 'Prüfe heute ein Gespräch oder eine Entscheidung bewusst im Licht von Wahrheit, Geduld und Liebe.',
                  bibleVerses: ['Johannes 14,6', 'Epheser 4,15', 'Psalm 25,10'],
                  questions: ['Wo fehlt mir gerade Klarheit?', 'Wie sieht wahrhaftige Liebe konkret aus?', 'Welche Gewohnheit stärkt Treue im Alltag?'],
                },
                books: {
                  topicTitle: 'Wahrheit und Treue im Alltag',
                  introduction: 'Diese Buchempfehlungen vertiefen das heutige Tagesthema und helfen, biblische Orientierung praktisch einzuüben.',
                  recommendations: [
                    {
                      title: 'Nachfolge',
                      author: 'Dietrich Bonhoeffer',
                      description: 'Ein klares Buch über die Bindung an Christus im Alltag.',
                      relevance: 'Hilft, Wahrheit nicht theoretisch, sondern gehorsam zu verstehen.',
                    },
                    {
                      title: 'Basic Christianity',
                      author: 'John Stott',
                      description: 'Eine konzentrierte Einführung in zentrale Wahrheiten des Glaubens.',
                      relevance: 'Stärkt die Fähigkeit, tragfähige christliche Orientierung zu gewinnen.',
                    },
                  ],
                },
              }),
            },
          },
        ],
      }),
    });

    vi.stubGlobal('fetch', fetchMock);
    vi.doMock('@/lib/db', () => dbMock.module);
    const { getTodayPsalmThema, getTodayGlaubenHeuteThema, getTodayBuchempfehlungen } = await import('@/lib/generated-content');

    const psalm = await getTodayPsalmThema('2026-04-11');
    const topic = await getTodayGlaubenHeuteThema('2026-04-11');
    const books = await getTodayBuchempfehlungen('2026-04-11');

    expect(psalm.title).toBe('Auf Gottes Wegen bleiben');
    expect(topic.title).toBe('Wahrheit und Treue im Alltag');
    expect(books.recommendations).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dbMock.getEntries()[0]?.source).toBe('ai');
  });

  it('falls back to deterministic content when no AI is configured', async () => {
    const dbMock = createDbMock();
    vi.doMock('@/lib/db', () => dbMock.module);
    const { getTodayBuchempfehlungen } = await import('@/lib/generated-content');

    const books = await getTodayBuchempfehlungen('2026-04-11');

    expect(books.introduction).toBe(
      `Diese Buchempfehlungen greifen das Tagesthema „${books.topicTitle}“ auf und helfen dabei, biblische Orientierung zu vertiefen.`
    );
    expect(books.introduction).not.toContain('KI-inspirierten');
    expect(dbMock.getEntries()[0]?.source).toBe('seed-fallback');
  });
});
